import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { Table } from '../ui/Table';
import { Tabs } from '../ui/Tabs';
import { JSONView } from '../ui/JSONView';
import { Bot, User, Wrench, XCircle, CheckCircle, Clock } from 'lucide-react';
import { useAgentRun, cancelRun } from '../../lib/api/agents';

interface RunDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string | null;
}

export function RunDetailDrawer({ isOpen, onClose, runId }: RunDetailDrawerProps) {
  const { data, loading, error } = useAgentRun(runId, { interval: 1500 });
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    if (!runId) return;
    setIsCancelling(true);
    try {
      await cancelRun(runId);
    } catch (err) {
      console.error('Failed to cancel run:', err);
      alert('Failed to cancel run. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isOpen || !runId) return null;

  const run = data?.run;
  const messages = data?.messages || [];
  const toolCalls = data?.tool_calls || [];
  const progress = data?.progress || 0;

  const isRunning = run?.status === 'running' || run?.status === 'queued';
  const canCancel = isRunning && !isCancelling;

  const messagesContent = (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No messages yet</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {msg.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              ) : msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="w-4 h-4 text-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">{msg.role}</span>
                {msg.tool_name && (
                  <span className="text-xs text-muted-foreground">({msg.tool_name})</span>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const toolCallsContent = (
    <div className="max-h-[500px] overflow-y-auto">
      {toolCalls.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No tool calls yet</p>
      ) : (
        <Table
          columns={[
            { 
              key: 'tool',
              header: 'Tool', 
              accessor: (row) => {
                const toolName = Object.keys(row.input)[0] || 'unknown';
                return (
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{toolName}</span>
                  </div>
                );
              }
            },
            { 
              key: 'status',
              header: 'Status', 
              accessor: (row) => (
                <div className="flex items-center gap-2">
                  {row.status === 'ok' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">{row.status}</span>
                </div>
              )
            },
            { 
              key: 'duration',
              header: 'Duration', 
              accessor: (row) => {
                if (!row.started_at || !row.finished_at) return '-';
                const ms = new Date(row.finished_at).getTime() - new Date(row.started_at).getTime();
                return `${ms}ms`;
              }
            },
            {
              key: 'input',
              header: 'Input',
              accessor: (row) => (
                <div className="max-w-xs truncate">
                  <code className="text-xs">{JSON.stringify(row.input)}</code>
                </div>
              )
            },
            {
              key: 'output',
              header: 'Output',
              accessor: (row) => row.output ? (
                <div className="max-w-xs truncate">
                  <code className="text-xs">{JSON.stringify(row.output)}</code>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )
            }
          ]}
          data={toolCalls}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Agent Run Details">
      {loading && !data ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-12">
          <p>Failed to load run details</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <StatusPill status={run?.status === 'succeeded' ? 'done' : run?.status === 'running' || run?.status === 'queued' ? 'in_progress' : 'blocked'} />
                {isRunning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-24 bg-border rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span>{progress}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{run?.input}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {run?.started_at ? new Date(run.started_at).toLocaleString() : 'Not started'}
                </div>
                {run?.latency_ms && (
                  <span>{(run.latency_ms / 1000).toFixed(2)}s</span>
                )}
              </div>
            </div>
            {canCancel && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCancel}
                disabled={isCancelling}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>

          <Tabs
            tabs={[
              { id: 'messages', label: `Messages (${messages.length})`, content: messagesContent },
              { id: 'tools', label: `Tool Calls (${toolCalls.length})`, content: toolCallsContent }
            ]}
          />

          {run?.result_summary && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-2">Final Answer</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-accent/30 p-3 rounded">
                {run.result_summary}
              </p>
            </div>
          )}

          {run?.error && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-destructive mb-2">Error</h3>
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {run.error}
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
