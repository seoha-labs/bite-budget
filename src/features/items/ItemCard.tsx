import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatKRW } from '../../lib/money';
import { unitLabel } from '../../lib/units';
import type { Item } from './items.types';

export function ItemCard({ item }: { item: Item }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';
  const u = unitLabel(item.unit, locale);
  return (
    <Link
      to={`/items/${item.id}`}
      className="block rounded-2xl border border-ink-900/10 bg-white p-4 active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{item.name}</h3>
        <span className="text-sm font-semibold">{formatKRW(item.remainingValue)}</span>
      </div>
      <div className="mt-1 text-xs text-ink-900/60">
        {t('items.remaining', {
          remaining: item.remainingQuantity,
          total: item.totalQuantity,
          unit: u,
        })}
        {' · '}
        {formatKRW(item.unitPrice)}/{u}
      </div>
      <div className="mt-1 text-xs text-ink-900/40">
        {item.purchaseDate.toDate().toLocaleDateString(locale)}
      </div>
    </Link>
  );
}
