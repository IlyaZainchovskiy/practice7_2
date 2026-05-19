import {
  applyCalculationMetadata,
  applyYtdTotals,
} from '../../src/payroll/employee-state.js';

describe('employee-state (pure helpers)', () => {
  test('applyCalculationMetadata increments count', () => {
    const base = { id: '1', calculationCount: 1 };
    const updated = applyCalculationMetadata(base);
    expect(updated.calculationCount).toBe(2);
    expect(updated.lastCalculated).toBeDefined();
    expect(base.calculationCount).toBe(1);
  });

  test('applyYtdTotals does not mutate input', () => {
    const base = { ytdGross: 100, ytdTax: 10 };
    const updated = applyYtdTotals(base, 50, 5);
    expect(updated.ytdGross).toBe(150);
    expect(updated.ytdTax).toBe(15);
    expect(base.ytdGross).toBe(100);
  });
});
