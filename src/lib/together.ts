// Direct Together AI integration for chat
// Bypasses n8n for simpler debugging and faster iteration

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Read from env or use hardcoded
const TOGETHER_API_KEY = process.env.EXPO_PUBLIC_TOGETHER_API_KEY || '';

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

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: agent.model || 'moonshotai/Kimi-K2.5',
      messages,
      temperature: agent.temperature ?? 0.7,
      max_tokens: agent.maxTokens ?? 1024,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Together AI error:', error);
    throw new Error(`Together AI returned ${response.status}: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
  
  return {
    text: text.trim(),
    model: data.model || 'moonshotai/Kimi-K2.5',
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
