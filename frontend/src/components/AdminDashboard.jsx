import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed.');
      localStorage.setItem('owner_token', data.token);
      onLoggedIn(data.token);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 bg-panel border border-line rounded-2xl p-6">
      <p className="font-mono text-sm text-muted mb-4">owner sign-in</p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper mb-3"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper mb-3"
      />
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button onClick={submit} className="w-full bg-copper text-bg font-bold py-2.5 rounded-lg text-sm">
        Sign in
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('owner_token') || '');
  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [val, setVal] = useState('');
  const [toasts, setToasts] = useState([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const socketRef = useRef(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadAppointments = () => {
    fetch(`${API}/api/appointments`, { headers: authHeaders })
      .then((r) => r.json())
      .then(setAppointments)
      .catch(() => {});
  };

  const loadConversations = () => {
    fetch(`${API}/api/chat/conversations`, { headers: authHeaders })
      .then((r) => r.json())
      .then(setConversations)
      .catch(() => {});
  };

  useEffect(() => {
    if (!token) return;
    loadAppointments();
    loadConversations();

    const socket = io(API);
    socketRef.current = socket;
    socket.emit('join', { isOwner: true });
    socket.on('new-message', (m) => {
      loadConversations();
      if (active === m.conversation_id) setMsgs((prev) => [...prev, m]);
      if (m.sender === 'customer') {
        setToasts((prev) => [{ id: m.id, body: m.body }, ...prev].slice(0, 4));
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== m.id)), 6000);
      }
    });
    return () => socket.disconnect();
  }, [token]);

  const openConversation = (id) => {
    setActive(id);
    fetch(`${API}/api/chat/history/${id}`)
      .then((r) => r.json())
      .then(setMsgs);
    fetch(`${API}/api/chat/conversations/${id}/read`, { method: 'POST', headers: authHeaders }).then(loadConversations);
  };

  const reply = () => {
    if (!val.trim() || !active) return;
    socketRef.current.emit('owner-message', { conversationId: active, body: val });
    setVal('');
  };

  const enablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch(`${API}/api/chat/push-subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      setPushEnabled(true);
    } catch (e) {
      alert('Could not enable phone notifications: ' + e.message);
    }
  };

  if (!token) return <Login onLoggedIn={setToken} />;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((tt) => (
          <div key={tt.id} className="bg-panel border border-teal/50 rounded-lg px-4 py-3 shadow-xl w-72">
            <p className="text-xs font-mono text-teal mb-1">New chat message</p>
            <p className="text-sm">{tt.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-xl font-bold">Owner dashboard</h1>
        {!pushEnabled && (
          <button onClick={enablePush} className="text-xs font-mono border border-line rounded-lg px-3 py-2 hover:border-copper">
            Enable phone notifications
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted font-mono mb-3">Upcoming appointments</p>
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="bg-panel border border-line rounded-xl p-3 text-sm">
                <p className="font-semibold">
                  {a.appointment_date} {a.appointment_time} — {a.customer_name}
                </p>
                <p className="text-muted">{a.phone}{a.issue ? ` · ${a.issue}` : ''}</p>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-muted text-sm">No appointments yet.</p>}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted font-mono mb-3">Conversations</p>
          <div className="flex gap-4">
            <div className="w-1/3 space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.conversation_id}
                  onClick={() => openConversation(c.conversation_id)}
                  className={
                    'w-full text-left px-2 py-2 rounded-lg text-xs font-mono border ' +
                    (active === c.conversation_id ? 'border-copper bg-panel2' : 'border-line')
                  }
                >
                  {c.conversation_id.slice(0, 6)}
                  {c.unread > 0 && <span className="ml-1 text-copper">●{c.unread}</span>}
                </button>
              ))}
            </div>
            <div className="flex-1 bg-panel border border-line rounded-xl p-3 flex flex-col" style={{ height: 320 }}>
              <div className="flex-1 overflow-y-auto space-y-2">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={
                      'max-w-[85%] px-3 py-2 rounded-xl text-sm ' +
                      (m.sender === 'owner' ? 'bg-copper text-bg ml-auto rounded-br-sm' : 'bg-panel2 rounded-bl-sm')
                    }
                  >
                    {m.body}
                  </div>
                ))}
              </div>
              {active && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && reply()}
                    className="flex-1 bg-panel2 border border-line rounded-lg px-2 py-1.5 text-sm outline-none focus:border-copper"
                  />
                  <button onClick={reply} className="bg-copper text-bg text-xs font-bold px-3 rounded-lg">
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
