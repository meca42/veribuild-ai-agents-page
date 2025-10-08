import { api, Query } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { getUserOrgIds } from "../lib/permissions";

interface ExportRunsRequest {
  status?: Query<string>;
  agentId?: Query<string>;
  projectId?: Query<string>;
  q?: Query<string>;
  from?: Query<string>;
  to?: Query<string>;
}

interface ExportRunsResponse {
  csv: string;
}

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function toCSV(rows: any[]): string {
  if (rows.length === 0) {
    return 'id,project_id,agent_id,status,input,result_summary,started_at,finished_at\n';
  }

  const headers = ['id', 'project_id', 'agent_id', 'status', 'input', 'result_summary', 'started_at', 'finished_at'];
  const csvHeaders = headers.join(',');
  
  const csvRows = rows.map(row => {
    return [
      escapeCSV(row.id),
      escapeCSV(row.project_id),
      escapeCSV(row.agent_id),
      escapeCSV(row.status),
      escapeCSV(row.input?.replace(/\n/g, ' ')),
      escapeCSV(row.result_summary?.replace(/\n/g, ' ')),
      escapeCSV(row.started_at),
      escapeCSV(row.finished_at),
    ].join(',');
  });

  return csvHeaders + '\n' + csvRows.join('\n') + '\n';
}

export const exportRuns = api<ExportRunsRequest, ExportRunsResponse>(
  { expose: true, method: "GET", path: "/runs/export" },
  async ({ status, agentId, projectId, q, from, to }) => {
    const userId = 'system';
    const orgIds = await getUserOrgIds(userId);

    if (orgIds.length === 0) {
      return { csv: toCSV([]) };
    }

    const supabase = createServiceClient();

    let query = supabase
      .from('agent_runs')
      .select('id, project_id, agent_id, status, input, result_summary, started_at, finished_at, projects!inner(org_id)')
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

    query = query.limit(5000);

    const { data, error } = await query;

    if (error) {
      console.error('Error exporting runs:', error);
      return { csv: toCSV([]) };
    }

    return { csv: toCSV(data ?? []) };
  }
);
