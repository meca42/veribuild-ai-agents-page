-- Temporarily disable RLS on agent tables for testing
-- WARNING: This allows unrestricted access. Re-enable RLS for production.

ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls DISABLE ROW LEVEL SECURITY;
