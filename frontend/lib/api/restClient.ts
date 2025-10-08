import { createBrowserClient } from '../supabase/client';
import { applySearch, applySort, applyDateRange, createPaginatedResponse, type FilterParams, type PaginatedResponse } from '../mocks/filters';
import type * as API from './types';

const getSupabase = () => {
  const supabase = createBrowserClient();
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const listProjects = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Project>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId);

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%,location.ilike.%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.sortBy) {
    query = query.order(params.sortBy, { ascending: params.sortDir !== 'desc' });
  }

  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapProject),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getProject = async (id: string): Promise<API.Project> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapProject(data);
};

export const createProject = async (orgId: string, data: Partial<API.Project>): Promise<API.Project> => {
  const supabase = getSupabase();
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      name: data.name || 'Untitled Project',
      description: data.description,
      status: data.status || 'planning',
      location: data.location,
      start_date: data.startDate,
      end_date: data.endDate,
      budget: data.budget,
      spent: data.spent || 0,
      progress: data.progress || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapProject(project);
};

export const updateProject = async (id: string, data: Partial<API.Project>): Promise<API.Project> => {
  const supabase = getSupabase();
  const { data: project, error } = await supabase
    .from('projects')
    .update({
      name: data.name,
      description: data.description,
      status: data.status,
      location: data.location,
      start_date: data.startDate,
      end_date: data.endDate,
      budget: data.budget,
      spent: data.spent,
      progress: data.progress,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapProject(project);
};

export const archiveProject = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) throw error;
};

export const listPhases = async (projectId: string): Promise<API.Phase[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('project_id', projectId)
    .order('sequence', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapPhase);
};

export const createPhase = async (projectId: string, data: Partial<API.Phase>): Promise<API.Phase> => {
  const supabase = getSupabase();
  
  const { count } = await supabase
    .from('phases')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const { data: phase, error } = await supabase
    .from('phases')
    .insert({
      project_id: projectId,
      name: data.name || 'Untitled Phase',
      description: data.description,
      status: data.status || 'not_started',
      sequence: data.order !== undefined ? data.order : (count || 0),
      progress: data.progress || 0,
      planned_start: data.startDate,
      planned_end: data.endDate,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPhase(phase);
};

export const updatePhase = async (id: string, data: Partial<API.Phase>): Promise<API.Phase> => {
  const supabase = getSupabase();
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.order !== undefined) updateData.sequence = data.order;
  if (data.progress !== undefined) updateData.progress = data.progress;
  if (data.startDate !== undefined) updateData.planned_start = data.startDate;
  if (data.endDate !== undefined) updateData.planned_end = data.endDate;

  const { data: phase, error } = await supabase
    .from('phases')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPhase(phase);
};

export const reorderPhases = async (projectId: string, phaseIds: string[]): Promise<void> => {
  const supabase = getSupabase();
  
  await Promise.all(
    phaseIds.map((phaseId, index) =>
      supabase
        .from('phases')
        .update({ sequence: index })
        .eq('id', phaseId)
        .eq('project_id', projectId)
    )
  );
};

export const listSteps = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Step>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('steps')
    .select(`
      *,
      phase:phases(id, name, sequence),
      checkitems:step_checkitems(*)
    `, { count: 'exact' })
    .eq('project_id', projectId);

  if (params.phaseId) {
    query = query.eq('phase_id', params.phaseId);
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.sortBy) {
    query = query.order(params.sortBy, { ascending: params.sortDir !== 'desc' });
  } else {
    query = query.order('order_index', { ascending: true });
  }

  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapStep),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getStep = async (id: string): Promise<API.Step> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('steps')
    .select(`
      *,
      checkitems:step_checkitems(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapStep(data);
};

export const createStep = async (projectId: string, phaseId: string, data: Partial<API.Step>): Promise<API.Step> => {
  const supabase = getSupabase();
  
  const { count } = await supabase
    .from('steps')
    .select('*', { count: 'exact', head: true })
    .eq('phase_id', phaseId);

  const { data: step, error } = await supabase
    .from('steps')
    .insert({
      phase_id: phaseId,
      title: data.name || 'Untitled Step',
      description: data.description,
      status: data.status || 'todo',
      assignee_id: data.assignee,
      planned_end: data.dueDate,
      order_index: count || 0,
      meta: {
        tags: data.tags || [],
      },
    })
    .select(`
      *,
      checkitems:step_checkitems(*)
    `)
    .single();

  if (error) throw error;
  
  if (data.checklist && data.checklist.length > 0) {
    const checkitems = data.checklist.map((item, index) => ({
      step_id: step.id,
      label: item.text,
      is_done: item.checked,
      order_index: index,
    }));
    
    await supabase.from('step_checkitems').insert(checkitems);
    
    const { data: updatedStep } = await supabase
      .from('steps')
      .select(`
        *,
        checkitems:step_checkitems(*)
      `)
      .eq('id', step.id)
      .single();
    
    return mapStep(updatedStep);
  }
  
  return mapStep(step);
};

export const updateStep = async (id: string, data: Partial<API.Step>): Promise<API.Step> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.title = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignee !== undefined) updateData.assignee_id = data.assignee;
  if (data.dueDate !== undefined) updateData.planned_end = data.dueDate;
  if (data.tags !== undefined) {
    updateData.meta = { tags: data.tags };
  }

  const { data: step, error } = await supabase
    .from('steps')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      checkitems:step_checkitems(*)
    `)
    .single();

  if (error) throw error;
  
  if (data.checklist !== undefined) {
    await supabase.from('step_checkitems').delete().eq('step_id', id);
    
    if (data.checklist.length > 0) {
      const checkitems = data.checklist.map((item, index) => ({
        step_id: id,
        label: item.text,
        is_done: item.checked,
        order_index: index,
      }));
      
      await supabase.from('step_checkitems').insert(checkitems);
    }
    
    const { data: updatedStep } = await supabase
      .from('steps')
      .select(`
        *,
        checkitems:step_checkitems(*)
      `)
      .eq('id', id)
      .single();
    
    return mapStep(updatedStep);
  }
  
  return mapStep(step);
};

