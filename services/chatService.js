const Conversation = require('../models/Conversation');
const { generateReply } = require('./ai');
const httpError = require('../utils/httpError');

const CATEGORIES = ['casual', 'professional', 'creative'];

async function addUserMessage({ user, conversationId, content, category }) {
  if (typeof content !== 'string' || !content.trim()) throw httpError(400, 'Message is required');
  if (content.length > 4000) throw httpError(400, 'Message too long (max 4000 characters)');

  let convo;
  if (conversationId) {
    convo = await Conversation.findOne({ _id: conversationId, user: user._id });
    if (!convo) throw httpError(404, 'Conversation not found');
  } else {
    convo = new Conversation({
      user: user._id,
      title: content.trim().slice(0, 40),
      category: CATEGORIES.includes(category) ? category : user.settings.category,
    });
  }
  convo.messages.push({ role: 'user', content: content.trim() });
  await convo.save();
  return convo;
}

async function addAssistantReply(convo, user) {
  let ai;
  try {
    ai = await generateReply(convo.messages, convo.category, user.settings.botName);
  } catch (err) {
    console.error('AI error:', err.message);
    throw httpError(502, 'The AI service is unavailable right now. Please try again.');
  }
  convo.messages.push({ role: 'assistant', content: ai.content, latencyMs: ai.latencyMs });
  await convo.save();
  return convo;
}

module.exports = { addUserMessage, addAssistantReply };