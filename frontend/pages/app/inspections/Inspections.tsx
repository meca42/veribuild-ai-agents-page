import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ClipboardCheck, Search, Plus } from "lucide-react";
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
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800",
};

const resultColors = {
  pass: "bg-green-100 text-green-800",
  fail: "bg-red-100 text-red-800",
  "n/a": "bg-gray-100 text-gray-800",
};

export default function Inspections() {
  const { id: projectId } = useParams<{ id: string }>();
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projectId || localStorage.getItem('selectedProjectId') || '';
  });

  const [inspections, setInspections] = useState<API.Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedInspection, setSelectedInspection] = useState<API.Inspection | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
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
      fetchInspections();
    }
  }, [selectedProjectId, statusFilter]);

  const fetchInspections = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      const result = await api.listInspections(selectedProjectId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        q: searchQuery || undefined,
      });
      setInspections(result.data);
    } catch (err: any) {
      console.error('Failed to fetch inspections:', err);
      addToast(err.message || 'Failed to load inspections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      scheduledAt: formData.get('scheduledAt') ? new Date(formData.get('scheduledAt') as string) : undefined,
      meta: {
        location: formData.get('location') as string || undefined,
      },
    };

    setIsSubmitting(true);
    try {
      const newInspection = await api.createInspection(selectedProjectId, data);
      setInspections(prev => [newInspection, ...prev]);
      setIsNewInspectionModalOpen(false);
      addToast('Inspection created successfully', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to create inspection:', err);
      addToast(err.message || 'Failed to create inspection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (inspectionId: string, status: API.InspectionStatus) => {
    try {
      const updateData: Partial<API.Inspection> = { status };
      if (status === 'in_progress' || status === 'passed' || status === 'failed') {
        updateData.performedAt = new Date();
      }
      
      const updated = await api.updateInspection(inspectionId, updateData);
      setInspections(prev => prev.map(i => i.id === inspectionId ? updated : i));
      if (selectedInspection?.id === inspectionId) {
        setSelectedInspection(updated);
      }
      addToast('Status updated', 'success');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInspection) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get('label') as string,
      orderIndex: selectedInspection.items?.length || 0,
    };

    try {
      const newItem = await api.addInspectionItem(selectedInspection.id, data);
      const updatedInspection = {
        ...selectedInspection,
        items: [...(selectedInspection.items || []), newItem],
      };
      setSelectedInspection(updatedInspection);
      setInspections(prev => prev.map(i => i.id === selectedInspection.id ? updatedInspection : i));
      addToast('Item added', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to add item:', err);
      addToast(err.message || 'Failed to add item', 'error');
    }
  };

  const handleUpdateItemResult = async (itemId: string, result: API.InspectionItemResult) => {
    if (!selectedInspection) return;

    try {
      await api.updateInspectionItem(itemId, { result });
      const updatedItems = selectedInspection.items?.map(item =>
        item.id === itemId ? { ...item, result } : item
      );
      const updatedInspection = { ...selectedInspection, items: updatedItems };
      setSelectedInspection(updatedInspection);
      setInspections(prev => prev.map(i => i.id === selectedInspection.id ? updatedInspection : i));
      addToast('Item result updated', 'success');
    } catch (err: any) {
      console.error('Failed to update item result:', err);
      addToast(err.message || 'Failed to update item result', 'error');
    }
  };

  const handleUpdateItemNotes = async (itemId: string, notes: string) => {
    if (!selectedInspection) return;

    try {
      await api.updateInspectionItem(itemId, { notes });
      const updatedItems = selectedInspection.items?.map(item =>
        item.id === itemId ? { ...item, notes } : item
      );
      const updatedInspection = { ...selectedInspection, items: updatedItems };
      setSelectedInspection(updatedInspection);
      setInspections(prev => prev.map(i => i.id === selectedInspection.id ? updatedInspection : i));
      addToast('Notes updated', 'success');
    } catch (err: any) {
      console.error('Failed to update notes:', err);
      addToast(err.message || 'Failed to update notes', 'error');
    }
  };

  const openDetailModal = async (inspection: API.Inspection) => {
    try {
      const fullInspection = await api.getInspection(inspection.id);
      setSelectedInspection(fullInspection);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load inspection details:', err);
      addToast(err.message || 'Failed to load inspection details', 'error');
    }
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
        title="Inspections"
        description="Quality control and compliance inspections"
        actions={
          <Button variant="primary" onClick={() => setIsNewInspectionModalOpen(true)}>
            <ClipboardCheck size={20} />
            New Inspection
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search inspections..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        {filteredInspections.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Performed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{inspection.name}</td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[inspection.status]}>
                        {inspection.status.replace('_', ' ').charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleDateString() : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {inspection.performedAt ? new Date(inspection.performedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{inspection.performedBy || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{inspection.items?.length || 0}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDetailModal(inspection)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardCheck}
            title="No inspections found"
            description="Create inspections to track quality control and compliance checks."
            actionLabel="New Inspection"
            onAction={() => setIsNewInspectionModalOpen(true)}
          />
        )}
      </div>

      <Modal
        isOpen={isNewInspectionModalOpen}
        onClose={() => setIsNewInspectionModalOpen(false)}
        title="New Inspection"
      >
        <form onSubmit={handleCreateInspection} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Inspection Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Foundation Inspection"
            />
          </div>

          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-neutral-700 mb-1">
              Scheduled Date
            </label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="date"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Inspection location"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewInspectionModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Inspection'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Inspection Details"
        size="xl"
      >
        {selectedInspection && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{selectedInspection.name}</h3>
              <div className="flex items-center gap-3">
                <Badge className={statusColors[selectedInspection.status]}>
                  {selectedInspection.status.replace('_', ' ').charAt(0).toUpperCase() + selectedInspection.status.slice(1)}
                </Badge>
                <span className="text-sm text-neutral-600">
                  Scheduled: {selectedInspection.scheduledAt ? new Date(selectedInspection.scheduledAt).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Performed:</span>{' '}
                <span className="text-neutral-900">
                  {selectedInspection.performedAt ? new Date(selectedInspection.performedAt).toLocaleDateString() : 'Not yet'}
                </span>
              </div>
              <div>
                <span className="text-neutral-600">Performed By:</span>{' '}
                <span className="text-neutral-900">{selectedInspection.performedBy || 'Not assigned'}</span>
              </div>
              {selectedInspection.meta?.location && (
                <div className="col-span-2">
                  <span className="text-neutral-600">Location:</span>{' '}
                  <span className="text-neutral-900">{selectedInspection.meta.location}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-700">Inspection Items</h4>
              </div>
              
              {selectedInspection.items && selectedInspection.items.length > 0 ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden mb-4">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Result</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {selectedInspection.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-neutral-900">{item.label}</td>
                          <td className="px-4 py-2">
                            <Select
                              value={item.result}
                              onChange={(e) => handleUpdateItemResult(item.id, e.target.value as API.InspectionItemResult)}
                              className="text-sm"
                            >
                              <option value="n/a">N/A</option>
                              <option value="pass">Pass</option>
                              <option value="fail">Fail</option>
                            </Select>
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => handleUpdateItemNotes(item.id, e.target.value)}
                              placeholder="Notes..."
                              className="text-sm"
                            />
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
                <h5 className="text-sm font-medium text-neutral-700">Add Inspection Item</h5>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      name="label"
                      type="text"
                      placeholder="Item to inspect *"
                      required
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Update Status</h4>
              <div className="flex gap-2 flex-wrap">
                {(['scheduled', 'in_progress', 'passed', 'failed', 'closed'] as API.InspectionStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedInspection.status === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedInspection.id, status)}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
