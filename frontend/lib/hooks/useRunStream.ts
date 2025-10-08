import { useEffect, useRef, useState } from 'react';
import backend from '~backend/client';

interface RunSnapshot {
  run: any;
  messages: any[];
  tool_calls: any[];
}

interface RunStatus {
  status: string;
  finished_at?: string;
}

interface UseRunStreamResult {
  snapshot: RunSnapshot | null;
  status: RunStatus | null;
  isLoading: boolean;
}

export function useRunStream(runId?: string): UseRunStreamResult {
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null);
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!runId) {
      setSnapshot(null);
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchRunData = async () => {
      try {
        const data = await backend.agents.streamRun({ runId });
        
        setSnapshot({
          run: data.run,
          messages: data.messages,
          tool_calls: data.tool_calls
        });

        if (data.run) {
          setStatus({
            status: data.run.status,
            finished_at: data.run.finished_at
          });
        }

        setIsLoading(false);

        if (data.run?.status && ['succeeded', 'failed', 'cancelled'].includes(data.run.status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error) {
        console.error('Failed to fetch run data:', error);
        setIsLoading(false);
      }
    };

    fetchRunData();

    intervalRef.current = setInterval(fetchRunData, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runId]);

  return { snapshot, status, isLoading };
}
