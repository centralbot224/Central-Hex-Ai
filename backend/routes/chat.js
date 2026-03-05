const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getAIResponse, generateOptimizedPrompt } = require('../controllers/aiController');

// Validation middleware
const validateChat = [
  body('message').notEmpty().withMessage('Message requis').trim().escape(),
  body('userId').optional().isString(),
  body('conversationHistory').optional().isArray()
];

// Route principale de chat
router.post('/', validateChat, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await getAIResponse(req, res);
});

// Route d'optimisation de prompts
router.post('/optimize', [
  body('userRequest').notEmpty(),
  body('promptType').optional().isIn(['marketing', 'creative', 'technical', 'educational'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await generateOptimizedPrompt(req, res);
});

// Route pour récupérer l'historique
router.get('/history/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({ 
      userId: req.params.userId 
    })
    .sort({ lastUpdated: -1 })
    .limit(20)
    .select('title lastUpdated metadata.totalMessages');
    
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
