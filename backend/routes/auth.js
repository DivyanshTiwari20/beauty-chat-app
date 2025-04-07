const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/auth');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// Export the router
module.exports = router; // ✅ Correct