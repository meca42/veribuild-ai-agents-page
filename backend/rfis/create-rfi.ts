import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface CreateRFIRequest {
  projectId: string;
  subject: string;
  question: string;
  priority?: string;
  dueDate?: string;
  drawingId?: string;
  assignedTo?: string;
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
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CreateRFIResponse {
  item: RFI;
}

export const createRFI = api<CreateRFIRequest, CreateRFIResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis", auth: false },
  async ({ projectId, subject, question, priority, dueDate, drawingId, assignedTo }) => {
    await verifyProjectAccess('system', projectId);

    if (!subject || !subject.trim()) {
      throw APIError.invalidArgument("subject is required");
    }

    if (!question || !question.trim()) {
      throw APIError.invalidArgument("question is required");
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('rfis')
      .insert({
        project_id: projectId,
        subject: subject.trim(),
        question: question.trim(),
        priority: priority || 'normal',
        due_date: dueDate || null,
        drawing_id: drawingId || null,
        assigned_to: assignedTo || null,
        created_by: 'system',
      })
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    return { item: data };
  }
);
