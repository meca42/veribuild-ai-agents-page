import { useState } from "react";
import { Activity, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useRuns } from "@/lib/mocks/agents";
import { AgentRun } from "@/lib/types";

const statusColors = {
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function Runs() {
  const { data: runs, isLoading } = useRuns();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  const filteredRuns = runs?.filter(
    (r) =>
      r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-[var(--vb-neutral-600)]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agent Runs"
        description="History of AI agent executions and responses"
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRuns && filteredRuns.length > 0 ? (
          <div className="space-y-3">
            {filteredRuns.map((run) => (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className="bg-white rounded-lg border border-neutral-200 p-6 hover:border-[var(--vb-primary)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={statusColors[run.status]}>{run.status}</Badge>
                      <span className="text-sm text-neutral-500">{run.agentName}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">{run.query}</p>
                  </div>
                  <ChevronRight size={20} className="text-neutral-400 flex-shrink-0 ml-4" />
                </div>

                <div className="flex items-center gap-6 text-xs text-neutral-500">
                  <div>
                    <span className="font-medium">User:</span> {run.user}
                  </div>
                  <div>
                    <span className="font-medium">Started:</span>{" "}
                    {new Date(run.startedAt).toLocaleString()}
                  </div>
                  {run.completedAt && (
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {Math.round(
                        (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000
                      )}
                      s
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No agent runs found"
            description="Agent execution history will appear here once you start using AI agents."
            actionLabel="View Agents"
            onAction={() => (window.location.href = "/agents")}
          />
        )}
      </div>

      <Sheet open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedRun && (
            <>
              <SheetHeader>
                <SheetTitle>Agent Run Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Agent</h4>
                  <p className="text-sm text-neutral-600">{selectedRun.agentName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Query</h4>
                  <p className="text-sm text-neutral-900 bg-neutral-50 p-4 rounded-lg">
                    {selectedRun.query}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Response</h4>
                  <div className="text-sm text-neutral-900 bg-neutral-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedRun.response}
                  </div>
                </div>

                {selectedRun.citations && selectedRun.citations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-3">Citations</h4>
                    <div className="space-y-3">
                      {selectedRun.citations.map((citation, idx) => (
                        <div key={idx} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{citation.type}</Badge>
                            <span className="text-sm font-medium text-neutral-900">
                              {citation.name}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">{citation.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">User</h4>
                    <p className="text-sm text-neutral-600">{selectedRun.user}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">Status</h4>
                    <Badge className={statusColors[selectedRun.status]}>{selectedRun.status}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">Started</h4>
                    <p className="text-sm text-neutral-600">
                      {new Date(selectedRun.startedAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedRun.completedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-1">Duration</h4>
                      <p className="text-sm text-neutral-600">
                        {Math.round(
                          (new Date(selectedRun.completedAt).getTime() -
                            new Date(selectedRun.startedAt).getTime()) /
                            1000
                        )}
                        s
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
