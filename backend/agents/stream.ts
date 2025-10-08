import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface StreamRunResponse {
  run: any;
  messages: any[];
  tool_calls: any[];
}

export const streamRun = api(
  { 
    method: "GET", 
    path: "/runs/:runId/stream",
    expose: true
  },
  async ({ runId }: { runId: string }): Promise<StreamRunResponse> => {
    const supabase = createServiceClient();
    const { data: run } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (!run) {
      throw new Error("Run not found");
    }

    const { data: messages } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });

    const { data: toolCalls } = await supabase
      .from('tool_calls')
      .select('*')
      .eq('run_id', runId)
      .order('seq', { ascending: true });

    return {
      run: run || null,
      messages: messages || [],
      tool_calls: toolCalls || []
    };
  }
);
