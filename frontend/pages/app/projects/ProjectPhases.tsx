import { useParams } from "react-router-dom";
import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useProjects } from "@/lib/hooks/useProjects";
import { usePhases } from "@/lib/hooks/usePhases";

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  blocked: "bg-red-100 text-red-800",
  done: "bg-green-100 text-green-800",
};

export default function ProjectPhases() {
  const { id } = useParams<{ id: string }>();
  const { data: phases, isLoading } = usePhases(id);

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
        title="Phases"
        description="Manage project phases"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${id}` },
          { label: "Phases" },
        ]}
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            Add Phase
          </Button>
        }
      />

      <div className="p-6">
        {phases && phases.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-200">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <button className="mt-1 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{phase.name}</h3>
                        <Badge className={statusColors[phase.status]}>
                          {phase.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">{phase.description}</p>
                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div>
                          <span className="font-medium">Order:</span> {phase.order}
                        </div>
                        {phase.startDate && (
                          <div>
                            <span className="font-medium">Start:</span>{" "}
                            {new Date(phase.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {phase.endDate && (
                          <div>
                            <span className="font-medium">End:</span>{" "}
                            {new Date(phase.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No phases yet"
            description="Get started by creating your first project phase to organize work into manageable sections."
            actionLabel="Add Phase"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
