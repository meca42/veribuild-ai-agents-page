import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { createServiceClient } from "../lib/supabase";
import { runAgent } from "../services/agent-executor/executor";

const openaiKey = secret("OpenAIKey");

interface StartRunRequest {
  agentId: string;
  project_id: string;
  input: string;
}

interface StartRunResponse {
  run_id: string;
}

export const startRun = api<StartRunRequest, StartRunResponse>(
  { expose: true, method: "POST", path: "/agents/:agentId/runs", auth: false },
  async ({ agentId, project_id, input }) => {
    const userId = 'system';
    
    if (!input || !input.trim()) {
      throw APIError.invalidArgument("input is required");
    }

    const supabase = createServiceClient();

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, org_id')
      .eq('id', agentId)
      .eq('is_active', true)
      .single();

    if (agentError || !agent) {
      throw APIError.notFound("Agent not found");
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('org_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw APIError.notFound("Project not found");
    }

    if (agent.org_id !== project.org_id) {
      throw APIError.permissionDenied("Agent and project belong to different organizations");
    }

    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: agentId,
        project_id,
        created_by: userId,
        trigger: 'ui',
        input,
        status: 'queued'
      })
      .select('id')
      .single();

    if (runError || !run) {
      throw APIError.internal("Failed to create agent run");
    }

    const apiKey = openaiKey();
    runAgent({ runId: run.id, openaiKey: apiKey }).catch((error) => {
      console.error('Agent execution error:', error);
    });

    return { run_id: run.id };
  }
);
