import { useEffect, useState, useMemo } from 'react';
import backend from '~backend/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

interface AgentRunRow {
  id: string;
  project_id: string;
  agent_id: string;
  status: string;
  input: string;
  result_summary: string | null;
  started_at: string | null;
  finished_at: string | null;
  projects: {
    org_id: string;
    name: string;
  }[];
  agents: {
    name: string;
    model: string;
  }[];
}

const STATUSES = ['queued', 'running', 'succeeded', 'failed', 'cancelled'] as const;

export default function Runs() {
  const [items, setItems] = useState<AgentRunRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agentId, setAgentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const urlParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      projectId: params.get('projectId') || '',
    };
  }, []);

  useEffect(() => {
    if (urlParams.projectId) {
      setProjectId(urlParams.projectId);
    }
  }, [urlParams.projectId]);

  const fetchRuns = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const response = await backend.agents.listRuns({
        status: status || undefined,
        agentId: agentId || undefined,
        projectId: projectId || undefined,
        q: q || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 20,
        cursor: isLoadMore ? nextCursor : undefined,
      });

      if (isLoadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }
      setNextCursor(response.next_cursor);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch runs:', err);
      setError('Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [status, agentId, projectId, q, fromDate, toDate]);

  return (
    <div className="space-y-4 p-6">
      <div className="border rounded-lg bg-background">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Agent Runs</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <Input
              placeholder="Search input or result…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <Input
              placeholder="Project ID"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            />
            <Input
              placeholder="Agent ID"
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
            />
            <Select
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">Any Status</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
              <Input
                type="date"
                placeholder="To"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 px-6">{error}</div>}

      <div className="space-y-3">
        {items.map((r: AgentRunRow) => (
          <div key={r.id} className="border rounded-lg p-4 bg-background hover:bg-accent/5 transition-colors">
            <div className="grid md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {r.started_at ? new Date(r.started_at).toLocaleString() : 'Not started'}
                </div>
                <div className="text-sm font-mono truncate">
                  {r.id.slice(0, 8)}
                </div>
              </div>
              <div className="md:col-span-6 min-w-0">
                <div className="text-xs text-muted-foreground truncate mb-1">
                  {r.projects?.[0]?.name || 'Unknown Project'} • {r.agents?.[0]?.name || 'Unknown Agent'}
                </div>
                <div className="truncate text-sm">
                  {r.result_summary || r.input}
                </div>
              </div>
              <div className="md:col-span-2 flex items-center">
                <Badge 
                  variant={
                    r.status === 'succeeded' ? 'success' : 
                    r.status === 'failed' ? 'danger' : 
                    'neutral'
                  } 
                  className="capitalize"
                >
                  {r.status}
                </Badge>
              </div>
              <div className="md:col-span-1 flex items-center justify-end">
                <a 
                  className="text-primary hover:underline text-sm" 
                  href={`/projects/${r.project_id}?run=${r.id}`}
                >
                  Open
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          No runs found
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => fetchRuns(true)} 
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
