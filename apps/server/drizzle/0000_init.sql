-- score_histogram_daily
CREATE TABLE IF NOT EXISTS "score_histogram_daily" (
  "date" date NOT NULL,
  "bucket" integer NOT NULL,
  "count" bigint DEFAULT 0 NOT NULL,
  PRIMARY KEY ("date", "bucket")
);

-- challenge_stats_daily
CREATE TABLE IF NOT EXISTS "challenge_stats_daily" (
  "date" date NOT NULL,
  "game_type" varchar(20) NOT NULL,
  "level" integer NOT NULL,
  "attempts" bigint DEFAULT 0 NOT NULL,
  "successes" bigint DEFAULT 0 NOT NULL,
  PRIMARY KEY ("date", "game_type", "level")
);

-- leaderboard
CREATE TABLE IF NOT EXISTS "leaderboard" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_hash" varchar(64) NOT NULL,
  "scope" varchar(20) NOT NULL,
  "year_month" varchar(7) NOT NULL,
  "score" integer NOT NULL,
  "max_level" integer NOT NULL,
  "created_at" date NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "leaderboard_user_scope_ym_idx" ON "leaderboard" ("user_hash","scope","year_month");
