import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/AppHeader';
import { endOfDay, startOfDay } from '../../lib/date';
import { formatKRW } from '../../lib/money';
import { useAuth } from '../auth/AuthProvider';
import { MealCard } from './MealCard';
import { useMeals } from './useMeals';

export function MealsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [day, setDay] = useState<Date>(() => startOfDay(new Date()));

  const range = useMemo(
    () => ({ start: day, end: endOfDay(day) }),
    [day],
  );
  const { meals, loading } = useMeals(user?.uid ?? null, range);

  const dayTotal = meals.reduce((sum, m) => sum + m.totalCost, 0);

  function shiftDay(delta: number) {
    const next = new Date(day);
    next.setDate(next.getDate() + delta);
    setDay(startOfDay(next));
  }

  return (
    <>
      <AppHeader title={t('meals.title')} />
      <div className="border-b border-ink-900/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => shiftDay(-1)}
            className="rounded-full p-2 text-ink-900/60 hover:bg-ink-900/5"
            aria-label="prev"
          >
            ◀
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold">
              {day.toLocaleDateString(i18n.resolvedLanguage, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </div>
            <div className="mt-0.5 text-xs text-ink-900/60">
              {t('meals.dayTotal', { total: formatKRW(dayTotal) })}
            </div>
          </div>
          <button
            onClick={() => shiftDay(1)}
            className="rounded-full p-2 text-ink-900/60 hover:bg-ink-900/5"
            aria-label="next"
          >
            ▶
          </button>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="py-8 text-center text-ink-900/50">{t('common.loading')}</div>
        ) : meals.length === 0 ? (
          <div className="py-8 text-center text-ink-900/50">{t('meals.empty')}</div>
        ) : (
          meals.map((m) => <MealCard key={m.id} meal={m} />)
        )}
      </div>
      <Link
        to="/meals/new"
        className="fixed bottom-20 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-2xl text-ink-50 shadow-lg"
        aria-label={t('meals.addNew')}
      >
        ＋
      </Link>
    </>
  );
}
