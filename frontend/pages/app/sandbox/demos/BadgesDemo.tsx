import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { StatusPill } from '@/components/ui/StatusPill';

export const BadgesDemo = () => {
  const [tags, setTags] = useState(['Design', 'Frontend', 'React', 'TypeScript']);

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Badge Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Tags (Removable)</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Tag key={index} onRemove={() => removeTag(index)}>
              {tag}
            </Tag>
          ))}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Click the × icon to remove tags
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Status Pills - Step Status</h3>
        <div className="flex flex-wrap gap-3">
          <StatusPill status="todo" type="step" />
          <StatusPill status="in_progress" type="step" />
          <StatusPill status="review" type="step" />
          <StatusPill status="done" type="step" />
          <StatusPill status="blocked" type="step" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Status Pills - Phase Status</h3>
        <div className="flex flex-wrap gap-3">
          <StatusPill status="not_started" type="phase" />
          <StatusPill status="in_progress" type="phase" />
          <StatusPill status="blocked" type="phase" />
          <StatusPill status="done" type="phase" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Project Status:</span>
            <StatusPill status="in_progress" type="phase" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Task Status:</span>
            <StatusPill status="review" type="step" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Priority:</span>
            <Badge variant="danger">High</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Category:</span>
            <Badge variant="info">Construction</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
