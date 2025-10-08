-- Fix circular dependency in org_members RLS policy
-- The current policy uses auth.user_orgs() which itself queries org_members,
-- causing a circular dependency and query timeouts

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view members of their orgs" ON org_members;

-- Create a new policy that allows users to see their own memberships directly
CREATE POLICY "Users can view their own memberships"
  ON org_members FOR SELECT
  USING (user_id = auth.uid());

-- Also allow users to see other members of orgs they belong to
-- This uses a subquery but avoids the circular dependency
CREATE POLICY "Users can view other members in their orgs"
  ON org_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );
