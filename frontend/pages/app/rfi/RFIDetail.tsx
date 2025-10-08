import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { FormRow } from "@/components/ui/FormRow";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
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

export default function RFIDetailPage() {
  const { id: projectId, rfiId } = useParams<{ id: string; rfiId: string }>();
  const { addToast } = useToast();
  const [rfi, setRFI] = useState<API.RFI | null>(null);
  const [attachments, setAttachments] = useState<API.RFIAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchRFI = async () => {
    if (!projectId || !rfiId) return;
    try {
      setIsLoading(true);
      const rfiData = await api.getRFI(projectId, rfiId);
      setRFI(rfiData);
      setAnswer(rfiData.answer || "");

      const attachmentsData = await api.listRFIAttachments(projectId, rfiId);
      setAttachments(attachmentsData);
    } catch (error: any) {
      addToast(error.message || "Failed to load RFI", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRFI();
  }, [projectId, rfiId]);

  const handleAnswerSubmit = async () => {
    if (!projectId || !rfiId || !answer.trim()) return;
    try {
      setIsSubmitting(true);
      await api.answerRFI(projectId, rfiId, answer);
      addToast("Answer submitted successfully", "success");
      fetchRFI();
    } catch (error: any) {
      addToast(error.message || "Failed to submit answer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!projectId || !rfiId) return;
    try {
      await api.closeRFI(projectId, rfiId);
      addToast("RFI closed", "success");
      fetchRFI();
    } catch (error: any) {
      addToast(error.message || "Failed to close RFI", "error");
    }
  };

  const handleReopen = async () => {
    if (!projectId || !rfiId) return;
    try {
      await api.reopenRFI(projectId, rfiId);
      addToast("RFI reopened", "success");
      fetchRFI();
    } catch (error: any) {
      addToast(error.message || "Failed to reopen RFI", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId || !rfiId) return;

    try {
      setUploadingFile(true);
      await api.uploadRFIAttachment(projectId, rfiId, file);
      addToast("File uploaded successfully", "success");
      fetchRFI();
    } catch (error: any) {
      addToast(error.message || "Failed to upload file", "error");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!projectId || !rfiId || !confirm("Delete this attachment?")) return;
    try {
      await api.deleteRFIAttachment(projectId, rfiId, attachmentId);
      addToast("Attachment deleted", "success");
      fetchRFI();
    } catch (error: any) {
      addToast(error.message || "Failed to delete attachment", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!rfi) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">RFI not found</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={rfi.subject}
        description="Request for Information"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${projectId}` },
          { label: "RFIs", href: `/projects/${projectId}/rfis` },
          { label: rfi.subject },
        ]}
        actions={
          <div className="flex gap-2">
            {rfi.status === "open" || rfi.status === "reopened" ? (
              <Button onClick={handleClose}>Close RFI</Button>
            ) : (
              <Button onClick={handleReopen}>Reopen RFI</Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge className={statusColors[rfi.status]}>{rfi.status}</Badge>
                <Badge className={priorityColors[rfi.priority]}>{rfi.priority}</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Question</h3>
                  <p className="text-sm text-neutral-900 whitespace-pre-wrap">{rfi.question}</p>
                </div>

                {rfi.answer && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Answer</h3>
                    <p className="text-sm text-neutral-900 whitespace-pre-wrap">{rfi.answer}</p>
                    {rfi.answeredBy && (
                      <p className="text-xs text-neutral-500 mt-2">Answered by: {rfi.answeredBy}</p>
                    )}
                  </div>
                )}

                {(rfi.status === "open" || rfi.status === "reopened") && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Provide Answer</h3>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={4}
                      placeholder="Enter your answer..."
                    />
                    <div className="mt-3">
                      <Button onClick={handleAnswerSubmit} disabled={isSubmitting || !answer.trim()}>
                        {isSubmitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-4">Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-neutral-500">Due Date</dt>
                  <dd className="text-sm text-neutral-900">
                    {rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500">Created</dt>
                  <dd className="text-sm text-neutral-900">
                    {new Date(rfi.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500">Updated</dt>
                  <dd className="text-sm text-neutral-900">
                    {new Date(rfi.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Attachments</h3>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <Button size="sm" disabled={uploadingFile}>
                    <Upload size={16} className="mr-2" />
                    {uploadingFile ? "Uploading..." : "Upload"}
                  </Button>
                </label>
              </div>
              <div className="space-y-2">
                {attachments.length > 0 ? (
                  attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 border border-neutral-200 rounded"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-900 truncate">{att.filename}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No attachments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
