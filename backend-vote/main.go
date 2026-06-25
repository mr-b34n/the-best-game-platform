// ==============================================================================
// VOTING SERVICE - Go Business Logic Engine
// Kiến trúc: Client → Go Service → Supabase DB
//                         ↓
//                  WebSocket → All Clients (realtime)
//
// Chạy: go run main.go
// Env:  SUPABASE_URL, SUPABASE_SERVICE_KEY, PORT, JWT_SECRET
// ==============================================================================

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// ==============================================================================
// TYPES & STRUCTS
// ==============================================================================

type VoteAction string

const (
	Upvote   VoteAction = "upvote"
	Downvote VoteAction = "downvote"
)

// Request từ client gửi lên
type CastVoteRequest struct {
	GameID string     `json:"game_id"`
	Action VoteAction `json:"action"`
}

// Kết quả trả về sau khi xử lý vote
type VoteResult struct {
	GameID   string      `json:"game_id"`
	Upvote   int         `json:"upvote"`
	Downvote int         `json:"downvote"`
	MyVote   *VoteAction `json:"my_vote"` // nil nếu đã hủy vote
}

// Event broadcast tới tất cả client đang xem game đó
type VoteBroadcast struct {
	Type     string `json:"type"` // "vote_update"
	GameID   string `json:"game_id"`
	Upvote   int    `json:"upvote"`
	Downvote int    `json:"downvote"`
}

// Row trong bảng game_votes
type GameVote struct {
	ID         string     `db:"id"`
	GameID     string     `db:"game_id"`
	UserID     string     `db:"user_id"`
	Action     VoteAction `db:"action"`
	WeekNumber int        `db:"week_number"`
	Year       int        `db:"year"`
}

// Snapshot upvote/downvote từ bảng games
type GameVoteCounts struct {
	Upvote   int `db:"upvote"`
	Downvote int `db:"downvote"`
}

// ==============================================================================
// HUB - Quản lý WebSocket connections theo game_id
// ==============================================================================

type Client struct {
	conn   *websocket.Conn
	gameID string
	send   chan []byte
}

type Hub struct {
	mu sync.RWMutex
	// map[game_id] → set of clients
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan VoteBroadcast
}

func newHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client, 256),
		unregister: make(chan *Client, 256),
		broadcast:  make(chan VoteBroadcast, 512),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.gameID] == nil {
				h.rooms[client.gameID] = make(map[*Client]bool)
			}
			h.rooms[client.gameID][client] = true
			h.mu.Unlock()
			log.Printf("[Hub] Client joined room: game=%s, total=%d", client.gameID, len(h.rooms[client.gameID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if room, ok := h.rooms[client.gameID]; ok {
				if _, ok := room[client]; ok {
					delete(room, client)
					close(client.send)
					if len(room) == 0 {
						delete(h.rooms, client.gameID)
					}
				}
			}
			h.mu.Unlock()

		case event := <-h.broadcast:
			payload, _ := json.Marshal(event)
			h.mu.RLock()
			room := h.rooms[event.GameID]
			h.mu.RUnlock()
			for client := range room {
				select {
				case client.send <- payload:
				default:
					// Buffer full → kick client
					h.unregister <- client
				}
			}
		}
	}
}

// writePump: gửi message từ channel xuống WebSocket
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second) // ping keepalive
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// readPump: đọc message từ client (chủ yếu để detect disconnect)
func (c *Client) readPump(hub *Hub) {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			break
		}
	}
}

// ==============================================================================
// VOTE SERVICE - Business Logic tách biệt
// ==============================================================================

type VoteService struct {
	db  *sqlx.DB
	hub *Hub
}

func NewVoteService(db *sqlx.DB, hub *Hub) *VoteService {
	return &VoteService{db: db, hub: hub}
}

// isoWeek trả về (week, year) theo chuẩn ISO 8601
func isoWeek() (int, int) {
	_, week := time.Now().ISOWeek()
	return week, time.Now().Year()
}

