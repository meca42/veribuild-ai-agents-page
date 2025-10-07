# Agent Infrastructure

Complete implementation of AI agents, tools, and execution traces for construction workflows.

## Overview

The agent infrastructure enables autonomous AI assistants to help with construction project tasks by:
- Calling predefined tools (search drawings, query inventory, create RFIs, etc.)
- Maintaining conversation history and execution traces
- Supporting multiple LLM models (GPT-4, Claude, etc.)
- Providing detailed run logs and debugging

## Database Schema

### Tables

#### `tools`
- Reusable functions that agents can call
- Fields: `id`, `org_id`, `name`, `version`, `description`, `input_schema` (JSONB), `output_schema` (JSONB), `is_active`, `created_at`
- Unique constraint on `(org_id, name, version)`

#### `agents`
- AI assistants configured with tools and prompts
- Fields: `id`, `org_id`, `project_id`, `name`, `model`, `system_prompt`, `temperature` (0-2), `tool_policy` (conservative/balanced/aggressive), `max_steps` (1-32), `is_active`, `created_at`, `updated_at`

#### `agent_tools`
- Many-to-many relationship between agents and tools
- Fields: `agent_id`, `tool_id`, `config` (JSONB for tool-specific configuration)

#### `agent_runs`
- Execution records of agent interactions
- Fields: `id`, `agent_id`, `project_id`, `started_by`, `trigger` (ui/api/schedule/webhook), `input`, `status` (queued/running/succeeded/failed/cancelled), `started_at`, `finished_at`, `latency_ms` (auto-computed), `error`, `result_summary`, `result_blob` (JSONB), `created_at`

#### `agent_messages`
- Conversation history for each run
- Fields: `id`, `run_id`, `role` (user/assistant/tool/system), `content`, `tool_name`, `seq`, `created_at`
- Unique constraint on `(run_id, seq)`

#### `tool_calls`
- Detailed logs of tool invocations during runs
- Fields: `id`, `run_id`, `tool_id`, `seq`, `input` (JSONB), `output` (JSONB), `status` (ok/error), `started_at`, `finished_at`, `error`
- Unique constraint on `(run_id, seq, tool_id)`

### Indexes
- `agent_runs(agent_id, project_id, status, started_at)` - composite index for filtering
- `agent_messages(run_id, seq)` - for ordered retrieval
- `tool_calls(run_id, seq)` - for trace reconstruction

## API Functions

### Tools
```typescript
// List all tools for an organization
listTools(orgId: string, params?: { q?: string; page?: number; pageSize?: number })

// Create a new tool
createTool(orgId: string, data: {
  name: string;
  version: string;
  description?: string;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
})

// Update tool
updateTool(toolId: string, data: {
  description?: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  isActive?: boolean;
})
```

### Agents
```typescript
// List agents
listAgents(params: {
  orgId: string;
  projectId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
})

// Get agent with tools
getAgent(agentId: string)

// Create agent
createAgent(orgId: string, data: {
  projectId?: string;
  name: string;
  model: string; // e.g., 'gpt-4', 'claude-3-opus'
  systemPrompt?: string;
  temperature?: number; // 0-2, default 0.2
  toolPolicy?: 'conservative' | 'balanced' | 'aggressive'; // default 'balanced'
  maxSteps?: number; // 1-32, default 16
  toolIds?: string[]; // array of tool IDs to attach
})

// Update agent
updateAgent(agentId: string, data: {
  systemPrompt?: string;
  temperature?: number;
  toolPolicy?: 'conservative' | 'balanced' | 'aggressive';
  maxSteps?: number;
  isActive?: boolean;
  toolIds?: string[]; // replaces all tools
})
```

### Agent Runs
```typescript
// List runs
listAgentRuns(params: {
  orgId: string;
  agentId?: string;
  projectId?: string;
  status?: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  page?: number;
  pageSize?: number;
})

// Get run with messages and tool calls
getAgentRun(runId: string)

// Start a new run
startAgentRun(agentId: string, input: string, projectId?: string)

// Cancel a running agent
cancelAgentRun(runId: string)
```

## Creating Tools

Tools are defined using JSON schemas for inputs and outputs:

### Example: Search Drawings Tool
```typescript
const searchDrawingsTool = {
  name: 'search_drawings',
  version: '1.0.0',
  description: 'Search for drawings by number, title, or discipline',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'The project ID to search within'
      },
      query: {
        type: 'string',
        description: 'Search query (drawing number, title, or keyword)'
      }
    },
    required: ['project_id', 'query']
  },
  outputSchema: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            number: { type: 'string' },
            title: { type: 'string' },
            discipline: { type: 'string' },
            url: { type: 'string' }
          }
        }
      }
    }
  }
};
```

### Example: Query Inventory Tool
```typescript
const queryInventoryTool = {
  name: 'query_inventory',
  version: '1.0.0',
  description: 'Query on-site inventory for material quantities and locations',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'The project ID to query'
      },
      item_number: {
        type: 'string',
        description: 'Material item number or description'
      }
    },
    required: ['project_id', 'item_number']
  },
  outputSchema: {
    type: 'object',
    properties: {
      total_quantity: { type: 'number' },
      locations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            location: { type: 'string' },
            quantity: { type: 'number' }
          }
        }
      }
    }
  }
};
```

