import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileCheck, Search, Upload, Plus, Trash2 } from "lucide-react";
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
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  resubmit: "bg-yellow-100 text-yellow-800",
};

const itemStatusColors = {
  pending: "bg-gray-100 text-gray-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  "n/a": "bg-neutral-100 text-neutral-600",
};

export default function Submittals() {
  const { id: projectId } = useParams<{ id: string }>();
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projectId || localStorage.getItem('selectedProjectId') || '';
  });
  const [submittals, setSubmittals] = useState<API.Submittal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmittal, setSelectedSubmittal] = useState<API.Submittal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewSubmittalModalOpen, setIsNewSubmittalModalOpen] = useState(false);
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
      fetchSubmittals();
    }
  }, [selectedProjectId, statusFilter]);

  const fetchSubmittals = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      const result = await api.listSubmittals(selectedProjectId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        q: searchQuery || undefined,
      });
      setSubmittals(result.data);
    } catch (err: any) {
      console.error('Failed to fetch submittals:', err);
      addToast(err.message || 'Failed to load submittals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmittal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      specSection: formData.get('specSection') as string || undefined,
      reviewerId: formData.get('reviewerId') as string || undefined,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
    };

    setIsSubmitting(true);
    try {
      const newSubmittal = await api.createSubmittal(selectedProjectId, data);
      setSubmittals(prev => [newSubmittal, ...prev]);
      setIsNewSubmittalModalOpen(false);
      addToast('Submittal created successfully', 'success');
    } catch (err: any) {
      console.error('Failed to create submittal:', err);
      addToast(err.message || 'Failed to create submittal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (submittalId: string, status: API.SubmittalStatus) => {
    try {
      const updated = await api.updateSubmittal(submittalId, { status });
      setSubmittals(prev => prev.map(s => s.id === submittalId ? updated : s));
      if (selectedSubmittal?.id === submittalId) {
        setSelectedSubmittal(updated);
      }
      addToast('Status updated', 'success');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddAttachment = async (submittalId: string, file: File) => {
    try {
      const updated = await api.addSubmittalAttachment(submittalId, file);
      setSubmittals(prev => prev.map(s => s.id === submittalId ? updated : s));
      if (selectedSubmittal?.id === submittalId) {
        setSelectedSubmittal(updated);
      }
      addToast('Attachment added', 'success');
    } catch (err: any) {
      console.error('Failed to add attachment:', err);
      addToast(err.message || 'Failed to add attachment', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubmittal) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get('description') as string,
      qty: formData.get('qty') ? parseFloat(formData.get('qty') as string) : undefined,
      unit: formData.get('unit') as string || undefined,
      manufacturer: formData.get('manufacturer') as string || undefined,
      model: formData.get('model') as string || undefined,
    };

    try {
      const newItem = await api.addSubmittalItem(selectedSubmittal.id, data);
      const updatedSubmittal = {
        ...selectedSubmittal,
        items: [...(selectedSubmittal.items || []), newItem],
      };
      setSelectedSubmittal(updatedSubmittal);
      setSubmittals(prev => prev.map(s => s.id === selectedSubmittal.id ? updatedSubmittal : s));
      addToast('Item added', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to add item:', err);
      addToast(err.message || 'Failed to add item', 'error');
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: API.SubmittalItemStatus) => {
    if (!selectedSubmittal) return;

    try {
      await api.updateSubmittalItem(itemId, { status });
      const updatedItems = selectedSubmittal.items?.map(item =>
        item.id === itemId ? { ...item, status } : item
      );
      const updatedSubmittal = { ...selectedSubmittal, items: updatedItems };
      setSelectedSubmittal(updatedSubmittal);
      setSubmittals(prev => prev.map(s => s.id === selectedSubmittal.id ? updatedSubmittal : s));
      addToast('Item status updated', 'success');
    } catch (err: any) {
      console.error('Failed to update item status:', err);
      addToast(err.message || 'Failed to update item status', 'error');
    }
  };

  const openDetailModal = async (submittal: API.Submittal) => {
    try {
      const fullSubmittal = await api.getSubmittal(submittal.id);
      setSelectedSubmittal(fullSubmittal);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load submittal details:', err);
      addToast(err.message || 'Failed to load submittal details', 'error');
    }
  };

  const filteredSubmittals = submittals.filter((submittal) => {
    const matchesSearch =
      submittal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submittal.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submittal.specSection?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || submittal.status === statusFilter;
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
        title="Submittals"
        description="Product submittals and material approvals"
        actions={
          <Button variant="primary" onClick={() => setIsNewSubmittalModalOpen(true)}>
            <FileCheck size={20} />
            New Submittal
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search submittals..."
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
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resubmit">Resubmit</option>
          </Select>
        </div>

        {filteredSubmittals.length > 0 ? (
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
                    Spec Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredSubmittals.map((submittal) => (
                  <tr
                    key={submittal.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => openDetailModal(submittal)}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-neutral-900">{submittal.number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{submittal.title}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{submittal.specSection || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[submittal.status]}>
                        {submittal.status.charAt(0).toUpperCase() + submittal.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{submittal.reviewerId || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {submittal.dueDate ? new Date(submittal.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileCheck}
            title="No submittals found"
            description="Create submittals to track product approvals and material specifications."
            actionLabel="New Submittal"
            onAction={() => setIsNewSubmittalModalOpen(true)}
          />
        )}
      </div>

      <Modal
        isOpen={isNewSubmittalModalOpen}
        onClose={() => setIsNewSubmittalModalOpen(false)}
        title="New Submittal"
      >
        <form onSubmit={handleCreateSubmittal} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Brief description of the submittal"
            />
          </div>

          <div>
            <label htmlFor="specSection" className="block text-sm font-medium text-neutral-700 mb-1">
              Spec Section
            </label>
            <Input
              id="specSection"
              name="specSection"
              type="text"
              placeholder="e.g., 09 91 00"
            />
          </div>

          <div>
            <label htmlFor="reviewerId" className="block text-sm font-medium text-neutral-700 mb-1">
              Reviewer
            </label>
            <Input
              id="reviewerId"
              name="reviewerId"
              type="text"
              placeholder="Person responsible for review"
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
              onClick={() => setIsNewSubmittalModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Submittal'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Submittal ${selectedSubmittal?.number}`}
        size="xl"
      >
        {selectedSubmittal && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{selectedSubmittal.title}</h3>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Badge className={statusColors[selectedSubmittal.status]}>
                  {selectedSubmittal.status.charAt(0).toUpperCase() + selectedSubmittal.status.slice(1)}
                </Badge>
                {selectedSubmittal.specSection && <span>Spec: {selectedSubmittal.specSection}</span>}
                <span>Reviewer: {selectedSubmittal.reviewerId || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-700">Items</h4>
              </div>
              
              {selectedSubmittal.items && selectedSubmittal.items.length > 0 ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden mb-4">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Manufacturer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Model</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {selectedSubmittal.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-neutral-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-neutral-600">
                            {item.qty ? `${item.qty} ${item.unit || ''}` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-neutral-600">{item.manufacturer || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-neutral-600">{item.model || 'N/A'}</td>
                          <td className="px-4 py-2">
                            <Select
                              value={item.status}
                              onChange={(e) => handleUpdateItemStatus(item.id, e.target.value as API.SubmittalItemStatus)}
                              className="text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="n/a">N/A</option>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-neutral-500 mb-4">No items added yet</p>
              )}

              <form onSubmit={handleAddItem} className="bg-neutral-50 p-4 rounded-lg space-y-3">
                <h5 className="text-sm font-medium text-neutral-700">Add Item</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input
                      name="description"
                      type="text"
                      placeholder="Description *"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="qty"
                      type="number"
                      step="0.001"
                      placeholder="Quantity"
                    />
                  </div>
                  <div>
                    <Input
                      name="unit"
                      type="text"
                      placeholder="Unit (EA, SF, etc.)"
                    />
                  </div>
                  <div>
                    <Input
                      name="manufacturer"
                      type="text"
                      placeholder="Manufacturer"
                    />
                  </div>
                  <div>
                    <Input
                      name="model"
                      type="text"
                      placeholder="Model"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="sm">
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Attachments</h4>
              {selectedSubmittal.attachments && selectedSubmittal.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {selectedSubmittal.attachments.map((att) => (
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
                  id="submittal-attachment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddAttachment(selectedSubmittal.id, file);
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('submittal-attachment')?.click()}
                >
                  <Upload size={16} />
                  Add Attachment
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Update Status</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedSubmittal.status === 'draft' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmittal.id, 'draft')}
                >
                  Draft
                </Button>
                <Button
                  variant={selectedSubmittal.status === 'submitted' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmittal.id, 'submitted')}
                >
                  Submitted
                </Button>
                <Button
                  variant={selectedSubmittal.status === 'approved' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmittal.id, 'approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={selectedSubmittal.status === 'rejected' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmittal.id, 'rejected')}
                >
                  Rejected
                </Button>
                <Button
                  variant={selectedSubmittal.status === 'resubmit' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmittal.id, 'resubmit')}
                >
                  Resubmit
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
