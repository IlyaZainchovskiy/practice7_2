/**
 * Hourly employee pay strategy
 */
export class HourlyStrategy {
  calculate(employee, period) {
    const rate = employee.hourlyRate || 0;
    const hours = period.hoursWorked || 0;

    if (hours < 0) {
      throw new Error('Invalid hours');
    }

    let basePay = 0;
    let overtimePay = 0;

    if (hours <= 40) {
      basePay = hours * rate;
    } else {
      const regularHours = 40;
      const overtimeHours = hours - 40;
      basePay = regularHours * rate;
      overtimePay = overtimeHours * rate * 1.5;

      if (period.isWeekend) {
        overtimePay = overtimeHours * rate * 2.0;
      }
    }

    const grossPay = basePay + overtimePay;
    return { grossPay, basePay, overtimePay };
  }
}
