import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useSubmittals } from "@/lib/mocks/workflow";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  "under-review": "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const typeColors = {
  "product-data": "bg-blue-100 text-blue-800",
  "shop-drawing": "bg-purple-100 text-purple-800",
  sample: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export default function Submittals() {
  const { data: submittals, isLoading } = useSubmittals();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubmittals = submittals?.filter(
    (s) =>
      s.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Submittals"
        description="Product data, shop drawings, and samples"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            New Submittal
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search submittals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredSubmittals && filteredSubmittals.length > 0 ? (
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
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
                {filteredSubmittals.map((submittal) => (
                  <tr key={submittal.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium text-[var(--vb-primary)]">
                      {submittal.number}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {submittal.title}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={typeColors[submittal.type]}>
                        {submittal.type.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[submittal.status]}>
                        {submittal.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(submittal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {submittal.dueDate ? new Date(submittal.dueDate).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No submittals found"
            description="Submit product data, shop drawings, and samples for review and approval."
            actionLabel="New Submittal"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
