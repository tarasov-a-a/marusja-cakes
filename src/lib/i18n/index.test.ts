import { afterEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
  dir,
  locale,
  setLocale,
  STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  t,
} from './index';

// The translator and direction are derived from the shared `locale` store.
// Reset to English after every test so cases stay independent.
afterEach(() => setLocale('en'));

/** Current translator snapshot. */
const tr = () => get(t);

describe('i18n', () => {
  describe('constants', () => {
    it('supports en, ru and ar', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'ru', 'ar']);
    });

    it('exposes the persistence key', () => {
      expect(STORAGE_KEY).toBe('marusja-cakes-locale');
    });
  });

  describe('setLocale / locale', () => {
    it('updates the locale store', () => {
      setLocale('ru');
      expect(get(locale)).toBe('ru');
    });
  });

  describe('dir (text direction)', () => {
    it('is ltr for english', () => {
      setLocale('en');
      expect(get(dir)).toBe('ltr');
    });

    it('is ltr for russian', () => {
      setLocale('ru');
      expect(get(dir)).toBe('ltr');
    });

    it('is rtl for arabic', () => {
      setLocale('ar');
      expect(get(dir)).toBe('rtl');
    });
  });

  describe('translate — namespace resolution', () => {
    it('defaults to the "common" namespace when no colon is present', () => {
      expect(tr()('brand')).toBe('Marusja Cakes');
    });

    it('uses the namespace before the colon', () => {
      expect(tr()('auth:welcome')).toBe('Welcome to Marusja Cakes');
    });

    it('resolves dotted nested paths', () => {
      expect(tr()('common:nav.cakes')).toBe('Cakes');
    });

    it('returns the raw key when the path is missing', () => {
      expect(tr()('common:nope.not.here')).toBe('common:nope.not.here');
    });

    it('returns the raw key when the value is not a string (a sub-table)', () => {
      expect(tr()('common:nav')).toBe('common:nav');
    });
  });

  describe('translate — interpolation', () => {
    it('substitutes {{var}} placeholders', () => {
      expect(tr()('cart:added', { name: 'Rose Velvet' })).toBe(
        'Rose Velvet added to your cart',
      );
    });

    it('leaves an unknown placeholder untouched', () => {
      expect(tr()('cart:added', {})).toBe('{{name}} added to your cart');
    });

    it('coerces numeric params to strings', () => {
      expect(tr()('cart:each', { size: 'Petite', price: 700 })).toBe(
        'Petite · E£700 each',
      );
    });
  });

  describe('translate — pluralization (CLDR via Intl.PluralRules)', () => {
    it('selects the english "one" form for count = 1', () => {
      expect(tr()('cart:treats', { count: 1 })).toBe('1 treat ready to go.');
    });

    it('selects the english "other" form for count = 2', () => {
      expect(tr()('cart:treats', { count: 2 })).toBe('2 treats ready to go.');
    });

    it('uses language-specific plural categories (russian)', () => {
      setLocale('ru');
      expect(tr()('cart:treats', { count: 1 })).toBe('1 сладость готова.');
      // 5 is russian "many" -> falls back to the _other form.
      expect(tr()('cart:treats', { count: 5 })).toBe('5 сладостей готово.');
    });

    it('falls back to the base key when no plural variants exist', () => {
      // common:reviews has only "{{count}} reviews", no _one/_other variants.
      expect(tr()('common:reviews', { count: 3 })).toBe('3 reviews');
    });
  });

  describe('translate — english fallback', () => {
    it('returns the key when missing in every locale', () => {
      setLocale('ar');
      expect(tr()('common:totally.missing.key')).toBe('common:totally.missing.key');
    });
  });

  describe('translate — locale-specific time conventions', () => {
    // Same locale-neutral key, but each language formats the daily cut-off
    // time in its own clock convention: English uses 12-hour "11am",
    // Russian uses the 24-hour "11:00".
    it('formats the daily cut-off as "11am" in english', () => {
      setLocale('en');
      expect(tr()('landing:stats.dailyValue')).toBe('11am');
    });

    it('formats the daily cut-off as "11:00" in russian', () => {
      setLocale('ru');
      expect(tr()('landing:stats.dailyValue')).toBe('11:00');
    });

    it('formats the daily cut-off as "11 صباحاً" in arabic', () => {
      setLocale('ar');
      expect(tr()('landing:stats.dailyValue')).toBe('11 صباحاً');
    });

    it('carries the same convention into the delivery line', () => {
      setLocale('en');
      expect(tr()('landing:trust.nextDay')).toBe('Next day after 11am');
      setLocale('ru');
      expect(tr()('landing:trust.nextDay')).toBe('На следующий день после 11:00');
      setLocale('ar');
      expect(tr()('landing:trust.nextDay')).toBe('التالي بعد الساعة 11 صباحًا');
    });
  });
});
