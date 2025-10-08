import { Tool } from '../types';
import { searchDrawingsTool } from './search-drawings';
import { queryInventoryTool } from './query-inventory';
import { createRFITool } from './create-rfi';

export const toolRegistry: Map<string, Tool> = new Map([
  ['search_drawings', searchDrawingsTool],
  ['query_inventory', queryInventoryTool],
  ['create_rfi', createRFITool]
]);

export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name);
}

export function getAllTools(): Tool[] {
  return Array.from(toolRegistry.values());
}
