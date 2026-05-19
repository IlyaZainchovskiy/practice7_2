/**
 * Employee Payroll Calculator (refactored)
 */
import { getPayStrategy } from './strategies/index.js';

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

  // mutate input — side effect!
  employee.lastCalculated = new Date().toISOString();
  employee.calculationCount = (employee.calculationCount || 0) + 1;

  globalPayrollStats.totalProcessed += 1;
  globalPayrollStats.lastEmployeeId = employee.id;

  const strategy = getPayStrategy(employee.type);
  const { grossPay, basePay, overtimePay } = strategy.calculate(employee, period);

  // --- TAX LOGIC hardcoded inline ---
  let taxRate = 0.18;
  let socialContribution = 0.22;
  let deductionThreshold = 10000;

  if (region === 'US') {
    taxRate = 0.22;
    socialContribution = 0.0765;
    deductionThreshold = 15000;
  } else if (region === 'EU') {
    taxRate = 0.25;
    socialContribution = 0.20;
    deductionThreshold = 12000;
  }

  let taxableIncome = grossPay;
  if (grossPay > deductionThreshold) {
    taxableIncome = grossPay - deductionThreshold * 0.1;
  }

  const incomeTax = taxableIncome * taxRate;
  const socialTax = grossPay * socialContribution;
  let totalTax = incomeTax + socialTax;

  // --- BONUS LOGIC inline ---
  let bonus = 0;

  if (period.quarter === 4) {
    // quarterly bonus — 5% of gross
    bonus += grossPay * 0.05;
  }

  if (period.year && employee.tenureYears >= 5) {
    // yearly loyalty bonus
    bonus += employee.monthlySalary ? employee.monthlySalary * 0.1 : grossPay * 0.08;
  }

  if (period.performanceRating >= 4) {
    // performance bonus
    const perfMultiplier = period.performanceRating === 5 ? 0.15 : 0.08;
    bonus += grossPay * perfMultiplier;
  }

  // float arithmetic — known precision issues
  const netPay = grossPay - totalTax + bonus;
  const roundedNet = Math.round(netPay * 100) / 100;

  // mutate employee again
  employee.ytdGross = (employee.ytdGross || 0) + grossPay;
  employee.ytdTax = (employee.ytdTax || 0) + totalTax;

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
