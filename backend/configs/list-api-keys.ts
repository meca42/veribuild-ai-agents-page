import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface ApiKeyListItem {
  id: string;
  org_id: string;
  provider: string;
  name: string;
  created_by: string | null;
  created_at: Date;
}

interface ListApiKeysRequest {
  orgId: string;
}

interface ListApiKeysResponse {
  items: ApiKeyListItem[];
}

export const listApiKeys = api(
  {
    method: "GET",
    path: "/orgs/:orgId/api-keys",
    expose: true,
  },
  async ({ orgId }: ListApiKeysRequest): Promise<ListApiKeysResponse> => {
    const supabase = createServiceClient();
    const { data: keys } = await supabase
      .from('api_keys')
      .select('id, org_id, provider, name, created_by, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    return { items: keys || [] };
  }
);
