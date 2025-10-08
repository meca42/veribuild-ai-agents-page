import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface UpdateRFIRequest {
  projectId: string;
  rfiId: string;
  subject?: string;
  question?: string;
  priority?: string;
  dueDate?: string;
  drawingId?: string;
  assignedTo?: string;
  status?: string;
}

interface RFI {
  id: string;
  project_id: string;
  subject: string;
  question: string;
  status: string;
  priority: string;
  due_date?: string;
  drawing_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface UpdateRFIResponse {
  item: RFI;
}

export const updateRFI = api<UpdateRFIRequest, UpdateRFIResponse>(
  { expose: true, method: "PATCH", path: "/projects/:projectId/rfis/:rfiId", auth: false },
  async ({ projectId, rfiId, subject, question, priority, dueDate, drawingId, assignedTo, status }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const updateData: any = {};
    if (subject !== undefined) updateData.subject = subject.trim();
    if (question !== undefined) updateData.question = question.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.due_date = dueDate || null;
    if (drawingId !== undefined) updateData.drawing_id = drawingId || null;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo || null;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const { data, error } = await supabase
      .from('rfis')
      .update(updateData)
      .eq('id', rfiId)
      .eq('project_id', projectId)
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    if (!data) {
      throw APIError.notFound("RFI not found");
    }

    return { item: data };
  }
);
