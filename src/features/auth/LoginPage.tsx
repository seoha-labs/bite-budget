import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { Button } from '../../components/Button';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useAuth } from './AuthProvider';

export function LoginPage() {
  const { t } = useTranslation();
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-ink-900/60">
        {t('auth.loading')}
      </div>
    );
  }

  if (user) return <Navigate to="/meals" replace />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between p-6">
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('app.name')}</h1>
        <p className="text-ink-900/60">🍳 {t('app.tagline')}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-end gap-3 self-stretch">
        <Button
          onClick={() => void signIn()}
          className="w-full max-w-xs"
        >
          G &nbsp; {t('auth.signInWithGoogle')}
        </Button>
        <LanguageToggle />
      </div>
    </div>
  );
}
