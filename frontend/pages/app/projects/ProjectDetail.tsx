import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, User, FileText, Package, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/app/PageHeader";
import { useProject } from "@/lib/mocks/projects";

const statusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-[var(--vb-neutral-600)]">Loading...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Project not found</div>
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
            <Button variant="outline">Edit Project</Button>
            <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
              Settings
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-neutral-600">Status</span>
              <Badge className={statusColors[project.status]}>
                {project.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600">Location</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900">{project.location}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600">Owner</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900">{project.owner}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600">Timeline</span>
            </div>
            <p className="text-sm text-neutral-900">
              {new Date(project.startDate).toLocaleDateString()}
              {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={`/projects/${id}/phases`}
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
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
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Steps</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Track detailed execution steps and checklists
            </p>
          </Link>

          <Link
            to="/drawings"
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Drawings</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Access project drawings and specifications
            </p>
          </Link>

          <Link
            to="/materials"
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Materials</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Manage BOM, deliveries, and inventory
            </p>
          </Link>

          <Link
            to="/rfi"
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">RFIs</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Submit and track requests for information
            </p>
          </Link>

          <Link
            to="/issues"
            className="bg-white p-6 rounded-lg border border-neutral-200 hover:border-[var(--vb-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Issues</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Track and resolve project issues
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
