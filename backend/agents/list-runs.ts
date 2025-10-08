import { api, Query } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { getUserOrgIds } from "../lib/permissions";

interface ListRunsRequest {
  status?: Query<string>;
  agentId?: Query<string>;
  projectId?: Query<string>;
  q?: Query<string>;
  from?: Query<string>;
  to?: Query<string>;
  limit?: Query<number>;
  cursor?: Query<string>;
}

interface AgentRunRow {
  id: string;
  project_id: string;
  agent_id: string;
  status: string;
  input: string;
  result_summary: string | null;
  started_at: string | null;
  finished_at: string | null;
  projects: {
    org_id: string;
    name: string;
  }[];
  agents: {
    name: string;
    model: string;
  }[];
}

interface ListRunsResponse {
  items: AgentRunRow[];
  next_cursor?: string;
}

export const listRuns = api<ListRunsRequest, ListRunsResponse>(
  { expose: true, method: "GET", path: "/runs" },
  async ({ status, agentId, projectId, q, from, to, limit, cursor }) => {
    const userId = 'system';
    const orgIds = await getUserOrgIds(userId);

    if (orgIds.length === 0) {
      return { items: [] };
    }

    const supabase = createServiceClient();
    const actualLimit = Math.min(limit ?? 20, 50);

    let query = supabase
      .from('agent_runs')
      .select('id, project_id, agent_id, status, input, result_summary, started_at, finished_at, projects!inner(org_id, name), agents!inner(name, model)')
      .in('projects.org_id', orgIds)
      .order('started_at', { ascending: false });

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (from) {
      query = query.gte('started_at', from);
    }

    if (to) {
      query = query.lte('started_at', to);
    }

    if (q) {
      query = query.or(`input.ilike.%${q}%,result_summary.ilike.%${q}%`);
    }

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf8');
        const [ts, id] = decoded.split('|');
        query = query.or(`started_at.lt.${ts},and(started_at.eq.${ts},id.neq.${id})`);
      } catch (err) {
        console.error('Invalid cursor:', err);
      }
    }

    query = query.limit(actualLimit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching runs:', error);
      return { items: [] };
    }

    let next_cursor: string | undefined;
    if ((data?.length ?? 0) === actualLimit) {
      const last = data![data!.length - 1] as any;
      next_cursor = Buffer.from(`${last.started_at}|${last.id}`).toString('base64');
    }

    return {
      items: data ?? [],
      next_cursor,
    };
  }
);
