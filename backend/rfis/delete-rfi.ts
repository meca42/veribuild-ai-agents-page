import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface DeleteRFIRequest {
  projectId: string;
  rfiId: string;
}

interface DeleteRFIResponse {
  ok: boolean;
}

export const deleteRFI = api<DeleteRFIRequest, DeleteRFIResponse>(
  { expose: true, method: "DELETE", path: "/projects/:projectId/rfis/:rfiId", auth: false },
  async ({ projectId, rfiId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('rfis')
      .delete()
      .eq('id', rfiId)
      .eq('project_id', projectId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
