import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatKRW } from '../../lib/money';
import type { Meal } from './meals.types';

export function MealCard({ meal }: { meal: Meal }) {
  const { t, i18n } = useTranslation();
  const time = meal.eatenAt
    .toDate()
    .toLocaleTimeString(i18n.resolvedLanguage, { hour: '2-digit', minute: '2-digit' });
  return (
    <Link
      to={`/meals/${meal.id}`}
      className="block border-b border-ink-900/5 px-4 py-3 active:bg-ink-900/5"
    >
      <div className="flex items-baseline justify-between">
        <div className="text-sm">
          <span className="font-semibold">{t(`meals.labels.${meal.label}`)}</span>
          <span className="ml-2 text-ink-900/50">· {time}</span>
        </div>
        <span className="font-semibold">{formatKRW(meal.totalCost)}</span>
      </div>
      {meal.consumptions.length > 0 && (
        <div className="mt-1 truncate text-xs text-ink-900/60">
          {meal.consumptions
            .map((c) => `${c.itemNameSnapshot} ${c.consumedQuantity}${c.unitSnapshot}`)
            .join('  ·  ')}
        </div>
      )}
    </Link>
  );
}
