import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormRow } from "@/components/ui/FormRow";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  location?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit, isLoading }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    status: 'planning',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    await onSubmit(formData);
    setFormData({ name: '', status: 'planning' });
  };

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormRow label="Project Name" required>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              required
              autoFocus
            />
          </FormRow>

          <FormRow label="Description">
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the project"
              rows={3}
            />
          </FormRow>

          <FormRow label="Location">
            <Input
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Project location"
            />
          </FormRow>

          <FormRow label="Status">
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </Select>
          </FormRow>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Start Date">
              <DatePicker
                value={formData.startDate}
                onChange={(date) => handleChange('startDate', date)}
              />
            </FormRow>

            <FormRow label="End Date">
              <DatePicker
                value={formData.endDate}
                onChange={(date) => handleChange('endDate', date)}
              />
            </FormRow>
          </div>

          <FormRow label="Budget">
            <Input
              type="number"
              value={formData.budget || ''}
              onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormRow>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!formData.name.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
