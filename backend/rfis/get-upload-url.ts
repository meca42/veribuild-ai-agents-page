import { api, APIError } from "encore.dev/api";
import { createServiceClient } from "../lib/supabase";
import { verifyProjectAccess } from "../lib/permissions";

interface GetUploadUrlRequest {
  projectId: string;
  rfiId: string;
  filename: string;
}

interface GetUploadUrlResponse {
  bucket: string;
  path: string;
  uploadUrl: string;
}

export const getUploadUrl = api<GetUploadUrlRequest, GetUploadUrlResponse>(
  { expose: true, method: "POST", path: "/projects/:projectId/rfis/:rfiId/upload-url", auth: false },
  async ({ projectId, rfiId, filename }) => {
    await verifyProjectAccess('system', projectId);

    const supabase = createServiceClient();

    const { data: project } = await supabase
      .from('projects')
      .select('org_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw APIError.notFound("Project not found");
    }

    const { data: rfi } = await supabase
      .from('rfis')
      .select('id')
      .eq('id', rfiId)
      .eq('project_id', projectId)
      .single();

    if (!rfi) {
      throw APIError.notFound("RFI not found");
    }

    const orgId = project.org_id;
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${orgId}/${projectId}/rfis/${rfiId}/${timestamp}_${cleanFilename}`;

    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('documents')
      .createSignedUploadUrl(path);

    if (urlError) {
      throw APIError.internal(urlError.message);
    }

    return {
      bucket: 'documents',
      path: path,
      uploadUrl: urlData.signedUrl,
    };
  }
);
