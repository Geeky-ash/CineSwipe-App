-- ============================================
-- CineSwipe Supabase Schema (Fix Run)
-- Run this in: Supabase Dashboard > SQL Editor
-- This handles an EXISTING Watchlist table
-- ============================================

-- 1. Add user_id column if it doesn't already exist
ALTER TABLE "Watchlist"
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Disable Row Level Security so guest saves work instantly
ALTER TABLE "Watchlist" DISABLE ROW LEVEL SECURITY;

-- 3. (Optional) Unique index to prevent duplicate saves per user
--    Only runs if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'Watchlist'
    AND indexname = 'watchlist_unique_user_movie'
  ) THEN
    CREATE UNIQUE INDEX watchlist_unique_user_movie
      ON "Watchlist" (user_id, movie_id)
      WHERE user_id IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- 4. Saved Actors Table
-- ============================================
CREATE TABLE IF NOT EXISTS "SavedActors" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  profile_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Disable RLS for SavedActors (Local Dev)
ALTER TABLE "SavedActors" DISABLE ROW LEVEL SECURITY;

-- 6. Unique index to prevent duplicate saves per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'SavedActors'
    AND indexname = 'savedactors_unique_user_actor'
  ) THEN
    CREATE UNIQUE INDEX savedactors_unique_user_actor
      ON "SavedActors" (user_id, actor_id)
      WHERE user_id IS NOT NULL;
  END IF;
END $$;
