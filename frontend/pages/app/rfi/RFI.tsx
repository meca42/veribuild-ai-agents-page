import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileQuestion, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function RFI() {
  const { id: projectId } = useParams<{ id: string }>();
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projectId || localStorage.getItem('selectedProjectId') || '';
  });
  const [rfis, setRfis] = useState<API.RFI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRFI, setSelectedRFI] = useState<API.RFI | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewRFIModalOpen, setIsNewRFIModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      const storedProjectId = localStorage.getItem('selectedProjectId');
      if (storedProjectId) {
        setSelectedProjectId(storedProjectId);
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchRFIs();
    }
  }, [selectedProjectId, statusFilter]);

  const fetchRFIs = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      const result = await api.listRFIs(selectedProjectId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        q: searchQuery || undefined,
      });
      setRfis(result.data);
    } catch (err: any) {
      console.error('Failed to fetch RFIs:', err);
      addToast(err.message || 'Failed to load RFIs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRFI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      question: formData.get('question') as string,
      assignedTo: formData.get('assignedTo') as string || undefined,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
    };

    setIsSubmitting(true);
    try {
      const newRFI = await api.createRFI(selectedProjectId, data);
      setRfis(prev => [newRFI, ...prev]);
      setIsNewRFIModalOpen(false);
      addToast('RFI created successfully', 'success');
    } catch (err: any) {
      console.error('Failed to create RFI:', err);
      addToast(err.message || 'Failed to create RFI', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (rfiId: string, status: API.RFIStatus) => {
    try {
      const updated = await api.updateRFI(rfiId, { status });
      setRfis(prev => prev.map(r => r.id === rfiId ? updated : r));
      if (selectedRFI?.id === rfiId) {
        setSelectedRFI(updated);
      }
      addToast('Status updated', 'success');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddAttachment = async (rfiId: string, file: File) => {
    try {
      const updated = await api.addRFIAttachment(rfiId, file);
      setRfis(prev => prev.map(r => r.id === rfiId ? updated : r));
      if (selectedRFI?.id === rfiId) {
        setSelectedRFI(updated);
      }
      addToast('Attachment added', 'success');
    } catch (err: any) {
      console.error('Failed to add attachment:', err);
      addToast(err.message || 'Failed to add attachment', 'error');
    }
  };

  const openDetailModal = async (rfi: API.RFI) => {
    try {
      const fullRFI = await api.getRFI(rfi.id);
      setSelectedRFI(fullRFI);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load RFI details:', err);
      addToast(err.message || 'Failed to load RFI details', 'error');
    }
  };

  const filteredRFIs = rfis.filter((rfi) => {
    const matchesSearch =
      rfi.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfi.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfi.question?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rfi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        actions={
          <Button variant="primary" onClick={() => setIsNewRFIModalOpen(true)}>
            <FileQuestion size={20} />
            New RFI
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search RFIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        {filteredRFIs.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Asked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredRFIs.map((rfi) => (
                  <tr
                    key={rfi.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => openDetailModal(rfi)}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-neutral-900">{rfi.number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{rfi.title}</td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[rfi.status]}>
                        {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{rfi.askedBy || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{rfi.assignedTo || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="No RFIs found"
            description="Create RFIs to track questions and information requests."
            actionLabel="New RFI"
            onAction={() => setIsNewRFIModalOpen(true)}
          />
        )}
      </div>

      <Modal
        isOpen={isNewRFIModalOpen}
        onClose={() => setIsNewRFIModalOpen(false)}
        title="New RFI"
      >
        <form onSubmit={handleCreateRFI} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Brief description of the question"
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-neutral-700 mb-1">
              Question *
            </label>
            <textarea
              id="question"
              name="question"
              required
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed question or information request"
            />
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700 mb-1">
              Assigned To
            </label>
            <Input
              id="assignedTo"
              name="assignedTo"
              type="text"
              placeholder="Person responsible for answering"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Due Date
            </label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewRFIModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create RFI'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`RFI ${selectedRFI?.number}`}
      >
        {selectedRFI && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{selectedRFI.title}</h3>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Badge className={statusColors[selectedRFI.status]}>
                  {selectedRFI.status.charAt(0).toUpperCase() + selectedRFI.status.slice(1)}
                </Badge>
                <span>Asked by: {selectedRFI.askedBy || 'Unknown'}</span>
                <span>Assigned to: {selectedRFI.assignedTo || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Question</h4>
              <p className="text-sm text-neutral-900 whitespace-pre-wrap">{selectedRFI.question}</p>
            </div>

            {selectedRFI.answer && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Answer</h4>
                <p className="text-sm text-neutral-900 whitespace-pre-wrap">{selectedRFI.answer}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Attachments</h4>
              {selectedRFI.attachments && selectedRFI.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {selectedRFI.attachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <span className="text-sm text-neutral-900">{att.fileName}</span>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No attachments</p>
              )}
              <div className="mt-3">
                <input
                  type="file"
                  id="rfi-attachment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddAttachment(selectedRFI.id, file);
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('rfi-attachment')?.click()}
                >
                  <Upload size={16} />
                  Add Attachment
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Update Status</h4>
              <div className="flex gap-2">
                <Button
                  variant={selectedRFI.status === 'open' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedRFI.id, 'open')}
                >
                  Open
                </Button>
                <Button
                  variant={selectedRFI.status === 'answered' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedRFI.id, 'answered')}
                >
                  Answered
                </Button>
                <Button
                  variant={selectedRFI.status === 'closed' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedRFI.id, 'closed')}
                >
                  Closed
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
