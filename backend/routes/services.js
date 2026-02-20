const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Service routes - to be implemented' });
});

module.exports = router;
