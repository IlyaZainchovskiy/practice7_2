/**
 * Employee Payroll Calculator (refactored)
 */
import { getPayStrategy } from './strategies/index.js';
import { TaxCalculator } from './tax/tax-calculator.js';
import { BonusCalculator } from './bonus/bonus-calculator.js';
import { applyCalculationMetadata, applyYtdTotals } from './payroll/employee-state.js';
import { generatePayrollReport } from './report/payroll-report-generator.js';
import { calculateNetPayCents } from './money/money.js';

const taxCalculator = new TaxCalculator();
const bonusCalculator = new BonusCalculator();

let globalPayrollStats = {
  totalProcessed: 0,
  lastEmployeeId: null,
};

export function resetGlobalStats() {
  globalPayrollStats = { totalProcessed: 0, lastEmployeeId: null };
}

export function getGlobalStats() {
  return globalPayrollStats;
}

/**
 * Main payroll calculation — everything in one place
 * @param {Object} employee
 * @param {Object} period - { hoursWorked, isWeekend, quarter, year, performanceRating }
 * @param {string} region - 'UA' | 'US' | 'EU'
 */
export function calculatePayroll(employee, period, region = 'UA') {
  if (!employee || !employee.type) {
    throw new Error('Invalid employee');
  }

  Object.assign(employee, applyCalculationMetadata(employee));

  globalPayrollStats.totalProcessed += 1;
  globalPayrollStats.lastEmployeeId = employee.id;

  const strategy = getPayStrategy(employee.type);
  const { grossPay, basePay, overtimePay } = strategy.calculate(employee, period);

  const { incomeTax, socialTax, totalTax } = taxCalculator.calculate(grossPay, region);

  const bonus = bonusCalculator.calculate(grossPay, employee, period);

  const roundedNet = calculateNetPayCents(grossPay, totalTax, bonus);

  Object.assign(employee, applyYtdTotals(employee, grossPay, totalTax));

  const result = {
    employeeId: employee.id,
    employeeName: employee.name,
    type: employee.type,
    region,
    grossPay,
    basePay,
    overtimePay,
    incomeTax,
    socialTax,
    totalTax,
    bonus,
    netPay: roundedNet,
    ytdGross: employee.ytdGross,
    ytdTax: employee.ytdTax,
  };

  // REPORT mixed with calculation
  result.report = generatePayrollReport(result, employee, period);

  return result;
}

export default { calculatePayroll, resetGlobalStats, getGlobalStats };
