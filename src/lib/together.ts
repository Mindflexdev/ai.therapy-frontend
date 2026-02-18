// Together AI integration via Supabase Edge Function proxy
// The API key is stored server-side — never exposed to the client.

import { supabase } from './supabase';

// Default model: MiniMax-M2.5
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M2.5';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1024;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AgentConfig {
  name: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chatWithAgent(
  message: string,
  agent: AgentConfig,
  history: ChatMessage[] = []
): Promise<{ text: string; model: string }> {
  const messages: ChatMessage[] = [
    { role: 'system', content: agent.systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const model = agent.model || DEFAULT_MODEL;

  // Get the current session token for auth
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('User must be logged in to chat.');
  }

  // Call the Supabase Edge Function (proxies to Together AI)
  const { data, error } = await supabase.functions.invoke('together-proxy', {
    body: {
      model,
      messages,
      temperature: agent.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: agent.maxTokens ?? DEFAULT_MAX_TOKENS,
      top_p: 0.9,
    },
  });

  if (error) {
    console.error('Together proxy error:', error);
    throw new Error(`AI request failed: ${error.message}`);
  }

  const text = data?.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

  return {
    text: text.trim(),
    model: data?.model || model,
  };
}

// Test function - can call directly from browser console
export async function testAgent(agentName: string, message: string): Promise<void> {
  try {
    const { text } = await chatWithAgent(message, {
      name: agentName,
      systemPrompt: `You are ${agentName}, an AI mental health companion.`,
    });
    console.log(`${agentName} responds:`, text);
  } catch (err) {
    console.error('Test failed:', err);
  }
}
