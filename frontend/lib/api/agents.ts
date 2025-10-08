import React from 'react';
import backend from '~backend/client';

export async function startRun(agentId: string, projectId: string, input: string) {
  return await backend.agents.startRun({ agentId, project_id: projectId, input });
}

export async function getRun(runId: string) {
  return await backend.agents.getRun({ runId });
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
