import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface AnswerRFIRequest {
  projectId: string;
  rfiId: string;
  answer: string;
  answeredBy?: string;
}

interface RFI {
  id: string;
  project_id: string;
  subject: string;
  question: string;
  status: string;
  priority: string;
  answer?: string;
  answered_by?: string;
  created_at: string;
  updated_at: string;
}

interface AnswerRFIResponse {
  item: RFI;
}

export const answerRFI = api<AnswerRFIRequest, AnswerRFIResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis/:rfiId/answer", auth: false },
  async ({ projectId, rfiId, answer, answeredBy }) => {
    await verifyProjectAccess('system', projectId);

    if (!answer || !answer.trim()) {
      throw APIError.invalidArgument("answer is required");
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('rfis')
      .update({
        answer: answer.trim(),
        status: 'answered',
        answered_by: answeredBy || 'system',
      })
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
