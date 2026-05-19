/**
 * Contract employee pay strategy
 */
export class ContractStrategy {
  calculate(employee, period) {
    const contractAmount = employee.contractAmount || 0;
    const milestones = period.milestonesCompleted || 0;
    const totalMilestones = employee.totalMilestones || 1;

    if (milestones < 0 || milestones > totalMilestones) {
      throw new Error('Invalid milestones');
    }

    const basePay = (contractAmount / totalMilestones) * milestones;
    return { grossPay: basePay, basePay, overtimePay: 0 };
  }
}
