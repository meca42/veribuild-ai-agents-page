-- Supabase Storage Buckets and Policies
-- Run this in Supabase Dashboard → Storage → SQL

-- Create storage buckets (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('drawings', 'drawings', false),
  ('documents', 'documents', false),
  ('receipts', 'receipts', false),
  ('artifacts', 'artifacts', false)
ON CONFLICT (id) DO NOTHING;

-- Helper function to get org_id from storage path
-- Expected path format: {org_id}/{project_id?}/{filename}
CREATE OR REPLACE FUNCTION storage.get_org_from_path(path TEXT)
RETURNS UUID AS $$
  SELECT CASE 
    WHEN path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' 
    THEN (regexp_match(path, '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))[1]::uuid
    ELSE NULL
  END;
$$ LANGUAGE SQL STABLE;

-- RLS policies for drawings bucket
DROP POLICY IF EXISTS "Org members can read drawings" ON storage.objects;
CREATE POLICY "Org members can read drawings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'drawings'
    AND storage.get_org_from_path(name) IN (SELECT auth.user_orgs())
  );

DROP POLICY IF EXISTS "Org members can upload drawings" ON storage.objects;
CREATE POLICY "Org members can upload drawings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'drawings'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org members can update drawings" ON storage.objects;
CREATE POLICY "Org members can update drawings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'drawings'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org admins can delete drawings" ON storage.objects;
CREATE POLICY "Org admins can delete drawings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'drawings'
    AND auth.has_org_role(storage.get_org_from_path(name), 'admin')
  );

-- RLS policies for documents bucket
DROP POLICY IF EXISTS "Org members can read documents" ON storage.objects;
CREATE POLICY "Org members can read documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND storage.get_org_from_path(name) IN (SELECT auth.user_orgs())
  );

DROP POLICY IF EXISTS "Org members can upload documents" ON storage.objects;
CREATE POLICY "Org members can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org members can update documents" ON storage.objects;
CREATE POLICY "Org members can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org admins can delete documents" ON storage.objects;
CREATE POLICY "Org admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.has_org_role(storage.get_org_from_path(name), 'admin')
  );

-- RLS policies for receipts bucket
DROP POLICY IF EXISTS "Org members can read receipts" ON storage.objects;
CREATE POLICY "Org members can read receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND storage.get_org_from_path(name) IN (SELECT auth.user_orgs())
  );

DROP POLICY IF EXISTS "Org members can upload receipts" ON storage.objects;
CREATE POLICY "Org members can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org members can update receipts" ON storage.objects;
CREATE POLICY "Org members can update receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org admins can delete receipts" ON storage.objects;
CREATE POLICY "Org admins can delete receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'admin')
  );

-- RLS policies for artifacts bucket
DROP POLICY IF EXISTS "Org members can read artifacts" ON storage.objects;
CREATE POLICY "Org members can read artifacts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'artifacts'
    AND storage.get_org_from_path(name) IN (SELECT auth.user_orgs())
  );

DROP POLICY IF EXISTS "Org members can upload artifacts" ON storage.objects;
CREATE POLICY "Org members can upload artifacts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artifacts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org members can update artifacts" ON storage.objects;
CREATE POLICY "Org members can update artifacts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'artifacts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'member')
  );

DROP POLICY IF EXISTS "Org admins can delete artifacts" ON storage.objects;
CREATE POLICY "Org admins can delete artifacts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artifacts'
    AND auth.has_org_role(storage.get_org_from_path(name), 'admin')
  );
