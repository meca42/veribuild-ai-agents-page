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
      phase:phases!inner(project_id),
      checkitems:step_checkitems(*)
    `, { count: 'exact' })
    .eq('phase.project_id', projectId);

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
    const fileName = `${orgId}/${projectId || 'general'}/${Date.now()}_${fileInfo.name}`;
    
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
    projectId: data.phase?.project_id || '',
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
  throw new Error('Not implemented - use mock client');
};

export const getDrawing = async (id: string): Promise<API.Drawing> => {
  throw new Error('Not implemented - use mock client');
};

export const createDrawing = async (projectId: string, data: Partial<API.Drawing>): Promise<API.Drawing> => {
  throw new Error('Not implemented - use mock client');
};

export const addDrawingVersion = async (drawingId: string, fileId: string, fileName: string, notes?: string): Promise<API.Drawing> => {
  throw new Error('Not implemented - use mock client');
};

export const listDocuments = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Document>> => {
  throw new Error('Not implemented - use mock client');
};

export const getDocument = async (id: string): Promise<API.Document> => {
  throw new Error('Not implemented - use mock client');
};

export const createDocument = async (projectId: string, data: Partial<API.Document>): Promise<API.Document> => {
  throw new Error('Not implemented - use mock client');
};

export const addDocumentVersion = async (documentId: string, fileId: string, fileName: string, notes?: string): Promise<API.Document> => {
  throw new Error('Not implemented - use mock client');
};

export const listRFIs = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.RFI>> => {
  throw new Error('Not implemented - use mock client');
};

export const getRFI = async (id: string): Promise<API.RFI> => {
  throw new Error('Not implemented - use mock client');
};

export const createRFI = async (projectId: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  throw new Error('Not implemented - use mock client');
};

export const updateRFI = async (id: string, data: Partial<API.RFI>): Promise<API.RFI> => {
  throw new Error('Not implemented - use mock client');
};

export const listSubmittals = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Submittal>> => {
  throw new Error('Not implemented - use mock client');
};

export const getSubmittal = async (id: string): Promise<API.Submittal> => {
  throw new Error('Not implemented - use mock client');
};

export const createSubmittal = async (projectId: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  throw new Error('Not implemented - use mock client');
};

export const updateSubmittal = async (id: string, data: Partial<API.Submittal>): Promise<API.Submittal> => {
  throw new Error('Not implemented - use mock client');
};

export const listBOM = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.BOMItem>> => {
  throw new Error('Not implemented - use mock client');
};

export const createBOMItem = async (projectId: string, data: Partial<API.BOMItem>): Promise<API.BOMItem> => {
  throw new Error('Not implemented - use mock client');
};

export const listDeliveries = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Delivery>> => {
  throw new Error('Not implemented - use mock client');
};

export const createDelivery = async (projectId: string, data: Partial<API.Delivery>): Promise<API.Delivery> => {
  throw new Error('Not implemented - use mock client');
};

export const listInventoryLots = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.InventoryLot>> => {
  throw new Error('Not implemented - use mock client');
};

export const listIssues = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Issue>> => {
  throw new Error('Not implemented - use mock client');
};

export const createIssue = async (projectId: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  throw new Error('Not implemented - use mock client');
};

export const updateIssue = async (id: string, data: Partial<API.Issue>): Promise<API.Issue> => {
  throw new Error('Not implemented - use mock client');
};

export const listInspections = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Inspection>> => {
  throw new Error('Not implemented - use mock client');
};

export const createInspection = async (projectId: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  throw new Error('Not implemented - use mock client');
};

export const updateInspection = async (id: string, data: Partial<API.Inspection>): Promise<API.Inspection> => {
  throw new Error('Not implemented - use mock client');
};

export const listAgents = async (projectId: string | undefined, params: FilterParams = {}): Promise<PaginatedResponse<API.Agent>> => {
  throw new Error('Not implemented - use mock client');
};

export const createAgent = async (projectId: string | undefined, data: Partial<API.Agent>): Promise<API.Agent> => {
  throw new Error('Not implemented - use mock client');
};

export const updateAgent = async (id: string, data: Partial<API.Agent>): Promise<API.Agent> => {
  throw new Error('Not implemented - use mock client');
};

export const listAgentRuns = async (projectId: string | undefined, params: FilterParams = {}): Promise<PaginatedResponse<API.AgentRun>> => {
  throw new Error('Not implemented - use mock client');
};

export const startAgentRun = async (agentId: string, projectId: string | undefined, input: string): Promise<API.AgentRun> => {
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
