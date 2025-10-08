import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ListStepsRequest {
  projectId: string;
  phaseId?: string;
  status?: string;
  q?: string;
}

interface Step {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string;
  status: string;
  assignee_id?: string;
  priority?: string;
  planned_start?: string;
  planned_end?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ListStepsResponse {
  items: Step[];
}

export const listSteps = api<ListStepsRequest, ListStepsResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/steps", auth: false },
  async ({ projectId, phaseId, status, q }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    let query = supabase
      .from('steps')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (phaseId) {
      query = query.eq('phase_id', phaseId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw APIError.internal(error.message);
    }

    return { items: data || [] };
  }
);