// CastVote xử lý toàn bộ business logic của 1 lần vote:
//  1. Validate game tồn tại và đang published
//  2. Kiểm tra vote hiện tại của user trong tuần
//  3. Toggle / Switch / Insert vote (atomic trong transaction)
//  4. Broadcast kết quả mới tới tất cả client đang xem game
func (s *VoteService) CastVote(ctx context.Context, userID, gameID string, action VoteAction) (*VoteResult, error) {
	week, year := isoWeek()

	// Validate game_id format
	if _, err := uuid.Parse(gameID); err != nil {
		return nil, fmt.Errorf("invalid game_id format")
	}

	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	// 1. Kiểm tra game tồn tại và đang published (row-level lock)
	var exists bool
	err = tx.QueryRowxContext(ctx,
		`SELECT EXISTS(
			SELECT 1 FROM games
			WHERE id = $1 AND status = 'published' AND is_archived = false
		) FOR SHARE`, gameID,
	).Scan(&exists)
	if err != nil || !exists {
		return nil, fmt.Errorf("game not found or not published")
	}

	// 2. Tìm vote hiện tại của user trong tuần này
	var existing GameVote
	err = tx.QueryRowxContext(ctx,
		`SELECT id, action FROM game_votes
		 WHERE user_id = $1 AND game_id = $2 AND week_number = $3 AND year = $4
		 FOR UPDATE`,
		userID, gameID, week, year,
	).StructScan(&existing)

	var myVote *VoteAction

	if err == nil {
		// Đã vote rồi
		if existing.Action == action {
			// Toggle off: hủy vote
			if _, err = tx.ExecContext(ctx,
				`DELETE FROM game_votes WHERE id = $1`, existing.ID,
			); err != nil {
				return nil, fmt.Errorf("delete vote: %w", err)
			}
			myVote = nil
		} else {
			// Đổi action
			if _, err = tx.ExecContext(ctx,
				`UPDATE game_votes SET action = $1, updated_at = NOW() WHERE id = $2`,
				action, existing.ID,
			); err != nil {
				return nil, fmt.Errorf("update vote: %w", err)
			}
			a := action
			myVote = &a
		}
	} else {
		// Chưa vote → tạo mới
		if _, err = tx.ExecContext(ctx,
			`INSERT INTO game_votes (game_id, user_id, action, week_number, year)
			 VALUES ($1, $2, $3, $4, $5)`,
			gameID, userID, action, week, year,
		); err != nil {
			return nil, fmt.Errorf("insert vote: %w", err)
		}
		a := action
		myVote = &a
	}

	// 3. Lấy vote counts mới nhất (trigger DB đã sync vào bảng games)
	var counts GameVoteCounts
	if err = tx.QueryRowxContext(ctx,
		`SELECT upvote, downvote FROM games WHERE id = $1`, gameID,
	).StructScan(&counts); err != nil {
		return nil, fmt.Errorf("get counts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	// 4. Broadcast realtime tới tất cả client đang xem game này
	s.hub.broadcast <- VoteBroadcast{
		Type:     "vote_update",
		GameID:   gameID,
		Upvote:   counts.Upvote,
		Downvote: counts.Downvote,
	}

	return &VoteResult{
		GameID:   gameID,
		Upvote:   counts.Upvote,
		Downvote: counts.Downvote,
		MyVote:   myVote,
	}, nil
}

// GetVoteCounts lấy nhanh upvote/downvote của một game (không cần auth)
func (s *VoteService) GetVoteCounts(ctx context.Context, gameID string) (*GameVoteCounts, error) {
	var counts GameVoteCounts
	err := s.db.QueryRowxContext(ctx,
		`SELECT upvote, downvote FROM games WHERE id = $1 AND is_archived = false`, gameID,
	).StructScan(&counts)
	if err != nil {
		return nil, fmt.Errorf("game not found")
	}
	return &counts, nil
}

// GetMyVote lấy vote hiện tại của user cho 1 game trong tuần này
func (s *VoteService) GetMyVote(ctx context.Context, userID, gameID string) (*VoteAction, error) {
	week, year := isoWeek()
	var v GameVote
	err := s.db.QueryRowxContext(ctx,
		`SELECT action FROM game_votes
		 WHERE user_id = $1 AND game_id = $2 AND week_number = $3 AND year = $4`,
		userID, gameID, week, year,
	).StructScan(&v)
	if err != nil {
		return nil, nil // chưa vote là bình thường
	}
	return &v.Action, nil
}

// ==============================================================================
// HTTP HANDLERS
// ==============================================================================

type Server struct {
	voteService *VoteService
	hub         *Hub
	jwtSecret   []byte
	upgrader    websocket.Upgrader
}

func NewServer(vs *VoteService, hub *Hub, jwtSecret string) *Server {
	return &Server{
		voteService: vs,
		hub:         hub,
		jwtSecret:   []byte(jwtSecret),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// TODO: production → whitelist domain
				return true
			},
		},
	}
}

// extractUserID parse JWT từ Authorization header, trả về user_id (sub claim)
func (s *Server) extractUserID(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("missing or invalid Authorization header")
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid claims")
	}
	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return "", fmt.Errorf("missing sub claim")
	}
	return sub, nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// POST /votes
