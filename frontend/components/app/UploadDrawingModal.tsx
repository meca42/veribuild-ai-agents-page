import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormRow } from "@/components/ui/FormRow";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

interface UploadDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DrawingFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface DrawingFormData {
  projectId: string;
  number: string;
  title?: string;
  discipline?: string;
  file: File | null;
  description?: string;
}

export default function UploadDrawingModal({ isOpen, onClose, onSubmit, isLoading }: UploadDrawingModalProps) {
  const { currentOrgId } = useAuth();
  const [projects, setProjects] = useState<API.Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [formData, setFormData] = useState<DrawingFormData>({
    projectId: '',
    number: '',
    file: null,
  });

  useEffect(() => {
    const loadProjects = async () => {
      if (!currentOrgId || !isOpen) return;
      
      setLoadingProjects(true);
      try {
        const response = await api.listProjects(currentOrgId, { pageSize: 100 });
        setProjects(response.data);
        if (response.data.length > 0 && !formData.projectId) {
          setFormData(prev => ({ ...prev, projectId: response.data[0].id }));
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [currentOrgId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.number.trim() || !formData.file) return;
    
    await onSubmit(formData);
    setFormData({ projectId: '', number: '', file: null });
  };

  const handleChange = (field: keyof DrawingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Drawing"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormRow label="Project" required>
            <Select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              required
              disabled={loadingProjects}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow label="Drawing File" required>
            <div className="space-y-2">
              <Input
                type="file"
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                onChange={(e) => handleChange('file', e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-neutral-500">
                Supported formats: PDF, DWG, DXF, PNG, JPG
              </p>
              {formData.file && (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </FormRow>

          <FormRow label="Drawing Number" required>
            <Input
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="e.g., A-101"
              required
            />
          </FormRow>

          <FormRow label="Title">
            <Input
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Ground Floor Plan"
            />
          </FormRow>

          <FormRow label="Discipline">
            <Select
              value={formData.discipline || ''}
              onChange={(e) => handleChange('discipline', e.target.value)}
            >
              <option value="">Select discipline</option>
              <option value="architectural">Architectural</option>
              <option value="structural">Structural</option>
              <option value="mechanical">Mechanical</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </Select>
          </FormRow>

          <FormRow label="Description">
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional notes about this drawing"
              rows={3}
            />
          </FormRow>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!formData.projectId || !formData.number.trim() || !formData.file || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Drawing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
