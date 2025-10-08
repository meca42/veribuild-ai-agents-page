export type ToolCtx = {
  runId: string;
  projectId: string;
  userId: string;
};

export type ToolResult =
  | { ok: true; result: any }
  | { ok: false; error: string };

export type ToolDef = {
  name: 'search_drawings' | 'query_inventory' | 'create_rfi';
  description: string;
  parameters: any;
  handler: (args: any, ctx: ToolCtx) => Promise<ToolResult>;
};
