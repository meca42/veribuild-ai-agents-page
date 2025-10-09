import { api, Query } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ListProjectRunsRequest {
  projectId: string;
  limit?: Query<number>;
}

interface AgentRunItem {
  id: string;
  project_id: string;
  agent_id: string;
  status: string;
  input: string;
  result_summary: string | null;
  started_at: string | null;
  finished_at: string | null;
}

interface ListProjectRunsResponse {
  items: AgentRunItem[];
}

export const listProjectRuns = api<ListProjectRunsRequest, ListProjectRunsResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/runs" },
  async ({ projectId, limit }) => {
    if (!projectId) {
      return { items: [] };
    }

    try {
      const userId = 'system';
      await verifyProjectAccess(userId, projectId);

      const supabase = createServiceClient();
      const actualLimit = Math.min(limit ?? 10, 20);

      const { data, error } = await supabase
        .from('agent_runs')
        .select('id, project_id, agent_id, status, input, result_summary, started_at, finished_at')
        .eq('project_id', projectId)
        .order('started_at', { ascending: false })
        .limit(actualLimit);

      if (error) {
        console.error('Error fetching project runs:', error);
        return { items: [] };
      }

      return { items: data ?? [] };
    } catch (err) {
      console.warn('listProjectRuns graceful degradation:', err);
      return { items: [] };
    }
  }
);
