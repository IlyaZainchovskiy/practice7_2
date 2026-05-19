# Refactoring Journal — Employee Payroll Calculator

## Крок 0: Characterization Tests

**Тип**: Characterization Testing

**Причина**: Зафіксувати поточну поведінку legacy перед будь-якими змінами.

**AI допоміг**: Згенерував 21 тест-кейс (hourly, salary, contract, tax, bonus, edge cases, side effects, report, float).

**Моє рішення**: Спочатку тести писались з «ідеальними» очікуваннями; після прогону на legacy виправлено `grossPay` weekend (1440) та US tax (gross 500). Characterization = фактична поведінка, не бажана.

**Тести**: `tests/characterization/payroll.characterization.test.js`, `characterization-suite.js`

**Commit**: `2fa0f8e`

---

## Крок 1: Extract Strategy Pattern

**Тип**: Strategy Pattern

**Причина**: Прибрати switch на 50+ рядків; дозволити OCP для нових типів працівників.

**AI допоміг**: `HourlyStrategy`, `SalaryStrategy`, `ContractStrategy`, registry у `strategies/index.js`.

**Моє рішення**: Кожна стратегія повертає `{ grossPay, basePay, overtimePay }` — той самий контракт, що й switch. Polymorphism замість `employee.type` branching.

**Чому Strategy тут підходить**: Тип оплати — варіювана поведінка; калькулятор не повинен знати деталі overtime/proration/milestones.

**Тести**: characterization suite (21), `tests/unit/strategies.test.js`

**Commit**: `f27a37d`

---

## Крок 2: Extract TaxCalculator

**Тип**: Extract Class

**Причина**: Винести hardcoded regional tax (UA/US/EU), thresholds, deduction rules.

**AI допоміг**: `REGION_POLICIES`, pure `calculateTax(grossPay, region)`.

**Моє рішення**: Політики в об'єкті конфігурації; `TaxCalculator` — thin wrapper для DI/testing.

**Тести**: characterization (tax cases), `tests/unit/tax-calculator.test.js`

**Commit**: `0593bdf`

---

## Крок 3: Extract BonusCalculator

**Тип**: Extract Class / Pure Function

**Причина**: Quarterly, tenure, performance bonuses змішувались з orchestration.

**AI допоміг**: Pure `calculateBonus(grossPay, employee, period)`.

**Моє рішення**: Збережено stacking бонусів і fallback `grossPay * 0.08` для hourly tenure.

**Тести**: characterization (bonus cases), `tests/unit/bonus-calculator.test.js`

**Commit**: `c4115b0`

---

## Крок 4: Replace Mutations With Pure Functions

**Тип**: Pure Functions (з backward-compatible boundary)

**Причина**: `employee` мутувався in-place → складні тести, приховані YTD bugs.

**AI допоміг**: `applyCalculationMetadata`, `applyYtdTotals` у `payroll/employee-state.js`.

**Моє рішення**: Внутрішня логіка pure; `Object.assign(employee, ...)` на boundary — characterization tests на мутації все ще PASS.

**Де були side effects**: `lastCalculated`, `calculationCount`, `ytdGross`, `ytdTax`, `globalPayrollStats`.

**Тести**: characterization (`side effect` tests), `tests/unit/employee-state.test.js`

**Commit**: `01f7fda`

---

## Крок 5: Extract PayrollReportGenerator

**Тип**: Extract Class / Separation of Concerns

**Причина**: Report formatting не є domain logic.

**AI допоміг**: `src/report/payroll-report-generator.js`, видалено inline `generatePayrollReport` з calculator.

**Моє рішення**: Calculator лише присвоює `result.report`; формат ($, sections) ізольований.

**Тести**: characterization (`report` test), `tests/unit/report-generator.test.js`

**Commit**: `713bddf`

---

## Крок 6: Fix Float Arithmetic

**Тип**: Fix / Money Value Object (cents)

**Причина**: IEEE 754 помилки при податках та net pay.

**AI допоміг**: `toCents`/`fromCents`, `calculateNetPayCents`; tax через integer cents.

**Моє рішення**: Cents всередині; фінальний `netPay` — `roundDollars` для сумісності з legacy rounding. Characterization tests залишились green.

**Тести**: characterization (`float` test), `tests/unit/money.test.js` (0.1+0.2 case)

**Commit**: `65dff0e`

---

## Підсумок coverage

| Metric | Value |
|--------|-------|
| Statements | 100% |
| Lines | 100% |
| Functions | 100% |
| Branches | 87.3% |

**Всього тестів**: 78 (42 characterization + 36 unit)

## Залишкові ризики

- `globalPayrollStats` — досі mutable module state
- Boundary `Object.assign` зберігає mutation API
- EU region мало покритий окремими unit-тестами
- Currency symbol `$` для всіх регіонів у звіті
