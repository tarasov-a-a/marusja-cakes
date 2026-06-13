import { describe, expect, it } from 'vitest';
import { ALL_CATEGORY, CATEGORY_KEYS } from './categories';

describe('categories constants', () => {
  it('lists the five known category keys in order', () => {
    expect(CATEGORY_KEYS).toEqual([
      'signature',
      'chocolate',
      'classic',
      'fruit',
      'seasonal',
    ]);
  });

  it('contains no duplicate keys', () => {
    expect(new Set(CATEGORY_KEYS).size).toBe(CATEGORY_KEYS.length);
  });

  it('treats "all" as a separate sentinel, not a real category', () => {
    expect(ALL_CATEGORY).toBe('all');
    expect(CATEGORY_KEYS).not.toContain(ALL_CATEGORY);
  });
});
