import { HourlyStrategy } from './hourly-strategy.js';
import { SalaryStrategy } from './salary-strategy.js';
import { ContractStrategy } from './contract-strategy.js';

const strategies = {
  hourly: new HourlyStrategy(),
  salary: new SalaryStrategy(),
  contract: new ContractStrategy(),
};

export function getPayStrategy(type) {
  const strategy = strategies[type];
  if (!strategy) {
    throw new Error('Unknown employee type: ' + type);
  }
  return strategy;
}

export { HourlyStrategy, SalaryStrategy, ContractStrategy };
