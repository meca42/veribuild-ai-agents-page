import { OpenAiProvider } from './openaiProvider';
import type { LlmProvider } from './provider';

export function getProvider(apiKey: string): LlmProvider {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAiProvider(apiKey);
}

export * from './provider';
