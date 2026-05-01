export const UNITS = ['g', 'kg', 'ml', 'L', 'piece'] as const;

export type Unit = (typeof UNITS)[number];

export function isUnit(value: unknown): value is Unit {
  return typeof value === 'string' && (UNITS as readonly string[]).includes(value);
}

export function unitLabel(unit: Unit, locale: string): string {
  if (unit === 'piece') return locale.startsWith('ko') ? '개' : 'piece';
  return unit;
}
