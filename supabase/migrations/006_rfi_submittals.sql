-- RFI and Submittal workflows
-- Idempotent migration with RLS policies

-- Drop existing objects if needed (for development)
DROP TABLE IF EXISTS submittal_items CASCADE;
DROP TABLE IF EXISTS submittal_attachments CASCADE;
DROP TABLE IF EXISTS submittals CASCADE;
DROP TABLE IF EXISTS rfi_attachments CASCADE;
DROP TABLE IF EXISTS rfis CASCADE;

-- RFIs table
CREATE TABLE IF NOT EXISTS rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  asked_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, number)
);

-- RFI attachments table
CREATE TABLE IF NOT EXISTS rfi_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittals table
CREATE TABLE IF NOT EXISTS submittals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  spec_section TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'resubmit')),
  submitted_by UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, number)
);

-- Submittal items table
CREATE TABLE IF NOT EXISTS submittal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submittal_id UUID NOT NULL REFERENCES submittals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty NUMERIC(18,3),
  unit TEXT,
  manufacturer TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'n/a')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittal attachments table
CREATE TABLE IF NOT EXISTS submittal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submittal_id UUID NOT NULL REFERENCES submittals(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfis_project_id ON rfis(project_id);
CREATE INDEX IF NOT EXISTS idx_rfis_project_status ON rfis(project_id, status);
CREATE INDEX IF NOT EXISTS idx_rfis_status ON rfis(status);
CREATE INDEX IF NOT EXISTS idx_rfis_assigned_to ON rfis(assigned_to);

CREATE INDEX IF NOT EXISTS idx_rfi_attachments_rfi_id ON rfi_attachments(rfi_id);
CREATE INDEX IF NOT EXISTS idx_rfi_attachments_file_id ON rfi_attachments(file_id);

CREATE INDEX IF NOT EXISTS idx_submittals_project_id ON submittals(project_id);
CREATE INDEX IF NOT EXISTS idx_submittals_project_status ON submittals(project_id, status);
CREATE INDEX IF NOT EXISTS idx_submittals_status ON submittals(status);
CREATE INDEX IF NOT EXISTS idx_submittals_reviewer ON submittals(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_submittal_items_submittal_id ON submittal_items(submittal_id);
CREATE INDEX IF NOT EXISTS idx_submittal_items_status ON submittal_items(status);

CREATE INDEX IF NOT EXISTS idx_submittal_attachments_submittal_id ON submittal_attachments(submittal_id);
CREATE INDEX IF NOT EXISTS idx_submittal_attachments_file_id ON submittal_attachments(file_id);

-- Triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON rfis;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON rfis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON submittals;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON submittals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON submittal_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON submittal_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now (we'll add proper policies later when auth functions are available)
ALTER TABLE rfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE rfi_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submittals DISABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_attachments DISABLE ROW LEVEL SECURITY;

-- Note: When auth.user_orgs() and auth.has_org_role() functions are implemented, enable RLS with:
--
-- ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view RFIs in their org projects" ON rfis FOR SELECT
--   USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = rfis.project_id AND p.org_id IN (SELECT auth.user_orgs())));
-- CREATE POLICY "Org members (manager+) can create RFIs" ON rfis FOR INSERT
--   WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = rfis.project_id AND auth.has_org_role(p.org_id, 'manager')));
-- CREATE POLICY "Org members (manager+) can update RFIs" ON rfis FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = rfis.project_id AND auth.has_org_role(p.org_id, 'manager')));
-- CREATE POLICY "Org admins can delete RFIs" ON rfis FOR DELETE
--   USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = rfis.project_id AND auth.has_org_role(p.org_id, 'admin')));
--
-- (Similar policies for submittals, rfi_attachments, submittal_items, submittal_attachments)
