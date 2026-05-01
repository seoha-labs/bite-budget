import { useMemo } from 'react';
import { bucketKey, type Bucket } from '../../lib/date';
import type { Item } from '../items/items.types';
import type { Meal } from '../meals/meals.types';

export type ReportRow = {
  key: string;
  label: string;
  total: number;
  count: number;
};

type Range = { start: Date; end: Date };

function inRange(d: Date, range: Range): boolean {
  const t = d.getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

function bucketLabel(date: Date, bucket: Bucket, locale: string): string {
  switch (bucket) {
    case 'day':
      return date.toLocaleDateString(locale, {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      });
    case 'week':
      return bucketKey(date, 'week');
    case 'month':
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  }
}

export type ConsumptionReport = {
  total: number;
  rows: ReportRow[];
  topMeals: Meal[];
};

export type PurchaseReport = {
  total: number;
  rows: ReportRow[];
  topItems: Item[];
  itemCount: number;
};

export function useConsumptionReport(
  meals: Meal[],
  range: Range,
  bucket: Bucket,
  locale: string,
): ConsumptionReport {
  return useMemo(() => {
    const inWindow = meals.filter((m) => inRange(m.eatenAt.toDate(), range));
    const map = new Map<string, ReportRow>();
    for (const m of inWindow) {
      const d = m.eatenAt.toDate();
      const key = bucketKey(d, bucket);
      const existing = map.get(key);
      if (existing) {
        existing.total += m.totalCost;
        existing.count += 1;
      } else {
        map.set(key, {
          key,
          label: bucketLabel(d, bucket, locale),
          total: m.totalCost,
          count: 1,
        });
      }
    }
    const rows = Array.from(map.values()).sort((a, b) =>
      a.key < b.key ? 1 : a.key > b.key ? -1 : 0,
    );
    const total = rows.reduce((s, r) => s + r.total, 0);
    const topMeals = [...inWindow].sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);
    return { total, rows, topMeals };
  }, [meals, range, bucket, locale]);
}

export function usePurchaseReport(
  items: Item[],
  range: Range,
  bucket: Bucket,
  locale: string,
): PurchaseReport {
  return useMemo(() => {
    const inWindow = items.filter((it) =>
      inRange(it.purchaseDate.toDate(), range),
    );
    const map = new Map<string, ReportRow>();
    for (const it of inWindow) {
      const d = it.purchaseDate.toDate();
      const key = bucketKey(d, bucket);
      const existing = map.get(key);
      if (existing) {
        existing.total += it.totalPrice;
        existing.count += 1;
      } else {
        map.set(key, {
          key,
          label: bucketLabel(d, bucket, locale),
          total: it.totalPrice,
          count: 1,
        });
      }
    }
    const rows = Array.from(map.values()).sort((a, b) =>
      a.key < b.key ? 1 : a.key > b.key ? -1 : 0,
    );
    const total = rows.reduce((s, r) => s + r.total, 0);
    const topItems = [...inWindow].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, 3);
    return { total, rows, topItems, itemCount: inWindow.length };
  }, [items, range, bucket, locale]);
}
