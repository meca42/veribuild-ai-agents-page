import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";

interface GetRunRequest {
  runId: string;
}

interface AgentMessage {
  id: string;
  role: string;
  content: string;
  tool_name?: string;
  seq: number;
  created_at: string;
}

interface ToolCall {
  id: string;
  tool_id: string;
  seq: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: string;
  error?: string;
  started_at: string;
  finished_at?: string;
}

interface GetRunResponse {
  run: {
    id: string;
    agent_id: string;
    project_id: string;
    status: string;
    input: string;
    started_at?: string;
    finished_at?: string;
    latency_ms?: number;
    error?: string;
    result_summary?: string;
    created_at: string;
  };
  messages: AgentMessage[];
  tool_calls: ToolCall[];
  progress: number;
}

export const getRun = api<GetRunRequest, GetRunResponse>(
  { expose: true, method: "GET", path: "/runs/:runId", auth: false },
  async ({ runId }) => {

    const supabase = createServiceClient();

    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      throw APIError.notFound("Run not found");
    }

    const { data: messages } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('run_id', runId)
      .order('seq', { ascending: true });

    const { data: toolCalls } = await supabase
      .from('tool_calls')
      .select('*')
      .eq('run_id', runId)
      .order('seq', { ascending: true });

    const { data: agent } = await supabase
      .from('agents')
      .select('max_steps')
      .eq('id', run.agent_id)
      .single();

    const maxSteps = agent?.max_steps || 16;
    const currentSteps = toolCalls?.length || 0;
    const progress = run.status === 'succeeded' || run.status === 'failed' || run.status === 'cancelled'
      ? 100
      : Math.min(Math.round((currentSteps / maxSteps) * 100), 99);

    return {
      run: {
        id: run.id,
        agent_id: run.agent_id,
        project_id: run.project_id,
        status: run.status,
        input: run.input,
        started_at: run.started_at,
        finished_at: run.finished_at,
        latency_ms: run.latency_ms,
        error: run.error,
        result_summary: run.result_summary,
        created_at: run.created_at
      },
      messages: messages || [],
      tool_calls: toolCalls || [],
      progress
    };
  }
);
