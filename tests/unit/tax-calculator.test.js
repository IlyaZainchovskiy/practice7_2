import { calculateTax, getRegionPolicy, TaxCalculator } from '../../src/tax/tax-calculator.js';

describe('TaxCalculator', () => {
  test('UA policy defaults', () => {
    const policy = getRegionPolicy('UA');
    expect(policy.taxRate).toBe(0.18);
    expect(policy.deductionThreshold).toBe(10000);
  });

  test('US policy rates', () => {
    const policy = getRegionPolicy('US');
    expect(policy.socialContribution).toBe(0.0765);
  });

  test('unknown region falls back to UA', () => {
    expect(getRegionPolicy('XX').taxRate).toBe(0.18);
  });

  test('calculates tax below threshold', () => {
    const { incomeTax, socialTax, totalTax } = calculateTax(1000, 'UA');
    expect(incomeTax).toBeCloseTo(180, 2);
    expect(socialTax).toBeCloseTo(220, 2);
    expect(totalTax).toBeCloseTo(400, 2);
  });

  test('applies deduction above threshold', () => {
    const { incomeTax, taxableIncome } = calculateTax(25000, 'UA');
    expect(taxableIncome).toBe(24000);
    expect(incomeTax).toBeCloseTo(4320, 2);
  });

  test('TaxCalculator class delegates to calculateTax', () => {
    const calc = new TaxCalculator();
    expect(calc.calculate(500, 'US').incomeTax).toBeCloseTo(110, 2);
  });
});
