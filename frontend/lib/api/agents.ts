import React from 'react';
import backend from '~backend/client';

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  seq: number;
  created_at: string;
  tool_name?: string | null;
}

export interface ToolCall {
  id: string;
  tool_id: string;
  seq: number;
  status: 'ok' | 'error';
  input: any;
  output?: any;
  error?: string | null;
  started_at: string;
  finished_at?: string | null;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  project_id: string;
  status: RunStatus;
  input: string;
  started_at?: string | null;
  finished_at?: string | null;
  latency_ms?: number | null;
  result_summary?: string | null;
  error?: string | null;
  created_at: string;
}

export interface GetRunResponse {
  run: AgentRun;
  messages: AgentMessage[];
  tool_calls: ToolCall[];
  progress: number;
}

export async function startRun(agentId: string, projectId: string, input: string) {
  return await backend.agents.startRun({ agentId, project_id: projectId, input });
}

export async function listProjectRuns(projectId: string) {
  if (!projectId) return [];
  
  try {
    const result = await backend.agents.listProjectRuns({ projectId, limit: 10 });
    return result.items ?? [];
  } catch (err) {
    console.warn('listProjectRuns error:', err);
    return [];
  }
}

export async function getRun(runId: string): Promise<GetRunResponse> {
  const result = await backend.agents.getRun({ runId });
  return {
    ...result,
    run: {
      ...result.run,
      status: result.run.status as RunStatus,
    },
    messages: result.messages.map(m => ({
      ...m,
      role: m.role as 'user' | 'assistant' | 'tool' | 'system',
    })),
    tool_calls: result.tool_calls.map(tc => ({
      ...tc,
      status: tc.status as 'ok' | 'error',
    })),
  };
}

export async function cancelRun(runId: string) {
  return await backend.agents.cancelRun({ runId });
}

export function useAgentRun(runId: string | null, options?: { interval?: number }) {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getRun>> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!runId) return;

    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const fetchRun = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        const result = await getRun(runId);
        if (!cancelled) {
          setData(result);
          setError(null);
          
          const isTerminal = ['succeeded', 'failed', 'cancelled'].includes(result.run.status);
          if (!isTerminal) {
            const interval = options?.interval || 2000;
            timeoutId = setTimeout(fetchRun, interval);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch run'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRun();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [runId, options?.interval]);

  return { data, loading, error };
}
