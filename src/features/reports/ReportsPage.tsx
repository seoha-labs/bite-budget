import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AppHeader } from '../../components/AppHeader';
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  type Bucket,
} from '../../lib/date';
import { formatKRW } from '../../lib/money';
import { useAuth } from '../auth/AuthProvider';
import { useItems } from '../items/useItems';
import { useMeals } from '../meals/useMeals';
import {
  useConsumptionReport,
  usePurchaseReport,
} from './useReport';

type Tab = 'consumption' | 'purchases';

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay() || 7;
  out.setDate(out.getDate() - (day - 1));
  return startOfDay(out);
}

function endOfWeek(d: Date): Date {
  const out = startOfWeek(d);
  out.setDate(out.getDate() + 6);
  return endOfDay(out);
}

export function ReportsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('consumption');
  const [bucket, setBucket] = useState<Bucket>('month');
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  const range = useMemo(() => {
    if (bucket === 'day') return { start: startOfDay(anchor), end: endOfDay(anchor) };
    if (bucket === 'week') return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }, [anchor, bucket]);

  // For consumption we need the meal range; for purchases we already pull all
  // items via the items snapshot and filter by purchaseDate locally.
  const { meals } = useMeals(user?.uid ?? null, range);
  const { items } = useItems(user?.uid ?? null);

  const consumption = useConsumptionReport(meals, range, bucket, locale);
  const purchases = usePurchaseReport(items, range, bucket, locale);

  function shift(delta: number) {
    const next = new Date(anchor);
    if (bucket === 'day') next.setDate(next.getDate() + delta);
    else if (bucket === 'week') next.setDate(next.getDate() + delta * 7);
    else next.setMonth(next.getMonth() + delta);
    setAnchor(next);
  }

  const anchorLabel = useMemo(() => {
    if (bucket === 'day')
      return anchor.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    if (bucket === 'week') {
      const s = startOfWeek(anchor);
      const e = endOfWeek(anchor);
      return `${s.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString(
        locale,
        { month: 'short', day: 'numeric' },
      )}`;
    }
    return anchor.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  }, [anchor, bucket, locale]);

  const summary =
    tab === 'consumption'
      ? {
          headline: t('reports.thisMonthConsumption'),
          total: consumption.total,
          subtitle: t('reports.averagePerDay', {
            defaultValue: '하루 평균',
          }),
          subtitleValue:
            bucket === 'month'
              ? formatKRW(consumption.total / Math.max(1, consumption.rows.length))
              : null,
          rows: consumption.rows,
          tops: consumption.topMeals.map((m) => ({
            id: m.id,
            title: `${m.eatenAt
              .toDate()
              .toLocaleDateString(locale, { month: 'numeric', day: 'numeric' })} ${t(
              `meals.labels.${m.label}`,
            )}`,
            value: m.totalCost,
            link: `/meals/${m.id}`,
          })),
          topsLabel: t('reports.topMeals'),
        }
      : {
          headline: t('reports.thisMonthPurchases'),
          total: purchases.total,
          subtitle: t('reports.itemsBoughtCount', { count: purchases.itemCount }),
          subtitleValue: null,
          rows: purchases.rows,
          tops: purchases.topItems.map((it) => ({
            id: it.id,
            title: it.name,
            value: it.totalPrice,
            link: `/items/${it.id}`,
          })),
          topsLabel: t('reports.topPurchases'),
        };

  return (
    <>
      <AppHeader title={t('reports.title')} />
      <div className="space-y-3 px-4 py-3">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-ink-900/10 text-sm">
          {(['consumption', 'purchases'] as Tab[]).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`py-2 ${
                tab === tk
                  ? 'bg-ink-900 text-ink-50'
                  : 'bg-white text-ink-900/60'
              }`}
            >
              {t(`reports.tabs.${tk}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as Bucket[]).map((bk) => (
            <button
              key={bk}
              onClick={() => setBucket(bk)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                bucket === bk
                  ? 'bg-ink-900 text-ink-50'
                  : 'bg-ink-900/5 text-ink-900/70'
              }`}
            >
              {t(`reports.buckets.${bk}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => shift(-1)}
            className="rounded-full p-2 text-ink-900/60 hover:bg-ink-900/5"
            aria-label="prev"
          >
            ◀
          </button>
          <div className="text-sm font-semibold">{anchorLabel}</div>
          <button
            onClick={() => shift(1)}
            className="rounded-full p-2 text-ink-900/60 hover:bg-ink-900/5"
            aria-label="next"
          >
            ▶
          </button>
        </div>
        <section className="rounded-2xl bg-ink-900 px-5 py-4 text-ink-50">
          <div className="text-xs text-ink-50/70">{summary.headline}</div>
          <div className="mt-1 text-2xl font-bold">{formatKRW(summary.total)}</div>
          {summary.subtitleValue && (
            <div className="mt-2 text-xs text-ink-50/70">
              {summary.subtitle} {summary.subtitleValue}
            </div>
          )}
          {summary.subtitleValue === null && summary.subtitle && (
            <div className="mt-2 text-xs text-ink-50/70">{summary.subtitle}</div>
          )}
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold">📅 {t('reports.byDay')}</h2>
          {summary.rows.length === 0 ? (
            <div className="rounded-xl bg-ink-900/5 px-3 py-6 text-center text-sm text-ink-900/50">
              {t('reports.empty')}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-900/10">
              {summary.rows.map((r) => (
                <div
                  key={r.key}
                  className="flex items-baseline justify-between border-b border-ink-900/5 px-3 py-2 last:border-b-0"
                >
                  <span className="text-sm">{r.label}</span>
                  <span className="text-sm font-medium">{formatKRW(r.total)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        {summary.tops.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">🏆 {summary.topsLabel}</h2>
            <div className="overflow-hidden rounded-xl border border-ink-900/10">
              {summary.tops.map((row, idx) => (
                <Link
                  key={row.id}
                  to={row.link}
                  className="flex items-baseline justify-between border-b border-ink-900/5 px-3 py-2 text-sm last:border-b-0 hover:bg-ink-900/5"
                >
                  <span>
                    {idx + 1}. {row.title}
                  </span>
                  <span className="font-medium">{formatKRW(row.value)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
