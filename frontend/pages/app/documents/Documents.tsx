import { useState } from "react";
import { Upload, Search, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useDocuments } from "@/lib/mocks/files";

const typeColors = {
  spec: "bg-blue-100 text-blue-800",
  submittal: "bg-purple-100 text-purple-800",
  rfi: "bg-yellow-100 text-yellow-800",
  contract: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
};

export default function Documents() {
  const { data: documents, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents?.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Documents"
        description="Specifications, contracts, and project documentation"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Upload size={20} className="mr-2" />
            Upload Document
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileStack size={20} className="text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={typeColors[doc.type]}>{doc.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{doc.uploadedBy}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileStack}
            title="No documents found"
            description="Upload specifications, contracts, and other project documentation."
            actionLabel="Upload Document"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
