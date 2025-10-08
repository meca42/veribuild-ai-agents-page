import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ReorderPhasesRequest {
  projectId: string;
  order: Array<{ id: string; sequence: number }>;
}

interface ReorderPhasesResponse {
  ok: boolean;
}

export const reorderPhases = api<ReorderPhasesRequest, ReorderPhasesResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/phases/reorder", auth: false },
  async ({ projectId, order }) => {
    await verifyProjectAccess('system', projectId);

    if (!Array.isArray(order) || order.length === 0) {
      throw APIError.invalidArgument("order must be a non-empty array");
    }

    const supabase = createServiceClient();

    for (const item of order) {
      const { error } = await supabase
        .from('phases')
        .update({ sequence: item.sequence })
        .eq('id', item.id)
        .eq('project_id', projectId);

      if (error) {
        throw APIError.internal(error.message);
      }
    }

    return { ok: true };
  }
);
