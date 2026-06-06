import type { QuantityUnit } from '../types/bankGuarantee';

/**
 * Convert quantity between kg and quintal.
 * 1 quintal = 100 kg
 */
export function convertQuantity(valueInKg: number, targetUnit: QuantityUnit): number {
  if (targetUnit === 'quintal') {
    return Math.round((valueInKg / 100) * 100) / 100;
  }
  return Math.round(valueInKg * 100) / 100;
}

/**
 * Format quantity with unit label
 */
export function formatQuantity(valueInKg: number, unit: QuantityUnit): string {
  const converted = convertQuantity(valueInKg, unit);
  return `${converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}
