import { useState } from "react";
import { Plus, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useInspections } from "@/lib/mocks/workflow";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const typeColors = {
  safety: "bg-red-100 text-red-800",
  quality: "bg-blue-100 text-blue-800",
  progress: "bg-yellow-100 text-yellow-800",
  final: "bg-green-100 text-green-800",
};

export default function Inspections() {
  const { data: inspections, isLoading } = useInspections();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInspections = inspections?.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Inspections"
        description="Schedule and track project inspections"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Plus size={20} className="mr-2" />
            Schedule Inspection
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredInspections && filteredInspections.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Inspection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{inspection.title}</div>
                      {inspection.notes && (
                        <div className="text-sm text-neutral-500 mt-1 line-clamp-1">
                          {inspection.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={typeColors[inspection.type]}>{inspection.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[inspection.status]}>
                        {inspection.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{inspection.inspector}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(inspection.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {inspection.passed !== undefined && (
                        <div className="flex items-center gap-2">
                          {inspection.passed ? (
                            <>
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Passed</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="text-red-600" />
                              <span className="text-sm text-red-600 font-medium">Failed</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No inspections found"
            description="Schedule inspections to ensure quality and compliance throughout your project."
            actionLabel="Schedule Inspection"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
