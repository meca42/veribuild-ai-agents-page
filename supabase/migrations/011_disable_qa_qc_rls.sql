-- Temporarily disable RLS for QA/QC tables during testing
-- Re-enable when authentication and user_orgs are properly set up

ALTER TABLE issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items DISABLE ROW LEVEL SECURITY;
