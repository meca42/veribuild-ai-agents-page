import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface CreateAgentRequest {
  orgId: string;
  name: string;
  model?: string;
  temperature?: number;
  max_steps?: number;
  cost_cap_usd?: number;
  allowed_tools?: string[];
}

interface CreateAgentResponse {
  item: {
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
  };
}

export const createAgent = api(
  {
    method: "POST",
    path: "/orgs/:orgId/agents",
    expose: true,
  },
  async ({
    orgId,
    name,
    model = "gpt-4o-mini",
    temperature = 0.2,
    max_steps = 6,
    cost_cap_usd = 5.0,
    allowed_tools = ["search_drawings", "query_inventory", "create_rfi"],
  }: CreateAgentRequest): Promise<CreateAgentResponse> => {
    const supabase = createServiceClient();
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        org_id: orgId,
        name,
        model,
        temperature,
        max_steps,
        cost_cap_usd,
        allowed_tools
      })
      .select('id, org_id, name, model, temperature, max_steps, cost_cap_usd, allowed_tools, created_at, updated_at')
      .single();

    if (error || !agent) {
      throw new Error(error?.message || "Failed to create agent");
    }

    return { item: agent };
  }
);
