-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');

CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Organization invitations table
CREATE TABLE IF NOT EXISTS org_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- Projects table
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'archived');

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  location TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  spent DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON org_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON org_invites(email);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);

-- Helper function to get current user's organizations
CREATE OR REPLACE FUNCTION auth.user_orgs()
RETURNS SETOF UUID AS $$
  SELECT org_id
  FROM org_members
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user has role in org
CREATE OR REPLACE FUNCTION auth.has_org_role(org UUID, required_role org_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_members
    WHERE org_id = org
      AND user_id = auth.uid()
      AND role::text >= required_role::text
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user is org member
CREATE OR REPLACE FUNCTION auth.is_org_member(org UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_members
    WHERE org_id = org
      AND user_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for orgs table
CREATE POLICY "Users can view orgs they are members of"
  ON orgs FOR SELECT
  USING (id IN (SELECT auth.user_orgs()));

CREATE POLICY "Org owners/admins can update org"
  ON orgs FOR UPDATE
  USING (auth.has_org_role(id, 'admin'));

CREATE POLICY "Any authenticated user can create an org"
  ON orgs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for org_members table
CREATE POLICY "Users can view members of their orgs"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

CREATE POLICY "Org owners/admins can manage members"
  ON org_members FOR ALL
  USING (auth.has_org_role(org_id, 'admin'));

CREATE POLICY "Users can insert themselves as org owner on org creation"
  ON org_members FOR INSERT
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- RLS Policies for org_invites table
CREATE POLICY "Users can view invites for their orgs"
  ON org_invites FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()) OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Org owners/admins can create invites"
  ON org_invites FOR INSERT
  WITH CHECK (auth.has_org_role(org_id, 'admin'));

CREATE POLICY "Org owners/admins can delete invites"
  ON org_invites FOR DELETE
  USING (auth.has_org_role(org_id, 'admin'));

CREATE POLICY "Users can update invites sent to their email"
  ON org_invites FOR UPDATE
  USING (email = (SELECT email FROM users WHERE id = auth.uid()));

-- RLS Policies for projects table
CREATE POLICY "Users can view projects in their orgs"
  ON projects FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members (manager+) can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.has_org_role(org_id, 'manager'));

CREATE POLICY "Org members (manager+) can update projects"
  ON projects FOR UPDATE
  USING (auth.has_org_role(org_id, 'manager'));

CREATE POLICY "Org admins can delete projects"
  ON projects FOR DELETE
  USING (auth.has_org_role(org_id, 'admin'));

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
