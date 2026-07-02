require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const db = require('./db');
const { notifyOwner } = require('./push');
const { startReminderJob } = require('./cron/reminders');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pc-repair-site.onrender.com';

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
});

// --- Security middleware ---
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 }); // 120 req/min per IP, plenty for real users
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Real-time chat ---
// Each browser tab picks a conversation_id (uuid) and stores it in localStorage,
// so a returning visitor keeps their chat history. The owner joins the 'owner' room
// and receives every new message plus an unread badge count.
io.on('connection', (socket) => {
  socket.on('join', ({ conversationId, isOwner }) => {
    if (isOwner) {
      socket.join('owner');
    } else if (conversationId) {
      socket.join(conversationId);
    }
  });

  socket.on('customer-message', ({ conversationId, body }) => {
    if (!conversationId || !body || !body.trim()) return;
    const text = body.trim().slice(0, 2000);

    db.run(
      `INSERT INTO chat_messages (conversation_id, sender, body) VALUES (?, 'customer', ?)`,
      [conversationId, text],
      function (err) {
        if (err) return;
        const message = {
          id: this.lastID,
          conversation_id: conversationId,
          sender: 'customer',
          body: text,
          created_at: new Date().toISOString(),
        };
        io.to(conversationId).emit('new-message', message);
        io.to('owner').emit('new-message', message); // live badge + toast on the dashboard
        notifyOwner('New chat message', text, '/admin'); // phone push notification
      }
    );
  });

  socket.on('owner-message', ({ conversationId, body }) => {
    if (!conversationId || !body || !body.trim()) return;
    const text = body.trim().slice(0, 2000);

    db.run(
      `INSERT INTO chat_messages (conversation_id, sender, body) VALUES (?, 'owner', ?)`,
      [conversationId, text],
      function (err) {
        if (err) return;
        const message = {
          id: this.lastID,
          conversation_id: conversationId,
          sender: 'owner',
          body: text,
          created_at: new Date().toISOString(),
        };
        io.to(conversationId).emit('new-message', message);
        io.to('owner').emit('new-message', message);
      }
    );
  });
});

startReminderJob();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`PC Fix backend running on port ${PORT}`));
