const express = require('express');
const db = require('../db');
const { requireOwner } = require('../middleware/auth');

const router = express.Router();

// Public: a visitor loading the widget fetches their own past messages
router.get('/history/:conversationId', (req, res) => {
  db.all(
    `SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
    [req.params.conversationId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load chat history.' });
      res.json(rows);
    }
  );
});

// Owner only: list every open conversation, most recently active first
router.get('/conversations', requireOwner, (req, res) => {
  db.all(
    `SELECT conversation_id,
            MAX(created_at) as last_message_at,
            SUM(CASE WHEN sender = 'customer' AND read_by_owner = 0 THEN 1 ELSE 0 END) as unread
     FROM chat_messages
     GROUP BY conversation_id
     ORDER BY last_message_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load conversations.' });
      res.json(rows);
    }
  );
});

// Owner only: mark a conversation as read
router.post('/conversations/:id/read', requireOwner, (req, res) => {
  db.run(
    `UPDATE chat_messages SET read_by_owner = 1 WHERE conversation_id = ?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Update failed.' });
      res.json({ updated: this.changes });
    }
  );
});

// Owner only: permanently delete a whole conversation
router.delete('/conversations/:id', requireOwner, (req, res) => {
  db.run(`DELETE FROM chat_messages WHERE conversation_id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Delete failed.' });
    res.json({ deleted: this.changes });
  });
});

// Public: save a push subscription (so we can notify the owner's phone)
// In this single-owner setup any subscription registered from the admin dashboard is treated as "your phone".
router.post('/push-subscribe', (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription.' });

  db.run(
    `INSERT OR IGNORE INTO push_subscriptions (endpoint, subscription_json) VALUES (?, ?)`,
    [sub.endpoint, JSON.stringify(sub)],
    (err) => {
      if (err) return res.status(500).json({ error: 'Could not save subscription.' });
      res.status(201).json({ saved: true });
    }
  );
});

module.exports = router;
