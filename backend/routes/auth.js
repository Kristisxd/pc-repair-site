const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Slow down brute-force attempts on the login form
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

router.post(
  '/login',
  loginLimiter,
  [body('email').isEmail(), body('password').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Enter a valid email and password.' });
    }

    const { email, password } = req.body;

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
    if (!ok) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = jwt.sign({ role: 'owner', email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  }
);

module.exports = router;