export const toggleCheckItem = async (stepId: string, checkItemId: string): Promise<API.Step> => {
  const supabase = getSupabase();
  
  const { data: checkitem } = await supabase
    .from('step_checkitems')
    .select('is_done')
    .eq('id', checkItemId)
    .single();

  if (!checkitem) throw new Error('Check item not found');

  await supabase
    .from('step_checkitems')
    .update({ 
      is_done: !checkitem.is_done,
      done_at: !checkitem.is_done ? new Date().toISOString() : null,
    })
    .eq('id', checkItemId);

  const { data: step, error } = await supabase
    .from('steps')
    .select(`
      *,
      checkitems:step_checkitems(*)
    `)
    .eq('id', stepId)
    .single();

  if (error) throw error;
  return mapStep(step);
};

export const listFiles = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.File>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('files')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId);

  if (params.projectId) {
    query = query.eq('project_id', params.projectId);
  }

  if (params.q) {
    query = query.or(`path.ilike.%${params.q}%,mime_type.ilike.%${params.q}%`);
  }

  if (params.sortBy) {
    query = query.order(params.sortBy, { ascending: params.sortDir !== 'desc' });
  } else {
    query = query.order('uploaded_at', { ascending: false });
  }

  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapFile),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getFile = async (id: string): Promise<API.File> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapFile(data);
};

