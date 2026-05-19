/**
 * Employee Payroll Calculator (refactored)
 */
import { getPayStrategy } from './strategies/index.js';
import { TaxCalculator } from './tax/tax-calculator.js';
import { BonusCalculator } from './bonus/bonus-calculator.js';
import { applyCalculationMetadata, applyYtdTotals } from './payroll/employee-state.js';

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

  // float arithmetic — known precision issues
  const netPay = grossPay - totalTax + bonus;
  const roundedNet = Math.round(netPay * 100) / 100;

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

function generatePayrollReport(result, employee, period) {
  const lines = [];
  lines.push('=== PAYROLL REPORT ===');
  lines.push('Employee: ' + employee.name + ' (' + employee.id + ')');
  lines.push('Type: ' + employee.type.toUpperCase());
  lines.push('Region: ' + result.region);
  lines.push('--- Earnings ---');
  lines.push('Gross Pay: $' + result.grossPay.toFixed(2));
  if (result.overtimePay > 0) {
    lines.push('  incl. Overtime: $' + result.overtimePay.toFixed(2));
  }
  lines.push('Bonus: $' + result.bonus.toFixed(2));
  lines.push('--- Deductions ---');
  lines.push('Income Tax: $' + result.incomeTax.toFixed(2));
  lines.push('Social Tax: $' + result.socialTax.toFixed(2));
  lines.push('Total Tax: $' + result.totalTax.toFixed(2));
  lines.push('--- Net ---');
  lines.push('NET PAY: $' + result.netPay.toFixed(2));
  lines.push('YTD Gross: $' + result.ytdGross.toFixed(2));
  if (period.hoursWorked) {
    lines.push('Hours Worked: ' + period.hoursWorked);
  }
  lines.push('=== END REPORT ===');
  return lines.join('\n');
}

export default { calculatePayroll, resetGlobalStats, getGlobalStats };
