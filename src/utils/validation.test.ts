import { validateSTXAmount } from './validation';

describe('validateSTXAmount', () => {
  it('should not accept letters', () => {
    expect(validateSTXAmount('abc')).toBe(false);
  });

  // Not accepting more than 6 decimals to be able to convert to micro
  it('should not accept more than 6 decimals', () => {
    expect(validateSTXAmount('12.1234567')).toBe(false);
  });

  it('should accept a valid amount', () => {
    expect(validateSTXAmount('12')).toBe(true);
  });

  it('should accept a valid amount with decimals', () => {
    expect(validateSTXAmount('12.123')).toBe(true);
  });
});
