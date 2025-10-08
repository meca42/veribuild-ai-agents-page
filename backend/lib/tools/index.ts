import type { ToolDef, ToolCtx, ToolResult } from './types';
import { search_drawings, query_inventory, create_rfi } from './handlers';

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
  return def.handler(args, ctx);
}

export * from './types';
