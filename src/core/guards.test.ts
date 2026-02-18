import { describe, expect, it } from 'vitest';

import { isRecord, isString } from './guards';

describe('isString', () => {
  it('returns true for string primitives', () => {
    expect(isString('rm-comments')).toBe(true);
    expect(isString('')).toBe(true);
  });

  it('returns false for non-strings', () => {
    expect(isString(42)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString(null)).toBe(false);
  });
});

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ value: 1 })).toBe(true);
  });

  it('returns true for arrays', () => {
    expect(isRecord([])).toBe(true);
  });

  it('returns false for functions, null, and primitives', () => {
    expect(isRecord(() => {})).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('text')).toBe(false);
    expect(isRecord(0)).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});
