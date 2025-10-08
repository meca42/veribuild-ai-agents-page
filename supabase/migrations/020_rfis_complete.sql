-- Complete RFI module: tables, indexes, RLS policies
-- Status flow: open → answered → closed (with reopened option)
-- Links to drawings, assignees, file attachments

-- ========== TABLES ==========

CREATE TABLE IF NOT EXISTS public.rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed', 'reopened')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  drawing_id UUID REFERENCES public.drawings(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rfi_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES public.rfis(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========

CREATE INDEX IF NOT EXISTS idx_rfis_project_status_due ON public.rfis(project_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_rfis_project_created ON public.rfis(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfis_assigned ON public.rfis(assigned_to);
CREATE INDEX IF NOT EXISTS idx_rfis_drawing ON public.rfis(drawing_id);
CREATE INDEX IF NOT EXISTS idx_rfi_attachments_rfi ON public.rfi_attachments(rfi_id);
CREATE INDEX IF NOT EXISTS idx_rfi_attachments_file ON public.rfi_attachments(file_id);

-- ========== RLS ==========

ALTER TABLE public.rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfi_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate cleanly
DROP POLICY IF EXISTS "Members view rfis" ON public.rfis;
DROP POLICY IF EXISTS "Managers create rfis" ON public.rfis;
DROP POLICY IF EXISTS "Managers update rfis" ON public.rfis;
DROP POLICY IF EXISTS "Managers delete rfis" ON public.rfis;
DROP POLICY IF EXISTS "Members view rfi attachments" ON public.rfi_attachments;
DROP POLICY IF EXISTS "Managers manage rfi attachments" ON public.rfi_attachments;

-- RFIs: Members can view, Managers can create/update/delete
CREATE POLICY "Members can view rfis in their org projects"
  ON public.rfis FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      WHERE p.org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can create rfis in their org projects"
  ON public.rfis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      INNER JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id = rfis.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Managers can update rfis in their org projects"
  ON public.rfis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      INNER JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id = rfis.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Managers can delete rfis in their org projects"
  ON public.rfis FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      INNER JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id = rfis.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

-- RFI Attachments: Members can view, Managers can manage
CREATE POLICY "Members can view rfi attachments in their org"
  ON public.rfi_attachments FOR SELECT
  USING (
    rfi_id IN (
      SELECT r.id FROM public.rfis r
      INNER JOIN public.projects p ON p.id = r.project_id
      WHERE p.org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can create rfi attachments in their org"
  ON public.rfi_attachments FOR INSERT
  WITH CHECK (
    rfi_id IN (
      SELECT r.id FROM public.rfis r
      INNER JOIN public.projects p ON p.id = r.project_id
      INNER JOIN public.org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Managers can delete rfi attachments in their org"
  ON public.rfi_attachments FOR DELETE
  USING (
    rfi_id IN (
      SELECT r.id FROM public.rfis r
      INNER JOIN public.projects p ON p.id = r.project_id
      INNER JOIN public.org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

-- ========== TRIGGERS ==========

-- Updated_at trigger for rfis
DROP TRIGGER IF EXISTS trg_rfis_updated_at ON public.rfis;
CREATE TRIGGER trg_rfis_updated_at 
  BEFORE UPDATE ON public.rfis
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========== COMMENTS ==========

COMMENT ON TABLE public.rfis IS 'Request for Information: questions raised during construction/planning';
COMMENT ON TABLE public.rfi_attachments IS 'File attachments linked to RFIs';
COMMENT ON COLUMN public.rfis.status IS 'Workflow: open → answered → closed (or reopened)';
COMMENT ON COLUMN public.rfis.priority IS 'Priority level for RFI response';
