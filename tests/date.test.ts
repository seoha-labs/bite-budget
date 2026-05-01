import { describe, expect, it } from 'vitest';
import {
  bucketKey,
  dayKey,
  endOfDay,
  endOfMonth,
  monthKey,
  startOfDay,
  startOfMonth,
  weekKey,
} from '../src/lib/date';

describe('date helpers', () => {
  it('produces YYYY-MM-DD day keys in local time', () => {
    expect(dayKey(new Date(2026, 4, 1, 23, 30))).toBe('2026-05-01');
  });

  it('produces YYYY-MM month keys', () => {
    expect(monthKey(new Date(2026, 4, 15))).toBe('2026-05');
  });

  it('produces ISO-style week keys', () => {
    // 2026-01-05 is a Monday, week 02 of 2026.
    expect(weekKey(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-W02');
  });

  it('routes bucketKey by bucket type', () => {
    const d = new Date(2026, 4, 1, 12, 0, 0);
    expect(bucketKey(d, 'day')).toBe('2026-05-01');
    expect(bucketKey(d, 'month')).toBe('2026-05');
  });

  it('startOfDay/endOfDay span the same calendar day', () => {
    const d = new Date(2026, 4, 1, 13, 14, 15, 999);
    const s = startOfDay(d);
    const e = endOfDay(d);
    expect(s.getDate()).toBe(1);
    expect(s.getHours()).toBe(0);
    expect(e.getHours()).toBe(23);
  });

  it('startOfMonth/endOfMonth bound the same month', () => {
    const d = new Date(2026, 4, 15);
    const s = startOfMonth(d);
    const e = endOfMonth(d);
    expect(s.getDate()).toBe(1);
    expect(e.getMonth()).toBe(4);
    expect(e.getDate()).toBe(31);
  });
});
