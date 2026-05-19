import {
  toCents,
  fromCents,
  addCents,
  subtractCents,
  multiplyCents,
  roundDollars,
  calculateNetPayCents,
} from '../../src/money/money.js';

describe('money (cents arithmetic)', () => {
  test('toCents and fromCents round-trip', () => {
    expect(fromCents(toCents(10.55))).toBe(10.55);
  });

  test('addCents avoids float drift', () => {
    expect(fromCents(addCents(0.1, 0.2))).toBe(0.3);
  });

  test('subtractCents', () => {
    expect(fromCents(subtractCents(1.0, 0.33))).toBe(0.67);
  });

  test('multiplyCents', () => {
    expect(fromCents(multiplyCents(33.33, 3))).toBe(99.99);
  });

  test('roundDollars to 2 decimals', () => {
    expect(roundDollars(10.556)).toBe(10.56);
  });

  test('calculateNetPayCents', () => {
    expect(calculateNetPayCents(1000, 400, 50)).toBe(650);
  });

  test('classic 0.1 + 0.2 case via addCents', () => {
    expect(addCents(0.1, 0.2)).toBe(30);
  });
});
