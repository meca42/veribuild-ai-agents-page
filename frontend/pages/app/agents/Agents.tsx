import { Plus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useAgents } from "@/lib/mocks/agents";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
};

const typeColors = {
  "drawing-search": "bg-blue-100 text-blue-800",
  "rfi-assistant": "bg-purple-100 text-purple-800",
  "inventory-query": "bg-orange-100 text-orange-800",
  "spec-qa": "bg-yellow-100 text-yellow-800",
  custom: "bg-gray-100 text-gray-800",
};

export default function Agents() {
  const { data: agents, isLoading } = useAgents();

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
        title="AI Agents"
        description="Configure and manage AI agents for your project"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            Create Agent
          </Button>
        }
      />

      <div className="p-6">
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-lg border border-neutral-200 p-6 hover:border-[var(--vb-primary)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot size={24} className="text-blue-600" />
                  </div>
                  <Badge className={statusColors[agent.status]}>{agent.status}</Badge>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{agent.name}</h3>
                <p className="text-sm text-neutral-600 mb-4">{agent.description}</p>

                <div className="mb-4">
                  <Badge className={typeColors[agent.type]}>{agent.type.replace("-", " ")}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-neutral-500 uppercase">Enabled Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.enabledTools.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configure
                  </Button>
                  <Button size="sm" className="flex-1 bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bot}
            title="No agents configured"
            description="Create AI agents to help your team search drawings, draft RFIs, and query inventory."
            actionLabel="Create Agent"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
