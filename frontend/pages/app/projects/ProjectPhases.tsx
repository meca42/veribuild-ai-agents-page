import { useParams } from "react-router-dom";
import { useState } from "react";
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormRow } from "@/components/ui/FormRow";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { usePhases, useCreatePhase, useDeletePhase, useReorderPhases } from "@/lib/hooks/usePhases";

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  blocked: "bg-red-100 text-red-800",
  done: "bg-green-100 text-green-800",
};

export default function ProjectPhases() {
  const { id } = useParams<{ id: string }>();
  const { data: phases, isLoading, refetch } = usePhases(id);
  const { createPhase, isLoading: isCreating } = useCreatePhase();
  const { deletePhase, isLoading: isDeleting } = useDeletePhase();
  const { reorderPhases } = useReorderPhases();
  const { addToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDescription, setNewPhaseDescription] = useState("");

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPhaseName.trim()) return;

    try {
      await createPhase(id, { name: newPhaseName, description: newPhaseDescription });
      addToast("Phase created successfully", "success");
      setShowCreateModal(false);
      setNewPhaseName("");
      setNewPhaseDescription("");
      refetch();
    } catch (error: any) {
      addToast(error.message || "Failed to create phase", "error");
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!id || !confirm("Are you sure you want to delete this phase?")) return;

    try {
      await deletePhase(id, phaseId);
      addToast("Phase deleted successfully", "success");
      refetch();
    } catch (error: any) {
      addToast(error.message || "Failed to delete phase", "error");
    }
  };

  const movePhase = async (index: number, direction: 'up' | 'down') => {
    if (!id || !phases) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= phases.length) return;

    const newOrder = [...phases];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    
    try {
      await reorderPhases(id, newOrder.map(p => p.id));
      refetch();
    } catch (error: any) {
      addToast(error.message || "Failed to reorder phases", "error");
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
        title="Phases"
        description="Manage project phases"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${id}` },
          { label: "Phases" },
        ]}
        actions={
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus size={20} className="mr-2" />
            Add Phase
          </Button>
        }
      />

      <div className="p-6">
        {phases && phases.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-200">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className="p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        onClick={() => movePhase(index, 'up')}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => movePhase(index, 'down')}
                        disabled={index === phases.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{phase.name}</h3>
                        <Badge className={statusColors[phase.status]}>
                          {phase.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {phase.description && (
                        <p className="text-sm text-neutral-600 mb-3">{phase.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div>
                          <span className="font-medium">Sequence:</span> {phase.order}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePhase(phase.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No phases yet"
            description="Get started by creating your first phase"
            onAction={() => setShowCreateModal(true)}
            actionLabel="Add Phase"
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Phase"
      >
        <form onSubmit={handleCreatePhase} className="space-y-4">
          <FormRow label="Name" required>
            <Input
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              placeholder="Phase name"
              required
            />
          </FormRow>
          <FormRow label="Description">
            <Textarea
              value={newPhaseDescription}
              onChange={(e) => setNewPhaseDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
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
              {isCreating ? "Creating..." : "Create Phase"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
