-- Drawings and Documents with versioning, linked to Steps
-- Idempotent migration with RLS policies

-- Drop existing objects if needed (for development)
DROP TABLE IF EXISTS step_references CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS drawing_versions CASCADE;
DROP TABLE IF EXISTS drawings CASCADE;

-- Drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  discipline TEXT,
  number TEXT NOT NULL,
  title TEXT,
  current_version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, number)
);

-- Drawing versions table
CREATE TABLE IF NOT EXISTS drawing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
  revision TEXT,
  issued_for TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drawing_id, version)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('spec', 'procedure', 'manual', 'rfi', 'submittal', 'other')),
  title TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version)
);

-- Step references table (links steps to drawings/documents)
CREATE TABLE IF NOT EXISTS step_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  ref_type TEXT NOT NULL CHECK (ref_type IN ('drawing', 'document')),
  drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  drawing_version INTEGER,
  document_version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(step_id, ref_type, drawing_id, document_id, drawing_version, document_version),
  CHECK (
    (ref_type = 'drawing' AND drawing_id IS NOT NULL AND document_id IS NULL) OR
    (ref_type = 'document' AND document_id IS NOT NULL AND drawing_id IS NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_project_number ON drawings(project_id, number);
CREATE INDEX IF NOT EXISTS idx_drawings_discipline ON drawings(discipline);

CREATE INDEX IF NOT EXISTS idx_drawing_versions_drawing_id ON drawing_versions(drawing_id);
CREATE INDEX IF NOT EXISTS idx_drawing_versions_drawing_version ON drawing_versions(drawing_id, version);
CREATE INDEX IF NOT EXISTS idx_drawing_versions_file_id ON drawing_versions(file_id);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_kind ON documents(kind);
CREATE INDEX IF NOT EXISTS idx_documents_project_kind ON documents(project_id, kind);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_version ON document_versions(document_id, version);
CREATE INDEX IF NOT EXISTS idx_document_versions_file_id ON document_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_status ON document_versions(status);

CREATE INDEX IF NOT EXISTS idx_step_references_step_id ON step_references(step_id);
CREATE INDEX IF NOT EXISTS idx_step_references_drawing_id ON step_references(drawing_id);
CREATE INDEX IF NOT EXISTS idx_step_references_document_id ON step_references(document_id);

-- Enable Row Level Security
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drawings
DROP POLICY IF EXISTS "Users can view drawings in their org projects" ON drawings;
CREATE POLICY "Users can view drawings in their org projects"
  ON drawings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = drawings.project_id
      AND p.org_id IN (SELECT auth.user_orgs())
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can create drawings" ON drawings;
CREATE POLICY "Org members (manager+) can create drawings"
  ON drawings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = drawings.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can update drawings" ON drawings;
CREATE POLICY "Org members (manager+) can update drawings"
  ON drawings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = drawings.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org admins can delete drawings" ON drawings;
CREATE POLICY "Org admins can delete drawings"
  ON drawings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = drawings.project_id
      AND auth.has_org_role(p.org_id, 'admin')
    )
  );

-- RLS Policies for drawing_versions
DROP POLICY IF EXISTS "Users can view drawing versions in their orgs" ON drawing_versions;
CREATE POLICY "Users can view drawing versions in their orgs"
  ON drawing_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = drawing_versions.drawing_id
      AND p.org_id IN (SELECT auth.user_orgs())
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can create drawing versions" ON drawing_versions;
CREATE POLICY "Org members (manager+) can create drawing versions"
  ON drawing_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = drawing_versions.drawing_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org admins can delete drawing versions" ON drawing_versions;
CREATE POLICY "Org admins can delete drawing versions"
  ON drawing_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = drawing_versions.drawing_id
      AND auth.has_org_role(p.org_id, 'admin')
    )
  );

-- RLS Policies for documents
DROP POLICY IF EXISTS "Users can view documents in their org projects" ON documents;
CREATE POLICY "Users can view documents in their org projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND p.org_id IN (SELECT auth.user_orgs())
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can create documents" ON documents;
CREATE POLICY "Org members (manager+) can create documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can update documents" ON documents;
CREATE POLICY "Org members (manager+) can update documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org admins can delete documents" ON documents;
CREATE POLICY "Org admins can delete documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND auth.has_org_role(p.org_id, 'admin')
    )
  );

-- RLS Policies for document_versions
DROP POLICY IF EXISTS "Users can view document versions in their orgs" ON document_versions;
CREATE POLICY "Users can view document versions in their orgs"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = document_versions.document_id
      AND p.org_id IN (SELECT auth.user_orgs())
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can create document versions" ON document_versions;
CREATE POLICY "Org members (manager+) can create document versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = document_versions.document_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org members (manager+) can update document versions" ON document_versions;
CREATE POLICY "Org members (manager+) can update document versions"
  ON document_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = document_versions.document_id
      AND auth.has_org_role(p.org_id, 'manager')
    )
  );

DROP POLICY IF EXISTS "Org admins can delete document versions" ON document_versions;
CREATE POLICY "Org admins can delete document versions"
  ON document_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = document_versions.document_id
      AND auth.has_org_role(p.org_id, 'admin')
    )
  );

-- RLS Policies for step_references
DROP POLICY IF EXISTS "Users can view step references in their orgs" ON step_references;
CREATE POLICY "Users can view step references in their orgs"
  ON step_references FOR SELECT
  USING (get_org_from_step(step_id) IN (SELECT auth.user_orgs()));

DROP POLICY IF EXISTS "Org members can manage step references" ON step_references;
CREATE POLICY "Org members can manage step references"
  ON step_references FOR ALL
  USING (auth.has_org_role(get_org_from_step(step_id), 'member'));

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON drawings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON drawings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON documents;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
