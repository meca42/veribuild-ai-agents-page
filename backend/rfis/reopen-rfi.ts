import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ReopenRFIRequest {
  projectId: string;
  rfiId: string;
}

interface ReopenRFIResponse {
  ok: boolean;
}

export const reopenRFI = api<ReopenRFIRequest, ReopenRFIResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis/:rfiId/reopen", auth: false },
  async ({ projectId, rfiId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('rfis')
      .update({ status: 'reopened' })
      .eq('id', rfiId)
      .eq('project_id', projectId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
