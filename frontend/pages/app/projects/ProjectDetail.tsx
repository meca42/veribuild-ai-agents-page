import React from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, User, FileText, Package, MessageSquare, Bot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/app/PageHeader";
import { AgentDrawer } from "@/components/app/AgentDrawer";
import { RunDetailDrawer } from "@/components/app/RunDetailDrawer";
import { useProject } from "@/lib/hooks";

const statusColors: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  planning: "info",
  active: "success",
  on_hold: "warning",
  completed: "neutral",
  archived: "neutral",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError, error } = useProject(id!);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = React.useState(false);
  const [isRunDetailOpen, setIsRunDetailOpen] = React.useState(false);
  const [currentRunId, setCurrentRunId] = React.useState<string | null>(null);

  const handleRunCreated = (runId: string) => {
    setCurrentRunId(runId);
    setIsAgentDrawerOpen(false);
    setIsRunDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          {error?.message || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAgentDrawerOpen(true)}>
              <Bot className="w-4 h-4 mr-2" />
              Ask Agent
            </Button>
            <Button variant="secondary">Edit Project</Button>
            <Button variant="primary">Settings</Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</span>
              <Badge variant={statusColors[project.status] || 'neutral'}>
                {project.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Location</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{project.location || '—'}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Budget</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {project.budget ? `$${project.budget.toLocaleString()}` : '—'}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Timeline</span>
            </div>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
              {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={`/projects/${id}/phases`}
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Phases</h3>
            </div>
            <p className="text-sm text-neutral-600">
              View and manage project phases and milestones
            </p>
          </Link>

          <Link
            to={`/projects/${id}/steps`}
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Steps</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track detailed execution steps and checklists
            </p>
          </Link>

          <Link
            to={`/projects/${id}/drawings`}
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Drawings</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Access project drawings and specifications
            </p>
          </Link>

          <Link
            to="/materials"
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Materials</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage BOM, deliveries, and inventory
            </p>
          </Link>

          <Link
            to="/rfi"
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">RFIs</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Submit and track requests for information
            </p>
          </Link>

          <Link
            to="/issues"
            className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Issues</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track and resolve project issues
            </p>
          </Link>
        </div>
      </div>

      <AgentDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
        projectId={id!}
        agentId="default-agent-id"
        onRunCreated={handleRunCreated}
      />

      <RunDetailDrawer
        isOpen={isRunDetailOpen}
        onClose={() => setIsRunDetailOpen(false)}
        runId={currentRunId}
      />
    </div>
  );
}
