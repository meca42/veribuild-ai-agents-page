import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";

interface CancelRunRequest {
  runId: string;
}

interface CancelRunResponse {
  success: boolean;
}

export const cancelRun = api<CancelRunRequest, CancelRunResponse>(
  { expose: true, method: "POST", path: "/runs/:runId/cancel" },
  async ({ runId }) => {
    const supabase = createServiceClient();

    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .select('id, status')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      throw APIError.notFound("Run not found");
    }

    if (run.status !== 'queued' && run.status !== 'running') {
      throw APIError.failedPrecondition("Run cannot be cancelled in its current state");
    }

    const { error: updateError } = await supabase
      .from('agent_runs')
      .update({
        status: 'cancelled',
        finished_at: new Date().toISOString()
      })
      .eq('id', runId);

    if (updateError) {
      throw APIError.internal("Failed to cancel run");
    }

    return { success: true };
  }
);
