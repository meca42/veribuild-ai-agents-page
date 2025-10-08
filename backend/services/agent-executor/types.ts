export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolOutput {
  [key: string]: unknown;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (input: ToolInput, context: ExecutionContext) => Promise<ToolOutput>;
}

export interface ExecutionContext {
  runId: string;
  projectId: string;
  orgId: string;
  userId: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  tool_name?: string;
}

export interface ToolCall {
  tool_id: string;
  tool_name: string;
  input: ToolInput;
  output?: ToolOutput;
  status: 'ok' | 'error';
  error?: string;
  started_at: Date;
  finished_at?: Date;
}

export interface AgentConfig {
  id: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_steps: number;
  tools: Tool[];
}

export interface RunResult {
  success: boolean;
  result_summary?: string;
  result_blob?: Record<string, unknown>;
  error?: string;
}
