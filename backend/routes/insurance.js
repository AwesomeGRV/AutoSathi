const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All insurance routes require authentication
router.use(authenticateToken);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Insurance routes - to be implemented' });
});

module.exports = router;
