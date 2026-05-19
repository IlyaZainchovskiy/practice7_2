import { calculateBonus, BonusCalculator } from '../../src/bonus/bonus-calculator.js';

describe('BonusCalculator', () => {
  test('quarterly Q4 bonus is 5% of gross', () => {
    expect(calculateBonus(1000, {}, { quarter: 4 })).toBe(50);
  });

  test('tenure bonus uses monthly salary when present', () => {
    const bonus = calculateBonus(1000, { monthlySalary: 4000, tenureYears: 5 }, { year: 2025 });
    expect(bonus).toBe(400);
  });

  test('tenure bonus fallback for hourly', () => {
    const bonus = calculateBonus(1000, { tenureYears: 6 }, { year: 2025 });
    expect(bonus).toBe(80);
  });

  test('performance rating 5', () => {
    expect(calculateBonus(200, {}, { performanceRating: 5 })).toBe(30);
  });

  test('performance rating 4', () => {
    expect(calculateBonus(200, {}, { performanceRating: 4 })).toBe(16);
  });

  test('stacks multiple bonuses', () => {
    const bonus = calculateBonus(
      1000,
      { monthlySalary: 2000, tenureYears: 5 },
      { quarter: 4, year: 2025, performanceRating: 5 }
    );
    expect(bonus).toBeCloseTo(50 + 200 + 150, 5);
  });

  test('BonusCalculator class', () => {
    const calc = new BonusCalculator();
    expect(calc.calculate(100, {}, { performanceRating: 3 })).toBe(0);
  });
});
