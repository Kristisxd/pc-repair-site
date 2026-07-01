# PC Fix — full site

A booking + live chat site for a PC repair business.

- **Backend:** Express, SQLite3, Socket.io, node-cron, web-push, JWT auth
- **Frontend:** React (Vite), Tailwind CSS, i18next (English / Lithuanian)

## What's included

- Public site: hero, services, appointment booking with a real calendar/time picker
- A chat bubble visitors use to ask quick questions, backed by real-time Socket.io messaging
- `/admin` dashboard (password-protected) where you see appointments, reply to chats live,
  and get an instant on-screen toast the moment someone messages you
- 24-hours-before appointment reminder emails, sent automatically by a cron job
- Phone notifications via Web Push when a new chat message arrives
- Security: hashed password (bcrypt), JWT sessions, rate limiting, Helmet security headers,
  input validation, parameterized SQL everywhere (no injection risk)

## 1. Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Generate your admin password hash:

```bash
node hash-password.js "yourRealPassword"
```

Paste the output into `ADMIN_PASSWORD_HASH` in `.env`. Set `ADMIN_EMAIL` to whatever you want to log in with.

**Reminder emails:** fill in `SMTP_*` with a real mailbox (a Gmail "app password" works well: Google Account → Security → App passwords).

**Phone notifications (free option, Web Push):**

```bash
npx web-push generate-vapid-keys
```

Copy the public/private key into `.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`). Also put the public key
in `frontend/.env` as `VITE_VAPID_PUBLIC_KEY=...`. Then, on your phone, open the site, go to `/admin`,
log in, and tap "Enable phone notifications" once. From then on any new chat message pushes a
notification straight to your phone's lock screen (works like a lightweight app — no app store needed).
This only works over HTTPS in production (not required on `localhost` during development).

**Phone notifications (paid, guaranteed SMS alternative):** if you'd rather get a real text message every
time regardless of whether your phone has the site open, sign up for Twilio, fill in the `TWILIO_*`
variables in `.env`, and swap the `notifyOwner()` call in `backend/server.js` for a Twilio `client.messages.create(...)`
call — a few lines, happy to add this for you if you want that route instead.

## 3. Run it

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Visit `http://localhost:5173` for the public site, and `http://localhost:5173/admin` to sign in as the owner.

## 4. Deploying for real

- Backend: any Node host works (Render, Railway, a small VPS). SQLite is a single file (`data.sqlite`) —
  fine for a one-location repair shop; back it up regularly.
- Frontend: `npm run build` in `frontend/`, then host the `dist/` folder anywhere static (Netlify, Vercel, Render).
- Set `FRONTEND_URL` in the backend `.env` to your real frontend domain, and `VITE_API_URL` in a
  `frontend/.env` to your real backend domain, so CORS and the chat/booking calls point to the right place.
- Web Push requires HTTPS in production — any of the hosts above give you that automatically.

## Notes on the language toggle

Every visible string lives in `frontend/src/locales/en.json` and `lt.json`. Add a key to both files and
reference it with `t('yourKey')` to extend the site with more content later.
