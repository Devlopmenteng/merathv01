import type { FractionData } from '../engine/types';

export function formatFraction(fraction: FractionData | undefined | null): string {
  if (!fraction) return '';
  return `${fraction.numerator}/${fraction.denominator}`;
}
