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
    .order('order', { ascending: true });

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
      order: data.order !== undefined ? data.order : (count || 0),
      progress: data.progress || 0,
      start_date: data.startDate,
      end_date: data.endDate,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPhase(phase);
};

export const updatePhase = async (id: string, data: Partial<API.Phase>): Promise<API.Phase> => {
  const supabase = getSupabase();
  const { data: phase, error } = await supabase
    .from('phases')
    .update({
      name: data.name,
      description: data.description,
      status: data.status,
      order: data.order,
      progress: data.progress,
      start_date: data.startDate,
      end_date: data.endDate,
    })
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
        .update({ order: index })
        .eq('id', phaseId)
        .eq('project_id', projectId)
    )
  );
};

export const listSteps = async (projectId: string, params: FilterParams = {}): Promise<PaginatedResponse<API.Step>> => {
  const supabase = getSupabase();
  
  let query = supabase
    .from('steps')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId);

  if (params.phaseId) {
    query = query.eq('phase_id', params.phaseId);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%,assignee.ilike.%${params.q}%`);
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
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapStep(data);
};

export const createStep = async (projectId: string, phaseId: string, data: Partial<API.Step>): Promise<API.Step> => {
  const supabase = getSupabase();
  const { data: step, error } = await supabase
    .from('steps')
    .insert({
      project_id: projectId,
      phase_id: phaseId,
      name: data.name || 'Untitled Step',
      description: data.description,
      status: data.status || 'todo',
      assignee: data.assignee,
      due_date: data.dueDate,
      checklist: data.checklist || [],
      tags: data.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return mapStep(step);
};

export const updateStep = async (id: string, data: Partial<API.Step>): Promise<API.Step> => {
  const supabase = getSupabase();
  const { data: step, error } = await supabase
    .from('steps')
    .update({
      name: data.name,
      description: data.description,
      status: data.status,
      assignee: data.assignee,
      due_date: data.dueDate,
      checklist: data.checklist,
      tags: data.tags,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapStep(step);
};

export const toggleCheckItem = async (stepId: string, checkItemId: string): Promise<API.Step> => {
  const supabase = getSupabase();
  const { data: step } = await supabase
    .from('steps')
    .select('checklist')
    .eq('id', stepId)
    .single();

  if (!step) throw new Error('Step not found');

  const checklist = (step.checklist as API.ChecklistItem[]).map(item =>
    item.id === checkItemId ? { ...item, checked: !item.checked } : item
  );

  const { data: updated, error } = await supabase
    .from('steps')
    .update({ checklist })
    .eq('id', stepId)
    .select()
    .single();

  if (error) throw error;
  return mapStep(updated);
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
    query = query.or(`name.ilike.%${params.q}%,type.ilike.%${params.q}%`);
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
  files: Array<{ name: string; size: number; type: string }>
): Promise<API.File[]> => {
  const supabase = getSupabase();
  
  const fileRecords = files.map(file => ({
    org_id: orgId,
    project_id: projectId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: `/files/${crypto.randomUUID()}`,
    status: 'ready',
    uploaded_by: 'Current User',
    tags: [],
  }));

  const { data, error } = await supabase
    .from('files')
    .insert(fileRecords)
    .select();

  if (error) throw error;
  return (data || []).map(mapFile);
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
  order: data.order,
  progress: data.progress,
  startDate: data.start_date ? new Date(data.start_date) : undefined,
  endDate: data.end_date ? new Date(data.end_date) : undefined,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapStep = (data: any): API.Step => ({
  id: data.id,
  projectId: data.project_id,
  phaseId: data.phase_id,
  name: data.name,
  description: data.description,
  status: data.status,
  assignee: data.assignee,
  dueDate: data.due_date ? new Date(data.due_date) : undefined,
  checklist: data.checklist || [],
  tags: data.tags || [],
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

const mapFile = (data: any): API.File => ({
  id: data.id,
  orgId: data.org_id,
  projectId: data.project_id,
  name: data.name,
  size: data.size,
  type: data.type,
  url: data.url,
  status: data.status,
  uploadedBy: data.uploaded_by,
  uploadedAt: new Date(data.uploaded_at || data.created_at),
  tags: data.tags || [],
});

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
