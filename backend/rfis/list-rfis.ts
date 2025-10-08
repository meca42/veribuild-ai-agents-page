import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ListRFIsRequest {
  projectId: string;
  status?: string;
  assignedTo?: string;
  q?: string;
  dueFrom?: string;
  dueTo?: string;
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

interface ListRFIsResponse {
  items: RFI[];
}

export const listRFIs = api<ListRFIsRequest, ListRFIsResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/rfis", auth: false },
  async ({ projectId, status, assignedTo, q, dueFrom, dueTo }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    let query = supabase
      .from('rfis')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (q) {
      query = query.or(`subject.ilike.%${q}%,question.ilike.%${q}%`);
    }

    if (dueFrom) {
      query = query.gte('due_date', dueFrom);
    }

    if (dueTo) {
      query = query.lte('due_date', dueTo);
    }

    const { data, error } = await query;

    if (error) {
      throw APIError.internal(error.message);
    }

    return { items: data || [] };
  }
);
