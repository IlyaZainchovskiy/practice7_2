import { HourlyStrategy } from '../../src/strategies/hourly-strategy.js';
import { SalaryStrategy } from '../../src/strategies/salary-strategy.js';
import { ContractStrategy } from '../../src/strategies/contract-strategy.js';
import { getPayStrategy } from '../../src/strategies/index.js';

describe('Pay strategies', () => {
  describe('HourlyStrategy', () => {
    const strategy = new HourlyStrategy();

    test('calculates pay within 40 hours', () => {
      const result = strategy.calculate({ hourlyRate: 25 }, { hoursWorked: 20 });
      expect(result).toEqual({ grossPay: 500, basePay: 500, overtimePay: 0 });
    });

    test('applies 1.5x weekday overtime', () => {
      const result = strategy.calculate({ hourlyRate: 20 }, { hoursWorked: 45 });
      expect(result.overtimePay).toBe(150);
      expect(result.grossPay).toBe(950);
    });

    test('applies 2.0x weekend overtime', () => {
      const result = strategy.calculate(
        { hourlyRate: 30 },
        { hoursWorked: 44, isWeekend: true }
      );
      expect(result.overtimePay).toBe(240);
    });

    test('rejects negative hours', () => {
      expect(() => strategy.calculate({ hourlyRate: 10 }, { hoursWorked: -1 })).toThrow(
        'Invalid hours'
      );
    });
  });

  describe('SalaryStrategy', () => {
    const strategy = new SalaryStrategy();

    test('defaults to 22 working days', () => {
      const result = strategy.calculate({ monthlySalary: 2200 }, {});
      expect(result.grossPay).toBe(2200);
    });

    test('prorates by days worked', () => {
      const result = strategy.calculate({ monthlySalary: 2200 }, { daysWorked: 11 });
      expect(result.grossPay).toBe(1100);
    });

    test('rejects invalid days', () => {
      expect(() => strategy.calculate({ monthlySalary: 1000 }, { daysWorked: 40 })).toThrow(
        'Invalid days worked'
      );
    });
  });

  describe('ContractStrategy', () => {
    const strategy = new ContractStrategy();

    test('pays per completed milestones', () => {
      const result = strategy.calculate(
        { contractAmount: 10000, totalMilestones: 4 },
        { milestonesCompleted: 1 }
      );
      expect(result.grossPay).toBe(2500);
    });

    test('rejects out-of-range milestones', () => {
      expect(() =>
        strategy.calculate({ contractAmount: 1000, totalMilestones: 2 }, { milestonesCompleted: 3 })
      ).toThrow('Invalid milestones');
    });
  });

  describe('getPayStrategy', () => {
    test('returns strategy by type', () => {
      expect(getPayStrategy('hourly')).toBeInstanceOf(HourlyStrategy);
    });

    test('throws for unknown type', () => {
      expect(() => getPayStrategy('freelance')).toThrow('Unknown employee type');
    });
  });
});