// Body: { "game_id": "...", "action": "upvote" | "downvote" }
// Auth: Bearer <supabase_jwt>
func (s *Server) handleCastVote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := s.extractUserID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	var req CastVoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.GameID == "" || (req.Action != Upvote && req.Action != Downvote) {
		writeError(w, http.StatusBadRequest, "game_id and action (upvote|downvote) are required")
		return
	}

	result, err := s.voteService.CastVote(r.Context(), userID, req.GameID, req.Action)
	if err != nil {
		log.Printf("[Vote] Error: user=%s game=%s err=%v", userID, req.GameID, err)
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// GET /votes/{game_id}
// Lấy vote counts public của một game (không cần auth)
func (s *Server) handleGetVoteCounts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	// Path: /votes/{game_id}
	gameID := strings.TrimPrefix(r.URL.Path, "/votes/")
	if gameID == "" {
		writeError(w, http.StatusBadRequest, "game_id is required")
		return
	}

	counts, err := s.voteService.GetVoteCounts(r.Context(), gameID)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	// Nếu user đã login → trả kèm my_vote
	var myVote *VoteAction
	if userID, err := s.extractUserID(r); err == nil {
		myVote, _ = s.voteService.GetMyVote(r.Context(), userID, gameID)
	}

	writeJSON(w, http.StatusOK, VoteResult{
		GameID:   gameID,
		Upvote:   counts.Upvote,
		Downvote: counts.Downvote,
		MyVote:   myVote,
	})
}

// GET /ws/votes/{game_id}
// WebSocket endpoint: client subscribe realtime vote update cho 1 game
func (s *Server) handleVoteWS(w http.ResponseWriter, r *http.Request) {
	gameID := strings.TrimPrefix(r.URL.Path, "/ws/votes/")
	if gameID == "" {
		writeError(w, http.StatusBadRequest, "game_id is required")
		return
	}
	if _, err := uuid.Parse(gameID); err != nil {
		writeError(w, http.StatusBadRequest, "invalid game_id")
		return
	}

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}

	client := &Client{
		conn:   conn,
		gameID: gameID,
		send:   make(chan []byte, 64),
	}

	s.hub.register <- client

	go client.writePump()
	client.readPump(s.hub) // blocking
}

// GET /health
func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// ==============================================================================
// RATE LIMITER - Token bucket per user
// ==============================================================================

type rateLimiter struct {
	mu     sync.Mutex
	tokens map[string]tokenBucket
}

type tokenBucket struct {
	tokens   float64
	lastTime time.Time
}

func newRateLimiter() *rateLimiter {
	rl := &rateLimiter{tokens: make(map[string]tokenBucket)}
	// Cleanup goroutine: xóa entry cũ mỗi 5 phút
	go func() {
		for range time.Tick(5 * time.Minute) {
			rl.mu.Lock()
			for k, b := range rl.tokens {
				if time.Since(b.lastTime) > 10*time.Minute {
					delete(rl.tokens, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

// Allow: 10 request/phút mỗi user (token bucket, rate=10/60 per second)
func (rl *rateLimiter) Allow(userID string) bool {
	const capacity = 10.0
	const ratePerSec = 10.0 / 60.0

	rl.mu.Lock()
	defer rl.mu.Unlock()

	b, ok := rl.tokens[userID]
	if !ok {
		rl.tokens[userID] = tokenBucket{tokens: capacity - 1, lastTime: time.Now()}
		return true
	}

	elapsed := time.Since(b.lastTime).Seconds()
	b.tokens = math.Min(capacity, b.tokens+elapsed*ratePerSec)
	b.lastTime = time.Now()

	if b.tokens < 1 {
		rl.tokens[userID] = b
		return false
	}
	b.tokens--
	rl.tokens[userID] = b
	return true
}

func (s *Server) withRateLimit(rl *rateLimiter, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := s.extractUserID(r)
		if err != nil {
			next(w, r) // không có auth thì bỏ qua rate limit (GET public)
			return
		}
		if !rl.Allow(userID) {
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded: max 10 votes/minute")
			return
		}
		next(w, r)
	}
}

// ==============================================================================
// CORS MIDDLEWARE
// ==============================================================================

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("ALLOWED_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ==============================================================================
// MAIN
// ==============================================================================

func main() {
	// Config từ env
	dbURL := mustEnv("DATABASE_URL")   // postgres://user:pass@host/db
	jwtSecret := mustEnv("JWT_SECRET") // Supabase JWT secret
	port := getEnv("PORT", "8080")

	// Connect DB
	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		log.Fatalf("DB connect failed: %v", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)
	log.Println("[DB] Connected")

	// Khởi tạo Hub + Service
	hub := newHub()
	go hub.Run()

	voteService := NewVoteService(db, hub)
	server := NewServer(voteService, hub, jwtSecret)
	rl := newRateLimiter()

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/votes", server.withRateLimit(rl, server.handleCastVote))
	mux.HandleFunc("/votes/", server.handleGetVoteCounts) // GET /votes/{game_id}
	mux.HandleFunc("/ws/votes/", server.handleVoteWS)     // WS  /ws/votes/{game_id}

	httpServer := &http.Server{
		Addr:         ":" + port,
		Handler:      withCORS(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("[Server] Listening on :%s", port)
	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("Missing required env var: %s", key)
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
