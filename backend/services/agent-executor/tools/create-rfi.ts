import { Tool, ToolInput, ToolOutput, ExecutionContext } from '../types';
import { createServiceClient } from '../../../lib/supabase';

export const createRFITool: Tool = {
  id: 'create_rfi',
  name: 'create_rfi',
  description: 'Create a new Request for Information (RFI) for the project. Use this when questions or clarifications are needed.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short title/subject of the RFI'
      },
      description: {
        type: 'string',
        description: 'Detailed description of the question or issue'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Priority level',
        default: 'medium'
      },
      drawing_reference: {
        type: 'string',
        description: 'Related drawing number or reference',
        nullable: true
      },
      assignee: {
        type: 'string',
        description: 'User ID to assign the RFI to',
        nullable: true
      }
    },
    required: ['title', 'description']
  },
  async execute(input: ToolInput, context: ExecutionContext): Promise<ToolOutput> {
    const supabase = createServiceClient();
    const { title, description, priority = 'medium', drawing_reference, assignee } = input as {
      title: string;
      description: string;
      priority?: string;
      drawing_reference?: string;
      assignee?: string;
    };

    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', context.projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    const { data: rfiData, error } = await supabase
      .from('rfis')
      .insert({
        project_id: context.projectId,
        title,
        description,
        priority,
        status: 'open',
        submitted_by: context.userId,
        assigned_to: assignee || null,
        drawing_reference: drawing_reference || null
      })
      .select('id, rfi_number, title, status, priority, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create RFI: ${error.message}`);
    }

    return {
      rfi: rfiData,
      message: `RFI #${rfiData.rfi_number} created successfully`
    };
  }
};
