/**
 * Salary employee pay strategy
 */
export class SalaryStrategy {
  calculate(employee, period) {
    const monthlySalary = employee.monthlySalary || 0;
    const daysWorked = period.daysWorked !== undefined ? period.daysWorked : 22;

    if (daysWorked < 0 || daysWorked > 31) {
      throw new Error('Invalid days worked');
    }

    const basePay = (monthlySalary / 22) * daysWorked;
    return { grossPay: basePay, basePay, overtimePay: 0 };
  }
}
