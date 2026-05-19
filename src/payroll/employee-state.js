/**
 * Pure helpers for employee tracking (replaces in-place mutation in calculator).
 */

export function applyCalculationMetadata(employee) {
  return {
    ...employee,
    lastCalculated: new Date().toISOString(),
    calculationCount: (employee.calculationCount || 0) + 1,
  };
}

export function applyYtdTotals(employee, grossPay, totalTax) {
  return {
    ...employee,
    ytdGross: (employee.ytdGross || 0) + grossPay,
    ytdTax: (employee.ytdTax || 0) + totalTax,
  };
}
