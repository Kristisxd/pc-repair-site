const jwt = require('jsonwebtoken');

function requireOwner(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not signed in.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'owner') throw new Error('wrong role');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Sign in again.' });
  }
}

module.exports = { requireOwner };
