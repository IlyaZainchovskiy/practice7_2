# ЕТАП 1 — Аналіз Legacy Code

## Файл: `original/payroll-calculator.js`

### Code Smells

| Smell | Локація | Опис |
|-------|---------|------|
| **God function** | `calculatePayroll` | Одна функція: зарплата, податки, бонуси, звіт, мутації |
| **Long switch** | `switch (employee.type)` | 50+ рядків — hourly/salary/contract в одному блоці |
| **Hardcoded constants** | tax/bonus blocks | Ставки UA/US/EU, пороги, множники бонусів без конфігурації |
| **Feature envy** | report inline | `generatePayrollReport` викликається всередині розрахунку |
| **Mutable shared state** | `globalPayrollStats` | Модульний глобальний стан між викликами |
| **Parameter mutation** | `employee.lastCalculated`, `ytdGross` | Вхідний об'єкт змінюється in-place |
| **Mixed languages** | коментарі | UA + EN в одному файлі |
| **Primitive obsession** | `region` string | Немає типізованої політики податків |
| **Float money** | `grossPay`, `netPay` | IEEE 754 — ризик `0.1 + 0.2` |

### Architecture Problems

1. **Немає шарів** — domain, tax, bonus, presentation змішані.
2. **Порушення SRP** — зміна ставки податку вимагає правки `calculatePayroll`.
3. **Порушення OCP** — новий тип працівника = новий `case` у switch.
4. **Тісне зв'язування** — звіт знає структуру `result` і `employee`.
5. **Нетестованість** — глобальний стан ускладнює ізольовані unit-тести.

### Side Effects

- `employee.lastCalculated`, `employee.calculationCount`, `employee.ytdGross`, `employee.ytdTax`
- `globalPayrollStats.totalProcessed`, `lastEmployeeId`
- Побічні ефекти при повторних викликах для того ж `employee` змінюють YTD

### Mutation Risks

- Повторне використання одного `employee` об'єкта між тестами/запитами дає накопичений YTD
- Клонування employee перед викликом не відбувається автоматично
- Паралельні розрахунки з одним об'єктом — race на мутаціях (у sync JS — послідовна плутанина)

### Testing Risks

- Characterization tests повинні `resetGlobalStats()` і клонувати employee
- Float assertions потребують `toBeCloseTo`
- Weekend vs weekday overtime — різні множники, легко зламати при refactor
- Threshold tax logic нелінійна — regression без тестів

### Dangerous Refactoring Areas

1. **Overtime multipliers** (1.5 vs 2.0 weekend) — бізнес-критично
2. **Tax threshold** `deductionThreshold * 0.1` — неочевидна формула
3. **Bonus stacking** — Q4 + tenure + performance сумуються
4. **Salary proration** `/22` — magic number
5. **Global stats** — видалення зламає спостерігачів (якщо є)

### Dependencies

- Немає зовнішніх npm-залежностей у legacy (pure JS)
- Експорт: `calculatePayroll`, `resetGlobalStats`, `getGlobalStats`

### Hidden Coupling

- `period.performanceRating` без default — `undefined >= 4` → false (OK)
- Salary tenure bonus uses `employee.monthlySalary` навіть для hourly (fallback `grossPay * 0.08`)
- Report assumes `$` currency symbol для всіх регіонів
