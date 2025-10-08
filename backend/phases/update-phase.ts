import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface UpdatePhaseRequest {
  projectId: string;
  phaseId: string;
  name?: string;
  description?: string;
  status?: string;
}

interface Phase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  sequence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UpdatePhaseResponse {
  item: Phase;
}

export const updatePhase = api<UpdatePhaseRequest, UpdatePhaseResponse>(
  { expose: true, method: "PATCH", path: "/projects/:projectId/phases/:phaseId", auth: false },
  async ({ projectId, phaseId, name, description, status }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const { data, error } = await supabase
      .from('phases')
      .update(updateData)
      .eq('id', phaseId)
      .eq('project_id', projectId)
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    if (!data) {
      throw APIError.notFound("Phase not found");
    }

    return { item: data };
  }
);
