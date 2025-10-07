import { useState, useEffect } from 'react';
import { Activity, ChevronDown, ChevronRight, X, Download } from 'lucide-react';
import PageHeader from '@/components/app/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type * as API from '@/lib/api/types';

const statusColors: Record<API.AgentRunStatus, string> = {
  queued: 'bg-neutral-100 text-neutral-600',
  running: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-neutral-100 text-neutral-600',
};

export default function Runs() {
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  
  const [runs, setRuns] = useState<API.AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<API.AgentRun | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<number>>(new Set());

  const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') || undefined : undefined;

  useEffect(() => {
    if (!currentOrgId) return;
    loadRuns();
  }, [currentOrgId, projectId, statusFilter]);

  const loadRuns = async () => {
    if (!currentOrgId) return;
    
    try {
      setIsLoading(true);
      const response = await api.listAgentRuns({
        orgId: currentOrgId,
        projectId,
        status: statusFilter !== 'all' ? statusFilter as API.AgentRunStatus : undefined,
      });
      setRuns(response.data);
    } catch (err: any) {
      console.error('Failed to load runs:', err);
      addToast(err.message || 'Failed to load runs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailModal = async (run: API.AgentRun) => {
    try {
      const fullRun = await api.getAgentRun(run.id);
      setSelectedRun(fullRun);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load run details:', err);
      addToast(err.message || 'Failed to load run details', 'error');
    }
  };

  const handleCancelRun = async (runId: string) => {
    try {
      const updated = await api.cancelAgentRun(runId);
      setRuns(prev => prev.map(r => r.id === runId ? updated : r));
      if (selectedRun?.id === runId) {
        setSelectedRun(updated);
      }
      addToast('Run cancelled', 'success');
    } catch (err: any) {
      console.error('Failed to cancel run:', err);
      addToast(err.message || 'Failed to cancel run', 'error');
    }
  };

  const toggleMessage = (seq: number) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(seq)) {
      newExpanded.delete(seq);
    } else {
      newExpanded.add(seq);
    }
    setExpandedMessages(newExpanded);
  };

  const toggleToolCall = (seq: number) => {
    const newExpanded = new Set(expandedToolCalls);
    if (newExpanded.has(seq)) {
      newExpanded.delete(seq);
    } else {
      newExpanded.add(seq);
    }
    setExpandedToolCalls(newExpanded);
  };

  const filteredRuns = runs.filter((run) =>
    run.agentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.input?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumn<API.AgentRun>[] = [
    {
      key: 'agent',
      header: 'Agent',
      accessor: (run) => (
        <div>
          <div className="font-medium text-neutral-900">{run.agentName || 'Unknown'}</div>
          <div className="text-sm text-neutral-500 truncate max-w-xs">
            {run.input || 'No input'}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (run) => (
        <Badge className={statusColors[run.status]}>
          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'started',
      header: 'Started',
      accessor: (run) => (
        <span className="text-sm text-neutral-600">
          {run.startedAt ? new Date(run.startedAt).toLocaleString() : 'Not started'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: (run) => (
        <span className="text-sm text-neutral-600">
          {run.latencyMs ? `${(run.latencyMs / 1000).toFixed(2)}s` : '-'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'trigger',
      header: 'Trigger',
      accessor: (run) => <Badge variant="neutral">{run.trigger}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (run) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => openDetailModal(run)}>
            <Activity size={16} />
            View
          </Button>
          {run.status === 'running' && (
            <Button variant="ghost" size="sm" onClick={() => handleCancelRun(run.id)}>
              <X size={16} />
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agent Runs"
        description="Execution history and traces"
        actions={null}
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4">
          <Input
            type="search"
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        <Table
          columns={columns}
          data={filteredRuns}
          getRowId={(run) => run.id}
          pagination
          pageSize={20}
        />
      </div>

      {/* Run Detail Modal */}
      {selectedRun && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRun(null);
            setExpandedMessages(new Set());
            setExpandedToolCalls(new Set());
          }}
          title={`Run: ${selectedRun.id.slice(0, 8)}`}
        >
          <div className="space-y-6">
            {/* Run Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Agent</h4>
                <p className="text-sm text-neutral-900">{selectedRun.agentName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Status</h4>
                <Badge className={statusColors[selectedRun.status]}>
                  {selectedRun.status.charAt(0).toUpperCase() + selectedRun.status.slice(1)}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Started By</h4>
                <p className="text-sm text-neutral-900">{selectedRun.startedBy || 'Unknown'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Duration</h4>
                <p className="text-sm text-neutral-900">
                  {selectedRun.latencyMs ? `${(selectedRun.latencyMs / 1000).toFixed(2)}s` : '-'}
                </p>
              </div>
            </div>

            {/* Input */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Input</h4>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-900 whitespace-pre-wrap">{selectedRun.input}</p>
              </div>
            </div>

            {/* Error */}
            {selectedRun.error && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Error</h4>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-900 whitespace-pre-wrap">{selectedRun.error}</p>
                </div>
              </div>
            )}

            {/* Result Summary */}
            {selectedRun.resultSummary && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Result</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-neutral-900 whitespace-pre-wrap">{selectedRun.resultSummary}</p>
                </div>
              </div>
            )}

            {/* Messages Trace */}
            {selectedRun.messages && selectedRun.messages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Message Trace</h4>
                <div className="space-y-2">
                  {selectedRun.messages.map((msg) => (
                    <div key={msg.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleMessage(msg.seq)}
                        className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedMessages.has(msg.seq) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <Badge variant={msg.role === 'user' ? 'info' : msg.role === 'assistant' ? 'neutral' : 'neutral'}>
                            {msg.role}
                          </Badge>
                          <span className="text-sm text-neutral-600">#{msg.seq}</span>
                        </div>
                      </button>
                      {expandedMessages.has(msg.seq) && (
                        <div className="p-3 border-t border-neutral-200">
                          <p className="text-sm text-neutral-900 whitespace-pre-wrap">{msg.content}</p>
                          {msg.toolName && (
                            <p className="text-xs text-neutral-500 mt-2">Tool: {msg.toolName}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool Calls */}
            {selectedRun.toolCalls && selectedRun.toolCalls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Tool Calls</h4>
                <div className="space-y-2">
                  {selectedRun.toolCalls.map((call) => (
                    <div key={call.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleToolCall(call.seq)}
                        className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedToolCalls.has(call.seq) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="font-medium text-neutral-900">{call.toolName}</span>
                          <Badge className={call.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {call.status}
                          </Badge>
                          <span className="text-sm text-neutral-600">#{call.seq}</span>
                        </div>
                      </button>
                      {expandedToolCalls.has(call.seq) && (
                        <div className="p-3 border-t border-neutral-200 space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-neutral-700 mb-1">Input</h5>
                            <pre className="text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(call.input, null, 2)}
                            </pre>
                          </div>
                          {call.output && (
                            <div>
                              <h5 className="text-xs font-medium text-neutral-700 mb-1">Output</h5>
                              <pre className="text-xs bg-neutral-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(call.output, null, 2)}
                              </pre>
                            </div>
                          )}
                          {call.error && (
                            <div>
                              <h5 className="text-xs font-medium text-red-700 mb-1">Error</h5>
                              <p className="text-xs text-red-900">{call.error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              {selectedRun.status === 'running' && (
                <Button variant="secondary" onClick={() => handleCancelRun(selectedRun.id)}>
                  <X size={16} />
                  Cancel Run
                </Button>
              )}
              {selectedRun.resultBlob && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(selectedRun.resultBlob, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `run-${selectedRun.id}.json`;
                    a.click();
                  }}
                >
                  <Download size={16} />
                  Download Result
                </Button>
              )}
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
