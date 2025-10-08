import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import backend from '~backend/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AgentMessage {
  id: string;
  role: string;
  content: string;
  tool_name?: string;
  seq: number;
  created_at: string;
}

interface ToolCall {
  id: string;
  tool_id: string;
  seq: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: string;
  error?: string;
  started_at: string;
  finished_at?: string;
}

interface RunDetail {
  run: {
    id: string;
    agent_id: string;
    project_id: string;
    status: string;
    input: string;
    started_at?: string;
    finished_at?: string;
    latency_ms?: number;
    error?: string;
    result_summary?: string;
    created_at: string;
  };
  messages: AgentMessage[];
  tool_calls: ToolCall[];
  progress: number;
}

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRun = async () => {
      try {
        setLoading(true);
        const response = await backend.agents.getRun({ runId: id });
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch run:', err);
        setError('Failed to load run');
      } finally {
        setLoading(false);
      }
    };

    fetchRun();

    const terminal = ['succeeded', 'failed', 'cancelled'].includes(data?.run?.status || '');
    if (!terminal) {
      const interval = setInterval(fetchRun, 1500);
      return () => clearInterval(interval);
    }
  }, [id, data?.run?.status]);

  const run = data?.run;
  const messages = data?.messages ?? [];
  const toolCalls = data?.tool_calls ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Agent Run</h1>
          <div className="text-xs text-muted-foreground mt-1">
            Run {id?.slice(0, 8)} {run?.project_id ? <>• Project {run.project_id.slice(0, 8)}</> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {run && (
            <Badge 
              variant={
                run.status === 'succeeded' ? 'success' : 
                run.status === 'failed' ? 'danger' : 
                'neutral'
              } 
              className="capitalize"
            >
              {run.status}
            </Badge>
          )}
          {run?.project_id && (
            <Link to={`/projects/${run.project_id}?run=${id}`}>
              <Button variant="secondary" size="sm">Open in Project</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="border-t pt-4" />

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {run && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="text-sm font-medium">Messages</div>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.seq} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground mb-1 uppercase">
                    {m.role}{m.tool_name ? ` • ${m.tool_name}` : ''}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">No messages yet.</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Run Info</div>
            <div className="rounded-md border p-3 text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">Agent: </span>
                {run.agent_id?.slice(0, 8)}
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className="capitalize">{run.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Started: </span>
                {run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Finished: </span>
                {run.finished_at ? new Date(run.finished_at).toLocaleString() : '—'}
              </div>
              {run.latency_ms && (
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  {(run.latency_ms / 1000).toFixed(2)}s
                </div>
              )}
              {run.result_summary && (
                <div>
                  <div className="text-muted-foreground mb-1">Summary</div>
                  <div className="rounded bg-muted p-2">{run.result_summary}</div>
                </div>
              )}
              {run.error && (
                <div>
                  <div className="text-muted-foreground mb-1">Error</div>
                  <div className="rounded bg-red-50 text-red-700 p-2 text-xs">{run.error}</div>
                </div>
              )}
            </div>

            <div className="text-sm font-medium">Tool Calls</div>
            <div className="space-y-2">
              {toolCalls.map((t, i) => (
                <details key={`${t.seq}-${i}`} className="rounded-md border p-3">
                  <summary className="cursor-pointer text-sm">
                    Tool call #{t.seq} — {t.status}
                  </summary>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Input</div>
                      <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-56">
                        {JSON.stringify(t.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Output</div>
                      <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-56">
                        {t.output ? JSON.stringify(t.output, null, 2) : '—'}
                      </pre>
                    </div>
                    {t.error && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Error</div>
                        <pre className="text-xs bg-red-50 text-red-700 p-2 rounded-md overflow-auto">
                          {t.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              ))}
              {toolCalls.length === 0 && (
                <div className="text-sm text-muted-foreground">No tool calls recorded.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
