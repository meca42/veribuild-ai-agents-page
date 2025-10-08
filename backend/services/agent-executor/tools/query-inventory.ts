import { Tool, ToolInput, ToolOutput, ExecutionContext } from '../types';
import { createServiceClient } from '../../../lib/supabase';

export const queryInventoryTool: Tool = {
  id: 'query_inventory',
  name: 'query_inventory',
  description: 'Query material inventory by name, category, or specification. Returns matching materials with quantities and status.',
  input_schema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term for material name or description'
      },
      category: {
        type: 'string',
        description: 'Filter by category (e.g., "Concrete", "Steel", "Electrical")',
        nullable: true
      },
      min_quantity: {
        type: 'number',
        description: 'Minimum quantity threshold',
        nullable: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 20
      }
    },
    required: ['search']
  },
  async execute(input: ToolInput, context: ExecutionContext): Promise<ToolOutput> {
    const supabase = createServiceClient();
    const { search, category, min_quantity, limit = 20 } = input as {
      search: string;
      category?: string;
      min_quantity?: number;
      limit?: number;
    };

    let dbQuery = supabase
      .from('materials')
      .select('id, name, category, quantity, unit, status, specification, supplier, created_at')
      .eq('project_id', context.projectId)
      .or(`name.ilike.%${search}%,specification.ilike.%${search}%,supplier.ilike.%${search}%`)
      .order('name')
      .limit(limit);

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (min_quantity !== undefined) {
      dbQuery = dbQuery.gte('quantity', min_quantity);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Failed to query inventory: ${error.message}`);
    }

    return {
      materials: data || [],
      count: data?.length || 0
    };
  }
};
