import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Bot, Send, Clock } from 'lucide-react';
import { startRun } from '../../lib/api/agents';

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  agentId: string;
  onRunCreated: (runId: string) => void;
}

export function AgentDrawer({ isOpen, onClose, projectId, agentId, onRunCreated }: AgentDrawerProps) {
  const [input, setInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [recentRuns, setRecentRuns] = React.useState<Array<{ id: string; input: string; created_at: string }>>([]);

  const savedPrompts = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('agentPrompts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await startRun(agentId, projectId, input);
      
      const prompts = [...savedPrompts];
      prompts.unshift(input);
      if (prompts.length > 5) prompts.pop();
      localStorage.setItem('agentPrompts', JSON.stringify(prompts));

      setInput('');
      onRunCreated(result.run_id);
    } catch (error) {
      console.error('Failed to start run:', error);
      alert('Failed to start agent run. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Ask Agent">
      <div className="flex flex-col h-full">
        <form onSubmit={handleSubmit} className="flex-shrink-0 space-y-4 pb-4 border-b border-border">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your project..."
            rows={4}
            className="resize-none"
          />
          <Button type="submit" disabled={!input.trim() || isSubmitting} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Starting...' : 'Run'}
          </Button>
        </form>

        {savedPrompts.length > 0 && (
          <div className="flex-shrink-0 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Recent prompts</h3>
            <div className="space-y-2">
              {savedPrompts.map((prompt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 p-2 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Recent runs</h3>
          {recentRuns.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No runs yet</p>
              <p className="text-xs mt-1">Start by asking a question above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => onRunCreated(run.id)}
                  className="w-full text-left p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm text-foreground line-clamp-2 mb-2">{run.input}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(run.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
