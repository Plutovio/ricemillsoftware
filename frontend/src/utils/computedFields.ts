/**
 * Compute PDC = (2/3) x Amount of BG, rounded to 2 decimal places
 */
export function computePDC(amountOfBG: number): number {
  if (!amountOfBG || isNaN(amountOfBG)) return 0;
  return Math.round((2 / 3) * amountOfBG * 100) / 100;
}

/**
 * Compute Total Amount = Amount of BG + PDC
 */
export function computeTotalAmount(amountOfBG: number): number {
  const pdc = computePDC(amountOfBG);
  return Math.round((amountOfBG + pdc) * 100) / 100;
}

/**
 * Compute Quantity = Total Amount / 2500 (in kg)
 */
export function computeQuantity(amountOfBG: number): number {
  const totalAmount = computeTotalAmount(amountOfBG);
  return Math.round((totalAmount / 2500) * 100) / 100;
}

/**
 * Compute number of days between two dates
 */
export function computeNoOfDays(issueDate: string, expiryDate: string): number {
  if (!issueDate || !expiryDate) return 0;
  const issue = new Date(issueDate);
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - issue.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
