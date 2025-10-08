import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface DeleteAgentRequest {
  orgId: string;
  agentId: string;
}

interface DeleteAgentResponse {
  success: boolean;
}

export const deleteAgent = api(
  {
    method: "DELETE",
    path: "/orgs/:orgId/agents/:agentId",
    expose: true,
  },
  async ({ orgId, agentId }: DeleteAgentRequest): Promise<DeleteAgentResponse> => {
    const supabase = createServiceClient();
    await supabase
      .from('agents')
      .delete()
      .eq('id', agentId)
      .eq('org_id', orgId);

    return { success: true };
  }
);
