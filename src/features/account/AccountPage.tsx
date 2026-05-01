import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAuth } from '../auth/AuthProvider';

export function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  return (
    <>
      <AppHeader title={t('account.title')} />
      <div className="space-y-4 px-4 py-4">
        <div className="rounded-2xl border border-ink-900/10 p-4">
          <div className="text-base font-semibold">
            {user?.displayName ?? '—'}
          </div>
          <div className="text-sm text-ink-900/60">{user?.email}</div>
        </div>
        <div className="rounded-2xl border border-ink-900/10">
          <label className="flex items-center justify-between border-b border-ink-900/5 px-4 py-3 text-sm">
            <span>{t('account.language')}</span>
            <select
              value={i18n.resolvedLanguage}
              onChange={(e) => void i18n.changeLanguage(e.target.value)}
              className="rounded-lg border border-ink-900/15 bg-white px-2 py-1"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{t('account.currency')}</span>
            <span className="text-ink-900/60">KRW ₩</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => void signOut()}
        >
          {t('auth.signOut')}
        </Button>
      </div>
    </>
  );
}
