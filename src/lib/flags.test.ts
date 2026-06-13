import { describe, expect, it } from 'vitest';
import { features, isEnabled, parseFlag } from './flags';

describe('parseFlag', () => {
  it('returns the fallback when the value is undefined', () => {
    expect(parseFlag(undefined, true)).toBe(true);
    expect(parseFlag(undefined, false)).toBe(false);
  });

  it('returns the fallback for empty / whitespace-only values', () => {
    expect(parseFlag('', true)).toBe(true);
    expect(parseFlag('   ', false)).toBe(false);
  });

  it('treats explicit falsy tokens as off, case/space-insensitively', () => {
    for (const v of ['false', 'FALSE', ' off ', '0', 'No', 'oFf']) {
      expect(parseFlag(v, true)).toBe(false);
    }
  });

  it('treats any other value as on', () => {
    for (const v of ['true', '1', 'on', 'yes', 'enabled', 'anything']) {
      expect(parseFlag(v, false)).toBe(true);
    }
  });
});

describe('features', () => {
  it('exposes boolean flags', () => {
    expect(typeof features.auth).toBe('boolean');
    expect(typeof features.mobileNav).toBe('boolean');
    expect(typeof features.extraNav).toBe('boolean');
  });

  // Vite (and so Vitest) loads `.env`, so `import.meta.env.VITE_FEATURE_*` may be
  // set when the suite runs. These tests assert the wiring — that each flag reads
  // its env var with the right committed default — by recomputing the expected
  // value from the same input, so they pass whether `.env` sets the flag or not.
  it('wires `auth` to VITE_FEATURE_AUTH with a committed default of ON', () => {
    const expected = parseFlag(import.meta.env.VITE_FEATURE_AUTH, true);
    expect(features.auth).toBe(expected);
    expect(isEnabled('auth')).toBe(expected);
  });

  it('wires `mobileNav` to VITE_FEATURE_MOBILE_NAV with a committed default of ON', () => {
    const expected = parseFlag(import.meta.env.VITE_FEATURE_MOBILE_NAV, true);
    expect(features.mobileNav).toBe(expected);
    expect(isEnabled('mobileNav')).toBe(expected);
  });

  it('wires `extraNav` to VITE_FEATURE_EXTRA_NAV with a committed default of OFF', () => {
    const expected = parseFlag(import.meta.env.VITE_FEATURE_EXTRA_NAV, false);
    expect(features.extraNav).toBe(expected);
    expect(isEnabled('extraNav')).toBe(expected);
  });
});
