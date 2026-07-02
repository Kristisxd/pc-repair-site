import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getConversationId() {
  let id = localStorage.getItem('conversation_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('conversation_id', id);
  }
  return id;
}

export default function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [val, setVal] = useState('');
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const conversationId = useRef(getConversationId());

  useEffect(() => {
    const socket = io(API);
    socketRef.current = socket;
    socket.emit('join', { conversationId: conversationId.current, isOwner: false });
    socket.on('new-message', (m) => {
      if (m.conversation_id === conversationId.current) setMsgs((prev) => [...prev, m]);
    });

    fetch(`${API}/api/chat/history/${conversationId.current}`)
      .then((r) => r.json())
      .then(setMsgs)
      .catch(() => {});

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  const send = () => {
    if (!val.trim()) return;
    fetch(`${API}/api/chat/history/${conversationId.current}`)
      .then((r) => r.json())
      .then(setMsgs)
      .catch(() => {});
    socketRef.current.emit('customer-message', { conversationId: conversationId.current, body: val });
    setVal('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-80 bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: 380 }}>
          <div className="bg-panel2 border-b border-line px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold">{t('chatTitle')}</p>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-off text-lg leading-none">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={
                  'max-w-[80%] px-3 py-2 rounded-xl text-sm ' +
                  (m.sender === 'customer' ? 'bg-copper text-bg ml-auto rounded-br-sm' : 'bg-panel2 text-off rounded-bl-sm')
                }
              >
                {m.body}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-line p-2 flex gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t('chatPlaceholder')}
              className="flex-1 bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper"
            />
            <button onClick={send} className="bg-copper text-bg text-sm font-bold px-3 rounded-lg">
              {t('send')}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-copper hover:bg-copperlight text-bg flex items-center justify-center shadow-xl text-2xl font-bold"
      >
        {open ? '×' : '◉'}
      </button>
    </div>
  );
}
