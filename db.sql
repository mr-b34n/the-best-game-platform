-- ==============================================================================
-- PHẦN 0: KHỞI TẠO CÁC KIỂU DỮ LIỆU ENUM (Chuẩn hóa dữ liệu)
-- ==============================================================================
create type badge_rank_enum as ENUM(
  'noob',
  'newbie',
  'player',
  'veteran',
  'master',
  'professor'
);

create type gender_enum as ENUM('secret', 'male', 'female', 'other');

create type user_type_enum as ENUM(
  'gamer',
  'game_studio',
  'sponsor',
  'moderator',
  'admin'
);

create type game_status_enum as ENUM('draft', 'pending', 'published', 'banned');

create type funding_state_enum as ENUM('none', 'seeking_fund', 'crowdfunding', 'funded');

create type system_req_enum as ENUM('minimum', 'recommended');

create type vote_action_enum as ENUM('upvote', 'downvote');

create type report_target_enum as ENUM('game_report', 'user_report', 'comment_report');

-- ==============================================================================
-- PHẦN 1: TẠO CÁC BẢNG DANH MỤC VÀ ĐỘC LẬP
-- ==============================================================================
create table notification_types (
  id UUID primary key default gen_random_uuid (),
  name VARCHAR(255) not null,
  icon VARCHAR(255),
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table report_type (
  id UUID primary key default gen_random_uuid (),
  name VARCHAR(255) not null,
  description TEXT,
  target_type report_target_enum default 'game_report',
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table sponsors (
  id UUID primary key default gen_random_uuid (),
  name VARCHAR(255) not null,
  logo_url VARCHAR(1000),
  bio TEXT,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table badges (
  id UUID primary key default gen_random_uuid (),
  name VARCHAR(255) not null unique,
  description TEXT,
  icon_url VARCHAR(1000),
  rank_level badge_rank_enum default 'noob',
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

-- ==============================================================================
-- PHẦN 2: TẠO CÁC BẢNG CỐT LÕI
-- ==============================================================================
create table user_profile (
  id UUID primary key references auth.users (id) on delete CASCADE,
  username VARCHAR(255) unique,
  gender gender_enum default 'secret',
  type user_type_enum default 'gamer',
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(100),
  phone_number VARCHAR(50),
  is_verified BOOLEAN default false,
  is_archived BOOLEAN default false,
  slug VARCHAR(255) unique,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table categories (
  id UUID primary key default gen_random_uuid (),
  label VARCHAR(255) not null,
  usage_count INT4 default 0,
  description TEXT,
  created_by UUID references user_profile (id) on delete set null,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table games (
  id UUID primary key default gen_random_uuid (),
  developer_id UUID references user_profile (id) on delete CASCADE, -- ĐỂ XÁC ĐỊNH CHỦ SỞ HỮU GAME
  name VARCHAR(255) not null,
  description TEXT,
  cover_url VARCHAR(1000),
  price TEXT,
  age_rating VARCHAR(50),
  upvote INT4 default 0,
  downvote INT4 default 0,
  funding_state funding_state_enum default 'none',
  status game_status_enum default 'draft',
  is_archived BOOLEAN default false,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

-- ==============================================================================
-- PHẦN 3: TẠO CÁC BẢNG VỆ TINH & TƯƠNG TÁC
-- ==============================================================================
create table user_badges (
  user_id UUID references user_profile (id) on delete CASCADE,
  badge_id UUID references badges (id) on delete CASCADE,
  granted_at TIMESTAMPTZ default NOW(),
  primary key (user_id, badge_id)
);

create table posts (
  id UUID primary key default gen_random_uuid (),
  game_id UUID references games (id) on delete CASCADE,
  user_id UUID references user_profile (id) on delete CASCADE,
  content TEXT not null,
  parent_id UUID references posts (id) on delete CASCADE,
  is_archived BOOLEAN default false,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table systems (
  id UUID primary key default gen_random_uuid (),
  game_id UUID references games (id) on delete CASCADE,
  req_type system_req_enum default 'minimum',
  description TEXT,
  processor VARCHAR(255),
  memory VARCHAR(255),
  graphic VARCHAR(255),
  storage VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table game_votes (
  id UUID primary key default gen_random_uuid (),
  game_id UUID references games (id) on delete CASCADE,
  user_id UUID references user_profile (id) on delete set null,
  action vote_action_enum not null,
  week_number INT2 not null,
  year INT4 not null,
  is_archived BOOLEAN default false,
  updated_at TIMESTAMPTZ default NOW(),
  constraint unique_weekly_vote unique (user_id, game_id, week_number, year)
);

create table game_category (
  id UUID primary key default gen_random_uuid (),
  game_id UUID references games (id) on delete CASCADE,
  category_id UUID references categories (id) on delete CASCADE,
  created_at TIMESTAMPTZ default NOW()
);

create table gallery (
  id UUID primary key default gen_random_uuid (),
  name VARCHAR(255),
  storage_object_id UUID,
  game_id UUID references games (id) on delete CASCADE,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table user_platform_links (
  id UUID primary key default gen_random_uuid (),
  profile_id UUID references user_profile (id) on delete CASCADE,
  platform VARCHAR(100),
  url VARCHAR(1000),
  is_show BOOLEAN default true,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table games_platform_link (
  id UUID primary key default gen_random_uuid (),
  platform VARCHAR(100),
  url VARCHAR(1000),
  is_show BOOLEAN default true,
  game_id UUID references games (id) on delete CASCADE,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table user_games (
  user_id UUID references user_profile (id) on delete CASCADE,
  game_id UUID references games (id) on delete CASCADE,
  primary key (user_id, game_id)
);

create table notifications (
  id UUID primary key default gen_random_uuid (),
  user_receive UUID references user_profile (id) on delete CASCADE,
  title VARCHAR(255) not null,
  content TEXT,
  read_at TIMESTAMPTZ,
  link VARCHAR(1000),
  is_archived BOOLEAN default false,
  notification_type_id UUID references notification_types (id) on delete set null,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table game_sponsor (
  id UUID primary key default gen_random_uuid (),
  sponsor_id UUID references sponsors (id) on delete CASCADE,
  game_id UUID references games (id) on delete CASCADE
);

create table platform_sponsors (
  id UUID primary key default gen_random_uuid (),
  sponsor_id UUID references sponsors (id) on delete CASCADE,
  created_at TIMESTAMPTZ default NOW(),
  updated_at TIMESTAMPTZ default NOW()
);

create table game_report (
  id UUID primary key default gen_random_uuid (),
  report_id UUID references report_type (id) on delete RESTRICT,
  game_id UUID references games (id) on delete CASCADE,
  created_at TIMESTAMPTZ default NOW()
);

create table user_report (
  id UUID primary key default gen_random_uuid (),
  user_id UUID references user_profile (id) on delete CASCADE,
  report_id UUID references report_type (id) on delete RESTRICT,
  created_at TIMESTAMPTZ default NOW()
);

-- ==============================================================================
-- PHẦN 4: TRIGGER TỰ ĐỘNG & BẢO MẬT ROLE
-- ==============================================================================
-- 4.1 Hàm tự động tạo User Profile khi user đăng nhập lần đầu
create or replace function public.handle_new_user () RETURNS trigger as $$
BEGIN
  INSERT INTO public.user_profile (id, username, avatar_url, type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url',
    'gamer' -- Mặc định là gamer
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

drop trigger IF exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after INSERT on auth.users for EACH row
execute PROCEDURE public.handle_new_user ();

-- 4.2 Hàm chặn thao tác leo thang đặc quyền (Hack quyền Admin)
create or replace function prevent_role_escalation () RETURNS TRIGGER as $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.type IS DISTINCT FROM OLD.type THEN
        -- Chặn nếu request đến từ API public của Frontend
        IF auth.role() = 'authenticated' OR auth.role() = 'anon' THEN
            RAISE EXCEPTION 'HACKING ATTEMPT DETECTED: You cannot change your own user type. This must be done manually by an Administrator.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

drop trigger IF exists enforce_manual_role_assignment on user_profile;

create trigger enforce_manual_role_assignment BEFORE
update on user_profile for EACH row
execute PROCEDURE prevent_role_escalation ();

-- ==============================================================================
-- PHẦN 5: ROW LEVEL SECURITY (RLS) - BẢO MẬT CẤP DÒNG
-- ==============================================================================
-- Bật RLS cho các bảng cốt lõi
alter table user_profile ENABLE row LEVEL SECURITY;

alter table games ENABLE row LEVEL SECURITY;

alter table posts ENABLE row LEVEL SECURITY;

alter table game_votes ENABLE row LEVEL SECURITY;

---------------------------------------------------------
-- POLICY BẢNG `user_profile`
---------------------------------------------------------
-- Mọi người đều có thể xem profile của nhau
create policy "Public profiles are viewable by everyone" on user_profile for
select
  using (true);

-- Chỉ được sửa profile của chính mình
create policy "Users can update own profile" on user_profile
for update
  using (auth.uid () = id);

---------------------------------------------------------
-- POLICY BẢNG `games`
---------------------------------------------------------
-- Xem game: Lọc bỏ game bị ẩn/ban, trừ khi người xem là admin/moderator
create policy "Public can view published and unarchived games" on games for
select
  using (
    (
      is_archived = false
      and status = 'published'
    )
    or auth.uid () = developer_id
    or exists (
      select
        1
      from
        user_profile
      where
        id = auth.uid ()
        and type in ('admin', 'moderator')
    )
  );

-- Tạo game: Chỉ user đăng nhập với type studio/admin mới được tạo game mới
create policy "Studios can create games" on games for INSERT
with
  check (
    auth.uid () = developer_id
    and exists (
      select
        1
      from
        user_profile
      where
        id = auth.uid ()
        and type in ('game_studio', 'admin')
    )
  );

-- Sửa game: Của ai người nấy sửa, admin sửa tất cả
create policy "Developers can update own games" on games
for update
  using (
    auth.uid () = developer_id
    or exists (
      select
        1
      from
        user_profile
      where
        id = auth.uid ()
        and type in ('admin', 'moderator')
    )
  );

---------------------------------------------------------
-- POLICY BẢNG `posts` (Forum/Bình luận)
---------------------------------------------------------
create policy "Public read access" on posts for
select
  using (is_archived = false);

-- Tạo: Phải có tài khoản
create policy "Users can create posts" on posts for INSERT
with
  check (auth.uid () = user_id);

-- Sửa: Chỉ sửa nội dung của mình
create policy "Users can update own posts" on posts
for update
  using (auth.uid () = user_id);

-- Xóa: User xóa bài mình, Admin/Mod xóa tất cả
create policy "Users can delete own, Admins delete all" on posts for DELETE using (
  auth.uid () = user_id
  or exists (
    select
      1
    from
      user_profile
    where
      id = auth.uid ()
      and type in ('admin', 'moderator')
  )
);

---------------------------------------------------------
-- POLICY BẢNG `game_votes` (Microservice)
---------------------------------------------------------
-- Xem lượt vote: Public
create policy "Public can view votes" on game_votes for
select
  using (is_archived = false);

-- Vote: Phải gắn với auth.uid() hiện tại (Chống giả mạo request ID người khác)
create policy "Users can only vote for themselves" on game_votes for INSERT
with
  check (auth.uid () = user_id);

-- Hủy vote: Xóa hoặc cập nhật lại vote của chính mình
create policy "Users can update own vote" on game_votes
for update
  using (auth.uid () = user_id);

create policy "Users can delete own vote" on game_votes for DELETE using (auth.uid () = user_id);

-- ==============================================================================
-- SCHEMA PATCH: Voting → Go Service
-- Áp dụng SAU khi đã chạy 1_schema.sql
--
-- Thay đổi:
--   ✅ Giữ nguyên bảng game_votes + trigger sync_game_vote_counts
--      (Go service ghi thẳng vào DB, trigger tự cập nhật games.upvote/downvote)
--   ✅ Thêm index tối ưu cho Go service query
--   ❌ Xóa RPC cast_vote_and_get_result (Go đảm nhận hoàn toàn)
--   ✅ Thêm RLS policy cho phép Go service (dùng service_role) ghi vào game_votes
-- ==============================================================================
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Xóa RPC cũ (đã được Go Service thay thế)
-- ─────────────────────────────────────────────────────────────────────────────
drop function IF exists cast_vote_and_get_result (UUID, vote_action_enum);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Indexes bổ sung tối ưu cho Go Service
--    Go query trực tiếp vào DB nên cần index chính xác theo pattern truy vấn
-- ─────────────────────────────────────────────────────────────────────────────
-- Index chính: Go dùng để tìm vote hiện tại của user trong tuần (FOR UPDATE)
-- Pattern: WHERE user_id = $1 AND game_id = $2 AND week_number = $3 AND year = $4
create unique INDEX IF not exists idx_game_votes_weekly_lookup on game_votes (user_id, game_id, week_number, year)
where
  is_archived = false;

-- NOTE: index này cũng enforce constraint unique_weekly_vote, 
--       có thể DROP constraint cũ nếu muốn dùng index này thay thế:
-- ALTER TABLE game_votes DROP CONSTRAINT IF EXISTS unique_weekly_vote;
-- Index cho Go query lấy vote counts: SELECT upvote, downvote FROM games WHERE id = $1
-- (đã có PK index trên games.id, không cần thêm)
-- Index tối ưu leaderboard RPC (get_leaderboard): GROUP BY year, week_number theo game
create index IF not exists idx_game_votes_leaderboard on game_votes (year, week_number, game_id, action)
where
  is_archived = false;

-- Index cho dashboard RPC (get_studio_dashboard): JOIN games ON developer_id + filter tuần
create index IF not exists idx_game_votes_studio_trend on game_votes (game_id, year, week_number, action)
where
  is_archived = false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS: Go Service dùng service_role key → bypass RLS tự động
--    Không cần thêm policy đặc biệt cho Go.
--    Tuy nhiên, cần đảm bảo các policy hiện tại KHÔNG chặn reads từ Go:
--
--    Policy "Public can view votes" ON game_votes FOR SELECT USING (is_archived = false)
--    → OK, Go service_role bypass RLS
--
--    Nếu Go dùng anon/authenticated key (không khuyến khích):
--    → Cần thêm policy INSERT/UPDATE/DELETE riêng cho service account
-- ─────────────────────────────────────────────────────────────────────────────
-- Ghi chú bảo mật:
-- Go Service KÉT NỐI với DATABASE_URL trực tiếp (postgres connection string)
-- KHÔNG dùng Supabase anon key → tự nhiên có quyền service_role level
-- → Tất cả RLS đều bị bypass ở tầng DB connection
-- → Việc kiểm tra quyền (auth.uid(), game published?) do Go tự xử lý trong code
-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Giữ nguyên trigger sync_game_vote_counts (không đổi)
--    Go INSERT/DELETE/UPDATE vào game_votes → trigger tự cộng/trừ games.upvote/downvote
--    Go sau đó SELECT upvote, downvote FROM games để lấy giá trị mới → broadcast WS
-- ─────────────────────────────────────────────────────────────────────────────
-- Kiểm tra trigger còn tồn tại:
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'game_votes'::regclass;
-- Kết quả mong đợi: sync_votes
-- ─────────────────────────────────────────────────────────────────────────────
-- 5. View tổng hợp vote theo tuần (optional - dùng cho debug/admin panel)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view v_weekly_vote_summary as
select
  g.id as game_id,
  g.name as game_name,
  gv.week_number,
  gv.year,
  COUNT(*) filter (
    where
      gv.action = 'upvote'
  ) as weekly_upvotes,
  COUNT(*) filter (
    where
      gv.action = 'downvote'
  ) as weekly_downvotes,
  COUNT(*) filter (
    where
      gv.action = 'upvote'
  ) - COUNT(*) filter (
    where
      gv.action = 'downvote'
  ) as weekly_score
from
  game_votes gv
  join games g on g.id = gv.game_id
where
  gv.is_archived = false
group by
  g.id,
  g.name,
  gv.week_number,
  gv.year;

COMMENT on VIEW v_weekly_vote_summary is 'Tổng hợp vote theo tuần cho admin panel / debug. Không dùng trong production query.';