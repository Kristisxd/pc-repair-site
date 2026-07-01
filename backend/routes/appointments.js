const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireOwner } = require('../middleware/auth');

const router = express.Router();

// Public: get already-taken time slots for a given date, so the calendar can grey them out
router.get('/availability/:date', (req, res) => {
  const { date } = req.params;
  db.all(
    `SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != 'cancelled'`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load availability.' });
      res.json({ taken: rows.map((r) => r.appointment_time) });
    }
  );
});

// Public: create a booking
router.post(
  '/',
  [
    body('customer_name').trim().isLength({ min: 2, max: 100 }),
    body('phone').trim().isLength({ min: 6, max: 30 }),
    body('email').optional({ checkFalsy: true }).isEmail(),
    body('appointment_date').isISO8601(),
    body('appointment_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('issue').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Check the booking details and try again.' });
    }

    const { customer_name, phone, email, appointment_date, appointment_time, issue } = req.body;

    db.get(
      `SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [appointment_date, appointment_time],
      (err, existing) => {
        if (err) return res.status(500).json({ error: 'Booking failed. Try again.' });
        if (existing) return res.status(409).json({ error: 'That time slot was just taken. Pick another.' });

        db.run(
          `INSERT INTO appointments (customer_name, phone, email, issue, appointment_date, appointment_time)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [customer_name, phone, email || null, issue || null, appointment_date, appointment_time],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ error: 'Booking failed. Try again.' });
            res.status(201).json({
              id: this.lastID,
              customer_name,
              appointment_date,
              appointment_time,
            });
          }
        );
      }
    );
  }
);

// Owner only: list all appointments
router.get('/', requireOwner, (req, res) => {
  db.all(`SELECT * FROM appointments ORDER BY appointment_date, appointment_time`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load appointments.' });
    res.json(rows);
  });
});

// Owner only: cancel / update status
router.patch('/:id/status', requireOwner, (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  db.run(`UPDATE appointments SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Update failed.' });
    res.json({ updated: this.changes > 0 });
  });
});

module.exports = router;
