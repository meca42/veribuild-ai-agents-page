import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cancelRun, RunStatus } from '@/lib/api/agents';
import { useRunPolling } from '@/lib/hooks/useRunPolling';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/ui/cn';

interface RunDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runId?: string;
}

function StatusBadge({ status }: { status: RunStatus }) {
  const variantMap: Record<RunStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
    queued: 'neutral',
    running: 'info',
    succeeded: 'success',
    failed: 'danger',
    cancelled: 'warning',
  };

  return (
    <Badge variant={variantMap[status]} className="capitalize">
      {status}
    </Badge>
  );
}

export default function RunDetailDrawer({ isOpen, onClose, runId }: RunDetailDrawerProps) {
  const { run, messages, tool_calls, progress, loading, error } = useRunPolling(runId);
  const [canceling, setCanceling] = useState(false);

  const canCancel = run && (run.status === 'running' || run.status === 'queued');

  async function handleCancel() {
    if (!run) return;
    setCanceling(true);
    try {
      await cancelRun(run.id);
    } catch (err) {
      console.error('Failed to cancel run:', err);
    } finally {
      setCanceling(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-5xl bg-white dark:bg-neutral-900 shadow-xl flex flex-col',
          'animate-in slide-in-from-right duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Agent Run
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {run ? `Run ${run.id.slice(0, 8)} • Agent ${run.agent_id.slice(0, 8)}` : 'Loading…'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {run && <StatusBadge status={run.status} />}
            {run && (
              <div className="text-xs text-neutral-500">
                {progress}% complete
              </div>
            )}
            {canCancel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={canceling}
              >
                {canceling ? 'Canceling...' : 'Cancel'}
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
              <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Messages</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {!run && !error && (
                  <div className="text-sm text-neutral-500">Loading messages...</div>
                )}
                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={`${msg.id}-${msg.seq}`} className="space-y-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {msg.role}
                      {msg.tool_name && ` • ${msg.tool_name}`}
                    </div>
                    <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-4 py-3 text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {run?.result_summary && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Result
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm whitespace-pre-wrap break-words border border-green-200 dark:border-green-800">
                      {run.result_summary}
                    </div>
                  </div>
                )}
                {run?.error && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                      Error
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm whitespace-pre-wrap break-words border border-red-200 dark:border-red-800">
                      {run.error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Tool Calls</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {tool_calls.length === 0 && (
                  <div className="text-sm text-neutral-500">No tool calls yet...</div>
                )}
                {tool_calls.map((tc, idx) => {
                  const duration =
                    tc.started_at && tc.finished_at
                      ? Math.max(0, new Date(tc.finished_at).getTime() - new Date(tc.started_at).getTime())
                      : null;

                  return (
                    <details
                      key={`${tc.id}-${idx}`}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                    >
                      <summary className="cursor-pointer px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                            #{tc.seq}
                          </span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {tc.tool_id}
                          </span>
                          <Badge variant={tc.status === 'ok' ? 'success' : 'danger'} className="capitalize">
                            {tc.status}
                          </Badge>
                        </div>
                        {duration !== null && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {duration}ms
                          </span>
                        )}
                      </summary>
                      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                        <div>
                          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                            Input
                          </div>
                          <pre className="text-xs bg-white dark:bg-neutral-900 p-3 rounded border border-neutral-200 dark:border-neutral-700 overflow-auto max-h-64">
                            {JSON.stringify(tc.input, null, 2)}
                          </pre>
                        </div>
                        {tc.output && (
                          <div>
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                              Output
                            </div>
                            <pre className="text-xs bg-white dark:bg-neutral-900 p-3 rounded border border-neutral-200 dark:border-neutral-700 overflow-auto max-h-64">
                              {JSON.stringify(tc.output, null, 2)}
                            </pre>
                          </div>
                        )}
                        {tc.error && (
                          <div>
                            <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                              Error
                            </div>
                            <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 overflow-auto">
                              {tc.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {run?.started_at && (
              <>
                Started {new Date(run.started_at).toLocaleString()}
                {run.finished_at && ` • Finished ${new Date(run.finished_at).toLocaleString()}`}
                {run.latency_ms && ` • ${run.latency_ms}ms`}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
