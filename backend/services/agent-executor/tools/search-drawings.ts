import { Tool, ToolInput, ToolOutput, ExecutionContext } from '../types';
import { createServiceClient } from '../../../lib/supabase';

export const searchDrawingsTool: Tool = {
  id: 'search_drawings',
  name: 'search_drawings',
  description: 'Search for construction drawings by name, number, or discipline. Returns matching drawings with their metadata.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (drawing name, number, or keywords)'
      },
      discipline: {
        type: 'string',
        description: 'Filter by discipline (e.g., "Mechanical", "Structural", "Electrical")',
        nullable: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return',
        default: 10
      }
    },
    required: ['query']
  },
  async execute(input: ToolInput, context: ExecutionContext): Promise<ToolOutput> {
    const supabase = createServiceClient();
    const { query, discipline, limit = 10 } = input as { query: string; discipline?: string; limit?: number };

    let dbQuery = supabase
      .from('drawings')
      .select('id, name, drawing_number, discipline, sheet_count, file_url, created_at')
      .eq('project_id', context.projectId)
      .or(`name.ilike.%${query}%,drawing_number.ilike.%${query}%,discipline.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (discipline) {
      dbQuery = dbQuery.eq('discipline', discipline);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search drawings: ${error.message}`);
    }

    return {
      drawings: data || [],
      count: data?.length || 0
    };
  }
};
