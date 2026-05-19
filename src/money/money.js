/**
 * Cents-based money arithmetic to avoid float precision issues.
 */

export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

export function addCents(...amounts) {
  return amounts.reduce((sum, a) => sum + toCents(a), 0);
}

export function subtractCents(a, b) {
  return toCents(a) - toCents(b);
}

export function multiplyCents(amount, multiplier) {
  return Math.round(toCents(amount) * multiplier);
}

/**
 * Round dollars to 2 decimal places (legacy-compatible output).
 */
export function roundDollars(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

/**
 * Net pay from gross, tax, bonus using integer cents internally.
 */
export function calculateNetPayCents(grossPay, totalTax, bonus) {
  const netCents = toCents(grossPay) - toCents(totalTax) + toCents(bonus);
  return roundDollars(fromCents(netCents));
}
