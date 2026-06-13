import { describe, expect, it } from 'vitest';
import {
  buildSrcSet,
  getLandingHeroSrc,
  getLandingHeroSrcSet,
  getProductImagePath,
  getProductImageUrls,
  hasPhotos,
  HERO_WIDTHS_COMPACT,
  HERO_WIDTHS_PRODUCT,
  IMAGE_COUNT,
  LANDING_HERO_WIDTHS,
} from './productImages';

const DEFAULT_WIDTH = 480; // mirrors the private constant in productImages.ts

describe('productImages', () => {
  describe('hasPhotos', () => {
    it('returns true only for the one product that ships real photos', () => {
      expect(hasPhotos('pancho-pineapple')).toBe(true);
    });

    it.each(['rose-velvet', 'cocoa-grove', 'vanilla-bean', 'unknown-id', ''])(
      'returns false for "%s"',
      (id) => {
        expect(hasPhotos(id)).toBe(false);
      },
    );
  });

  describe('getProductImagePath', () => {
    it('converts a zero-based index into a one-based file number', () => {
      expect(getProductImagePath('cake', 0)).toBe('/cake_1-480w.webp');
      expect(getProductImagePath('cake', 3)).toBe('/cake_4-480w.webp');
    });

    it('falls back to the default width when none is supplied', () => {
      expect(getProductImagePath('cake', 0)).toContain(`-${DEFAULT_WIDTH}w.webp`);
    });

    it('uses the explicit width when provided', () => {
      expect(getProductImagePath('cake', 2, 768)).toBe('/cake_3-768w.webp');
    });
  });

  describe('buildSrcSet', () => {
    it('produces a comma-separated "path <w>w" descriptor list', () => {
      expect(buildSrcSet('cake', 0, [320, 640])).toBe(
        '/cake_1-320w.webp 320w, /cake_1-640w.webp 640w',
      );
    });

    it('returns an empty string for an empty width list', () => {
      expect(buildSrcSet('cake', 0, [])).toBe('');
    });
  });

  describe('getProductImageUrls', () => {
    it('returns exactly IMAGE_COUNT urls at the default width', () => {
      const urls = getProductImageUrls('cake');
      expect(urls).toHaveLength(IMAGE_COUNT);
      expect(urls).toEqual([
        '/cake_1-480w.webp',
        '/cake_2-480w.webp',
        '/cake_3-480w.webp',
        '/cake_4-480w.webp',
      ]);
    });
  });

  describe('landing hero helpers', () => {
    it('builds the hero src from the hero asset id at index 0', () => {
      expect(getLandingHeroSrc()).toBe('/hero-img_1-480w.webp');
    });

    it('builds the hero srcset across the configured widths', () => {
      const expected = LANDING_HERO_WIDTHS.map(
        (w) => `/hero-img_1-${w}w.webp ${w}w`,
      ).join(', ');
      expect(getLandingHeroSrcSet()).toBe(expected);
    });
  });

  describe('width-table invariants', () => {
    it('every width table is a non-empty ascending list of numbers', () => {
      for (const widths of [HERO_WIDTHS_PRODUCT, HERO_WIDTHS_COMPACT, LANDING_HERO_WIDTHS]) {
        expect(widths.length).toBeGreaterThan(0);
        const sorted = [...widths].sort((a, b) => a - b);
        expect([...widths]).toEqual(sorted);
      }
    });

    it('the default fallback width exists in the hero tables (so `src` always resolves)', () => {
      expect(HERO_WIDTHS_PRODUCT).toContain(DEFAULT_WIDTH);
      expect(HERO_WIDTHS_COMPACT).toContain(DEFAULT_WIDTH);
    });
  });
});
