import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useProjects } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

const statusColors: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  planning: "info",
  active: "success",
  on_hold: "warning",
  completed: "neutral",
  archived: "neutral",
};

export default function ProjectsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  const { currentOrgId } = useAuth();
  const { data: projects, total, isLoading, isError, error, refetch } = useProjects({
    q: searchQuery,
    sortBy,
    sortDir,
    page: 1,
    pageSize: 50,
  });

  const { addToast } = useToast();

  const handleCreateProject = async () => {
    if (!currentOrgId) {
      addToast('No organization selected', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const project = await api.createProject(currentOrgId, {
        name: 'New Project',
        status: 'planning',
      });
      addToast('Project created successfully', 'success');
      await refetch();
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      addToast(err.message || 'Failed to create project', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (isError && error) {
    addToast(error.message, 'error');
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader title="Projects" description="Manage your construction projects" />
        <div className="mt-6">
          <SkeletonTable rows={5} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your construction projects"
        actions={
          <Button variant="primary" onClick={handleCreateProject} disabled={isCreating}>
            <Plus className="h-5 w-5" />
            {isCreating ? 'Creating...' : 'New Project'}
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {projects && projects.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {project.name}
                      </Link>
                      {project.description && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{project.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">{project.location || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusColors[project.status] || 'neutral'}>
                        {project.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 w-10 text-right">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No projects found"
            description="No projects match your search criteria. Try adjusting your filters or create a new project."
            actionLabel="Create Project"
            onAction={handleCreateProject}
          />
        )}

        {total > 0 && (
          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Showing {projects.length} of {total} projects
          </div>
        )}
      </div>
    </div>
  );
}
