package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Cannot find '.env'")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Println("DATABASE_URL is not configured in '.env'")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Cannot config database: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}

	log.Println("Connected to supabase")

	app := fiber.New()
	app.Get("/api/health/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "Go service is running!",
			"database": "Connected successfully!",
		})
	})
	log.Fatal(app.Listen(":8080"))
}
