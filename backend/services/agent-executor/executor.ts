import { createServiceClient } from '../../lib/supabase';
import { AgentConfig, ExecutionContext, RunResult, AgentMessage, ToolCall } from './types';
import { getTool } from './tools';

interface ExecutorOptions {
  runId: string;
  agentConfig: AgentConfig;
  input: string;
  context: ExecutionContext;
}

export async function executeAgentRun(options: ExecutorOptions): Promise<RunResult> {
  const { runId, agentConfig, input, context } = options;
  const supabase = createServiceClient();

  try {
    await supabase
      .from('agent_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', runId);

    let messages: AgentMessage[] = [
      { role: 'system', content: agentConfig.system_prompt },
      { role: 'user', content: input }
    ];

    await saveMessage(runId, 'user', input, 0);

    let stepCount = 0;
    let finalAnswer = '';

    while (stepCount < agentConfig.max_steps) {
      const response = await callLLM(agentConfig, messages);
      
      if (response.type === 'text') {
        finalAnswer = response.content;
        messages.push({ role: 'assistant', content: response.content });
        await saveMessage(runId, 'assistant', response.content, messages.length - 1);
        break;
      }

      if (response.type === 'tool_use') {
        const toolCallResults: string[] = [];

        for (const toolUse of response.tool_calls) {
          const tool = getTool(toolUse.name);
          if (!tool) {
            throw new Error(`Unknown tool: ${toolUse.name}`);
          }

          const toolCallStarted = new Date();
          let toolOutput;
          let toolStatus: 'ok' | 'error' = 'ok';
          let toolError: string | undefined;

          try {
            toolOutput = await tool.execute(toolUse.input, context);
          } catch (error) {
            toolStatus = 'error';
            toolError = error instanceof Error ? error.message : 'Unknown error';
            toolOutput = { error: toolError };
          }

          const toolCallFinished = new Date();

          await saveToolCall(runId, {
            tool_id: tool.id,
            tool_name: tool.name,
            input: toolUse.input,
            output: toolOutput,
            status: toolStatus,
            error: toolError,
            started_at: toolCallStarted,
            finished_at: toolCallFinished
          });

          const resultText = JSON.stringify(toolOutput);
          toolCallResults.push(`Tool ${tool.name}: ${resultText}`);
          messages.push({
            role: 'tool',
            content: resultText,
            tool_name: tool.name
          });
        }

        const assistantMsg = `[Used tools: ${response.tool_calls.map(t => t.name).join(', ')}]`;
        messages.push({ role: 'assistant', content: assistantMsg });
        await saveMessage(runId, 'assistant', assistantMsg, messages.length - 1);

        stepCount++;

        const shouldStop = await checkStopCondition(runId);
        if (shouldStop) {
          finalAnswer = 'Run was cancelled by user';
          break;
        }
      }
    }

    if (stepCount >= agentConfig.max_steps && !finalAnswer) {
      finalAnswer = 'Maximum steps reached without final answer';
    }

    await supabase
      .from('agent_runs')
      .update({
        status: 'succeeded',
        finished_at: new Date().toISOString(),
        result_summary: finalAnswer
      })
      .eq('id', runId);

    return {
      success: true,
      result_summary: finalAnswer
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await supabase
      .from('agent_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error: errorMessage
      })
      .eq('id', runId);

    return {
      success: false,
      error: errorMessage
    };
  }
}

async function callLLM(
  config: AgentConfig,
  messages: AgentMessage[]
): Promise<{ type: 'text'; content: string } | { type: 'tool_use'; tool_calls: Array<{ name: string; input: any }> }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map(m => ({
        role: m.role === 'tool' ? 'function' : m.role,
        content: m.content,
        name: m.tool_name
      })),
      temperature: config.temperature,
      tools: config.tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema
        }
      })),
      tool_choice: 'auto'
    })
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.statusText}`);
  }

  const data = await response.json();
  const choice = (data as any).choices[0];

  if (choice.message.tool_calls) {
    return {
      type: 'tool_use',
      tool_calls: choice.message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments)
      }))
    };
  }

  return {
    type: 'text',
    content: choice.message.content || ''
  };
}

async function saveMessage(runId: string, role: string, content: string, seq: number): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from('agent_messages').insert({
    run_id: runId,
    role,
    content,
    seq
  });
}

async function saveToolCall(runId: string, toolCall: ToolCall): Promise<void> {
  const supabase = createServiceClient();
  
  const { data: existingCalls } = await supabase
    .from('tool_calls')
    .select('seq')
    .eq('run_id', runId)
    .order('seq', { ascending: false })
    .limit(1);

  const nextSeq = existingCalls && existingCalls.length > 0 ? existingCalls[0].seq + 1 : 0;

  await supabase.from('tool_calls').insert({
    run_id: runId,
    tool_id: toolCall.tool_id,
    seq: nextSeq,
    input: toolCall.input,
    output: toolCall.output,
    status: toolCall.status,
    error: toolCall.error,
    started_at: toolCall.started_at.toISOString(),
    finished_at: toolCall.finished_at?.toISOString()
  });
}

async function checkStopCondition(runId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('agent_runs')
    .select('status')
    .eq('id', runId)
    .single();

  return data?.status === 'cancelled';
}
