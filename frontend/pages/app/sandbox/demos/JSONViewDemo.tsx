import { JSONView } from '@/components/ui/JSONView';

export const JSONViewDemo = () => {
  const simpleObject = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    active: true,
  };

  const complexObject = {
    project: {
      id: 'proj-123',
      name: 'Commercial Building Alpha',
      status: 'in_progress',
      metadata: {
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-10-05T14:22:00Z',
        tags: ['construction', 'commercial', 'priority-high'],
      },
      team: [
        { id: 'user-1', name: 'Sarah Johnson', role: 'Project Manager' },
        { id: 'user-2', name: 'Mike Chen', role: 'Lead Engineer' },
        { id: 'user-3', name: 'Emily Davis', role: 'Architect' },
      ],
      phases: [
        {
          id: 'phase-1',
          name: 'Foundation',
          status: 'done',
          progress: 100,
          tasks: 15,
        },
        {
          id: 'phase-2',
          name: 'Framing',
          status: 'in_progress',
          progress: 65,
          tasks: 22,
        },
        {
          id: 'phase-3',
          name: 'Electrical',
          status: 'not_started',
          progress: 0,
          tasks: 18,
        },
      ],
      budget: {
        allocated: 5000000,
        spent: 3250000,
        currency: 'USD',
      },
    },
  };

  const arrayData = [
    { id: 1, task: 'Foundation inspection', completed: true },
    { id: 2, task: 'Electrical review', completed: false },
    { id: 3, task: 'Plumbing check', completed: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Simple Object</h3>
        <JSONView data={simpleObject} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Complex Nested Object</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Click the copy button to copy the JSON to clipboard
        </p>
        <JSONView data={complexObject} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Array Data</h3>
        <JSONView data={arrayData} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">API Response Example</h3>
        <JSONView
          data={{
            success: true,
            data: {
              id: 'api-response-123',
              timestamp: new Date().toISOString(),
              results: [
                { type: 'success', message: 'Operation completed' },
                { type: 'warning', message: 'Minor issue detected' },
              ],
            },
            meta: {
              version: '1.0.0',
              requestId: 'req-xyz-789',
            },
          }}
        />
      </div>
    </div>
  );
};
