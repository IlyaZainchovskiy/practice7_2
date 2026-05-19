/**
 * Payroll report formatting — presentation only.
 */
export function generatePayrollReport(result, employee, period) {
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

export class PayrollReportGenerator {
  generate(result, employee, period) {
    return generatePayrollReport(result, employee, period);
  }
}
