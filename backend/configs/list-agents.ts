import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface Agent {
  id: string;
  org_id: string;
  name: string;
  model: string;
  temperature: number;
  max_steps: number;
  cost_cap_usd: number;
  allowed_tools: string[];
  created_at: Date;
  updated_at: Date;
}

interface ListAgentsRequest {
  orgId: string;
}

interface ListAgentsResponse {
  items: Agent[];
}

export const listAgents = api(
  {
    method: "GET",
    path: "/orgs/:orgId/agents",
    expose: true,
  },
  async ({ orgId }: ListAgentsRequest): Promise<ListAgentsResponse> => {
    const supabase = createServiceClient();
    const { data: agents } = await supabase
      .from('agents')
      .select('id, org_id, name, model, temperature, max_steps, cost_cap_usd, allowed_tools, created_at, updated_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    return { items: agents || [] };
  }
);
