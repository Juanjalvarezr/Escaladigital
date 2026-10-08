-- Supabase Database Schema for Escala Digital App
-- Run this SQL in the Supabase SQL Editor to create all tables

-- Companies table (scalable: 1 user = 1 company initially, then multiple users per company)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  profile_json JSONB DEFAULT '{}'::jsonb,
  profile_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  company TEXT,
  industry TEXT,
  interests TEXT[],
  default_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company members (supports roles and areas of training)
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  quiz_score INTEGER,
  lessons_completed TEXT[] DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- User lessons (generated content)
CREATE TABLE user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  key_points TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL,
  duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- User quizzes
CREATE TABLE user_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  questions JSONB NOT NULL,
  user_answers INTEGER[] DEFAULT '{}',
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- User diagnostics
CREATE TABLE user_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  main_challenge TEXT NOT NULL,
  business_description TEXT NOT NULL,
  scalability_roadmap JSONB NOT NULL,
  recommended_modules TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved lessons for later
CREATE TABLE saved_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Analytics: generic event stream (company-scoped)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics: tool signals (clicks / usage witnesses)
CREATE TABLE tool_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tool_key TEXT NOT NULL,
  tool_url TEXT,
  source_type TEXT,
  source_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_default_company ON users(default_company_id);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_company_members_company_user ON company_members(company_id, user_id);
CREATE INDEX idx_user_progress_user_module ON user_progress(user_id, module_id);
CREATE INDEX idx_user_lessons_user_module ON user_lessons(user_id, lesson_id);
CREATE INDEX idx_user_quizzes_user_module ON user_quizzes(user_id, module_id);
CREATE INDEX idx_user_diagnostics_user ON user_diagnostics(user_id);
CREATE INDEX idx_saved_lessons_user ON saved_lessons(user_id);
CREATE INDEX idx_analytics_events_company_created ON analytics_events(company_id, created_at);
CREATE INDEX idx_tool_clicks_company_created ON tool_clicks(company_id, created_at);

-- Row Level Security Policies
-- Enable RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_clicks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can create companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can view their companies" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Owners/admins can manage their companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id::text = auth.uid()::text
        AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create initial membership" ON company_members
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id::text = auth.uid()::text
    AND role = 'owner'
  );

CREATE POLICY "Members can view company memberships" ON company_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = company_members.company_id
        AND cm.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Owners/admins can manage memberships" ON company_members
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = company_members.company_id
        AND cm.user_id::text = auth.uid()::text
        AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own lessons" ON user_lessons
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own lessons" ON user_lessons
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own quizzes" ON user_quizzes
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own quizzes" ON user_quizzes
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own diagnostics" ON user_diagnostics
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own diagnostics" ON user_diagnostics
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own saved lessons" ON saved_lessons
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own saved lessons" ON saved_lessons
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Members can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = analytics_events.company_id
        AND cm.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Owners/admins can view analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = analytics_events.company_id
        AND cm.user_id::text = auth.uid()::text
        AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members can insert tool clicks" ON tool_clicks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = tool_clicks.company_id
        AND cm.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Owners/admins can view tool clicks" ON tool_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM company_members cm
      WHERE cm.company_id = tool_clicks.company_id
        AND cm.user_id::text = auth.uid()::text
        AND cm.role IN ('owner', 'admin')
    )
  );
