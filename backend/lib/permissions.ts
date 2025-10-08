import { createServiceClient } from './supabase';
import { APIError } from 'encore.dev/api';

export async function verifyOrgMembership(userId: string, orgId: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('org_members')
    .select('id')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw APIError.permissionDenied("User is not a member of this organization");
  }
}

export async function verifyProjectAccess(userId: string, projectId: string): Promise<string> {
  const supabase = createServiceClient();
  
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    throw APIError.notFound("Project not found");
  }

  await verifyOrgMembership(userId, project.org_id);
  
  return project.org_id;
}

export async function verifyRunAccess(userId: string, runId: string): Promise<{ orgId: string; projectId: string }> {
  const supabase = createServiceClient();
  
  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .select('agent_id, project_id')
    .eq('id', runId)
    .single();

  if (runError || !run) {
    throw APIError.notFound("Run not found");
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('org_id')
    .eq('id', run.agent_id)
    .single();

  if (agentError || !agent) {
    throw APIError.notFound("Agent not found");
  }

  await verifyOrgMembership(userId, agent.org_id);
  
  return { orgId: agent.org_id, projectId: run.project_id };
}

export async function verifyRunOwnership(userId: string, runId: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .select('started_by, agent_id')
    .eq('id', runId)
    .single();

  if (runError || !run) {
    throw APIError.notFound("Run not found");
  }

  if (run.started_by !== userId) {
    const { data: agent } = await supabase
      .from('agents')
      .select('org_id')
      .eq('id', run.agent_id)
      .single();

    if (agent) {
      const { data: membership } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', agent.org_id)
        .eq('user_id', userId)
        .single();

      if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
        throw APIError.permissionDenied("Only the run creator or org admin can cancel this run");
      }
    } else {
      throw APIError.permissionDenied("Only the run creator can cancel this run");
    }
  }
}

export async function getUserOrgIds(userId: string): Promise<string[]> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId);

  if (error) {
    throw APIError.internal("Failed to fetch user organizations");
  }

  return (data ?? []).map(m => m.org_id);
}
