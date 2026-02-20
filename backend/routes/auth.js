const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', AuthController.validateRegister, AuthController.register);

// Login user
router.post('/login', AuthController.validateLogin, AuthController.login);

// Get user profile (protected)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Update user profile (protected)
router.put('/profile', authenticateToken, AuthController.updateProfile);

// Change password (protected)
router.put('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;
