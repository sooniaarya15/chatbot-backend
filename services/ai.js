const OpenAI = require('openai');

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 1 })
  : null;

const PROMPTS = {
  casual: 'You are a friendly, relaxed assistant. Keep answers conversational and concise.',
  professional: 'You are a professional assistant. Be precise, structured and formal.',
  creative: 'You are a creative assistant. Be imaginative, playful and vivid.',
};

async function generateReply(history, category = 'casual', botName = 'Assistant') {
  const start = Date.now();

  if (!client) {
    const last = history[history.length - 1]?.content || '';
    return {
      content: `[Demo mode: add OPENAI_API_KEY to backend/.env for real answers] You said: "${last}"`,
      latencyMs: Date.now() - start,
    };
  }

  const messages = [
    { role: 'system', content: `${PROMPTS[category] || PROMPTS.casual} Your name is ${botName}.` },
    ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  });

  return { content: res.choices[0].message.content, latencyMs: Date.now() - start };
}

module.exports = { generateReply };