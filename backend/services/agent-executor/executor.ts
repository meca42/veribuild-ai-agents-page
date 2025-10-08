import { createServiceClient } from '../../lib/supabase';
import { getProvider } from '../../lib/llm';
import { toolSpecsForLlm, runToolByName } from '../../lib/tools';

type RunRow = {
  id: string;
  agent_id: string;
  project_id: string;
  input: string;
  status: string;
  created_by?: string | null;
};

type AgentRow = {
  id: string;
  model: string;
  max_steps?: number | null;
  system_prompt?: string | null;
};

const MAX_STEPS_DEFAULT = 6;
const STEP_TIMEOUT_MS = 30_000;

async function appendMessage(
  runId: string,
  role: 'user' | 'assistant' | 'tool' | 'system',
  content: string,
  toolName?: string
) {
  const supabase = createServiceClient();
  
  const { data } = await supabase
    .from('agent_messages')
    .select('seq')
    .eq('run_id', runId)
    .order('seq', { ascending: false })
    .limit(1);

  const nextSeq = (data && data.length > 0 ? data[0].seq : 0) + 1;

  await supabase.from('agent_messages').insert({
    run_id: runId,
    role,
    content,
    tool_name: toolName || null,
    seq: nextSeq,
  });
}

async function logTool(
  runId: string,
  seq: number,
  toolName: string,
  input: any,
  res: any,
  startedAt: Date,
  error?: string
) {
  const supabase = createServiceClient();
  await supabase.from('tool_calls').insert({
    run_id: runId,
    seq,
    tool_name: toolName,
    input: JSON.stringify(input),
    output: error ? null : JSON.stringify(res),
    error: error || null,
    started_at: startedAt.toISOString(),
    finished_at: new Date().toISOString(),
    status: error ? 'error' : 'ok',
  });
}

async function updateRun(runId: string, patch: Record<string, any>) {
  const supabase = createServiceClient();
  await supabase.from('agent_runs').update(patch).eq('id', runId);
}

export async function runAgent({
  runId,
  openaiKey,
}: {
  runId: string;
  openaiKey: string;
}) {
  await updateRun(runId, {
    status: 'running',
    started_at: new Date().toISOString(),
  });

  const supabase = createServiceClient();

  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .select('id, agent_id, project_id, input, status, created_by')
    .eq('id', runId)
    .single<RunRow>();

  if (runError || !run) {
    await updateRun(runId, {
      status: 'failed',
      error: runError?.message || 'run not found',
      finished_at: new Date().toISOString(),
    });
    return;
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, model, max_steps, system_prompt')
    .eq('id', run.agent_id)
    .single<AgentRow>();

  if (agentError || !agent) {
    await updateRun(runId, {
      status: 'failed',
      error: agentError?.message || 'agent not found',
      finished_at: new Date().toISOString(),
    });
    return;
  }

  if (!openaiKey) {
    await updateRun(runId, {
      status: 'failed',
      error: 'OpenAI API key not configured',
      finished_at: new Date().toISOString(),
    });
    return;
  }

  const provider = getProvider(openaiKey);
  const model = agent.model || 'gpt-4o-mini';
  const maxSteps = agent.max_steps ?? MAX_STEPS_DEFAULT;

  if (agent.system_prompt) {
    await appendMessage(runId, 'system', agent.system_prompt);
  }
  await appendMessage(runId, 'user', run.input);

  let step = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let costUSD = 0;

  try {
    while (step < maxSteps) {
      const { data: messages } = await supabase
        .from('agent_messages')
        .select('role, content, tool_name')
        .eq('run_id', runId)
        .order('seq', { ascending: true });

      if (!messages) {
        throw new Error('Failed to fetch messages');
      }

      const llmRes = await Promise.race([
        provider.chat({
          model,
          messages: messages.map((m) => ({
            role: m.role as any,
            content: m.content,
            name: m.tool_name ?? undefined,
          })),
          tools: toolSpecsForLlm(),
          tool_choice: 'auto',
          temperature: 0.2,
          max_tokens: 800,
        }),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error('step_timeout')), STEP_TIMEOUT_MS)
        ),
      ]);

      if (llmRes.usage) {
        promptTokens += llmRes.usage.prompt_tokens ?? 0;
        completionTokens += llmRes.usage.completion_tokens ?? 0;
        costUSD += llmRes.usage.cost_usd ?? 0;
      }

      if ((llmRes.toolCalls?.length ?? 0) === 0) {
        if (llmRes.content?.trim()) {
          await appendMessage(runId, 'assistant', llmRes.content.trim());
          await updateRun(runId, {
            status: 'succeeded',
            finished_at: new Date().toISOString(),
            result_summary: llmRes.content.slice(0, 500),
            usage_prompt_tokens: promptTokens,
            usage_completion_tokens: completionTokens,
            usage_total_tokens: promptTokens + completionTokens,
            usage_cost_usd: Number(costUSD.toFixed(6)),
          });
          return;
        }
        await updateRun(runId, {
          status: 'failed',
          error: 'empty_response',
          finished_at: new Date().toISOString(),
        });
        return;
      }

      for (const tc of llmRes.toolCalls!) {
        const started = new Date();
        try {
          const args = JSON.parse(tc.arguments || '{}');
          const toolRes = await runToolByName(tc.name as any, args, {
            runId,
            projectId: run.project_id,
            userId: run.created_by ?? 'system',
          });

          await logTool(
            runId,
            step + 1,
            tc.name,
            args,
            toolRes.ok ? toolRes.result : null,
            started,
            toolRes.ok ? undefined : toolRes.error
          );

          await appendMessage(
            runId,
            'tool',
            JSON.stringify(toolRes.ok ? toolRes.result : { error: toolRes.error }),
            tc.name
          );
        } catch (err: any) {
          await logTool(runId, step + 1, tc.name, {}, null, started, err?.message ?? 'tool_error');
          await appendMessage(
            runId,
            'tool',
            JSON.stringify({ error: err?.message ?? 'tool_error' }),
            tc.name
          );
        }
      }

      step += 1;

      const { data: fresh } = await supabase
        .from('agent_runs')
        .select('status')
        .eq('id', runId)
        .single();

      if (fresh?.status === 'cancelled') return;
    }

    await updateRun(runId, {
      status: 'failed',
      error: 'max_steps_exceeded',
      finished_at: new Date().toISOString(),
      usage_prompt_tokens: promptTokens,
      usage_completion_tokens: completionTokens,
      usage_total_tokens: promptTokens + completionTokens,
      usage_cost_usd: Number(costUSD.toFixed(6)),
    });
  } catch (err: any) {
    await updateRun(runId, {
      status: 'failed',
      error: err?.message ?? 'executor_error',
      finished_at: new Date().toISOString(),
      usage_prompt_tokens: promptTokens,
      usage_completion_tokens: completionTokens,
      usage_total_tokens: promptTokens + completionTokens,
      usage_cost_usd: Number(costUSD.toFixed(6)),
    });
  }
}
