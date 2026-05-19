/**
 * Shared characterization cases — run against any payroll module with same API.
 */
export function registerCharacterizationSuite(label, { calculatePayroll, resetGlobalStats, getGlobalStats }) {
  describe(`Characterization: Employee Payroll Calculator (${label})`, () => {
    beforeEach(() => {
      resetGlobalStats();
    });

    test('hourly: standard 40 hours, no overtime', () => {
      const emp = { id: 'H1', name: 'Anna', type: 'hourly', hourlyRate: 25 };
      const result = calculatePayroll(emp, { hoursWorked: 40, performanceRating: 1 }, 'UA');

      expect(result.grossPay).toBe(1000);
      expect(result.basePay).toBe(1000);
      expect(result.overtimePay).toBe(0);
      expect(result.netPay).toBeCloseTo(1000 - result.totalTax, 2);
    });

    test('hourly: overtime beyond 40 hours (weekday 1.5x)', () => {
      const emp = { id: 'H2', name: 'Bob', type: 'hourly', hourlyRate: 20 };
      const result = calculatePayroll(emp, { hoursWorked: 45, performanceRating: 1 }, 'UA');

      expect(result.basePay).toBe(800);
      expect(result.overtimePay).toBe(150);
      expect(result.grossPay).toBe(950);
    });

    test('hourly: weekend overtime uses 2.0x multiplier', () => {
      const emp = { id: 'H3', name: 'Carl', type: 'hourly', hourlyRate: 30 };
      const result = calculatePayroll(
        emp,
        { hoursWorked: 44, isWeekend: true, performanceRating: 1 },
        'UA'
      );

      expect(result.overtimePay).toBe(240);
      expect(result.grossPay).toBe(1440);
    });

    test('hourly: negative hours throws', () => {
      const emp = { id: 'H4', name: 'Dan', type: 'hourly', hourlyRate: 15 };
      expect(() => calculatePayroll(emp, { hoursWorked: -1 }, 'UA')).toThrow('Invalid hours');
    });

    test('salary: full month default 22 days', () => {
      const emp = { id: 'S1', name: 'Eve', type: 'salary', monthlySalary: 4400 };
      const result = calculatePayroll(emp, { performanceRating: 1 }, 'UA');

      expect(result.grossPay).toBe(4400);
      expect(result.basePay).toBe(4400);
    });

    test('salary: prorated partial month', () => {
      const emp = { id: 'S2', name: 'Frank', type: 'salary', monthlySalary: 2200 };
      const result = calculatePayroll(emp, { daysWorked: 11, performanceRating: 1 }, 'UA');

      expect(result.grossPay).toBe(1100);
    });

    test('salary: invalid days throws', () => {
      const emp = { id: 'S3', name: 'Grace', type: 'salary', monthlySalary: 3000 };
      expect(() => calculatePayroll(emp, { daysWorked: 32 }, 'UA')).toThrow('Invalid days worked');
    });

    test('contract: partial milestones', () => {
      const emp = {
        id: 'C1',
        name: 'Henry',
        type: 'contract',
        contractAmount: 10000,
        totalMilestones: 4,
      };
      const result = calculatePayroll(emp, { milestonesCompleted: 2, performanceRating: 1 }, 'UA');

      expect(result.grossPay).toBe(5000);
    });

    test('contract: invalid milestones throws', () => {
      const emp = {
        id: 'C2',
        name: 'Ivy',
        type: 'contract',
        contractAmount: 8000,
        totalMilestones: 4,
      };
      expect(() =>
        calculatePayroll(emp, { milestonesCompleted: 5 }, 'UA')
      ).toThrow('Invalid milestones');
    });

    test('tax: UA region default rates applied', () => {
      const emp = { id: 'T1', name: 'Jack', type: 'hourly', hourlyRate: 100 };
      const result = calculatePayroll(emp, { hoursWorked: 10, performanceRating: 1 }, 'UA');

      expect(result.region).toBe('UA');
      expect(result.incomeTax).toBeCloseTo(result.grossPay * 0.18, 5);
      expect(result.socialTax).toBeCloseTo(result.grossPay * 0.22, 5);
    });

    test('tax: US region different rates', () => {
      const emp = { id: 'T2', name: 'Kate', type: 'hourly', hourlyRate: 50 };
      const result = calculatePayroll(emp, { hoursWorked: 10, performanceRating: 1 }, 'US');

      expect(result.grossPay).toBe(500);
      expect(result.incomeTax).toBeCloseTo(500 * 0.22, 5);
      expect(result.socialTax).toBeCloseTo(500 * 0.0765, 5);
    });

    test('tax: high income threshold reduces taxable base (UA)', () => {
      const emp = { id: 'T3', name: 'Leo', type: 'salary', monthlySalary: 25000 };
      const result = calculatePayroll(emp, { performanceRating: 1 }, 'UA');

      const expectedTaxable = 25000 - 10000 * 0.1;
      expect(result.incomeTax).toBeCloseTo(expectedTaxable * 0.18, 5);
    });

    test('bonus: Q4 quarterly 5%', () => {
      const emp = { id: 'B1', name: 'Mia', type: 'hourly', hourlyRate: 20 };
      const result = calculatePayroll(
        emp,
        { hoursWorked: 40, quarter: 4, performanceRating: 1 },
        'UA'
      );

      expect(result.bonus).toBeCloseTo(800 * 0.05, 5);
    });

    test('bonus: performance rating 5 adds 15%', () => {
      const emp = { id: 'B2', name: 'Noah', type: 'hourly', hourlyRate: 10 };
      const result = calculatePayroll(
        emp,
        { hoursWorked: 40, performanceRating: 5 },
        'UA'
      );

      expect(result.bonus).toBeCloseTo(400 * 0.15, 5);
    });

    test('bonus: tenure 5+ years with year flag', () => {
      const emp = {
        id: 'B3',
        name: 'Olivia',
        type: 'salary',
        monthlySalary: 5000,
        tenureYears: 5,
      };
      const result = calculatePayroll(
        emp,
        { year: 2025, performanceRating: 1 },
        'UA'
      );

      expect(result.bonus).toBeCloseTo(500, 5);
    });

    test('invalid: missing employee throws', () => {
      expect(() => calculatePayroll(null, {})).toThrow('Invalid employee');
    });

    test('invalid: unknown type throws', () => {
      const emp = { id: 'X1', name: 'Bad', type: 'intern' };
      expect(() => calculatePayroll(emp, {})).toThrow('Unknown employee type');
    });

    test('side effect: mutates employee ytd and calculationCount', () => {
      const emp = { id: 'M1', name: 'Paul', type: 'hourly', hourlyRate: 10 };
      calculatePayroll(emp, { hoursWorked: 10, performanceRating: 1 }, 'UA');
      calculatePayroll(emp, { hoursWorked: 10, performanceRating: 1 }, 'UA');

      expect(emp.calculationCount).toBe(2);
      expect(emp.ytdGross).toBe(200);
      expect(emp.lastCalculated).toBeDefined();
    });

    test('side effect: global stats increment', () => {
      const emp = { id: 'G1', name: 'Quinn', type: 'hourly', hourlyRate: 10 };
      calculatePayroll(emp, { hoursWorked: 5, performanceRating: 1 }, 'UA');
      expect(getGlobalStats().totalProcessed).toBe(1);
      expect(getGlobalStats().lastEmployeeId).toBe('G1');
    });

    test('report: includes key sections and net pay line', () => {
      const emp = { id: 'R1', name: 'Rita', type: 'hourly', hourlyRate: 15 };
      const result = calculatePayroll(emp, { hoursWorked: 20, performanceRating: 1 }, 'UA');

      expect(result.report).toContain('=== PAYROLL REPORT ===');
      expect(result.report).toContain('Rita');
      expect(result.report).toContain('NET PAY:');
      expect(result.report).toContain('=== END REPORT ===');
    });

    test('float: net pay rounded to 2 decimal places', () => {
      const emp = { id: 'F1', name: 'Sam', type: 'hourly', hourlyRate: 33.33 };
      const result = calculatePayroll(emp, { hoursWorked: 3, performanceRating: 1 }, 'UA');

      const decimalPart = result.netPay.toString().split('.')[1];
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(2);
      }
    });
  });
}
