import { useState } from 'react';
import { Table, type TableColumn } from '@/components/ui/Table';
import { StatusPill } from '@/components/ui/StatusPill';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DemoRow {
  id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  progress: number;
}

const generateMockData = (count: number): DemoRow[] => {
  const statuses: DemoRow['status'][] = ['todo', 'in_progress', 'review', 'done', 'blocked'];
  const priorities: DemoRow['priority'][] = ['low', 'medium', 'high'];
  const assignees = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Eve Davis'];
  const tasks = ['Foundation Review', 'Electrical Inspection', 'Plumbing Check', 'HVAC Installation', 'Final Walkthrough'];

  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    name: `${tasks[i % tasks.length]} ${Math.floor(i / tasks.length) + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    progress: Math.floor(Math.random() * 101),
  }));
};

export const TableDemo = () => {
  const [data] = useState<DemoRow[]>(generateMockData(100));
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const columns: TableColumn<DemoRow>[] = [
    {
      key: 'name',
      header: 'Task Name',
      accessor: (row) => row.name,
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusPill status={row.status} type="step" />,
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (row) => (
        <Badge variant={row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'neutral'}>
          {row.priority}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'assignee',
      header: 'Assignee',
      accessor: (row) => row.assignee,
      sortable: true,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: (row) => row.dueDate,
      sortable: true,
    },
    {
      key: 'progress',
      header: 'Progress',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400 w-10 text-right">{row.progress}%</span>
        </div>
      ),
      sortable: true,
      width: 'min-w-[150px]',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Interactive Table</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Features: sorting, pagination, column visibility, row selection, keyboard navigation (arrow keys, space to select)
        </p>
        
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Selected: {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''}
          </span>
          {selectedRows.size > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
              Clear Selection
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          pagination
          pageSize={10}
          stickyHeader
          emptyMessage="No tasks found"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Simple Table (No Pagination)</h3>
        <Table
          columns={columns.slice(0, 4)}
          data={data.slice(0, 5)}
          getRowId={(row) => row.id}
          emptyMessage="No data available"
        />
      </div>
    </div>
  );
};