### Example: Create RFI Tool
```typescript
const createRFITool = {
  name: 'create_rfi',
  version: '1.0.0',
  description: 'Create a new Request for Information',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'The project ID for the RFI'
      },
      title: {
        type: 'string',
        description: 'RFI title or subject'
      },
      question: {
        type: 'string',
        description: 'The question or request details'
      }
    },
    required: ['project_id', 'title', 'question']
  },
  outputSchema: {
    type: 'object',
    properties: {
      rfi_id: { type: 'string' },
      number: { type: 'string' },
      status: { type: 'string' }
    }
  }
};
```

## Creating Agents

### Example: Construction Assistant
```typescript
const agent = await api.createAgent('org-123', {
  name: 'Construction Assistant',
  model: 'gpt-4',
  systemPrompt: `You are a helpful construction assistant. Help users with project information and tasks.
  
When searching for information, use the available tools to query project data.
When creating RFIs or other documents, confirm details with the user first.
Be concise and professional in your responses.`,
  temperature: 0.2,
  toolPolicy: 'balanced',
  maxSteps: 16,
  toolIds: [
    'search-drawings-tool-id',
    'query-inventory-tool-id',
    'create-rfi-tool-id'
  ]
});
```

### Tool Policies
- **conservative**: Only uses tools when explicitly asked, requires confirmation for destructive actions
- **balanced** (default): Uses tools as needed, confirms destructive actions
- **aggressive**: Proactively uses tools, minimal confirmation

## Running Agents

### From UI
1. Navigate to `/agents`
2. Click on an agent
3. Click "Run" button
4. Enter your input/question
5. View results in `/runs`

### From API
```typescript
const run = await api.startAgentRun(
  'agent-123',
  'Find drawing M-102 and check if we have enough 4" anchor bolts',
  'project-456'
);

// Poll for completion
const result = await api.getAgentRun(run.id);
```

## Run Traces

Each run includes:
- **Messages**: User prompts, assistant responses, tool invocations
- **Tool Calls**: Detailed input/output for each tool with timing
- **Status**: queued → running → succeeded/failed/cancelled
- **Latency**: Auto-computed from started_at to finished_at
- **Result**: Summary text and optional JSON blob

### Example Run Trace
```
User: "Find drawing M-102"
├─ Tool Call: search_drawings
│  ├─ Input: { project_id: "proj-123", query: "M-102" }
│  ├─ Output: { results: [{ number: "M-102", title: "Main HVAC Layout", url: "..." }] }
│  └─ Status: ok (250ms)
├─ Assistant: "I found drawing M-102 titled 'Main HVAC Layout'. Here's the link: ..."
└─ Status: succeeded (1.2s total)
```

## Mock Mode

When `VITE_USE_MOCK_API=true`:
- Tools and agents are generated in-memory
- Runs simulate execution with 3-second delay
- No actual LLM calls are made
- Mock responses are returned

## RLS and Security

**Testing (Current)**:
- RLS is disabled on all agent tables (`014_disable_agents_rls.sql`)

**Production (TODO)**:
- Re-enable RLS with policies:
  - SELECT: Users can view tools/agents/runs for their organizations
  - INSERT: Managers+ can create tools/agents, all members can start runs
  - UPDATE: Users can update their own runs, managers can update agents
  - DELETE: Admins only

## Next Steps

1. **Backend Agent Executor**: Implement actual LLM function calling loop (currently not implemented - this is frontend-only infrastructure)
2. **Tool Handlers**: Implement the actual tool execution logic for `search_drawings`, `query_inventory`, `create_rfi`
3. **Streaming**: Add real-time updates during agent execution
4. **Scheduling**: Add support for scheduled agent runs (cron-based)
5. **Webhooks**: Trigger agents from external events

## Migration Instructions

To set up agent infrastructure:

1. Apply migrations:
```bash
# Supabase Dashboard → SQL Editor
# Run supabase/migrations/013_agents.sql
# Run supabase/migrations/014_disable_agents_rls.sql
```

2. Create your first tool:
```typescript
const tool = await api.createTool('your-org-id', {
  name: 'search_drawings',
  version: '1.0.0',
  description: 'Search for drawings',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: { type: 'string' },
      query: { type: 'string' }
    },
    required: ['project_id', 'query']
  }
});
```

3. Create an agent:
```typescript
const agent = await api.createAgent('your-org-id', {
  name: 'My Agent',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant',
  toolIds: [tool.id]
});
```

4. Run it:
```typescript
const run = await api.startAgentRun(agent.id, 'Find drawing M-102');
```

## UI Pages

- `/agents` - List, create, edit agents
- `/runs` - View run history and traces
- Agent detail modal - Configure tools, prompts, settings
- Run detail modal - View messages, tool calls, results
