-- Add profile fields for Tully to remember user details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS current_goal TEXT,
ADD COLUMN IF NOT EXISTS skills_assessed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_session_summary TEXT;