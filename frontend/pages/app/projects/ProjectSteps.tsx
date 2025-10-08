import { useParams } from "react-router-dom";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useSteps } from "@/lib/hooks/useSteps";
import type * as API from "@/lib/api/types";

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

export default function ProjectSteps() {
  const { id } = useParams<{ id: string }>();
  const { data: steps, isLoading } = useSteps(id);
  const [selectedStep, setSelectedStep] = useState<API.Step | null>(null);

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
        title="Steps"
        description="Manage execution steps"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${id}` },
          { label: "Steps" },
        ]}
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            Add Step
          </Button>
        }
      />

      <div className="p-6">
        {steps && steps.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {steps.map((step) => {
                  const completedItems = step.checklist.filter((c) => c.checked).length;
                  const totalItems = step.checklist.length;
                  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                  return (
                    <tr
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--vb-primary)]">
                          {step.name}
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">{step.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">{step.assignee || "-"}</td>
                      <td className="px-6 py-4">
                        <Badge className={statusColors[step.status]}>
                          {step.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {step.dueDate ? new Date(step.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-[var(--vb-accent)] h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-600 w-12">{progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No steps yet"
            description="Create execution steps with checklists to track detailed work items."
            actionLabel="Add Step"
            onAction={() => {}}
          />
        )}
      </div>

      <Sheet open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedStep && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedStep.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Description</h4>
                  <p className="text-sm text-neutral-600">{selectedStep.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Status</h4>
                    <Badge className={statusColors[selectedStep.status]}>
                      {selectedStep.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Assignee</h4>
                    <p className="text-sm text-neutral-600">{selectedStep.assignee || "-"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Due Date</h4>
                    <p className="text-sm text-neutral-600">
                      {selectedStep.dueDate
                        ? new Date(selectedStep.dueDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

<div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-3">Checklist</h4>
                  <div className="space-y-3">
                    {selectedStep.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Checkbox checked={item.checked} />
                        <label
                          className={`text-sm ${
                            item.checked ? "line-through text-neutral-400" : "text-neutral-900"
                          }`}
                        >
                          {item.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                    Edit Step
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Mark Complete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
