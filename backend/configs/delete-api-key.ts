import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface DeleteApiKeyRequest {
  orgId: string;
  keyId: string;
}

interface DeleteApiKeyResponse {
  success: boolean;
}

export const deleteApiKey = api(
  {
    method: "DELETE",
    path: "/orgs/:orgId/api-keys/:keyId",
    expose: true,
  },
  async ({ orgId, keyId }: DeleteApiKeyRequest): Promise<DeleteApiKeyResponse> => {
    const supabase = createServiceClient();
    await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('org_id', orgId);

    return { success: true };
  }
);
