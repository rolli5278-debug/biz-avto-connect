-- ============================================================
-- EnglishAI Learning Platform — Full Supabase Schema (idempotent)
-- Safe to run multiple times — skips anything already created.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES  (skipped if already exist)
-- ============================================================

DO $$ BEGIN CREATE TYPE subscription_type  AS ENUM ('free','pro','premium');        EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE english_level      AS ENUM ('A1','A2','B1','B2','C1','C2'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lesson_type        AS ENUM ('grammar','vocabulary','speaking','listening','reading','writing','ielts'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE difficulty         AS ENUM ('easy','medium','hard');         EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ielts_section      AS ENUM ('reading','writing','speaking','listening'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE achievement_rarity AS ENUM ('common','rare','epic','legendary'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE message_role       AS ENUM ('user','assistant','system');    EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE quiz_type          AS ENUM ('multiple_choice','fill_blank','listening','speaking','true_false'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL DEFAULT '',
  avatar_url           TEXT,
  bio                  TEXT,
  country              TEXT DEFAULT 'UZ',
  native_language      TEXT DEFAULT 'uz',
  level                english_level NOT NULL DEFAULT 'A1',
  xp                   INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak               INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  subscription_type    subscription_type NOT NULL DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  daily_goal           INTEGER NOT NULL DEFAULT 3 CHECK (daily_goal BETWEEN 1 AND 10),
  reminder_time        TIME,
  ui_language          TEXT NOT NULL DEFAULT 'en',
  last_active_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id           UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp          INTEGER NOT NULL DEFAULT 0,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  words_learned     INTEGER NOT NULL DEFAULT 0,
  minutes_practiced INTEGER NOT NULL DEFAULT 0,
  ielts_target      DECIMAL(3,1) CHECK (ielts_target BETWEEN 0 AND 9),
  quiz_accuracy     DECIMAL(5,2) DEFAULT 0,
  total_quizzes     INTEGER NOT NULL DEFAULT 0,
  last_streak_date  DATE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_activity (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  minutes   INTEGER NOT NULL DEFAULT 0,
  lessons   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  level            english_level NOT NULL,
  type             lesson_type NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 10 CHECK (duration_minutes > 0),
  xp_reward        INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward > 0),
  content          JSONB NOT NULL DEFAULT '{}',
  thumbnail_url    TEXT,
  is_premium       BOOLEAN NOT NULL DEFAULT FALSE,
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index      INTEGER NOT NULL DEFAULT 0,
  tags             TEXT[] DEFAULT '{}',
  author_id        UUID REFERENCES public.users(id),
  view_count       INTEGER NOT NULL DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,
  avg_score        DECIMAL(5,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  score        INTEGER CHECK (score BETWEEN 0 AND 100),
  time_spent   INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.vocabulary_words (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word             TEXT NOT NULL,
  definition       TEXT NOT NULL,
  example_sentence TEXT NOT NULL DEFAULT '',
  translation_uz   TEXT NOT NULL DEFAULT '',
  pronunciation    TEXT DEFAULT '',
  audio_url        TEXT,
  category         TEXT NOT NULL DEFAULT 'general',
  difficulty       difficulty NOT NULL DEFAULT 'medium',
  level            english_level,
  part_of_speech   TEXT DEFAULT 'noun',
  synonyms         TEXT[] DEFAULT '{}',
  antonyms         TEXT[] DEFAULT '{}',
  tags             TEXT[] DEFAULT '{}',
  frequency_rank   INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word_id     UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
  interval    INTEGER NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, word_id)
);

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'New Conversation',
  mode       TEXT NOT NULL DEFAULT 'free_chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            message_role NOT NULL,
  content         TEXT NOT NULL,
  type            TEXT DEFAULT 'text',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id  UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  type       quiz_type NOT NULL DEFAULT 'multiple_choice',
  level      english_level,
  xp_reward  INTEGER NOT NULL DEFAULT 30,
  time_limit INTEGER,
  questions  JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id      UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score        INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  answers      JSONB NOT NULL DEFAULT '[]',
  time_taken   INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.speaking_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic      TEXT NOT NULL,
  mode       TEXT NOT NULL DEFAULT 'pronunciation',
  duration   INTEGER NOT NULL DEFAULT 0,
  score      INTEGER CHECK (score BETWEEN 0 AND 100),
  feedback   TEXT,
  audio_url  TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ielts_practices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         ielts_section NOT NULL,
  section      TEXT NOT NULL,
  difficulty   difficulty NOT NULL DEFAULT 'medium',
  content      TEXT NOT NULL,
  answers      TEXT[] NOT NULL DEFAULT '{}',
  band_range   TEXT,
  time_allowed INTEGER,
  word_count   INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ielts_attempts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES public.ielts_practices(id) ON DELETE CASCADE,
  response    TEXT NOT NULL,
  band_score  DECIMAL(3,1),
  feedback    TEXT,
  ai_analysis JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '🏆',
  xp_reward   INTEGER NOT NULL DEFAULT 50,
  condition   TEXT NOT NULL,
  threshold   INTEGER,
  rarity      achievement_rarity NOT NULL DEFAULT 'common',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  slug                    subscription_type NOT NULL UNIQUE,
  price_monthly           DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly            DECIMAL(10,2) NOT NULL DEFAULT 0,
  features                TEXT[] NOT NULL DEFAULT '{}',
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly  TEXT
);

CREATE TABLE IF NOT EXISTS public.payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount         DECIMAL(10,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'USD',
  status         TEXT NOT NULL DEFAULT 'pending',
  provider       TEXT NOT NULL DEFAULT 'stripe',
  provider_ref   TEXT,
  plan           subscription_type,
  billing_period TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  user_id    UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL,
  avatar_url TEXT,
  country    TEXT DEFAULT 'UZ',
  weekly_xp  INTEGER NOT NULL DEFAULT 0,
  monthly_xp INTEGER NOT NULL DEFAULT 0,
  total_xp   INTEGER NOT NULL DEFAULT 0,
  streak     INTEGER NOT NULL DEFAULT 0,
  level      english_level NOT NULL DEFAULT 'A1',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  icon       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (IF NOT EXISTS requires PG 9.5+ — Supabase is fine)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email              ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_level              ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_xp                 ON public.users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_level            ON public.lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_type             ON public.lessons(type);
CREATE INDEX IF NOT EXISTS idx_lessons_premium          ON public.lessons(is_premium);
CREATE INDEX IF NOT EXISTS idx_lessons_published        ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_user_lessons_user        ON public.user_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lessons_lesson      ON public.user_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_vocab_category           ON public.vocabulary_words(category);
CREATE INDEX IF NOT EXISTS idx_vocab_level              ON public.vocabulary_words(level);
CREATE INDEX IF NOT EXISTS idx_vocab_difficulty         ON public.vocabulary_words(difficulty);
CREATE INDEX IF NOT EXISTS idx_flashcards_user          ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review   ON public.flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user  ON public.chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv       ON public.chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user       ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz       ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_speaking_sessions_user   ON public.speaking_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ielts_attempts_user      ON public.ielts_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user   ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user            ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly       ON public.leaderboard_cache(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly      ON public.leaderboard_cache(monthly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total        ON public.leaderboard_cache(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user       ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread     ON public.notifications(user_id, is_read) WHERE NOT is_read;

-- GIN index for vocabulary fuzzy search
DO $$ BEGIN
  CREATE INDEX idx_vocab_word ON public.vocabulary_words USING gin(word gin_trgm_ops);
EXCEPTION WHEN duplicate_table THEN null; END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ielts_attempts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_words   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ielts_practices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache  ENABLE ROW LEVEL SECURITY;

-- Drop policies before recreating (safe re-run)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Own-row policies
CREATE POLICY "users_select_own"      ON public.users              FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"      ON public.users              FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own"      ON public.users              FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "progress_own"          ON public.user_progress      FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "activity_own"          ON public.daily_activity     FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "user_lessons_own"      ON public.user_lessons       FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "flashcards_own"        ON public.flashcards         FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "conversations_own"     ON public.chat_conversations FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "messages_own"          ON public.chat_messages      FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_own"     ON public.quiz_attempts      FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "speaking_own"          ON public.speaking_sessions  FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "ielts_attempts_own"    ON public.ielts_attempts     FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "achievements_own"      ON public.user_achievements  FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "payments_own"          ON public.payments           FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "notifications_own"     ON public.notifications      FOR ALL    USING (auth.uid() = user_id);

-- Public read policies
CREATE POLICY "lessons_public_read"      ON public.lessons            FOR SELECT TO authenticated USING (is_published = TRUE);
CREATE POLICY "vocab_public_read"        ON public.vocabulary_words   FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "quizzes_public_read"      ON public.quizzes            FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "achievements_public_read" ON public.achievements       FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "plans_public_read"        ON public.subscription_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "ielts_public_read"        ON public.ielts_practices    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "leaderboard_public_read"  ON public.leaderboard_cache  FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger (safe re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at              ON public.users;
DROP TRIGGER IF EXISTS user_progress_updated_at      ON public.user_progress;
DROP TRIGGER IF EXISTS flashcards_updated_at         ON public.flashcards;
DROP TRIGGER IF EXISTS chat_conversations_updated_at ON public.chat_conversations;
DROP TRIGGER IF EXISTS lessons_updated_at            ON public.lessons;

CREATE TRIGGER users_updated_at              BEFORE UPDATE ON public.users              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER user_progress_updated_at      BEFORE UPDATE ON public.user_progress      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER flashcards_updated_at         BEFORE UPDATE ON public.flashcards         FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER lessons_updated_at            BEFORE UPDATE ON public.lessons            FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.add_user_xp(p_user_id UUID, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users          SET xp = xp + p_amount                   WHERE id = p_user_id;
  UPDATE public.user_progress  SET total_xp = total_xp + p_amount       WHERE user_id = p_user_id;
  UPDATE public.leaderboard_cache
    SET weekly_xp  = weekly_xp  + p_amount,
        monthly_xp = monthly_xp + p_amount,
        total_xp   = total_xp   + p_amount,
        updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================================
-- SEED DATA  (skipped if rows already exist)
-- ============================================================

INSERT INTO public.subscription_plans (name, slug, price_monthly, price_yearly, features) VALUES
('Free',    'free',    0,     0,      ARRAY['5 lessons per day','10 AI chat messages/day','Basic vocabulary (500 words)','Streak tracking','Basic progress tracking']),
('Pro',     'pro',     9.99,  95.90,  ARRAY['Unlimited lessons','Unlimited AI chat','Full vocabulary library (5000+ words)','Speaking practice','IELTS preparation','Advanced progress analytics','Pronunciation feedback','Priority support']),
('Premium', 'premium', 19.99, 191.90, ARRAY['Everything in Pro','Personal AI learning path','Pronunciation scoring','Offline access','Custom flashcard decks','Live group sessions','Certificate of completion','1-on-1 AI tutor sessions'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.achievements (title, description, icon, xp_reward, condition, threshold, rarity) VALUES
('First Step',        'Complete your first lesson',            '🎯', 50,   'lessons_completed',  1,   'common'),
('Quick Learner',     'Complete 5 lessons',                    '⚡', 100,  'lessons_completed',  5,   'common'),
('Dedicated Student', 'Complete 25 lessons',                   '📚', 200,  'lessons_completed',  25,  'rare'),
('Scholar',           'Complete 100 lessons',                  '🎓', 500,  'lessons_completed',  100, 'epic'),
('Vocabulary Novice', 'Learn 10 new words',                    '📖', 50,   'words_learned',      10,  'common'),
('Word Collector',    'Learn 100 words',                       '🔤', 200,  'words_learned',      100, 'rare'),
('Lexicon Master',    'Learn 500 words',                       '📚', 500,  'words_learned',      500, 'epic'),
('On Fire',           'Maintain a 3-day streak',               '🔥', 50,   'streak',             3,   'common'),
('Week Warrior',      'Maintain a 7-day streak',               '💪', 150,  'streak',             7,   'rare'),
('Monthly Master',    'Maintain a 30-day streak',              '🏆', 500,  'streak',             30,  'epic'),
('Century Streak',    'Maintain a 100-day streak',             '👑', 2000, 'streak',             100, 'legendary'),
('First Chat',        'Have your first AI tutor conversation', '🤖', 50,   'chat_messages',      1,   'common'),
('Grammar Guru',      'Score 100% on 5 grammar lessons',       '✅', 200,  'perfect_grammar',    5,   'rare'),
('Speed Demon',       'Complete a lesson in under 5 minutes',  '⚡', 100,  'speed_complete',     1,   'common'),
('Night Owl',         'Practice after midnight',               '🦉', 50,   'night_session',      1,   'common'),
('IELTS Ready',       'Complete all IELTS prep modules',       '🎯', 500,  'ielts_complete',     4,   'epic'),
('Pronunciation Pro', 'Score 90%+ on speaking 10 times',       '🎤', 300,  'high_pronunciation', 10,  'rare'),
('Early Bird',        'Practice before 7am',                   '🌅', 50,   'early_session',      1,   'common'),
('Team Player',       'Reach top 10 on leaderboard',           '🏅', 300,  'leaderboard_top10',  1,   'rare'),
('Champion',          'Reach #1 on the weekly leaderboard',    '👑', 1000, 'leaderboard_first',  1,   'legendary')
ON CONFLICT DO NOTHING;
