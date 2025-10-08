import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface DeleteAttachmentRequest {
  projectId: string;
  rfiId: string;
  attachmentId: string;
}

interface DeleteAttachmentResponse {
  ok: boolean;
}

export const deleteAttachment = api<DeleteAttachmentRequest, DeleteAttachmentResponse>(
  { expose: true, method: "DELETE", path: "/projects/:projectId/rfis/:rfiId/attachments/:attachmentId", auth: false },
  async ({ projectId, rfiId, attachmentId }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data: attachment } = await supabase
      .from('rfi_attachments')
      .select('file_id')
      .eq('id', attachmentId)
      .eq('rfi_id', rfiId)
      .single();

    if (!attachment) {
      throw APIError.notFound("Attachment not found");
    }

    const { data: file } = await supabase
      .from('files')
      .select('bucket, path')
      .eq('id', attachment.file_id)
      .single();

    if (file) {
      await supabase.storage.from(file.bucket).remove([file.path]);
    }

    const { error } = await supabase
      .from('rfi_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      throw APIError.internal(error.message);
    }

    return { ok: true };
  }
);
