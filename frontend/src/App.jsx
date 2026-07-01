import { useTranslation } from 'react-i18next';
import LanguageToggle from './components/LanguageToggle.jsx';
import BookingForm from './components/BookingForm.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function MarketingSite() {
  const { t } = useTranslation();

  const services = [
    { title: t('service1Title'), desc: t('service1Desc') },
    { title: t('service2Title'), desc: t('service2Desc') },
    { title: t('service3Title'), desc: t('service3Desc') },
    { title: t('service4Title'), desc: t('service4Desc') },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line sticky top-0 bg-bg/90 backdrop-blur z-30">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal" />
            <span className="font-mono font-bold tracking-tight text-sm md:text-base">{t('brand')}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#book" className="hidden sm:block text-sm text-off/80 hover:text-copper transition-colors">
              {t('navBook')}
            </a>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-5 pt-16 pb-16">
        <h1 className="font-mono text-3xl md:text-5xl font-bold mb-5 leading-tight">{t('heroTitle')}</h1>
        <p className="text-muted text-base md:text-lg max-w-xl mb-8">{t('heroSub')}</p>
        <a href="#book" className="inline-block bg-copper hover:bg-copperlight text-bg font-bold px-5 py-3 rounded-lg text-sm transition-colors">
          {t('ctaBook')}
        </a>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-16">
        <p className="text-xs uppercase tracking-wide text-muted font-mono mb-4">{t('servicesTitle')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div key={i} className="bg-panel border border-line rounded-xl p-5 hover:border-copper/50 transition-colors">
              <p className="font-semibold mb-1">{s.title}</p>
              <p className="text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="max-w-5xl mx-auto px-5 pb-24">
        <p className="text-xs uppercase tracking-wide text-muted font-mono mb-1">{t('bookingTitle')}</p>
        <p className="text-muted text-sm mb-4">{t('bookingSub')}</p>
        <BookingForm />
      </section>

      <ChatWidget />
    </div>
  );
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  return isAdmin ? <AdminDashboard /> : <MarketingSite />;
}
