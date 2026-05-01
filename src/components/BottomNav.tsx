import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

const tabs = [
  { to: '/items', icon: '🍱', key: 'nav.items' },
  { to: '/meals', icon: '🥗', key: 'nav.meals' },
  { to: '/reports', icon: '📊', key: 'nav.reports' },
  { to: '/account', icon: '👤', key: 'nav.account' },
] as const;

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-ink-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? 'text-ink-900' : 'text-ink-900/50'
            }`
          }
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span>{t(tab.key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
