const express = require('express');
const db = require('../db');
const { requireOwner } = require('../middleware/auth');

const router = express.Router();

// Owner only: delete every appointment and every chat message.
// Push subscriptions (your registered phone/devices) are left alone on purpose,
// so you don't have to re-enable notifications after clearing data.
router.delete('/clear-all', requireOwner, (req, res) => {
  db.serialize(() => {
    db.run(`DELETE FROM appointments`);
    db.run(`DELETE FROM chat_messages`, (err) => {
      if (err) return res.status(500).json({ error: 'Delete failed.' });
      res.json({ cleared: true });
    });
  });
});

module.exports = router;
