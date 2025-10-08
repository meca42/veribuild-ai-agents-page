import { useEffect, useRef, useState } from 'react';
import { getRun, AgentRun, AgentMessage, ToolCall, RunStatus } from '@/lib/api/agents';

interface RunData {
  run: AgentRun | null;
  messages: AgentMessage[];
  tool_calls: ToolCall[];
  progress: number;
}

const TERMINAL_STATUSES: RunStatus[] = ['succeeded', 'failed', 'cancelled'];

export function useRunPolling(runId?: string) {
  const [data, setData] = useState<RunData>({
    run: null,
    messages: [],
    tool_calls: [],
    progress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backoffRef = useRef(1000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const tick = async () => {
    if (!runId || !isMountedRef.current) return;

    setLoading(true);
    try {
      const result = await getRun(runId);
      
      if (!isMountedRef.current) return;

      setData({
        run: result.run,
        messages: result.messages,
        tool_calls: result.tool_calls,
        progress: result.progress
      });
      setError(null);

      if (TERMINAL_STATUSES.includes(result.run.status)) {
        return;
      }

      timerRef.current = setTimeout(tick, backoffRef.current);
      backoffRef.current = Math.min(backoffRef.current * 2, 8000);
    } catch (e: any) {
      if (!isMountedRef.current) return;
      
      setError(e?.message ?? 'Failed to load run');
      timerRef.current = setTimeout(tick, Math.min(backoffRef.current * 2, 8000));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!runId) {
      setData({ run: null, messages: [], tool_calls: [], progress: 0 });
      setError(null);
      return;
    }

    isMountedRef.current = true;
    backoffRef.current = 1000;
    tick();

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [runId]);

  return { ...data, loading, error, refresh: tick };
}
