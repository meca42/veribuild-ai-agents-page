import { useEffect, useState } from 'react';
import { listProjectRuns } from '@/lib/api/agents';
import { Badge } from '@/components/ui/Badge';

interface AgentRunItem {
  id: string;
  project_id: string;
  agent_id: string;
  status: string;
  input: string;
  result_summary: string | null;
  started_at: string | null;
  finished_at: string | null;
}

interface RecentRunsProps {
  projectId?: string;
}

export function RecentRuns({ projectId }: RecentRunsProps) {
  const [runs, setRuns] = useState<AgentRunItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    const fetchRuns = async () => {
      try {
        setLoading(true);
        const items = await listProjectRuns(projectId);
        setRuns(items);
      } catch (err) {
        console.warn('Failed to fetch recent runs:', err);
        setRuns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [projectId]);

  if (!projectId) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Recent Agent Runs</h3>
        <a 
          className="text-sm text-primary hover:underline" 
          href={`/runs?projectId=${projectId}`}
        >
          View all
        </a>
      </div>
      <div className="p-6">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        <div className="space-y-3">
          {runs.map((r) => (
            <a 
              key={r.id} 
              href={`/runs/${r.id}`}
              className="flex items-start justify-between gap-3 border rounded-md p-3 hover:bg-accent/5 transition-colors block"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  {r.started_at ? new Date(r.started_at).toLocaleString() : 'Not started'}
                </div>
                <div className="truncate text-sm">
                  {r.result_summary || r.input}
                </div>
              </div>
              <Badge variant={r.status === 'succeeded' ? 'success' : r.status === 'failed' ? 'danger' : 'neutral'} className="shrink-0 capitalize">
                {r.status}
              </Badge>
            </a>
          ))}
          {!loading && runs.length === 0 && (
            <div className="text-sm text-muted-foreground">No runs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
