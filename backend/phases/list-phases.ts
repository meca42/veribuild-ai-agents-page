import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ListPhasesRequest {
  projectId: string;
}

interface Phase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  sequence: number;
  status: string;
  planned_start?: string;
  planned_end?: string;
  created_at: string;
  updated_at: string;
}

interface ListPhasesResponse {
  items: Phase[];
}

export const listPhases = api<ListPhasesRequest, ListPhasesResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/phases", auth: false },
  async ({ projectId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('phases')
      .select('*')
      .eq('project_id', projectId)
      .order('sequence', { ascending: true });

    if (error) {
      throw APIError.internal(error.message);
    }

    return { items: data || [] };
  }
);
