import { describe, expect, it } from 'vitest';
import { formatKRW, roundKRW, unitPrice } from '../src/lib/money';

describe('money', () => {
  it('formats KRW without fractional digits', () => {
    expect(formatKRW(9000)).toMatch(/9,?000/);
  });

  it('rounds half away from zero on positive numbers', () => {
    expect(roundKRW(0.5)).toBe(1);
    expect(roundKRW(1.4)).toBe(1);
    expect(roundKRW(2.6)).toBe(3);
  });

  it('treats invalid totals as 0 unit price', () => {
    expect(unitPrice(1000, 0)).toBe(0);
    expect(unitPrice(NaN, 10)).toBe(0);
  });

  it('computes the egg example from the plan', () => {
    // 30 eggs for ₩9,000 → ₩300 / egg, 2 eggs share = ₩600.
    const up = unitPrice(9000, 30);
    expect(up).toBe(300);
    expect(roundKRW(up * 2)).toBe(600);
  });

  it('computes the butter (g) example from the plan', () => {
    // 200g butter for ₩5,000 → ₩25 / g, 30g share = ₩750.
    const up = unitPrice(5000, 200);
    expect(up).toBe(25);
    expect(roundKRW(up * 30)).toBe(750);
  });
});
