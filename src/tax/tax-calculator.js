const REGION_POLICIES = {
  UA: { taxRate: 0.18, socialContribution: 0.22, deductionThreshold: 10000 },
  US: { taxRate: 0.22, socialContribution: 0.0765, deductionThreshold: 15000 },
  EU: { taxRate: 0.25, socialContribution: 0.2, deductionThreshold: 12000 },
};

const DEFAULT_REGION = 'UA';

export function getRegionPolicy(region) {
  return REGION_POLICIES[region] || REGION_POLICIES[DEFAULT_REGION];
}

/**
 * Pure tax calculation for a gross pay amount and region.
 * @returns {{ incomeTax, socialTax, totalTax, taxableIncome }}
 */
export function calculateTax(grossPay, region = DEFAULT_REGION) {
  const { taxRate, socialContribution, deductionThreshold } = getRegionPolicy(region);

  let taxableIncome = grossPay;
  if (grossPay > deductionThreshold) {
    taxableIncome = grossPay - deductionThreshold * 0.1;
  }

  const incomeTax = taxableIncome * taxRate;
  const socialTax = grossPay * socialContribution;
  const totalTax = incomeTax + socialTax;

  return { incomeTax, socialTax, totalTax, taxableIncome };
}

export class TaxCalculator {
  calculate(grossPay, region = DEFAULT_REGION) {
    return calculateTax(grossPay, region);
  }
}
