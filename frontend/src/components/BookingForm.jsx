import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const ALL_TIMES = ['09:00', '10:30', '13:00', '15:30', '17:00'];

function nextDays(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

export default function BookingForm() {
  const { t } = useTranslation();
  const days = nextDays(7);

  const [date, setDate] = useState(null);
  const [taken, setTaken] = useState([]);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ customer_name: '', phone: '', email: '', issue: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!date) return;
    const iso = date.toISOString().slice(0, 10);
    fetch(`${API}/api/appointments/availability/${iso}`)
      .then((r) => r.json())
      .then((d) => setTaken(d.taken || []))
      .catch(() => setTaken([]));
  }, [date]);

  const submit = async () => {
    setError('');
    if (!form.customer_name || !form.phone) {
      setError('Add your name and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          appointment_date: date.toISOString().slice(0, 10),
          appointment_time: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed.');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="bg-panel border border-line rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-teal mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <span className="font-mono text-sm">{t('booked')}</span>
        </div>
        <p className="text-lg">
          {result.appointment_date}, {result.appointment_time} — {result.customer_name}
        </p>
        <p className="text-sm text-muted mt-2">
          You'll get a reminder the day before{form.email ? ' by email' : ''}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted font-mono mb-3">{t('chooseDate')}</p>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => {
            const iso = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            const selected = date && date.toISOString().slice(0, 10) === iso;
            return (
              <button
                key={iso}
                onClick={() => {
                  setDate(d);
                  setTime(null);
                }}
                className={
                  'px-4 py-2 rounded-lg border text-sm font-mono transition-colors ' +
                  (selected ? 'bg-copper border-copper text-bg font-bold' : 'border-line hover:border-copper/60')
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-muted font-mono mb-3">{t('chooseTime')}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_TIMES.map((tm) => {
              const isTaken = taken.includes(tm);
              return (
                <button
                  key={tm}
                  disabled={isTaken}
                  onClick={() => setTime(tm)}
                  className={
                    'px-4 py-2 rounded-lg border text-sm font-mono transition-colors ' +
                    (isTaken
                      ? 'border-line text-muted/40 cursor-not-allowed line-through'
                      : time === tm
                      ? 'bg-copper border-copper text-bg font-bold'
                      : 'border-line hover:border-copper/60')
                  }
                >
                  {tm}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {date && time && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted font-mono mb-3">{t('yourDetails')}</p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              placeholder={t('name')}
              className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t('phone')}
              className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper"
            />
          </div>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t('email')}
            className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper mb-3"
          />
          <textarea
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            placeholder={t('issue')}
            rows="2"
            className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-copper mb-3"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-copper hover:bg-copperlight disabled:opacity-60 text-bg font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {t('confirm')}
          </button>
        </div>
      )}
    </div>
  );
}
