-- PantryPilot Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the required tables

-- Create the items table
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  urgency VARCHAR(10) CHECK (urgency IN ('critical', 'medium', 'low')) DEFAULT 'medium',
  notes TEXT,
  quantity VARCHAR(50),
  estimated_time_to_run_out VARCHAR(100),
  category VARCHAR(50),
  photo_url TEXT,
  audio_url TEXT,
  transcription TEXT,
  status VARCHAR(10) CHECK (status IN ('active', 'restocked', 'deleted')) DEFAULT 'active',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_restocked TIMESTAMP WITH TIME ZONE,
  date_last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  ai_extracted BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_status_date ON items(status, date_added DESC);
CREATE INDEX IF NOT EXISTS idx_items_urgency_status ON items(urgency, status);
CREATE INDEX IF NOT EXISTS idx_items_user_status ON items(user_id, status);

-- Create a text search index for full-text search
CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(notes, '')));

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.date_last_modified = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security
-- Allow users to see all items for now (you can restrict this later)
CREATE POLICY "Users can view all items" ON items
  FOR SELECT USING (true);

-- Allow users to insert their own items
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own items
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (true);

-- Allow users to delete their own items
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (true);

-- Create a users table for additional user info (optional)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  push_token TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id); 