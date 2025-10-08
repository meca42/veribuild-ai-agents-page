import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface CreatePhaseRequest {
  projectId: string;
  name: string;
  description?: string;
}

interface Phase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  sequence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreatePhaseResponse {
  item: Phase;
}

export const createPhase = api<CreatePhaseRequest, CreatePhaseResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/phases", auth: false },
  async ({ projectId, name, description }) => {
    await verifyProjectAccess('system', projectId);

    if (!name || !name.trim()) {
      throw APIError.invalidArgument("name is required");
    }

    const supabase = createServiceClient();

    const { data: maxRow } = await supabase
      .from('phases')
      .select('sequence')
      .eq('project_id', projectId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSeq = (maxRow?.sequence ?? 0) + 1;

    const { data, error } = await supabase
      .from('phases')
      .insert({
        project_id: projectId,
        name: name.trim(),
        description: description?.trim() || null,
        sequence: nextSeq,
      })
      .select('*')
      .single();

    if (error) {
      throw APIError.internal(error.message);
    }

    return { item: data };
  }
);
