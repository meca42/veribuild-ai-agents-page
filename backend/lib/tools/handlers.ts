import { createServiceClient } from '../supabase';
import type { ToolCtx, ToolResult } from './types';

export async function search_drawings(
  args: { query: string },
  ctx: ToolCtx
): Promise<ToolResult> {
  const q = (args?.query ?? '').trim();
  if (!q) {
    return { ok: false, error: 'query is required' };
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('drawings')
      .select('id, project_id, title, number, version, file_path, created_at')
      .eq('project_id', ctx.projectId)
      .or(`title.ilike.%${q}%,number.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, result: data || [] };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Database query failed' };
  }
}

export async function query_inventory(
  args: { item: string },
  ctx: ToolCtx
): Promise<ToolResult> {
  const item = (args?.item ?? '').trim();
  if (!item) {
    return { ok: false, error: 'item is required' };
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, sku, name, quantity_on_hand, uom, location')
      .eq('project_id', ctx.projectId)
      .or(`sku.ilike.%${item}%,name.ilike.%${item}%`)
      .limit(20);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, result: data || [] };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Database query failed' };
  }
}

export async function create_rfi(
  args: {
    subject: string;
    question: string;
    drawing_id?: string | null;
  },
  ctx: ToolCtx
): Promise<ToolResult> {
  const subject = (args?.subject ?? '').trim();
  const question = (args?.question ?? '').trim();

  if (!subject || !question) {
    return { ok: false, error: 'subject and question are required' };
  }

  try {
    const supabase = createServiceClient();
    const payload: any = {
      project_id: ctx.projectId,
      subject,
      question,
      status: 'open',
      created_by: ctx.userId,
    };

    if (args.drawing_id) {
      payload.drawing_id = args.drawing_id;
    }

    const { data, error } = await supabase
      .from('rfis')
      .insert(payload)
      .select('id, project_id, subject, status, created_at')
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, result: data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to create RFI' };
  }
}
