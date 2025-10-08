import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormRow } from "@/components/ui/FormRow";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  reopened: "bg-yellow-100 text-yellow-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function RFIPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [rfis, setRFIs] = useState<API.RFI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newPriority, setNewPriority] = useState<string>("normal");
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchRFIs = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await api.listRFIs(id, {
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setRFIs(response.data);
    } catch (error: any) {
      addToast(error.message || "Failed to load RFIs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRFIs();
  }, [id, statusFilter, searchQuery]);

  const handleCreateRFI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newSubject.trim() || !newQuestion.trim()) return;

    try {
      setIsCreating(true);
      await api.createRFI(id, {
        subject: newSubject,
        question: newQuestion,
        priority: newPriority,
        dueDate: newDueDate?.toISOString().split('T')[0],
      });
      addToast("RFI created successfully", "success");
      setShowCreateModal(false);
      setNewSubject("");
      setNewQuestion("");
      setNewPriority("normal");
      setNewDueDate(null);
      fetchRFIs();
    } catch (error: any) {
      addToast(error.message || "Failed to create RFI", "error");
    } finally {
      setIsCreating(false);
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
        title="RFIs"
        description="Requests for Information"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${id}` },
          { label: "RFIs" },
        ]}
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            New RFI
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search RFIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
          </Select>
        </div>

        {rfis.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {rfis.map((rfi) => (
                  <tr
                    key={rfi.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/projects/${id}/rfis/${rfi.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{rfi.subject}</div>
                      <div className="text-sm text-neutral-500 truncate max-w-md">{rfi.question}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[rfi.status]}>{rfi.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={priorityColors[rfi.priority]}>{rfi.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(rfi.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary hover:underline">Open</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No RFIs yet"
            description="Create your first Request for Information"
            onAction={() => setShowCreateModal(true)}
            actionLabel="New RFI"
          />
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create RFI">
        <form onSubmit={handleCreateRFI} className="space-y-4">
          <FormRow label="Subject" required>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="RFI subject"
              required
            />
          </FormRow>
          <FormRow label="Question" required>
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Detailed question"
              rows={4}
              required
            />
          </FormRow>
          <FormRow label="Priority">
            <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormRow>
          <FormRow label="Due Date">
            <DatePicker value={newDueDate || undefined} onChange={(date) => setNewDueDate(date)} />
          </FormRow>
          <div className="flex gap-3 justify-end">
            <Button type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create RFI"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
