import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface CloseRFIRequest {
  projectId: string;
  rfiId: string;
}

interface CloseRFIResponse {
  ok: boolean;
}

export const closeRFI = api<CloseRFIRequest, CloseRFIResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis/:rfiId/close", auth: false },
  async ({ projectId, rfiId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('rfis')
      .update({ status: 'closed' })
      .eq('id', rfiId)
      .eq('project_id', projectId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
