import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import RunDetailDrawer from './RunDetailDrawer';
import { startRun } from '@/lib/api/agents';

interface AgentRunsPanelProps {
  projectId: string;
  agentId: string;
}

export default function AgentRunsPanel({ projectId, agentId }: AgentRunsPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRun() {
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { run_id } = await startRun(agentId, projectId, prompt.trim());
      setActiveRunId(run_id);
      setDrawerOpen(true);
      setPrompt('');
    } catch (err) {
      console.error('Failed to start run:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const rid = url.searchParams.get('run');
    if (rid) {
      setActiveRunId(rid);
      setDrawerOpen(true);
    }
  }, []);

  return (
    <>
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3">
        <div>
          <label htmlFor="agent-prompt" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Ask the Agent
          </label>
          <Textarea
            id="agent-prompt"
            placeholder="What would you like to know about this project?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleRun}
            disabled={!prompt.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Starting...' : 'Run'}
          </Button>
        </div>
      </div>

      <RunDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        runId={activeRunId}
      />
    </>
  );
}
