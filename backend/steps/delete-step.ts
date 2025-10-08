import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface DeleteStepRequest {
  projectId: string;
  stepId: string;
}

interface DeleteStepResponse {
  ok: boolean;
}

export const deleteStep = api<DeleteStepRequest, DeleteStepResponse>(
  { expose: true, method: "DELETE", path: "/projects/:projectId/steps/:stepId", auth: false },
  async ({ projectId, stepId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('steps')
      .delete()
      .eq('id', stepId)
      .eq('project_id', projectId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
