import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface ListAttachmentsRequest {
  projectId: string;
  rfiId: string;
}

interface Attachment {
  id: string;
  rfi_id: string;
  file_id: string;
  filename: string;
  content_type?: string;
  size_bytes?: number;
  created_at: string;
}

interface ListAttachmentsResponse {
  items: Attachment[];
}

export const listAttachments = api<ListAttachmentsRequest, ListAttachmentsResponse>(
  { expose: true, method: "GET", path: "/projects/:projectId/rfis/:rfiId/attachments", auth: false },
  async ({ projectId, rfiId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('rfi_attachments')
      .select('*')
      .eq('rfi_id', rfiId)
      .order('created_at', { ascending: false });

    if (error) {
      throw APIError.internal(error.message);
    }

    return { items: data || [] };
  }
);
