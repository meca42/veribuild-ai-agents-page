import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { executeAgentRun } from "../services/agent-executor/executor";
import { getAllTools } from "../services/agent-executor/tools";

interface StartRunRequest {
  agentId: string;
  project_id: string;
  input: string;
}

interface StartRunResponse {
  run_id: string;
}

export const startRun = api<StartRunRequest, StartRunResponse>(
  { expose: true, method: "POST", path: "/agents/:agentId/runs" },
  async ({ agentId, project_id, input }) => {
    const supabase = createServiceClient();

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, org_id, model, system_prompt, temperature, max_steps')
      .eq('id', agentId)
      .eq('is_active', true)
      .single();

    if (agentError || !agent) {
      throw APIError.notFound("Agent not found");
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, org_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw APIError.notFound("Project not found");
    }

    if (agent.org_id !== project.org_id) {
      throw APIError.permissionDenied("Agent and project belong to different organizations");
    }

    const userId = 'system';

    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: agentId,
        project_id,
        started_by: userId,
        trigger: 'ui',
        input,
        status: 'queued'
      })
      .select('id')
      .single();

    if (runError || !run) {
      throw APIError.internal("Failed to create agent run");
    }

    executeAgentRun({
      runId: run.id,
      agentConfig: {
        id: agent.id,
        model: agent.model,
        system_prompt: agent.system_prompt,
        temperature: agent.temperature,
        max_steps: agent.max_steps,
        tools: getAllTools()
      },
      input,
      context: {
        runId: run.id,
        projectId: project_id,
        orgId: agent.org_id,
        userId
      }
    }).catch(error => {
      console.error('Agent execution error:', error);
    });

    return { run_id: run.id };
  }
);
