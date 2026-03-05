const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { generateImage } = require('../controllers/imageController');

const validateImage = [
  body('prompt').notEmpty().withMessage('Prompt requis'),
  body('size').optional().isIn(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']),
  body('quality').optional().isIn(['standard', 'hd'])
];

router.post('/generate', validateImage, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await generateImage(req, res);
});

module.exports = router;
