import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useRFIs } from "@/lib/mocks/workflow";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function RFI() {
  const { data: rfis, isLoading } = useRFIs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRFIs = rfis?.filter(
    (r) =>
      r.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-[var(--vb-neutral-600)]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="RFIs"
        description="Requests for information and clarifications"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            New RFI
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search RFIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRFIs && filteredRFIs.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredRFIs.map((rfi) => (
                  <tr key={rfi.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium text-[var(--vb-primary)]">
                      {rfi.number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{rfi.subject}</div>
                      <div className="text-sm text-neutral-500 mt-1 line-clamp-1">{rfi.question}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[rfi.status]}>{rfi.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={priorityColors[rfi.priority]}>{rfi.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(rfi.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No RFIs found"
            description="Create RFIs to request clarifications on project drawings and specifications."
            actionLabel="New RFI"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
