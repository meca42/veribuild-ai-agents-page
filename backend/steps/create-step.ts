import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface CreateStepRequest {
  projectId: string;
  phaseId?: string;
  title: string;
  description?: string;
  status?: string;
  checklist?: string[];
}

interface Step {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreateStepResponse {
  item: Step;
}

export const createStep = api<CreateStepRequest, CreateStepResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/steps", auth: false },
  async ({ projectId, phaseId, title, description, status, checklist }) => {
    await verifyProjectAccess('system', projectId);

    if (!title || !title.trim()) {
      throw APIError.invalidArgument("title is required");
    }

    const supabase = createServiceClient();

    const { data: step, error } = await supabase
      .from('steps')
      .insert({
        project_id: projectId,
        phase_id: phaseId || null,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'todo',
      })
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    if (Array.isArray(checklist) && checklist.length > 0) {
      const rows = checklist.map((label, index) => ({
        step_id: step.id,
        label,
        order_index: index,
      }));

      const { error: checklistError } = await supabase
        .from('step_checkitems')
        .insert(rows);

      if (checklistError) {
        console.error('Failed to create checklist items:', checklistError);
      }
    }

    return { item: step };
  }
);
