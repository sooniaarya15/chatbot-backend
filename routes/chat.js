const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { generateReply } = require('../services/ai');

router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string') throw httpError(400, 'message is required');
    const ai = await generateReply([{ role: 'user', content: message }]);
    res.json({ reply: ai.content });
  })
);

module.exports = router;