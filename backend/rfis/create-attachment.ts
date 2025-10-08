import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface CreateAttachmentRequest {
  projectId: string;
  rfiId: string;
  bucket: string;
  path: string;
  filename: string;
  contentType?: string;
  sizeBytes?: number;
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

interface CreateAttachmentResponse {
  item: Attachment;
}

export const createAttachment = api<CreateAttachmentRequest, CreateAttachmentResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis/:rfiId/attachments", auth: false },
  async ({ projectId, rfiId, bucket, path, filename, contentType, sizeBytes }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data: file, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: (await supabase.from('projects').select('org_id').eq('id', projectId).single()).data?.org_id,
        project_id: projectId,
        bucket,
        path,
        mime_type: contentType || null,
        size_bytes: sizeBytes || null,
        uploaded_by: 'system',
      })
      .select('id')
      .single();

    if (fileError) {
      throw APIError.internal(fileError.message);
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from('rfi_attachments')
      .insert({
        rfi_id: rfiId,
        file_id: file.id,
        filename,
        content_type: contentType || null,
        size_bytes: sizeBytes || null,
      })
      .select('*')
      .single();

    if (attachmentError) {
      throw APIError.internal(attachmentError.message);
    }

    return { item: attachment };
  }
);
