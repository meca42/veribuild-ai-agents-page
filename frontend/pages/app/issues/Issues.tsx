import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Search, Upload, Plus, Image } from "lucide-react";
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

const typeColors = {
  defect: "bg-red-100 text-red-800",
  safety: "bg-orange-100 text-orange-800",
  coordination: "bg-blue-100 text-blue-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  verified: "bg-purple-100 text-purple-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityLabels = {
  1: { label: "Low", color: "bg-green-100 text-green-800" },
  2: { label: "Medium-Low", color: "bg-blue-100 text-blue-800" },
  3: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  4: { label: "High", color: "bg-orange-100 text-orange-800" },
  5: { label: "Critical", color: "bg-red-100 text-red-800" },
};

export default function Issues() {
  const { id: projectId } = useParams<{ id: string }>();
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projectId || localStorage.getItem('selectedProjectId') || '';
  });

  const [issues, setIssues] = useState<API.Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [selectedIssue, setSelectedIssue] = useState<API.Issue | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
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
      fetchIssues();
    }
  }, [selectedProjectId, statusFilter, typeFilter, priorityFilter]);

  const fetchIssues = async () => {
    if (!selectedProjectId) return;
    
    setIsLoading(true);
    try {
      const result = await api.listIssues(selectedProjectId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        priority: priorityFilter === "all" ? undefined : parseInt(priorityFilter),
        q: searchQuery || undefined,
      });
      setIssues(result.data);
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      addToast(err.message || 'Failed to load issues', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type: formData.get('type') as API.IssueType || 'other',
      priority: parseInt(formData.get('priority') as string) || 3,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
      assigneeId: formData.get('assigneeId') as string || undefined,
    };

    setIsSubmitting(true);
    try {
      const newIssue = await api.createIssue(selectedProjectId, data);
      setIssues(prev => [newIssue, ...prev]);
      setIsNewIssueModalOpen(false);
      addToast('Issue created successfully', 'success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Failed to create issue:', err);
      addToast(err.message || 'Failed to create issue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (issueId: string, status: API.IssueStatus) => {
    try {
      const updated = await api.updateIssue(issueId, { status });
      setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(updated);
      }
      addToast('Status updated', 'success');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddAttachment = async (issueId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be less than 10MB', 'error');
      return;
    }

    try {
      const updated = await api.addIssueAttachment(issueId, file);
      setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(updated);
      }
      addToast('Attachment added', 'success');
    } catch (err: any) {
      console.error('Failed to add attachment:', err);
      addToast(err.message || 'Failed to add attachment', 'error');
    }
  };

  const openDetailModal = async (issue: API.Issue) => {
    try {
      const fullIssue = await api.getIssue(issue.id);
      setSelectedIssue(fullIssue);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load issue details:', err);
      addToast(err.message || 'Failed to load issue details', 'error');
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
        title="Issues"
        description="Track defects, safety concerns, and coordination items"
        actions={
          <Button variant="primary" onClick={() => setIsNewIssueModalOpen(true)}>
            <AlertCircle size={20} />
            New Issue
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Types</option>
            <option value="defect">Defect</option>
            <option value="safety">Safety</option>
            <option value="coordination">Coordination</option>
            <option value="other">Other</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Priorities</option>
            <option value="1">Low</option>
            <option value="2">Medium-Low</option>
            <option value="3">Medium</option>
            <option value="4">High</option>
            <option value="5">Critical</option>
          </Select>
        </div>

        {filteredIssues.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
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
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredIssues.map((issue) => {
                  const priority = priorityLabels[issue.priority as keyof typeof priorityLabels] || priorityLabels[3];
                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(issue)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{issue.title}</td>
                      <td className="px-6 py-4">
                        <Badge className={typeColors[issue.type]}>
                          {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusColors[issue.status]}>
                          {issue.status.replace('_', ' ').charAt(0).toUpperCase() + issue.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{issue.assigneeId || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No issues found"
            description="Create issues to track defects, safety concerns, and coordination items."
            actionLabel="New Issue"
            onAction={() => setIsNewIssueModalOpen(true)}
          />
        )}
      </div>

      <Modal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        title="New Issue"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                Type *
              </label>
              <Select id="type" name="type" required>
                <option value="defect">Defect</option>
                <option value="safety">Safety</option>
                <option value="coordination">Coordination</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-1">
                Priority *
              </label>
              <Select id="priority" name="priority" required defaultValue="3">
                <option value="1">1 - Low</option>
                <option value="2">2 - Medium-Low</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Critical</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-neutral-700 mb-1">
                Assignee
              </label>
              <Input
                id="assigneeId"
                name="assigneeId"
                type="text"
                placeholder="Person responsible"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewIssueModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Issue Details"
        size="xl"
      >
        {selectedIssue && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{selectedIssue.title}</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={typeColors[selectedIssue.type]}>
                  {selectedIssue.type.charAt(0).toUpperCase() + selectedIssue.type.slice(1)}
                </Badge>
                <Badge className={statusColors[selectedIssue.status]}>
                  {selectedIssue.status.replace('_', ' ').charAt(0).toUpperCase() + selectedIssue.status.slice(1)}
                </Badge>
                <Badge className={priorityLabels[selectedIssue.priority as keyof typeof priorityLabels]?.color || priorityLabels[3].color}>
                  Priority: {priorityLabels[selectedIssue.priority as keyof typeof priorityLabels]?.label || 'Medium'}
                </Badge>
              </div>
            </div>

            {selectedIssue.description && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Description</h4>
                <p className="text-sm text-neutral-900 whitespace-pre-wrap">{selectedIssue.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Due Date:</span>{' '}
                <span className="text-neutral-900">
                  {selectedIssue.dueDate ? new Date(selectedIssue.dueDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-neutral-600">Assignee:</span>{' '}
                <span className="text-neutral-900">{selectedIssue.assigneeId || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-neutral-600">Created By:</span>{' '}
                <span className="text-neutral-900">{selectedIssue.createdBy || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-neutral-600">Created:</span>{' '}
                <span className="text-neutral-900">{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Attachments</h4>
              {selectedIssue.attachments && selectedIssue.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedIssue.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 p-3 bg-neutral-50 rounded border border-neutral-200">
                      <Image size={20} className="text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 truncate">{att.fileName}</p>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No attachments</p>
              )}
              <div className="mt-3">
                <input
                  type="file"
                  id="issue-attachment"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddAttachment(selectedIssue.id, file);
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('issue-attachment')?.click()}
                >
                  <Upload size={16} />
                  Add Attachment
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Update Status</h4>
              <div className="flex gap-2 flex-wrap">
                {(['open', 'in_progress', 'resolved', 'verified', 'closed'] as API.IssueStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedIssue.status === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedIssue.id, status)}
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
