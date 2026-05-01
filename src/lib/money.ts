const krwFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

export function formatKRW(amount: number): string {
  if (!Number.isFinite(amount)) return krwFormatter.format(0);
  return krwFormatter.format(roundKRW(amount));
}

export function roundKRW(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount);
}

export function unitPrice(totalPrice: number, totalQuantity: number): number {
  if (!Number.isFinite(totalPrice) || !Number.isFinite(totalQuantity)) return 0;
  if (totalQuantity <= 0) return 0;
  return totalPrice / totalQuantity;
}
