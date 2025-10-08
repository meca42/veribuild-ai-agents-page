-- Add usage metrics and error tracking to agent_runs

ALTER TABLE agent_runs 
  ADD COLUMN IF NOT EXISTS usage_prompt_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS usage_completion_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS usage_total_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS usage_cost_usd NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS error TEXT;

-- Add created_by if missing
ALTER TABLE agent_runs 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ensure agent_messages.role allows 'tool'
ALTER TABLE agent_messages 
  DROP CONSTRAINT IF EXISTS agent_messages_role_check;

ALTER TABLE agent_messages
  ADD CONSTRAINT agent_messages_role_check 
  CHECK (role IN ('user', 'assistant', 'tool', 'system'));

-- Add tool_name column to tool_calls if missing (for logging which tool was called)
ALTER TABLE tool_calls
  ADD COLUMN IF NOT EXISTS tool_name TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_run_id_seq ON agent_messages(run_id, seq);
CREATE INDEX IF NOT EXISTS idx_tool_calls_run_id_seq ON tool_calls(run_id, seq);
