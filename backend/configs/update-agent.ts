import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';

interface UpdateAgentRequest {
  orgId: string;
  agentId: string;
  name?: string;
  model?: string;
  temperature?: number;
  max_steps?: number;
  cost_cap_usd?: number;
  allowed_tools?: string[];
}

interface UpdateAgentResponse {
  item: {
    id: string;
    org_id: string;
    name: string;
    model: string;
    temperature: number;
    max_steps: number;
    cost_cap_usd: number;
    allowed_tools: string[];
    updated_at: Date;
  };
}

export const updateAgent = api(
  {
    method: "PATCH",
    path: "/orgs/:orgId/agents/:agentId",
    expose: true,
  },
  async ({
    orgId,
    agentId,
    name,
    model,
    temperature,
    max_steps,
    cost_cap_usd,
    allowed_tools,
  }: UpdateAgentRequest): Promise<UpdateAgentResponse> => {
    const supabase = createServiceClient();
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (model !== undefined) updates.model = model;
    if (temperature !== undefined) updates.temperature = temperature;
    if (max_steps !== undefined) updates.max_steps = max_steps;
    if (cost_cap_usd !== undefined) updates.cost_cap_usd = cost_cap_usd;
    if (allowed_tools !== undefined) updates.allowed_tools = allowed_tools;

    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .eq('org_id', orgId)
      .select('id, org_id, name, model, temperature, max_steps, cost_cap_usd, allowed_tools, updated_at')
      .single();

    if (error || !agent) {
      throw new Error(error?.message || "Agent not found");
    }

    return { item: agent };
  }
);
