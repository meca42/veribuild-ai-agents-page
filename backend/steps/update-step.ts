import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface UpdateStepRequest {
  projectId: string;
  stepId: string;
  title?: string;
  description?: string;
  status?: string;
  phaseId?: string;
  assigneeId?: string;
  priority?: string;
}

interface Step {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string;
  status: string;
  assignee_id?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

interface UpdateStepResponse {
  item: Step;
}

export const updateStep = api<UpdateStepRequest, UpdateStepResponse>(
  { expose: true, method: "PATCH", path: "/projects/:projectId/steps/:stepId", auth: false },
  async ({ projectId, stepId, title, description, status, phaseId, assigneeId, priority }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (phaseId !== undefined) updateData.phase_id = phaseId || null;
    if (assigneeId !== undefined) updateData.assignee_id = assigneeId || null;
    if (priority !== undefined) updateData.priority = priority;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const { data, error } = await supabase
      .from('steps')
      .update(updateData)
      .eq('id', stepId)
      .eq('project_id', projectId)
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    if (!data) {
      throw APIError.notFound("Step not found");
    }

    return { item: data };
  }
);
