import { Navigate, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthProvider';
import { BottomNav } from './BottomNav';
import { InstallPrompt } from './InstallPrompt';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-ink-900/60">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto pb-2">
        <Outlet />
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
