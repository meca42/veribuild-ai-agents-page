export type LlmMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type LlmCall = {
  model: string;
  messages: LlmMessage[];
  tools?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  temperature?: number;
  max_tokens?: number;
  tool_choice?: 'auto' | { type: 'function'; function: { name: string } };
};

export type LlmToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type LlmResponse = {
  content?: string;
  toolCalls?: LlmToolCall[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd?: number;
  };
};

export interface LlmProvider {
  chat(call: LlmCall): Promise<LlmResponse>;
}

export function estimateCostUSD(
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number }
): number {
  const prices: Record<string, { inK: number; outK: number }> = {
    'gpt-4o-mini': { inK: 0.15 / 1000, outK: 0.60 / 1000 },
    'gpt-4o': { inK: 5 / 1000, outK: 15 / 1000 },
    'gpt-4-turbo': { inK: 10 / 1000, outK: 30 / 1000 },
  };
  const p = prices[model] ?? prices['gpt-4o-mini'];
  const cost = usage.prompt_tokens * p.inK + usage.completion_tokens * p.outK;
  return Number(cost.toFixed(6));
}
