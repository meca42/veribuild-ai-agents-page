import { useState, useEffect } from "react";
import { Upload, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import UploadDrawingModal, { type DrawingFormData } from "@/components/app/UploadDrawingModal";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

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
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  const [drawings, setDrawings] = useState<API.Drawing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  useEffect(() => {
    const fetchDrawings = async () => {
      if (!currentOrgId) return;
      
      setIsLoading(true);
      try {
        const supabase = (await import('@/lib/supabase/client')).createBrowserClient();
        if (!supabase) throw new Error('Supabase not configured');

        const { data: projectsData } = await supabase
          .from('projects')
          .select('id')
          .eq('org_id', currentOrgId);

        if (!projectsData || projectsData.length === 0) {
          setDrawings([]);
          return;
        }

        const projectIds = projectsData.map(p => p.id);
        
        const { data, error } = await supabase
          .from('drawings')
          .select('*')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setDrawings((data || []).map(d => ({
          id: d.id,
          projectId: d.project_id,
          discipline: d.discipline || '',
          number: d.number,
          title: d.title || '',
          status: 'approved' as const,
          currentVersion: d.current_version || 1,
          currentRevision: '1',
          versions: [],
          createdAt: new Date(d.created_at),
          updatedAt: new Date(d.updated_at || d.created_at),
        })));
      } catch (error) {
        console.error('Error fetching drawings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrawings();
  }, [currentOrgId, selectedProject]);

  const handleUploadDrawing = async (formData: DrawingFormData) => {
    if (!currentOrgId || !formData.file || !formData.projectId) {
      addToast('Missing required data', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createBrowserClient();
      if (!supabase) throw new Error('Supabase not configured');

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${formData.projectId}/${Date.now()}-${formData.number.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const storagePath = `${currentOrgId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('drawings')
        .upload(storagePath, formData.file, {
          contentType: formData.file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          org_id: currentOrgId,
          project_id: formData.projectId,
          bucket: 'drawings',
          path: storagePath,
          mime_type: formData.file.type,
          size_bytes: formData.file.size,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      const { data: drawing, error: drawingError } = await supabase
        .from('drawings')
        .insert({
          project_id: formData.projectId,
          discipline: formData.discipline || null,
          number: formData.number,
          title: formData.title || null,
          current_version: 1,
        })
        .select()
        .single();

      if (drawingError) throw drawingError;

      const { error: versionError } = await supabase
        .from('drawing_versions')
        .insert({
          drawing_id: drawing.id,
          version: 1,
          file_id: fileRecord.id,
          notes: formData.description || null,
        });

      if (versionError) throw versionError;

      addToast('Drawing uploaded successfully', 'success');
      setIsModalOpen(false);
      
      setDrawings(prev => [...prev, {
        id: drawing.id,
        projectId: formData.projectId,
        discipline: formData.discipline || '',
        number: formData.number,
        title: formData.title || '',
        status: 'approved' as const,
        currentVersion: 1,
        currentRevision: '1',
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    } catch (err: any) {
      console.error('Failed to upload drawing:', err);
      addToast(err.message || 'Failed to upload drawing', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDrawings = drawings.filter((d) => {
    const matchesSearch =
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline = disciplineFilter === "all" || d.discipline === disciplineFilter;
    return matchesSearch && matchesDiscipline;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Drawings"
        description="Project drawings and technical documentation"
        actions={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Upload size={20} />
            Upload Drawing
          </Button>
        }
      />

      <UploadDrawingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUploadDrawing}
        isLoading={isUploading}
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
          <Select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Disciplines</option>
            <option value="architectural">Architectural</option>
            <option value="structural">Structural</option>
            <option value="mechanical">Mechanical</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
          </Select>
        </div>

        {filteredDrawings.length > 0 ? (
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
                        <span className="text-sm font-medium text-neutral-900">{drawing.title || drawing.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-900">{drawing.number}</td>
                    <td className="px-6 py-4">
                      <Badge>
                        {drawing.discipline || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>Current</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{drawing.currentVersion || 1}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {drawing.createdAt ? new Date(drawing.createdAt).toLocaleDateString() : 'N/A'}
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
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </div>
    </div>
  );
}
