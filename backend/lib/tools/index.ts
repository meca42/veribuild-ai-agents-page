import type { ToolDef, ToolCtx, ToolResult } from './types';
import { search_drawings, query_inventory, create_rfi } from './handlers';
import { schemas, retry } from './validation';
import { createServiceClient } from '../supabase';

const stringSchema = (desc: string) => ({
  type: 'string',
  description: desc,
});

export const tools: ToolDef[] = [
  {
    name: 'search_drawings',
    description:
      'Search drawings in this project by title or number; returns latest first.',
    parameters: {
      type: 'object',
      properties: {
        query: stringSchema('Search text: title or number'),
      },
      required: ['query'],
    },
    handler: search_drawings,
  },
  {
    name: 'query_inventory',
    description: 'Find inventory items for this project by SKU or name.',
    parameters: {
      type: 'object',
      properties: {
        item: stringSchema('SKU or name query'),
      },
      required: ['item'],
    },
    handler: query_inventory,
  },
  {
    name: 'create_rfi',
    description:
      'Create a new RFI with subject and question; optionally link to a drawing.',
    parameters: {
      type: 'object',
      properties: {
        subject: stringSchema('Short subject'),
        question: stringSchema('Detailed question'),
        drawing_id: { type: ['string', 'null'], description: 'Optional drawing ID to link' },
      },
      required: ['subject', 'question'],
    },
    handler: create_rfi,
  },
];

export function toolSpecsForLlm() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

export async function runToolByName(
  name: ToolDef['name'],
  args: any,
  ctx: ToolCtx
): Promise<ToolResult> {
  const def = tools.find((t) => t.name === name);
  if (!def) {
    return { ok: false, error: `unknown tool: ${name}` };
  }

  const schema = schemas[name as keyof typeof schemas];
  if (!schema) {
    return { ok: false, error: `no validation schema for tool: ${name}` };
  }

  const validation = schema.validate(args);
  if (!validation.valid) {
    return { ok: false, error: validation.error || 'validation failed' };
  }

  const started = Date.now();
  
  try {
    const result = await retry(async () => {
      return await def.handler(validation.data, ctx);
    }, 2);

    const elapsed = Date.now() - started;
    const supabase = createServiceClient();
    await supabase.from('agent_audit').insert({
      run_id: ctx.runId,
      event: 'tool.call',
      meta: { name, ms: elapsed }
    });

    return result;
  } catch (e: any) {
    const supabase = createServiceClient();
    await supabase.from('agent_audit').insert({
      run_id: ctx.runId,
      event: 'tool.error',
      meta: { name, error: e?.message ?? 'tool_error' }
    });
    return { ok: false, error: e?.message ?? 'tool execution failed' };
  }
}

export * from './types';
