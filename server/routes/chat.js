const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getSessions, createSession, getSession,
  sendMessage, renameSession, deleteSession
} = require('../controllers/chatController');

// All chat routes are protected — must be logged in
router.use(authMiddleware);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/message', sendMessage);
router.patch('/sessions/:id/rename', renameSession);
router.delete('/sessions/:id', deleteSession);

module.exports = router;