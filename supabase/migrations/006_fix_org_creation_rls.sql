-- Fix RLS policy for orgs table to allow authenticated users to create organizations

-- Drop the existing policy
DROP POLICY IF EXISTS "Any authenticated user can create an org" ON orgs;

-- Recreate with explicit authentication check
CREATE POLICY "Authenticated users can create orgs"
  ON orgs FOR INSERT
  TO authenticated
  WITH CHECK (true);
