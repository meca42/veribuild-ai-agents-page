-- =====================================================
-- QA/QC: Issues and Inspections
-- =====================================================

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('defect', 'safety', 'coordination', 'other')) DEFAULT 'other',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'verified', 'closed')) DEFAULT 'open',
  priority INT DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  due_date DATE,
  assignee_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_created_by ON issues(created_by);

-- Issue Attachments
CREATE TABLE IF NOT EXISTS issue_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issue_attachments_issue ON issue_attachments(issue_id);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'passed', 'failed', 'closed')) DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  performed_at TIMESTAMPTZ,
  performed_by UUID REFERENCES users(id),
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspections_project_status ON inspections(project_id, status);
CREATE INDEX idx_inspections_performed_by ON inspections(performed_by);

-- Inspection Items
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  result TEXT CHECK (result IN ('pass', 'fail', 'n/a')) DEFAULT 'n/a',
  notes TEXT,
  order_index INT DEFAULT 0
);

CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);

-- Updated_at triggers
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- Issues Policies (commented out for testing - enable when RLS is ready)
-- SELECT: user must be member of org that owns the project
-- CREATE POLICY issues_select ON issues FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = issues.project_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- INSERT/UPDATE: user must be owner|admin|manager|qa of org
-- CREATE POLICY issues_insert ON issues FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = issues.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY issues_update ON issues FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = issues.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- DELETE: user must be owner|admin
-- CREATE POLICY issues_delete ON issues FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = issues.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Issue Attachments Policies
-- CREATE POLICY issue_attachments_select ON issue_attachments FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM issues i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = issue_attachments.issue_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY issue_attachments_insert ON issue_attachments FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM issues i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = issue_attachments.issue_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY issue_attachments_delete ON issue_attachments FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM issues i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = issue_attachments.issue_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Inspections Policies
-- CREATE POLICY inspections_select ON inspections FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inspections.project_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY inspections_insert ON inspections FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inspections.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY inspections_update ON inspections FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inspections.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY inspections_delete ON inspections FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM projects p
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE p.id = inspections.project_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );

-- Inspection Items Policies
-- CREATE POLICY inspection_items_select ON inspection_items FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM inspections i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = inspection_items.inspection_id
--       AND uo.user_id = auth.uid()
--     )
--   );

-- CREATE POLICY inspection_items_insert ON inspection_items FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM inspections i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = inspection_items.inspection_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY inspection_items_update ON inspection_items FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM inspections i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = inspection_items.inspection_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin', 'manager', 'qa')
--     )
--   );

-- CREATE POLICY inspection_items_delete ON inspection_items FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM inspections i
--       JOIN projects p ON p.id = i.project_id
--       JOIN user_orgs uo ON uo.org_id = p.org_id
--       WHERE i.id = inspection_items.inspection_id
--       AND uo.user_id = auth.uid()
--       AND uo.role IN ('owner', 'admin')
--     )
--   );
