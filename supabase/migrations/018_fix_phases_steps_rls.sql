-- Fix phases/steps RLS and add project_id to steps for performance
-- This resolves "Project not found" errors and avoids circular RLS issues

-- 1) Add project_id column to steps table for denormalized query performance
ALTER TABLE steps ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- 2) Backfill project_id from phase->project relationship
UPDATE steps s
SET project_id = ph.project_id
FROM phases ph
WHERE s.phase_id = ph.id
  AND s.project_id IS NULL;

-- 3) Create index for performance
CREATE INDEX IF NOT EXISTS idx_steps_project_id ON steps(project_id);

-- 4) Add trigger to auto-populate project_id when inserting steps
CREATE OR REPLACE FUNCTION set_step_project_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    SELECT project_id INTO NEW.project_id
    FROM phases
    WHERE id = NEW.phase_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_step_project_id_trigger ON steps;
CREATE TRIGGER set_step_project_id_trigger
  BEFORE INSERT OR UPDATE ON steps
  FOR EACH ROW
  EXECUTE FUNCTION set_step_project_id();

-- 5) Drop old complex RLS policies that cause circular dependencies
DROP POLICY IF EXISTS "Users can view steps in their org projects" ON steps;
DROP POLICY IF EXISTS "Org members (manager+) can create steps" ON steps;
DROP POLICY IF EXISTS "Org members can update steps" ON steps;
DROP POLICY IF EXISTS "Org admins can delete steps" ON steps;

-- 6) Create simpler RLS policies using project_id directly
CREATE POLICY "Members can view steps in their org projects"
  ON steps FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p 
      WHERE p.org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can create steps in their org projects"
  ON steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = steps.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Members can update steps in their org projects"
  ON steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = steps.project_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete steps in their org projects"
  ON steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = steps.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- 7) Fix phases RLS to avoid auth.user_orgs() which has circular dependency issues
DROP POLICY IF EXISTS "Users can view phases in their org projects" ON phases;
DROP POLICY IF EXISTS "Org members (manager+) can create phases" ON phases;
DROP POLICY IF EXISTS "Org members (manager+) can update phases" ON phases;
DROP POLICY IF EXISTS "Org admins can delete phases" ON phases;

CREATE POLICY "Members can view phases in their org projects"
  ON phases FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p 
      WHERE p.org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can create phases in their org projects"
  ON phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = phases.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Members can update phases in their org projects"
  ON phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = phases.project_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete phases in their org projects"
  ON phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = phases.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- 8) Fix step_checkitems RLS
DROP POLICY IF EXISTS "Users can view checkitems in their org steps" ON step_checkitems;
DROP POLICY IF EXISTS "Org members can manage checkitems" ON step_checkitems;

CREATE POLICY "Members can view checkitems in their org projects"
  ON step_checkitems FOR SELECT
  USING (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      WHERE p.org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can manage checkitems in their org projects"
  ON step_checkitems FOR ALL
  USING (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );
