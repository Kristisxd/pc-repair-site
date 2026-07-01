const webpush = require('web-push');
const db = require('./db');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:you@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Sends a push notification to every device the owner has registered
// (open the site on your phone once, tap "enable notifications", done).
function notifyOwner(title, body, url = '/') {
  if (!process.env.VAPID_PUBLIC_KEY) return; // push not configured yet

  db.all(`SELECT subscription_json FROM push_subscriptions`, [], (err, rows) => {
    if (err || !rows.length) return;

    const payload = JSON.stringify({ title, body, url });

    rows.forEach((row) => {
      const subscription = JSON.parse(row.subscription_json);
      webpush.sendNotification(subscription, payload).catch((sendErr) => {
        // 410/404 means the subscription is dead (browser data cleared, etc) - clean it up
        if (sendErr.statusCode === 410 || sendErr.statusCode === 404) {
          db.run(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [subscription.endpoint]);
        }
      });
    });
  });
}

module.exports = { notifyOwner };
