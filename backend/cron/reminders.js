const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../db');

function buildTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const transporter = buildTransport();

function startReminderJob() {
  // Runs every hour. Finds appointments happening in the next 23-25h window
  // that haven't had a reminder sent yet, and emails the customer.
  cron.schedule('0 * * * *', () => {
    const windowStart = new Date(Date.now() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(Date.now() + 25 * 60 * 60 * 1000);

    db.all(
      `SELECT * FROM appointments WHERE status = 'confirmed' AND reminder_sent = 0`,
      [],
      (err, rows) => {
        if (err) return;

        rows.forEach((appt) => {
          const apptDate = new Date(`${appt.appointment_date}T${appt.appointment_time}:00`);
          if (apptDate >= windowStart && apptDate <= windowEnd) {
            sendReminder(appt);
          }
        });
      }
    );
  });
}

function sendReminder(appt) {
  db.run(`UPDATE appointments SET reminder_sent = 1 WHERE id = ?`, [appt.id]);

  if (!transporter || !appt.email) return; // no email on file, or SMTP not configured

  transporter
    .sendMail({
      from: process.env.SMTP_FROM,
      to: appt.email,
      subject: 'Reminder: your PC repair appointment is tomorrow',
      text: `Hi ${appt.customer_name},\n\nThis is a reminder that your appointment is on ${appt.appointment_date} at ${appt.appointment_time}.\nReply to this email if you need to reschedule.\n\n- PC Fix`,
    })
    .catch(() => {
      // Reminder emails failing shouldn't crash the job; consider logging to a monitoring tool in production
    });
}

module.exports = { startReminderJob };
