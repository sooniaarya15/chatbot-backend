const router = require('express').Router();
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const c = require('../controllers/chatController');

router.use(auth);
router.get('/conversations', asyncHandler(c.list));
router.get('/conversations/:id', asyncHandler(c.get));
router.delete('/conversations/:id', asyncHandler(c.remove));
router.post('/messages', asyncHandler(c.send));

module.exports = router;