export const uploadFiles = async (
  orgId: string,
  projectId: string | undefined,
  files: Array<{ name: string; size: number; type: string; file: File }>
): Promise<API.File[]> => {
  const supabase = getSupabase();
  const uploadedFiles: API.File[] = [];

  for (const fileInfo of files) {
    const bucket = 'documents';
    // Sanitize filename: remove spaces and special characters
    const sanitizedName = fileInfo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${orgId}/${projectId || 'general'}/${Date.now()}_${sanitizedName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileInfo.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert({
        org_id: orgId,
        project_id: projectId,
        bucket,
        path: fileName,
        mime_type: fileInfo.type,
        size_bytes: fileInfo.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    uploadedFiles.push(mapFile({ ...fileRecord, url: urlData.publicUrl }));
  }

  return uploadedFiles;
};

const mapProject = (data: any): API.Project => ({
  id: data.id,
  orgId: data.org_id,
  name: data.name,
  description: data.description,
  status: data.status,
  location: data.location,
  startDate: data.start_date ? new Date(data.start_date) : undefined,
  endDate: data.end_date ? new Date(data.end_date) : undefined,
  budget: data.budget,
  spent: data.spent,
  progress: data.progress,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapPhase = (data: any): API.Phase => ({
  id: data.id,
  projectId: data.project_id,
  name: data.name,
  description: data.description,
  status: data.status,
  order: data.sequence,
  progress: data.progress || 0,
  startDate: data.planned_start ? new Date(data.planned_start) : undefined,
  endDate: data.planned_end ? new Date(data.planned_end) : undefined,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapStep = (data: any): API.Step => {
  const checkitems = (data.checkitems || []).map((item: any) => ({
    id: item.id,
    text: item.label,
    checked: item.is_done || false,
  }));

  return {
    id: data.id,
    projectId: data.project_id || '',
    phaseId: data.phase_id,
    name: data.title,
    description: data.description,
    status: data.status,
    assignee: data.assignee_id,
    dueDate: data.planned_end ? new Date(data.planned_end) : undefined,
    checklist: checkitems,
    tags: data.meta?.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

const mapDrawing = (data: any): API.Drawing => {
  const supabase = createBrowserClient();
  
  const versions = (data.versions || []).map((v: any) => {
    let url = '';
    if (supabase && v.file?.bucket && v.file?.path) {
      const { data: urlData } = supabase.storage.from(v.file.bucket).getPublicUrl(v.file.path);
      url = urlData.publicUrl;
    }
    
    return {
      id: v.id,
      version: v.version,
      revision: v.revision || 'A',
      fileId: v.file?.id || '',
      fileName: v.file?.path?.split('/').pop() || '',
      uploadedBy: v.file?.uploaded_by || 'Unknown',
      uploadedAt: new Date(v.file?.uploaded_at || v.created_at),
      notes: v.notes,
      url,
    };
  });

  return {
    id: data.id,
    projectId: data.project_id,
    number: data.number,
    title: data.title,
    discipline: data.discipline,
    status: 'draft',
    currentVersion: data.current_version,
    currentRevision: versions[0]?.revision || 'A',
    versions,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

const mapDocument = (data: any): API.Document => {
  const supabase = createBrowserClient();
  
  const versions = (data.versions || []).map((v: any) => {
    let url = '';
    if (supabase && v.file?.bucket && v.file?.path) {
      const { data: urlData } = supabase.storage.from(v.file.bucket).getPublicUrl(v.file.path);
      url = urlData.publicUrl;
    }
    
    return {
      id: v.id,
      version: v.version,
      fileId: v.file?.id || '',
      fileName: v.file?.path?.split('/').pop() || '',
      uploadedBy: v.file?.uploaded_by || v.submitted_by || 'Unknown',
      uploadedAt: new Date(v.file?.uploaded_at || v.created_at),
      notes: v.notes,
      url,
    };
  });

  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    type: data.kind,
    status: data.versions?.[0]?.status || 'draft',
    currentVersion: data.current_version,
    versions,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

const mapFile = (data: any): API.File => {
  const supabase = createBrowserClient();
  let url = data.url;
  
  if (!url && data.bucket && data.path && supabase) {
    const { data: urlData } = supabase.storage.from(data.bucket).getPublicUrl(data.path);
    url = urlData.publicUrl;
  }

  const fileName = data.path?.split('/').pop() || 'unknown';
  
  return {
    id: data.id,
    orgId: data.org_id,
    projectId: data.project_id,
    name: fileName,
    size: data.size_bytes || 0,
    type: data.mime_type || 'application/octet-stream',
    url: url || '',
    status: 'ready',
    uploadedBy: data.uploaded_by || 'Unknown',
    uploadedAt: new Date(data.uploaded_at),
    tags: data.meta?.tags || [],
  };
};

export const listDrawings = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Drawing>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('drawings')
    .select(`
      *,
      versions:drawing_versions(
        id,
        version,
        revision,
        issued_for,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes, uploaded_at)
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`number.ilike.%${params.q}%,title.ilike.%${params.q}%`);
  }

  if (params.discipline) {
    query = query.eq('discipline', params.discipline);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapDrawing),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getDrawing = async (id: string): Promise<API.Drawing> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('drawings')
    .select(`
      *,
      versions:drawing_versions(
        id,
        version,
        revision,
        issued_for,
        notes,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes, uploaded_at, uploaded_by)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapDrawing(data);
};

export const createDrawing = async (projectId: string, data: Partial<API.Drawing>): Promise<API.Drawing> => {
  const supabase = getSupabase();
  const { data: drawing, error } = await supabase
    .from('drawings')
    .insert({
      project_id: projectId,
      discipline: data.discipline || 'General',
      number: data.number || `DWG-${Date.now()}`,
      title: data.title || 'Untitled Drawing',
      tags: data.tags || [],
      current_version: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDrawing({ ...drawing, versions: [] });
};

export const addDrawingVersion = async (
  drawingId: string,
  file: File,
  revision?: string,
  issuedFor?: string,
  notes?: string
): Promise<API.Drawing> => {
  const supabase = getSupabase();
  
  const { data: drawing } = await supabase
    .from('drawings')
    .select('project_id, current_version')
    .eq('id', drawingId)
    .single();

  if (!drawing) throw new Error('Drawing not found');

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', drawing.project_id)
    .single();

  if (!project) throw new Error('Project not found');

  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size must be less than 50MB');
  }

  const bucket = 'drawings';
  const fileName = `${project.org_id}/${drawing.project_id}/${crypto.randomUUID()}.pdf`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: drawing.project_id,
        bucket,
        path: fileName,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    const newVersion = drawing.current_version + 1;

    const { error: versionError } = await supabase
      .from('drawing_versions')
      .insert({
        drawing_id: drawingId,
        version: newVersion,
        file_id: fileRecord.id,
        revision,
        issued_for: issuedFor,
        notes,
      });

    if (versionError) throw versionError;

    const { error: updateError } = await supabase
      .from('drawings')
      .update({ current_version: newVersion })
      .eq('id', drawingId);

    if (updateError) throw updateError;

    return await getDrawing(drawingId);
  } catch (error) {
    await supabase.storage.from(bucket).remove([fileName]);
    throw error;
  }
};

export const listDocuments = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Document>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('documents')
    .select(`
      *,
      versions:document_versions(
        id,
        version,
        status,
        submitted_by,
        reviewed_by,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes, uploaded_at)
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`);
  }

  if (params.type) {
    query = query.eq('kind', params.type);
  }

  if (params.status) {
    query = query.contains('versions', [{ status: params.status }]);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapDocument),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getDocument = async (id: string): Promise<API.Document> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      versions:document_versions(
        id,
        version,
        status,
        submitted_by,
        reviewed_by,
        notes,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes, uploaded_at, uploaded_by)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapDocument(data);
};

export const createDocument = async (projectId: string, data: Partial<API.Document>): Promise<API.Document> => {
  const supabase = getSupabase();
  const { data: document, error } = await supabase
    .from('documents')
    .insert({
      project_id: projectId,
      kind: data.type || 'other',
      title: data.title || 'Untitled Document',
      tags: data.tags || [],
      current_version: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDocument({ ...document, versions: [] });
};

export const addDocumentVersion = async (
  documentId: string,
  file: File,
  status?: string,
  submittedBy?: string,
  reviewedBy?: string,
  notes?: string
): Promise<API.Document> => {
  const supabase = getSupabase();
  
  const { data: document } = await supabase
    .from('documents')
    .select('project_id, current_version')
    .eq('id', documentId)
    .single();

  if (!document) throw new Error('Document not found');

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', document.project_id)
    .single();

  if (!project) throw new Error('Project not found');

  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size must be less than 50MB');
  }

  const bucket = 'documents';
  const fileName = `${project.org_id}/${document.project_id}/${crypto.randomUUID()}.pdf`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: document.project_id,
        bucket,
        path: fileName,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    const newVersion = document.current_version + 1;
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;

    const { error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version: newVersion,
        file_id: fileRecord.id,
        status: status || 'draft',
        submitted_by: submittedBy || currentUserId,
        reviewed_by: reviewedBy,
        notes,
      });

    if (versionError) throw versionError;

    const { error: updateError } = await supabase
      .from('documents')
      .update({ current_version: newVersion })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return await getDocument(documentId);
  } catch (error) {
    await supabase.storage.from(bucket).remove([fileName]);
    throw error;
  }
};

const mapRFI = (data: any): API.RFI => ({
  id: data.id,
  projectId: data.project_id,
  number: data.number,
  title: data.title,
  question: data.question,
  answer: data.answer,
  status: data.status,
  askedBy: data.asked_by_user?.name || data.asked_by,
  assignedTo: data.assigned_to_user?.name || data.assigned_to,
  dueDate: data.due_date ? new Date(data.due_date) : undefined,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  attachments: (data.attachments || []).map((a: any) => ({
    id: a.id,
    rfiId: a.rfi_id,
    fileId: a.file_id,
    fileName: a.file?.path?.split('/').pop() || 'Unknown',
    fileUrl: a.file?.path ? createBrowserClient()?.storage.from(a.file.bucket).getPublicUrl(a.file.path).data.publicUrl || '' : '',
    createdAt: new Date(a.created_at),
  })),
});

export const listRFIs = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.RFI>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('rfis')
    .select(`
      *,
      asked_by_user:users!rfis_asked_by_fkey(name),
      assigned_to_user:users!rfis_assigned_to_fkey(name),
      attachments:rfi_attachments(
        id,
        rfi_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`number.ilike.%${params.q}%,title.ilike.%${params.q}%,question.ilike.%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapRFI),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getRFI = async (id: string): Promise<API.RFI> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('rfis')
    .select(`
      *,
      asked_by_user:users!rfis_asked_by_fkey(name),
      assigned_to_user:users!rfis_assigned_to_fkey(name),
      attachments:rfi_attachments(
        id,
        rfi_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapRFI(data);
};

export const createRFI = async (projectId: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  const supabase = getSupabase();
  
  const { count } = await supabase
    .from('rfis')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const rfiNumber = data.number || `RFI-${String((count || 0) + 1).padStart(3, '0')}`;

  const { data: rfi, error } = await supabase
    .from('rfis')
    .insert({
      project_id: projectId,
      number: rfiNumber,
      title: data.title || 'Untitled RFI',
      question: data.question || '',
      status: data.status || 'open',
      asked_by: data.askedBy || (await supabase.auth.getUser()).data.user?.id,
      assigned_to: data.assignedTo,
      due_date: data.dueDate,
    })
    .select(`
      *,
      asked_by_user:users!rfis_asked_by_fkey(name),
      assigned_to_user:users!rfis_assigned_to_fkey(name),
      attachments:rfi_attachments(
        id,
        rfi_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapRFI(rfi);
};

export const updateRFI = async (id: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.question !== undefined) updateData.question = data.question;
  if (data.answer !== undefined) updateData.answer = data.answer;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;

  const { data: rfi, error } = await supabase
    .from('rfis')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      asked_by_user:users!rfis_asked_by_fkey(name),
      assigned_to_user:users!rfis_assigned_to_fkey(name),
      attachments:rfi_attachments(
        id,
        rfi_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapRFI(rfi);
};

export const addRFIAttachment = async (rfiId: string, file: File): Promise<API.RFI> => {
  const supabase = getSupabase();
  
  const { data: rfi } = await supabase
    .from('rfis')
    .select('project_id')
    .eq('id', rfiId)
    .single();

  if (!rfi) throw new Error('RFI not found');

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', rfi.project_id)
    .single();

  if (!project) throw new Error('Project not found');

  const bucket = 'documents';
  // Sanitize filename: remove spaces and special characters
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${project.org_id}/${rfi.project_id}/rfi/${crypto.randomUUID()}_${sanitizedName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: rfi.project_id,
        bucket,
        path: fileName,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    const { error: attachmentError } = await supabase
      .from('rfi_attachments')
      .insert({
        rfi_id: rfiId,
        file_id: fileRecord.id,
      });

    if (attachmentError) throw attachmentError;

    return await getRFI(rfiId);
  } catch (error) {
    await supabase.storage.from(bucket).remove([fileName]);
    throw error;
  }
};

const mapSubmittal = (data: any): API.Submittal => ({
  id: data.id,
  projectId: data.project_id,
  number: data.number,
  title: data.title,
  specSection: data.spec_section,
  status: data.status,
  submittedBy: data.submitted_by,
  reviewerId: data.reviewer_id,
  dueDate: data.due_date ? new Date(data.due_date) : undefined,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  items: (data.items || []).map((i: any) => ({
    id: i.id,
    submittalId: i.submittal_id,
    description: i.description,
    qty: i.qty,
    unit: i.unit,
    manufacturer: i.manufacturer,
    model: i.model,
    status: i.status,
    createdAt: new Date(i.created_at),
    updatedAt: new Date(i.updated_at),
  })),
  attachments: (data.attachments || []).map((a: any) => ({
    id: a.id,
    submittalId: a.submittal_id,
    fileId: a.file_id,
    fileName: a.file?.path?.split('/').pop() || 'Unknown',
    fileUrl: a.file?.path ? createBrowserClient()?.storage.from(a.file.bucket).getPublicUrl(a.file.path).data.publicUrl || '' : '',
    createdAt: new Date(a.created_at),
  })),
});

export const listSubmittals = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Submittal>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('submittals')
    .select(`
      *,
      items:submittal_items(*),
      attachments:submittal_attachments(
        id,
        submittal_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`number.ilike.%${params.q}%,title.ilike.%${params.q}%,spec_section.ilike.%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapSubmittal),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getSubmittal = async (id: string): Promise<API.Submittal> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('submittals')
    .select(`
      *,
      items:submittal_items(*),
      attachments:submittal_attachments(
        id,
        submittal_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapSubmittal(data);
};

export const createSubmittal = async (projectId: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  const supabase = getSupabase();
  
  const { count } = await supabase
    .from('submittals')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const submittalNumber = data.number || `SUB-${String((count || 0) + 1).padStart(3, '0')}`;

  const { data: submittal, error } = await supabase
    .from('submittals')
    .insert({
      project_id: projectId,
      number: submittalNumber,
      title: data.title || 'Untitled Submittal',
      spec_section: data.specSection,
      status: data.status || 'draft',
      submitted_by: data.submittedBy || (await supabase.auth.getUser()).data.user?.id,
      reviewer_id: data.reviewerId,
      due_date: data.dueDate,
    })
    .select(`
      *,
      items:submittal_items(*),
      attachments:submittal_attachments(
        id,
        submittal_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapSubmittal(submittal);
};

export const updateSubmittal = async (id: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.specSection !== undefined) updateData.spec_section = data.specSection;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.reviewerId !== undefined) updateData.reviewer_id = data.reviewerId;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;

  const { data: submittal, error } = await supabase
    .from('submittals')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      items:submittal_items(*),
      attachments:submittal_attachments(
        id,
        submittal_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapSubmittal(submittal);
};

export const addSubmittalItem = async (submittalId: string, data: Partial<API.SubmittalItem>): Promise<API.SubmittalItem> => {
  const supabase = getSupabase();
  
  const { data: item, error } = await supabase
    .from('submittal_items')
    .insert({
      submittal_id: submittalId,
      description: data.description || '',
      qty: data.qty,
      unit: data.unit,
      manufacturer: data.manufacturer,
      model: data.model,
      status: data.status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: item.id,
    submittalId: item.submittal_id,
    description: item.description,
    qty: item.qty,
    unit: item.unit,
    manufacturer: item.manufacturer,
    model: item.model,
    status: item.status,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
};

export const updateSubmittalItem = async (itemId: string, data: Partial<API.SubmittalItem>): Promise<API.SubmittalItem> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.qty !== undefined) updateData.qty = data.qty;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: item, error } = await supabase
    .from('submittal_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: item.id,
    submittalId: item.submittal_id,
    description: item.description,
    qty: item.qty,
    unit: item.unit,
    manufacturer: item.manufacturer,
    model: item.model,
    status: item.status,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
};

export const addSubmittalAttachment = async (submittalId: string, file: File): Promise<API.Submittal> => {
  const supabase = getSupabase();
  
  const { data: submittal } = await supabase
    .from('submittals')
    .select('project_id')
    .eq('id', submittalId)
    .single();

  if (!submittal) throw new Error('Submittal not found');

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', submittal.project_id)
    .single();

  if (!project) throw new Error('Project not found');

  const bucket = 'documents';
  // Sanitize filename: remove spaces and special characters
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${project.org_id}/${submittal.project_id}/submittal/${crypto.randomUUID()}_${sanitizedName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: submittal.project_id,
        bucket,
        path: fileName,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    const { error: attachmentError } = await supabase
      .from('submittal_attachments')
      .insert({
        submittal_id: submittalId,
        file_id: fileRecord.id,
      });

    if (attachmentError) throw attachmentError;

    return await getSubmittal(submittalId);
  } catch (error) {
    await supabase.storage.from(bucket).remove([fileName]);
    throw error;
  }
};

const mapBOMItem = (data: any): API.BOMItem => ({
  id: data.id,
  projectId: data.project_id,
  itemNumber: data.item_number,
  description: data.description,
  specSection: data.spec_section,
  unit: data.unit,
  plannedQty: parseFloat(data.planned_qty) || 0,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const listBOMItems = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.BOMItem>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('bom_items')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .order('item_number', { ascending: true });

  if (params.q) {
    query = query.or(`item_number.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  const limit = params.pageSize || 50;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapBOMItem),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getBOMItem = async (id: string): Promise<API.BOMItem> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bom_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapBOMItem(data);
};

export const createBOMItem = async (projectId: string, data: Partial<API.BOMItem>): Promise<API.BOMItem> => {
  const supabase = getSupabase();
  
  const { data: bomItem, error } = await supabase
    .from('bom_items')
    .insert({
      project_id: projectId,
      item_number: data.itemNumber || '',
      description: data.description,
      spec_section: data.specSection,
      unit: data.unit,
      planned_qty: data.plannedQty || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBOMItem(bomItem);
};

export const updateBOMItem = async (id: string, data: Partial<API.BOMItem>): Promise<API.BOMItem> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.itemNumber !== undefined) updateData.item_number = data.itemNumber;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.specSection !== undefined) updateData.spec_section = data.specSection;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.plannedQty !== undefined) updateData.planned_qty = data.plannedQty;

  const { data: bomItem, error } = await supabase
    .from('bom_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapBOMItem(bomItem);
};

const mapDeliveryItem = (data: any): API.DeliveryItem => ({
  id: data.id,
  deliveryId: data.delivery_id,
  bomItemId: data.bom_item_id,
  itemNumber: data.item_number,
  description: data.description,
  qty: parseFloat(data.qty),
  unit: data.unit,
  activity: data.activity,
  sourceFileId: data.source_file_id,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapDelivery = (data: any): API.Delivery => ({
  id: data.id,
  projectId: data.project_id,
  vendor: data.vendor,
  packingListNumber: data.packing_list_number,
  receivedAt: new Date(data.received_at),
  receivedBy: data.received_by,
  notes: data.notes,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  items: (data.items || []).map(mapDeliveryItem),
});

export const listDeliveries = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Delivery>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('deliveries')
    .select(`
      *,
      items:delivery_items(*)
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('received_at', { ascending: false });

  if (params.q) {
    query = query.or(`vendor.ilike.%${params.q}%,packing_list_number.ilike.%${params.q}%`);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapDelivery),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getDelivery = async (id: string): Promise<API.Delivery> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      *,
      items:delivery_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapDelivery(data);
};

export const createDelivery = async (projectId: string, data: Partial<API.Delivery>): Promise<API.Delivery> => {
  const supabase = getSupabase();
  
  const { data: delivery, error } = await supabase
    .from('deliveries')
    .insert({
      project_id: projectId,
      vendor: data.vendor,
      packing_list_number: data.packingListNumber,
      received_at: data.receivedAt || new Date(),
      received_by: data.receivedBy || (await supabase.auth.getUser()).data.user?.id,
      notes: data.notes,
    })
    .select(`
      *,
      items:delivery_items(*)
    `)
    .single();

  if (error) throw error;
  return mapDelivery(delivery);
};

export const addDeliveryItem = async (
  deliveryId: string,
  data: {
    itemNumber: string;
    description?: string;
    qty: number;
    unit?: string;
    activity?: string;
    bomItemId?: string;
    sourceFile?: File;
  }
): Promise<API.DeliveryItem> => {
  const supabase = getSupabase();
  
  let sourceFileId: string | undefined;
  
  if (data.sourceFile) {
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('project_id')
      .eq('id', deliveryId)
      .single();

    if (!delivery) throw new Error('Delivery not found');

    const { data: project } = await supabase
      .from('projects')
      .select('org_id')
      .eq('id', delivery.project_id)
      .single();

    if (!project) throw new Error('Project not found');

    const bucket = 'receipts';
    const fileName = `${project.org_id}/${delivery.project_id}/${crypto.randomUUID()}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, data.sourceFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: delivery.project_id,
        bucket,
        path: fileName,
        mime_type: data.sourceFile.type,
        size_bytes: data.sourceFile.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) {
      await supabase.storage.from(bucket).remove([fileName]);
      throw fileError;
    }

    sourceFileId = fileRecord.id;
  }

  const { data: deliveryItem, error } = await supabase
    .from('delivery_items')
    .insert({
      delivery_id: deliveryId,
      bom_item_id: data.bomItemId,
      item_number: data.itemNumber,
      description: data.description,
      qty: data.qty,
      unit: data.unit,
      activity: data.activity,
      source_file_id: sourceFileId,
    })
    .select()
    .single();

  if (error) throw error;

  if (data.bomItemId) {
    const { data: bomItem } = await supabase
      .from('bom_items')
      .select('project_id')
      .eq('id', data.bomItemId)
      .single();

    if (bomItem) {
      const { data: existingLot } = await supabase
        .from('inventory_lots')
        .select('*')
        .eq('project_id', bomItem.project_id)
        .eq('bom_item_id', data.bomItemId)
        .eq('location', 'default')
        .single();

      if (existingLot) {
        await supabase
          .from('inventory_lots')
          .update({
            qty: parseFloat(existingLot.qty) + data.qty,
            last_counted_at: new Date().toISOString(),
          })
          .eq('id', existingLot.id);
      } else {
        await supabase
          .from('inventory_lots')
          .insert({
            project_id: bomItem.project_id,
            bom_item_id: data.bomItemId,
            location: 'default',
            qty: data.qty,
            unit: data.unit,
            last_counted_at: new Date().toISOString(),
          });
      }
    }
  }

  return mapDeliveryItem(deliveryItem);
};

const mapInventoryLot = (data: any): API.InventoryLot => ({
  id: data.id,
  projectId: data.project_id,
  bomItemId: data.bom_item_id,
  location: data.location,
  qty: parseFloat(data.qty),
  unit: data.unit,
  lastCountedAt: new Date(data.last_counted_at),
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

export const listInventoryLots = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.InventoryLot>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('inventory_lots')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .order('last_counted_at', { ascending: false });

  if (params.q) {
    query = query.ilike('location', `%${params.q}%`);
  }

  const limit = params.pageSize || 50;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapInventoryLot),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getInventoryLot = async (id: string): Promise<API.InventoryLot> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('inventory_lots')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapInventoryLot(data);
};

export const updateInventoryLot = async (id: string, data: { qty?: number; lastCountedAt?: Date }): Promise<API.InventoryLot> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.qty !== undefined) updateData.qty = data.qty;
  if (data.lastCountedAt !== undefined) updateData.last_counted_at = data.lastCountedAt;

  const { data: lot, error } = await supabase
    .from('inventory_lots')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapInventoryLot(lot);
};

const mapIssue = (data: any): API.Issue => ({
  id: data.id,
  projectId: data.project_id,
  stepId: data.step_id,
  title: data.title,
  description: data.description,
  type: data.type,
  status: data.status,
  priority: data.priority,
  dueDate: data.due_date ? new Date(data.due_date) : undefined,
  assigneeId: data.assignee_id,
  createdBy: data.created_by,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  attachments: (data.attachments || []).map((a: any) => ({
    id: a.id,
    issueId: a.issue_id,
    fileId: a.file_id,
    fileName: a.file?.path?.split('/').pop() || 'Unknown',
    fileUrl: a.file?.path ? createBrowserClient()?.storage.from(a.file.bucket).getPublicUrl(a.file.path).data.publicUrl || '' : '',
    createdAt: new Date(a.created_at),
  })),
});

export const listIssues = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Issue>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('issues')
    .select(`
      *,
      attachments:issue_attachments(
        id,
        issue_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.type) {
    query = query.eq('type', params.type);
  }

  if (params.priority) {
    query = query.eq('priority', params.priority);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapIssue),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getIssue = async (id: string): Promise<API.Issue> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      attachments:issue_attachments(
        id,
        issue_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapIssue(data);
};

export const createIssue = async (projectId: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  const supabase = getSupabase();
  
  const { data: issue, error } = await supabase
    .from('issues')
    .insert({
      project_id: projectId,
      step_id: data.stepId,
      title: data.title || 'Untitled Issue',
      description: data.description,
      type: data.type || 'other',
      status: data.status || 'open',
      priority: data.priority || 3,
      due_date: data.dueDate,
      assignee_id: data.assigneeId,
      created_by: data.createdBy || (await supabase.auth.getUser()).data.user?.id,
    })
    .select(`
      *,
      attachments:issue_attachments(
        id,
        issue_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapIssue(issue);
};

export const updateIssue = async (id: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
  if (data.assigneeId !== undefined) updateData.assignee_id = data.assigneeId;
  if (data.stepId !== undefined) updateData.step_id = data.stepId;

  const { data: issue, error } = await supabase
    .from('issues')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      attachments:issue_attachments(
        id,
        issue_id,
        file_id,
        created_at,
        file:files(id, path, bucket, mime_type, size_bytes)
      )
    `)
    .single();

  if (error) throw error;
  return mapIssue(issue);
};

export const addIssueAttachment = async (issueId: string, file: File): Promise<API.Issue> => {
  const supabase = getSupabase();
  
  const { data: issue } = await supabase
    .from('issues')
    .select('project_id')
    .eq('id', issueId)
    .single();

  if (!issue) throw new Error('Issue not found');

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', issue.project_id)
    .single();

  if (!project) throw new Error('Project not found');

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB');
  }

  const bucket = 'artifacts';
  const fileExt = file.name.split('.').pop();
  const fileName = `${project.org_id}/${issue.project_id}/issues/${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  try {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        org_id: project.org_id,
        project_id: issue.project_id,
        bucket,
        path: fileName,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    const { error: attachmentError } = await supabase
      .from('issue_attachments')
      .insert({
        issue_id: issueId,
        file_id: fileRecord.id,
      });

    if (attachmentError) throw attachmentError;

    return await getIssue(issueId);
  } catch (error) {
    await supabase.storage.from(bucket).remove([fileName]);
    throw error;
  }
};

const mapInspectionItem = (data: any): API.InspectionItem => ({
  id: data.id,
  inspectionId: data.inspection_id,
  label: data.label,
  result: data.result,
  notes: data.notes,
  orderIndex: data.order_index,
});

const mapInspection = (data: any): API.Inspection => ({
  id: data.id,
  projectId: data.project_id,
  name: data.name,
  status: data.status,
  scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
  performedAt: data.performed_at ? new Date(data.performed_at) : undefined,
  performedBy: data.performed_by,
  meta: data.meta || {},
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  items: (data.items || []).map(mapInspectionItem),
});

export const listInspections = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Inspection>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('inspections')
    .select(`
      *,
      items:inspection_items(*)
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapInspection),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getInspection = async (id: string): Promise<API.Inspection> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      items:inspection_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapInspection(data);
};

export const createInspection = async (projectId: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  const supabase = getSupabase();
  
  const { data: inspection, error } = await supabase
    .from('inspections')
    .insert({
      project_id: projectId,
      name: data.name || 'Untitled Inspection',
      status: data.status || 'scheduled',
      scheduled_at: data.scheduledAt,
      meta: data.meta || {},
    })
    .select(`
      *,
      items:inspection_items(*)
    `)
    .single();

  if (error) throw error;
  return mapInspection(inspection);
};

export const updateInspection = async (id: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.scheduledAt !== undefined) updateData.scheduled_at = data.scheduledAt;
  if (data.performedAt !== undefined) updateData.performed_at = data.performedAt;
  if (data.performedBy !== undefined) updateData.performed_by = data.performedBy;
  if (data.meta !== undefined) updateData.meta = data.meta;

  const { data: inspection, error } = await supabase
    .from('inspections')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      items:inspection_items(*)
    `)
    .single();

  if (error) throw error;
  return mapInspection(inspection);
};

export const addInspectionItem = async (
  inspectionId: string,
  data: { label: string; orderIndex?: number }
): Promise<API.InspectionItem> => {
  const supabase = getSupabase();
  
  const { data: item, error } = await supabase
    .from('inspection_items')
    .insert({
      inspection_id: inspectionId,
      label: data.label,
      order_index: data.orderIndex || 0,
      result: 'n/a',
    })
    .select()
    .single();

  if (error) throw error;
  return mapInspectionItem(item);
};

export const updateInspectionItem = async (
  itemId: string,
  data: { result?: API.InspectionItemResult; notes?: string }
): Promise<API.InspectionItem> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.result !== undefined) updateData.result = data.result;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { data: item, error } = await supabase
    .from('inspection_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return mapInspectionItem(item);
};

// Tool mappers
const mapTool = (data: any): API.Tool => ({
  id: data.id,
  orgId: data.org_id,
  name: data.name,
  version: data.version,
  description: data.description,
  inputSchema: data.input_schema,
  outputSchema: data.output_schema,
  isActive: data.is_active,
  createdAt: new Date(data.created_at),
});

// Agent mappers
const mapAgent = (data: any): API.Agent => ({
  id: data.id,
  orgId: data.org_id,
  projectId: data.project_id,
  name: data.name,
  model: data.model,
  systemPrompt: data.system_prompt,
  temperature: data.temperature,
  toolPolicy: data.tool_policy,
  maxSteps: data.max_steps,
  isActive: data.is_active,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  tools: (data.tools || []).map(mapTool),
  toolCount: data.tool_count,
  lastRun: data.last_run ? new Date(data.last_run) : undefined,
});

// Agent run mappers
const mapAgentMessage = (data: any): API.AgentMessage => ({
  id: data.id,
  runId: data.run_id,
  role: data.role,
  content: data.content,
  toolName: data.tool_name,
  seq: data.seq,
  createdAt: new Date(data.created_at),
});

const mapToolCall = (data: any): API.ToolCall => ({
  id: data.id,
  runId: data.run_id,
  toolId: data.tool_id,
  seq: data.seq,
  input: data.input,
  output: data.output,
  status: data.status,
  startedAt: new Date(data.started_at),
  finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
  error: data.error,
  toolName: data.tool?.name,
});

const mapAgentRun = (data: any): API.AgentRun => ({
  id: data.id,
  agentId: data.agent_id,
  projectId: data.project_id,
  startedBy: data.started_by,
  trigger: data.trigger,
  input: data.input,
  status: data.status,
  startedAt: data.started_at ? new Date(data.started_at) : undefined,
  finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
  latencyMs: data.latency_ms,
  error: data.error,
  resultSummary: data.result_summary,
  resultBlob: data.result_blob,
  createdAt: new Date(data.created_at),
  agentName: data.agent?.name,
  messages: (data.messages || []).map(mapAgentMessage),
  toolCalls: (data.tool_calls || []).map(mapToolCall),
});

// Tools API
export const listTools = async (orgId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Tool>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('tools')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapTool),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const createTool = async (orgId: string, data: Partial<API.Tool>): Promise<API.Tool> => {
  const supabase = getSupabase();
  
  const { data: tool, error } = await supabase
    .from('tools')
    .insert({
      org_id: orgId,
      name: data.name,
      version: data.version,
      description: data.description,
      input_schema: data.inputSchema,
      output_schema: data.outputSchema,
      is_active: data.isActive !== undefined ? data.isActive : true,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTool(tool);
};

export const updateTool = async (toolId: string, data: Partial<API.Tool>): Promise<API.Tool> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.inputSchema !== undefined) updateData.input_schema = data.inputSchema;
  if (data.outputSchema !== undefined) updateData.output_schema = data.outputSchema;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: tool, error } = await supabase
    .from('tools')
    .update(updateData)
    .eq('id', toolId)
    .select()
    .single();

  if (error) throw error;
  return mapTool(tool);
};

// Agents API
export const listAgents = async (params: { orgId: string; projectId?: string; q?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<API.Agent>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('agents')
    .select(`
      *,
      tools:agent_tools(
        tool:tools(*)
      ),
      runs:agent_runs(started_at)
    `, { count: 'exact' })
    .eq('org_id', params.orgId)
    .order('created_at', { ascending: false });

  if (params.projectId) {
    query = query.eq('project_id', params.projectId);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,system_prompt.ilike.%${params.q}%`);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const agents = (data || []).map((a: any) => ({
    ...mapAgent(a),
    tools: (a.tools || []).map((t: any) => mapTool(t.tool)),
    toolCount: (a.tools || []).length,
    lastRun: a.runs && a.runs.length > 0 
      ? new Date(Math.max(...a.runs.map((r: any) => new Date(r.started_at).getTime()))) 
      : undefined,
  }));

  return {
    data: agents,
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getAgent = async (agentId: string): Promise<API.Agent> => {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      tools:agent_tools(
        tool:tools(*)
      )
    `)
    .eq('id', agentId)
    .single();

  if (error) throw error;
  
  return {
    ...mapAgent(data),
    tools: (data.tools || []).map((t: any) => mapTool(t.tool)),
    toolCount: (data.tools || []).length,
  };
};

export const createAgent = async (orgId: string, data: { 
  projectId?: string; 
  name: string; 
  model: string; 
  systemPrompt?: string; 
  temperature?: number; 
  toolPolicy?: API.ToolPolicy; 
  maxSteps?: number;
  toolIds?: string[];
}): Promise<API.Agent> => {
  const supabase = getSupabase();
  
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      org_id: orgId,
      project_id: data.projectId,
      name: data.name,
      model: data.model,
      system_prompt: data.systemPrompt,
      temperature: data.temperature || 0.2,
      tool_policy: data.toolPolicy || 'balanced',
      max_steps: data.maxSteps || 16,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  // Add tools to agent
  if (data.toolIds && data.toolIds.length > 0) {
    const { error: toolError } = await supabase
      .from('agent_tools')
      .insert(
        data.toolIds.map(toolId => ({
          agent_id: agent.id,
          tool_id: toolId,
          config: {},
        }))
      );

    if (toolError) throw toolError;
  }

  return getAgent(agent.id);
};

export const updateAgent = async (agentId: string, data: Partial<API.Agent> & { toolIds?: string[] }): Promise<API.Agent> => {
  const supabase = getSupabase();
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.systemPrompt !== undefined) updateData.system_prompt = data.systemPrompt;
  if (data.temperature !== undefined) updateData.temperature = data.temperature;
  if (data.toolPolicy !== undefined) updateData.tool_policy = data.toolPolicy;
  if (data.maxSteps !== undefined) updateData.max_steps = data.maxSteps;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('id', agentId);

  if (error) throw error;

  // Update tools if provided
  if (data.toolIds !== undefined) {
    // Delete existing tool associations
    await supabase
      .from('agent_tools')
      .delete()
      .eq('agent_id', agentId);

    // Add new tool associations
    if (data.toolIds.length > 0) {
      const { error: toolError } = await supabase
        .from('agent_tools')
        .insert(
          data.toolIds.map(toolId => ({
            agent_id: agentId,
            tool_id: toolId,
            config: {},
          }))
        );

      if (toolError) throw toolError;
    }
  }

  return getAgent(agentId);
};

// Agent Runs API
export const listAgentRuns = async (params: { 
  orgId: string;
  agentId?: string; 
  projectId?: string; 
  status?: API.AgentRunStatus;
  page?: number; 
  pageSize?: number;
}): Promise<PaginatedResponse<API.AgentRun>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('agent_runs')
    .select(`
      *,
      agent:agents(name, org_id)
    `, { count: 'exact' })
    .order('started_at', { ascending: false });

  // Filter by org through agent
  const { data: orgAgents } = await supabase
    .from('agents')
    .select('id')
    .eq('org_id', params.orgId);

  if (orgAgents) {
    const agentIds = orgAgents.map((a: any) => a.id);
    query = query.in('agent_id', agentIds);
  }

  if (params.agentId) {
    query = query.eq('agent_id', params.agentId);
  }

  if (params.projectId) {
    query = query.eq('project_id', params.projectId);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const limit = params.pageSize || 20;
  const offset = ((params.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapAgentRun),
    total: count || 0,
    page: params.page || 1,
    pageSize: limit,
  };
};

export const getAgentRun = async (runId: string): Promise<API.AgentRun> => {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('agent_runs')
    .select(`
      *,
      agent:agents(name),
      messages:agent_messages(*),
      tool_calls:tool_calls(
        *,
        tool:tools(name)
      )
    `)
    .eq('id', runId)
    .single();

  if (error) throw error;
  return mapAgentRun(data);
};

export const startAgentRun = async (agentId: string, input: string, projectId?: string): Promise<API.AgentRun> => {
  const supabase = getSupabase();
  
  const { data: run, error } = await supabase
    .from('agent_runs')
    .insert({
      agent_id: agentId,
      project_id: projectId,
      started_by: (await supabase.auth.getUser()).data.user?.id,
      trigger: 'ui',
      input,
      status: 'queued',
      created_at: new Date().toISOString(),
    })
    .select(`
      *,
      agent:agents(name)
    `)
    .single();

  if (error) throw error;
  return mapAgentRun(run);
};

export const cancelAgentRun = async (runId: string): Promise<API.AgentRun> => {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('agent_runs')
    .update({ 
      status: 'cancelled',
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .eq('status', 'running') // Only cancel running runs
    .select(`
      *,
      agent:agents(name)
    `)
    .single();

  if (error) throw error;
  return mapAgentRun(data);
};

export const listAgents_old = async (projectId: string | undefined, params: FilterParams = {}): Promise<PaginatedResponse<API.Agent>> => {
  throw new Error('Not implemented - use mock client');
};

export const createAgent_old = async (projectId: string | undefined, data: Partial<API.Agent>): Promise<API.Agent> => {
  throw new Error('Not implemented - use mock client');
};

export const updateAgent_old = async (id: string, data: Partial<API.Agent>): Promise<API.Agent> => {
  throw new Error('Not implemented - use mock client');
};

export const listAgentRuns_old = async (projectId: string | undefined, params: FilterParams = {}): Promise<PaginatedResponse<API.AgentRun>> => {
  throw new Error('Not implemented - use mock client');
};

export const startAgentRun_old = async (agentId: string, projectId: string | undefined, input: string): Promise<API.AgentRun> => {
  throw new Error('Not implemented - use mock client');
};

export const listApiKeys = async (orgId: string): Promise<API.ApiKey[]> => {
  throw new Error('Not implemented - use mock client');
};

export const createApiKey = async (orgId: string, name: string): Promise<API.ApiKey> => {
  throw new Error('Not implemented - use mock client');
};

export const deleteApiKey = async (id: string): Promise<void> => {
  throw new Error('Not implemented - use mock client');
};

export const listWebhooks = async (orgId: string): Promise<API.Webhook[]> => {
  throw new Error('Not implemented - use mock client');
};

export const createWebhook = async (orgId: string, data: Partial<API.Webhook>): Promise<API.Webhook> => {
  throw new Error('Not implemented - use mock client');
};

export const updateWebhook = async (id: string, data: Partial<API.Webhook>): Promise<API.Webhook> => {
  throw new Error('Not implemented - use mock client');
};

export const deleteWebhook = async (id: string): Promise<void> => {
  throw new Error('Not implemented - use mock client');
};

export const linkStepReference = async (params: {
  stepId: string;
  refType: 'drawing' | 'document';
  drawingId?: string;
  documentId?: string;
  drawingVersion?: number;
  documentVersion?: number;
}): Promise<void> => {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('step_references')
    .insert({
      step_id: params.stepId,
      ref_type: params.refType,
      drawing_id: params.drawingId,
      document_id: params.documentId,
      drawing_version: params.drawingVersion,
      document_version: params.documentVersion,
    });

  if (error) throw error;
};

export const unlinkStepReference = async (stepReferenceId: string): Promise<void> => {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('step_references')
    .delete()
    .eq('id', stepReferenceId);

  if (error) throw error;
};

export const getStepReferences = async (stepId: string): Promise<any[]> => {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('step_references')
    .select(`
      *,
      drawing:drawings(id, number, title, discipline),
      document:documents(id, title, kind)
    `)
    .eq('step_id', stepId);

  if (error) throw error;
  
  return data || [];
};

// File signed URL helpers
export const getFileSignedUrl = async (fileId: string, expiresIn: number = 3600): Promise<string> => {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('files')
    .select('bucket, path')
    .eq('id', fileId)
    .single();

  if (error || !data) throw error ?? new Error('File not found');

  const { data: signed, error: signError } = await supabase.storage
    .from(data.bucket)
    .createSignedUrl(data.path, expiresIn);

  if (signError) throw signError;
  if (!signed?.signedUrl) throw new Error('Failed to create signed URL');

  return signed.signedUrl;
};

export const getDrawingVersionFileUrl = async (versionId: string, expiresIn: number = 3600): Promise<string> => {
  const supabase = getSupabase();
  
  const { data: version, error: versionError } = await supabase
    .from('drawing_versions')
    .select('file_id')
    .eq('id', versionId)
    .single();

  if (versionError || !version) throw versionError ?? new Error('Drawing version not found');

  return getFileSignedUrl(version.file_id, expiresIn);
};
