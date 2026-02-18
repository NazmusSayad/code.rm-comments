import { describe, expect, it } from 'vitest';

import { range, regexpEscape } from './utils';

describe('regexpEscape', () => {
  it('escapes regular expression tokens', () => {
    expect(regexpEscape('a+b?(test)[v1]')).toBe('a\\+b\\?\\(test\\)\\[v1\\]');
  });

  it('returns plain text as-is', () => {
    expect(regexpEscape('rm-comments')).toBe('rm-comments');
  });
});

describe('range', () => {
  it('builds number sequences', () => {
    expect(range(2, 6)).toEqual([2, 3, 4, 5]);
  });

  it('returns empty when start equals end', () => {
    expect(range(3, 3)).toEqual([]);
  });

  it('returns empty when end is before start', () => {
    expect(range(5, 2)).toEqual([]);
  });
});
