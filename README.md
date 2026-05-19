# Employee Payroll Calculator — Legacy Refactoring


## Структура

```
/
├── src/                    # Рефакторений модуль
│   ├── strategies/         # Strategy Pattern (hourly, salary, contract)
│   ├── tax/                  # TaxCalculator
│   ├── bonus/                # BonusCalculator
│   ├── payroll/              # Pure employee state helpers
│   ├── report/               # PayrollReportGenerator
│   ├── money/                # Cents-based arithmetic
│   └── payroll-calculator.js # Facade / orchestration
├── original/               # Заморожений legacy (не змінювати)
├── tests/
│   ├── characterization/   # 21 тестів × 2 (original + src)
│   └── unit/               # Unit tests (80%+ coverage)
├── docs/STAGE1-ANALYSIS.md
├── refactoring-journal.md
└── README.md
```

## Запуск

```bash
npm install
npm test              # characterization + unit
npm run test:coverage # coverage report
```

## Workflow

1. **Аналіз** — `docs/STAGE1-ANALYSIS.md`
2. **Characterization tests** — фіксують поточну поведінку (включно з side effects)
3. **Рефакторинг** — 6 кроків, кожен = окремий git commit
4. **Unit tests** — strategies, tax, bonus, money, report

## Git commits

| Commit | Message |
|--------|---------|
| `2fa0f8e` | test: add characterization tests for legacy payroll calculator |
| `981ec56` | chore: copy legacy module to src and add shared characterization suite |
| `f27a37d` | refactor: extract hourly, salary, and contract payroll strategies |
| `0593bdf` | refactor: extract TaxCalculator with regional policies |
| `c4115b0` | refactor: extract BonusCalculator for bonus logic |
| `01f7fda` | refactor: replace employee mutations with pure state helpers |
| `713bddf` | refactor: extract PayrollReportGenerator from calculator |
| `65dff0e` | fix: replace float calculations with cents arithmetic |

## API

```javascript
import { calculatePayroll, resetGlobalStats, getGlobalStats } from './src/index.js';

const result = calculatePayroll(
  { id: '1', name: 'Anna', type: 'hourly', hourlyRate: 25 },
  { hoursWorked: 40, performanceRating: 1 },
  'UA'
);
```
