import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatWidget from '../components/ChatWidget.jsx';

export default function MarketingSite() {
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal" />
            <span className="font-mono font-bold tracking-tight text-sm md:text-base">{t('brand')}</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#book" className="hidden sm:block text-sm text-off/80 hover:text-copper transition-colors">
              {t('navBook')}
            </a>
            <a href="#contact" className="hidden sm:block text-sm text-off/80 hover:text-copper transition-colors">
              {t('contactTitle')}
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

      <section id="contact" className="max-w-5xl mx-auto px-5 pb-16">
        <p className="text-xs uppercase tracking-wide text-muted font-mono mb-4">{t('contactTitle')}</p>
        <div className="bg-panel border border-line rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted text-xs font-mono uppercase mb-1">Address</p>
              <p>{t('contactAddress')}</p>
            </div>
            <div>
              <p className="text-muted text-xs font-mono uppercase mb-1">Phone</p>
              <a href={`tel:${t('contactPhone').replace(/\s/g, '')}`} className="hover:text-copper transition-colors">
                {t('contactPhone')}
              </a>
            </div>
            <div>
              <p className="text-muted text-xs font-mono uppercase mb-1">Email</p>
              <a href={`mailto:${t('contactEmail')}`} className="hover:text-copper transition-colors">
                {t('contactEmail')}
              </a>
            </div>
            <div>
              <p className="text-muted text-xs font-mono uppercase mb-1">Hours</p>
              <p>{t('contactHours')}</p>
            </div>
          </div>
          <iframe
            title="map"
            className="w-full h-48 sm:h-full rounded-xl border border-line"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(t('contactAddress'))}&output=embed`}
          />
        </div>
      </section>

      <footer className="border-t border-line py-6">
        <p className="text-center text-xs text-muted font-mono">{t('brand')} · {t('contactAddress')}</p>
      </footer>

      <ChatWidget />
    </div>
  );
}
