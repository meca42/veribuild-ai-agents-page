-- Core workflow tables: phases, steps, step_checkitems, files
-- Idempotent migration with RLS policies

-- Drop existing objects if needed (for development)
DROP TABLE IF EXISTS step_checkitems CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS files CASCADE;

-- Phases table
CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'done')),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps table
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step check items table
CREATE TABLE IF NOT EXISTS step_checkitems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  done_by UUID,
  done_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  sha256 TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_phases_project_sequence ON phases(project_id, sequence);

CREATE INDEX IF NOT EXISTS idx_steps_phase_id ON steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status);
CREATE INDEX IF NOT EXISTS idx_steps_assignee ON steps(assignee_id);

CREATE INDEX IF NOT EXISTS idx_step_checkitems_step_id ON step_checkitems(step_id);

CREATE INDEX IF NOT EXISTS idx_files_org_id ON files(org_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_bucket ON files(bucket);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);

-- Helper function to get org_id from phase_id
CREATE OR REPLACE FUNCTION get_org_from_phase(phase_id_param UUID)
RETURNS UUID AS $$
  SELECT p.org_id 
  FROM phases ph
  JOIN projects p ON ph.project_id = p.id
  WHERE ph.id = phase_id_param;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to get org_id from step_id
CREATE OR REPLACE FUNCTION get_org_from_step(step_id_param UUID)
RETURNS UUID AS $$
  SELECT p.org_id 
  FROM steps s
  JOIN phases ph ON s.phase_id = ph.id
  JOIN projects p ON ph.project_id = p.id
  WHERE s.id = step_id_param;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_checkitems ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phases
DROP POLICY IF EXISTS "Users can view phases in their org projects" ON phases;
CREATE POLICY "Users can view phases in their org projects"
  ON phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = phases.project_id
      AND p.org_id IN (SELECT auth.user_orgs())
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can create phases" ON phases;
CREATE POLICY "Org members (manager+) can create phases"
  ON phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = phases.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can update phases" ON phases;
CREATE POLICY "Org members (manager+) can update phases"
  ON phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = phases.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org admins can delete phases" ON phases;
CREATE POLICY "Org admins can delete phases"
  ON phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = phases.project_id
      AND auth.has_org_role(p.org_id, 'admin')
    )
  );

-- RLS Policies for steps
DROP POLICY IF EXISTS "Users can view steps in their org projects" ON steps;
CREATE POLICY "Users can view steps in their org projects"
  ON steps FOR SELECT
  USING (get_org_from_step(id) IN (SELECT auth.user_orgs()));

DROP POLICY IF EXISTS "Org members (manager+) can create steps" ON steps;
CREATE POLICY "Org members (manager+) can create steps"
  ON steps FOR INSERT
  WITH CHECK (auth.has_org_role(get_org_from_phase(phase_id), 'manager'));

DROP POLICY IF EXISTS "Org members can update steps" ON steps;
CREATE POLICY "Org members can update steps"
  ON steps FOR UPDATE
  USING (auth.has_org_role(get_org_from_step(id), 'member'));

DROP POLICY IF EXISTS "Org admins can delete steps" ON steps;
CREATE POLICY "Org admins can delete steps"
  ON steps FOR DELETE
  USING (auth.has_org_role(get_org_from_step(id), 'admin'));

-- RLS Policies for step_checkitems
DROP POLICY IF EXISTS "Users can view checkitems in their org steps" ON step_checkitems;
CREATE POLICY "Users can view checkitems in their org steps"
  ON step_checkitems FOR SELECT
  USING (get_org_from_step(step_id) IN (SELECT auth.user_orgs()));

DROP POLICY IF EXISTS "Org members can manage checkitems" ON step_checkitems;
CREATE POLICY "Org members can manage checkitems"
  ON step_checkitems FOR ALL
  USING (auth.has_org_role(get_org_from_step(step_id), 'member'));

-- RLS Policies for files
DROP POLICY IF EXISTS "Users can view files in their orgs" ON files;
CREATE POLICY "Users can view files in their orgs"
  ON files FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

DROP POLICY IF EXISTS "Org members can upload files" ON files;
CREATE POLICY "Org members can upload files"
  ON files FOR INSERT
  WITH CHECK (auth.has_org_role(org_id, 'member'));

DROP POLICY IF EXISTS "Org members can update files" ON files;
CREATE POLICY "Org members can update files"
  ON files FOR UPDATE
  USING (auth.has_org_role(org_id, 'member'));

DROP POLICY IF EXISTS "Org admins can delete files" ON files;
CREATE POLICY "Org admins can delete files"
  ON files FOR DELETE
  USING (auth.has_org_role(org_id, 'admin'));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON phases;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON steps;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
