import { useState } from "react";
import { Upload, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import { useDrawings } from "@/lib/mocks/files";

const statusColors = {
  current: "bg-green-100 text-green-800",
  superseded: "bg-gray-100 text-gray-800",
  "for-review": "bg-yellow-100 text-yellow-800",
};

const disciplineColors = {
  architectural: "bg-blue-100 text-blue-800",
  structural: "bg-purple-100 text-purple-800",
  mechanical: "bg-orange-100 text-orange-800",
  electrical: "bg-yellow-100 text-yellow-800",
  plumbing: "bg-cyan-100 text-cyan-800",
};

export default function Drawings() {
  const { data: drawings, isLoading } = useDrawings();
  const [searchQuery, setSearchQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");

  const filteredDrawings = drawings?.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline = disciplineFilter === "all" || d.discipline === disciplineFilter;
    return matchesSearch && matchesDiscipline;
  });

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
        title="Drawings"
        description="Project drawings and technical documentation"
        actions={
          <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
            <Upload size={20} className="mr-2" />
            Upload Drawing
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search drawings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              <SelectItem value="architectural">Architectural</SelectItem>
              <SelectItem value="structural">Structural</SelectItem>
              <SelectItem value="mechanical">Mechanical</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDrawings && filteredDrawings.length > 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Drawing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Discipline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredDrawings.map((drawing) => (
                  <tr key={drawing.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ImageIcon size={20} className="text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900">{drawing.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-900">{drawing.number}</td>
                    <td className="px-6 py-4">
                      <Badge className={disciplineColors[drawing.discipline]}>
                        {drawing.discipline}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[drawing.status]}>
                        {drawing.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{drawing.version}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(drawing.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="No drawings found"
            description="Upload project drawings to access them across your team."
            actionLabel="Upload Drawing"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
}
