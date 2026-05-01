import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'ko' ? 'en' : 'ko';
  return (
    <button
      onClick={() => void i18n.changeLanguage(next)}
      className="rounded-full px-3 py-1.5 text-xs text-ink-900/70 hover:bg-ink-900/5"
    >
      {i18n.resolvedLanguage === 'ko' ? '한국어 / English' : 'EN / 한국어'}
    </button>
  );
}
