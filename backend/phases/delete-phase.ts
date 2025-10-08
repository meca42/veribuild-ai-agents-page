import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface DeletePhaseRequest {
  projectId: string;
  phaseId: string;
}

interface DeletePhaseResponse {
  ok: boolean;
}

export const deletePhase = api<DeletePhaseRequest, DeletePhaseResponse>(
  { expose: true, method: "DELETE", path: "/projects/:projectId/phases/:phaseId", auth: false },
  async ({ projectId, phaseId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('phases')
      .delete()
      .eq('id', phaseId)
      .eq('project_id', projectId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
