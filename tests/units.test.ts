import { describe, expect, it } from 'vitest';
import { isUnit, unitLabel, UNITS } from '../src/lib/units';

describe('units', () => {
  it('lists the canonical units', () => {
    expect(UNITS).toEqual(['g', 'kg', 'ml', 'L', 'piece']);
  });

  it('detects valid units', () => {
    expect(isUnit('g')).toBe(true);
    expect(isUnit('foo')).toBe(false);
    expect(isUnit(undefined)).toBe(false);
  });

  it('localizes piece in Korean and keeps physical units identical', () => {
    expect(unitLabel('piece', 'ko')).toBe('개');
    expect(unitLabel('piece', 'en')).toBe('piece');
    expect(unitLabel('g', 'ko')).toBe('g');
  });
});
