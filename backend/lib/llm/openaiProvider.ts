import OpenAI from 'openai';
import type {
  LlmProvider,
  LlmCall,
  LlmResponse,
} from './provider';
import { estimateCostUSD } from './provider';

export class OpenAiProvider implements LlmProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(call: LlmCall): Promise<LlmResponse> {
    const res = await this.client.chat.completions.create({
      model: call.model,
      temperature: call.temperature ?? 0.2,
      max_tokens: call.max_tokens ?? 800,
      messages: call.messages.map((m) => ({
        role: m.role as any,
        content: m.content,
        name: m.name,
      })),
      tools: call.tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      tool_choice: call.tool_choice ?? 'auto',
    });

    const choice = res.choices[0];
    const toolCalls = (choice?.message?.tool_calls ?? []).map((tc) => ({
      id: tc.id!,
      name: tc.function?.name!,
      arguments: tc.function?.arguments!,
    }));

    const usage = res.usage
      ? {
          prompt_tokens: res.usage.prompt_tokens ?? 0,
          completion_tokens: res.usage.completion_tokens ?? 0,
          total_tokens: res.usage.total_tokens ?? 0,
          cost_usd: estimateCostUSD(res.model, {
            prompt_tokens: res.usage.prompt_tokens ?? 0,
            completion_tokens: res.usage.completion_tokens ?? 0,
          }),
        }
      : undefined;

    return {
      content: choice?.message?.content ?? undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
    };
  }
}
