/**
 * Pure bonus calculation logic.
 */
export function calculateBonus(grossPay, employee, period) {
  let bonus = 0;

  if (period.quarter === 4) {
    bonus += grossPay * 0.05;
  }

  if (period.year && employee.tenureYears >= 5) {
    bonus += employee.monthlySalary ? employee.monthlySalary * 0.1 : grossPay * 0.08;
  }

  if (period.performanceRating >= 4) {
    const perfMultiplier = period.performanceRating === 5 ? 0.15 : 0.08;
    bonus += grossPay * perfMultiplier;
  }

  return bonus;
}

export class BonusCalculator {
  calculate(grossPay, employee, period) {
    return calculateBonus(grossPay, employee, period);
  }
}
