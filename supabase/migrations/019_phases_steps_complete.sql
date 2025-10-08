-- Complete Phases/Steps schema audit and fixes
-- Ensures all columns, constraints, indexes, triggers, and RLS are properly configured

-- ========== Ensure Extensions ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== Audit/Fix Tables ==========

-- Phases: ensure all columns exist
DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS sequence INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS planned_start DATE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS planned_end DATE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE phases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Steps: ensure all columns exist (including project_id from migration 018)
DO $$ BEGIN
  ALTER TABLE steps ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Make phase_id nullable (it can be null if phase is deleted)
ALTER TABLE steps ALTER COLUMN phase_id DROP NOT NULL;

-- Ensure status check constraint includes all valid values
DO $$ BEGIN
  ALTER TABLE steps DROP CONSTRAINT IF EXISTS steps_status_check;
  ALTER TABLE steps ADD CONSTRAINT steps_status_check 
    CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step checkitems: ensure order_index exists
DO $$ BEGIN
  ALTER TABLE step_checkitems ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE step_checkitems ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ========== Indexes ==========
CREATE INDEX IF NOT EXISTS idx_phases_project_sequence ON phases(project_id, sequence);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);

CREATE INDEX IF NOT EXISTS idx_steps_project_id ON steps(project_id);
CREATE INDEX IF NOT EXISTS idx_steps_phase_id ON steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_steps_created_at ON steps(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status);

CREATE INDEX IF NOT EXISTS idx_checkitems_step_id ON step_checkitems(step_id);

-- ========== Triggers ==========

-- Updated_at trigger function (reuse existing from migration 003)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Phases updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON phases;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Steps updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON steps;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step checkitems updated_at trigger
DROP TRIGGER IF EXISTS trg_checkitems_updated_at ON step_checkitems;
CREATE TRIGGER trg_checkitems_updated_at
  BEFORE UPDATE ON step_checkitems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-populate step.project_id from phase (already exists from migration 018 but ensuring it's here)
CREATE OR REPLACE FUNCTION set_step_project_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NULL AND NEW.phase_id IS NOT NULL THEN
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

-- Backfill any missing project_id values
UPDATE steps s
SET project_id = ph.project_id
FROM phases ph
WHERE s.phase_id = ph.id
  AND s.project_id IS NULL;

-- ========== RLS Policies ==========

-- Enable RLS (idempotent)
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_checkitems ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Members can view phases in their org projects" ON phases;
DROP POLICY IF EXISTS "Managers can create phases in their org projects" ON phases;
DROP POLICY IF EXISTS "Members can update phases in their org projects" ON phases;
DROP POLICY IF EXISTS "Admins can delete phases in their org projects" ON phases;

DROP POLICY IF EXISTS "Members can view steps in their org projects" ON steps;
DROP POLICY IF EXISTS "Managers can create steps in their org projects" ON steps;
DROP POLICY IF EXISTS "Members can update steps in their org projects" ON steps;
DROP POLICY IF EXISTS "Admins can delete steps in their org projects" ON steps;

DROP POLICY IF EXISTS "Members can view checkitems in their org projects" ON step_checkitems;
DROP POLICY IF EXISTS "Members can manage checkitems in their org projects" ON step_checkitems;

-- PHASES policies
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

CREATE POLICY "Managers can update phases in their org projects"
  ON phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = phases.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
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

-- STEPS policies
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

CREATE POLICY "Managers can update steps in their org projects"
  ON steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE p.id = steps.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
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

-- STEP_CHECKITEMS policies
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

CREATE POLICY "Managers can create checkitems in their org projects"
  ON step_checkitems FOR INSERT
  WITH CHECK (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Managers can update checkitems in their org projects"
  ON step_checkitems FOR UPDATE
  USING (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Managers can delete checkitems in their org projects"
  ON step_checkitems FOR DELETE
  USING (
    step_id IN (
      SELECT s.id FROM steps s
      INNER JOIN projects p ON p.id = s.project_id
      INNER JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'manager')
    )
  );
