-- Temporarily disable RLS on storage for testing
-- WARNING: This allows anyone to upload/access files. Re-enable RLS for production.

-- Disable RLS on storage objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Optional: Drop existing policies (they won't apply anyway with RLS disabled)
DROP POLICY IF EXISTS "Org members can read drawings" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload drawings" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update drawings" ON storage.objects;
DROP POLICY IF EXISTS "Org admins can delete drawings" ON storage.objects;

DROP POLICY IF EXISTS "Org members can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Org admins can delete documents" ON storage.objects;

DROP POLICY IF EXISTS "Org members can read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update receipts" ON storage.objects;
DROP POLICY IF EXISTS "Org admins can delete receipts" ON storage.objects;

DROP POLICY IF EXISTS "Org members can read artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Org admins can delete artifacts" ON storage.objects;
