-- Phases table
CREATE TYPE phase_status AS ENUM ('not_started', 'in_progress', 'blocked', 'done');

CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status phase_status NOT NULL DEFAULT 'not_started',
  "order" INTEGER NOT NULL DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps table
CREATE TYPE step_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');

CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status step_status NOT NULL DEFAULT 'todo',
  assignee TEXT,
  due_date DATE,
  checklist JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drawings table
CREATE TYPE drawing_status AS ENUM ('draft', 'under_review', 'approved', 'superseded');

CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  discipline TEXT,
  status drawing_status NOT NULL DEFAULT 'draft',
  current_version INTEGER DEFAULT 1,
  current_revision TEXT DEFAULT 'A',
  versions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TYPE document_status AS ENUM ('draft', 'under_review', 'approved', 'archived');

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  status document_status NOT NULL DEFAULT 'draft',
  current_version INTEGER DEFAULT 1,
  versions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFIs table
CREATE TYPE rfi_status AS ENUM ('open', 'pending_response', 'answered', 'closed');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE IF NOT EXISTS rfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT,
  status rfi_status NOT NULL DEFAULT 'open',
  priority priority NOT NULL DEFAULT 'medium',
  requested_by TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittals table
CREATE TYPE submittal_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revised');

CREATE TABLE IF NOT EXISTS submittals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  status submittal_status NOT NULL DEFAULT 'draft',
  items JSONB DEFAULT '[]'::jsonb,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status issue_status NOT NULL DEFAULT 'open',
  priority priority NOT NULL DEFAULT 'medium',
  assigned_to TEXT,
  reported_by TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections table
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'passed', 'failed', 'n/a');

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  inspector TEXT,
  status inspection_status NOT NULL DEFAULT 'scheduled',
  result TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_steps_project_id ON steps(project_id);
CREATE INDEX IF NOT EXISTS idx_steps_phase_id ON steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_rfis_project_id ON rfis(project_id);
CREATE INDEX IF NOT EXISTS idx_submittals_project_id ON submittals(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_project_id ON inspections(project_id);

-- Helper function to get org_id from project_id
CREATE OR REPLACE FUNCTION get_org_from_project(project UUID)
RETURNS UUID AS $$
  SELECT org_id FROM projects WHERE id = project;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Enable RLS
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phases
CREATE POLICY "Users can view phases in their org projects"
  ON phases FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members (manager+) can manage phases"
  ON phases FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'manager'));

-- RLS Policies for steps
CREATE POLICY "Users can view steps in their org projects"
  ON steps FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage steps"
  ON steps FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for drawings
CREATE POLICY "Users can view drawings in their org projects"
  ON drawings FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage drawings"
  ON drawings FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their org projects"
  ON documents FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage documents"
  ON documents FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for rfis
CREATE POLICY "Users can view rfis in their org projects"
  ON rfis FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage rfis"
  ON rfis FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for submittals
CREATE POLICY "Users can view submittals in their org projects"
  ON submittals FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage submittals"
  ON submittals FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for issues
CREATE POLICY "Users can view issues in their org projects"
  ON issues FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage issues"
  ON issues FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- RLS Policies for inspections
CREATE POLICY "Users can view inspections in their org projects"
  ON inspections FOR SELECT
  USING (get_org_from_project(project_id) IN (SELECT auth.user_orgs()));

CREATE POLICY "Org members can manage inspections"
  ON inspections FOR ALL
  USING (auth.has_org_role(get_org_from_project(project_id), 'member'));

-- Update triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON phases FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON steps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON drawings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rfis FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON submittals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
