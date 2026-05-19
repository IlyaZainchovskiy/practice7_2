import { generatePayrollReport, PayrollReportGenerator } from '../../src/report/payroll-report-generator.js';

describe('PayrollReportGenerator', () => {
  const result = {
    region: 'UA',
    grossPay: 1000,
    overtimePay: 0,
    bonus: 50,
    incomeTax: 180,
    socialTax: 220,
    totalTax: 400,
    netPay: 650,
    ytdGross: 5000,
  };
  const employee = { id: 'E1', name: 'Test User', type: 'hourly' };
  const period = { hoursWorked: 40 };

  test('includes required sections', () => {
    const report = generatePayrollReport(result, employee, period);
    expect(report).toContain('PAYROLL REPORT');
    expect(report).toContain('Test User');
    expect(report).toContain('NET PAY: $650.00');
    expect(report).toContain('Hours Worked: 40');
  });

  test('shows overtime line when present', () => {
    const withOt = { ...result, overtimePay: 100 };
    const report = generatePayrollReport(withOt, employee, period);
    expect(report).toContain('incl. Overtime');
  });

  test('PayrollReportGenerator class', () => {
    const gen = new PayrollReportGenerator();
    expect(gen.generate(result, employee, {})).toContain('END REPORT');
  });
});
