import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface GetRFIRequest {
  projectId: string;
  rfiId: string;
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
  answered_by?: string;
  answer?: string;
  created_at: string;
  updated_at: string;
}

interface GetRFIResponse {
  item: RFI;
}

export const getRFI = api<GetRFIRequest, GetRFIResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/rfis/:rfiId", auth: false },
  async ({ projectId, rfiId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('rfis')
      .select('*')
      .eq('id', rfiId)
      .eq('project_id', projectId)
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
