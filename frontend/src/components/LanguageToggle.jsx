import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="flex items-center bg-panel2 border border-line rounded-full p-1 text-xs font-mono">
      {['en', 'lt'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={
            'px-3 py-1 rounded-full transition-colors ' +
            (i18n.language === l ? 'bg-copper text-bg font-bold' : 'text-muted hover:text-off')
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
