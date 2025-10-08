import { useParams } from "react-router-dom";
import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormRow } from "@/components/ui/FormRow";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useSteps, useCreateStep, useDeleteStep } from "@/lib/hooks/useSteps";
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
  const { data: steps, isLoading, refetch } = useSteps(id);
  const { createStep, isLoading: isCreating } = useCreateStep();
  const { deleteStep, isLoading: isDeleting } = useDeleteStep();
  const { addToast } = useToast();

  const [selectedStep, setSelectedStep] = useState<API.Step | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStepName, setNewStepName] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [checklistText, setChecklistText] = useState("");

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStepName.trim()) return;

    const checklistItems = checklistText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({ id: '', text, checked: false }));

    try {
      await createStep(id, '', {
        name: newStepName,
        description: newStepDescription,
        checklist: checklistItems,
      });
      addToast("Step created successfully", "success");
      setShowCreateModal(false);
      setNewStepName("");
      setNewStepDescription("");
      setChecklistText("");
      refetch();
    } catch (error: any) {
      addToast(error.message || "Failed to create step", "error");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!id || !confirm("Are you sure you want to delete this step?")) return;

    try {
      await deleteStep(id, stepId);
      addToast("Step deleted successfully", "success");
      refetch();
    } catch (error: any) {
      addToast(error.message || "Failed to delete step", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
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
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
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
                        <div className="text-sm font-medium text-primary">
                          {step.name}
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">{step.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusColors[step.status]}>
                          {step.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {totalItems > 0 ? `${completedItems}/${totalItems} (${progress}%)` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStep(step.id);
                          }}
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </Button>
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
            description="Get started by creating your first step"
            onAction={() => setShowCreateModal(true)}
            actionLabel="Add Step"
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Step"
      >
        <form onSubmit={handleCreateStep} className="space-y-4">
          <FormRow label="Title" required>
            <Input
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              placeholder="Step title"
              required
            />
          </FormRow>
          <FormRow label="Description">
            <Textarea
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </FormRow>
          <FormRow label="Checklist (one item per line)">
            <Textarea
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              placeholder="Item 1&#10;Item 2&#10;Item 3"
              rows={4}
            />
          </FormRow>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Step"}
            </Button>
          </div>
        </form>
      </Modal>

      {selectedStep && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStep(null)}
          title={selectedStep.name}
        >
          <div className="space-y-4">
            {selectedStep.description && (
              <p className="text-sm text-neutral-600">{selectedStep.description}</p>
            )}

            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium text-neutral-700">Status:</span>
                <Badge className={`ml-2 ${statusColors[selectedStep.status]}`}>
                  {selectedStep.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {selectedStep.checklist.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Checklist</h4>
                <div className="space-y-3">
                  {selectedStep.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox checked={item.checked} disabled />
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
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setSelectedStep(null)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
