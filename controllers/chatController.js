const Conversation = require('../models/Conversation');
const httpError = require('../utils/httpError');
const { addUserMessage, addAssistantReply } = require('../services/chatService');

exports.list = async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id })
    .select('title category updatedAt')
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  res.json({ conversations });
};

exports.get = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!conversation) throw httpError(404, 'Conversation not found');
  res.json({ conversation });
};

exports.remove = async (req, res) => {
  const result = await Conversation.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) throw httpError(404, 'Conversation not found');
  res.json({ ok: true });
};

exports.send = async (req, res) => {
  const { conversationId, content, category } = req.body;
  const convo = await addUserMessage({ user: req.user, conversationId, content, category });
  await addAssistantReply(convo, req.user);
  res.json({ conversation: convo });
};