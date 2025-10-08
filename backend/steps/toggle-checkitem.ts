import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ToggleCheckitemRequest {
  projectId: string;
  stepId: string;
  checkitemId: string;
}

interface Checkitem {
  id: string;
  step_id: string;
  label: string;
  is_done: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ToggleCheckitemResponse {
  item: Checkitem;
}

export const toggleCheckitem = api<ToggleCheckitemRequest, ToggleCheckitemResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/steps/:stepId/checkitems/:checkitemId/toggle", auth: false },
  async ({ projectId, stepId, checkitemId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from('step_checkitems')
      .select('is_done')
      .eq('id', checkitemId)
      .eq('step_id', stepId)
      .single();

    if (fetchError || !existing) {
      throw APIError.notFound("Checkitem not found");
    }

    const { data, error } = await supabase
      .from('step_checkitems')
      .update({ 
        is_done: !existing.is_done,
        done_at: !existing.is_done ? new Date().toISOString() : null,
        done_by: !existing.is_done ? 'system' : null,
      })
      .eq('id', checkitemId)
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    return { item: data };
  }
);
