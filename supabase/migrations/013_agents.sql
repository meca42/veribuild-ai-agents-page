-- Agent Infrastructure Schema
-- Tools, Agents, Agent Runs, Messages, and Tool Calls

-- Tools: Reusable functions that agents can call
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  input_schema JSONB NOT NULL,
  output_schema JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name, version)
);

-- Agents: AI assistants configured with tools and prompts
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  system_prompt TEXT,
  temperature NUMERIC(3,2) DEFAULT 0.2,
  tool_policy TEXT CHECK (tool_policy IN ('conservative', 'balanced', 'aggressive')) DEFAULT 'balanced',
  max_steps INT DEFAULT 16,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Tools: Many-to-many relationship between agents and tools
CREATE TABLE IF NOT EXISTS agent_tools (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE RESTRICT,
  config JSONB DEFAULT '{}',
  PRIMARY KEY (agent_id, tool_id)
);

-- Agent Runs: Execution records of agent interactions
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  started_by UUID REFERENCES users(id) ON DELETE SET NULL,
  trigger TEXT CHECK (trigger IN ('ui', 'api', 'schedule', 'webhook')) DEFAULT 'ui',
  input TEXT,
  status TEXT CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')) DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  latency_ms INT,
  error TEXT,
  result_summary TEXT,
  result_blob JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Messages: Conversation history for each run
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'tool', 'system')),
  content TEXT,
  tool_name TEXT,
  seq INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, seq)
);

-- Tool Calls: Detailed logs of tool invocations during runs
CREATE TABLE IF NOT EXISTS tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE RESTRICT,
  seq INT NOT NULL,
  input JSONB NOT NULL,
  output JSONB,
  status TEXT CHECK (status IN ('ok', 'error')) DEFAULT 'ok',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error TEXT,
  UNIQUE(run_id, seq, tool_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tools_org_id ON tools(org_id);
CREATE INDEX IF NOT EXISTS idx_tools_is_active ON tools(is_active);

CREATE INDEX IF NOT EXISTS idx_agents_org_id ON agents(org_id);
CREATE INDEX IF NOT EXISTS idx_agents_project_id ON agents(project_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_composite ON agent_runs(agent_id, project_id, status, started_at);

CREATE INDEX IF NOT EXISTS idx_agent_messages_run_id ON agent_messages(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_seq ON agent_messages(run_id, seq);

CREATE INDEX IF NOT EXISTS idx_tool_calls_run_id ON tool_calls(run_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_seq ON tool_calls(run_id, seq);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-compute latency_ms when run finishes
CREATE OR REPLACE FUNCTION compute_run_latency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.finished_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.latency_ms = EXTRACT(EPOCH FROM (NEW.finished_at - NEW.started_at))::INT * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_agent_run_latency
  BEFORE UPDATE ON agent_runs
  FOR EACH ROW
  WHEN (NEW.finished_at IS NOT NULL AND OLD.finished_at IS NULL)
  EXECUTE FUNCTION compute_run_latency();

-- RLS Policies
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls ENABLE ROW LEVEL SECURITY;

-- Tools policies
CREATE POLICY "Users can view org tools"
  ON tools FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

CREATE POLICY "Admins can create tools"
  ON tools FOR INSERT
  WITH CHECK (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'manager')
  );

CREATE POLICY "Admins can update tools"
  ON tools FOR UPDATE
  USING (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'manager')
  );

CREATE POLICY "Admins can delete tools"
  ON tools FOR DELETE
  USING (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'admin')
  );

-- Agents policies
CREATE POLICY "Users can view org agents"
  ON agents FOR SELECT
  USING (org_id IN (SELECT auth.user_orgs()));

CREATE POLICY "Managers can create agents"
  ON agents FOR INSERT
  WITH CHECK (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'manager')
  );

CREATE POLICY "Managers can update agents"
  ON agents FOR UPDATE
  USING (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'manager')
  );

CREATE POLICY "Admins can delete agents"
  ON agents FOR DELETE
  USING (
    org_id IN (SELECT auth.user_orgs())
    AND auth.has_org_role(org_id, 'admin')
  );

-- Agent tools policies
CREATE POLICY "Users can view agent tools"
  ON agent_tools FOR SELECT
  USING (
    agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
  );

CREATE POLICY "Managers can manage agent tools"
  ON agent_tools FOR ALL
  USING (
    agent_id IN (
      SELECT id FROM agents 
      WHERE org_id IN (SELECT auth.user_orgs())
      AND auth.has_org_role(org_id, 'manager')
    )
  );

-- Agent runs policies
CREATE POLICY "Users can view org runs"
  ON agent_runs FOR SELECT
  USING (
    agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
  );

CREATE POLICY "Members can create runs"
  ON agent_runs FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents 
      WHERE org_id IN (SELECT auth.user_orgs())
      AND auth.has_org_role(org_id, 'member')
    )
  );

CREATE POLICY "Users can update own runs"
  ON agent_runs FOR UPDATE
  USING (
    started_by = auth.uid()
    OR agent_id IN (
      SELECT id FROM agents 
      WHERE org_id IN (SELECT auth.user_orgs())
      AND auth.has_org_role(org_id, 'admin')
    )
  );

-- Agent messages policies
CREATE POLICY "Users can view run messages"
  ON agent_messages FOR SELECT
  USING (
    run_id IN (
      SELECT id FROM agent_runs 
      WHERE agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
    )
  );

CREATE POLICY "System can insert messages"
  ON agent_messages FOR INSERT
  WITH CHECK (
    run_id IN (
      SELECT id FROM agent_runs 
      WHERE agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
    )
  );

-- Tool calls policies
CREATE POLICY "Users can view run tool calls"
  ON tool_calls FOR SELECT
  USING (
    run_id IN (
      SELECT id FROM agent_runs 
      WHERE agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
    )
  );

CREATE POLICY "System can insert tool calls"
  ON tool_calls FOR INSERT
  WITH CHECK (
    run_id IN (
      SELECT id FROM agent_runs 
      WHERE agent_id IN (SELECT id FROM agents WHERE org_id IN (SELECT auth.user_orgs()))
    )
  );
