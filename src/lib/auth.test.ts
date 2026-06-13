import { describe, expect, it } from 'vitest';
import { avatarDataUrl, avatarSVG, PROVIDERS } from './auth';

describe('auth', () => {
  describe('PROVIDERS', () => {
    it('exposes the four OAuth providers', () => {
      expect(PROVIDERS.map((p) => p.id)).toEqual([
        'Google',
        'Apple',
        'Facebook',
        'GitHub',
      ]);
    });

    it('gives every provider a full visual spec', () => {
      for (const p of PROVIDERS) {
        expect(p.color).toMatch(/^#|rgb/);
        expect(p.text).toMatch(/^#|rgb/);
        expect(p.border).toMatch(/^#|rgb/);
        expect(p.glyph).toBe(p.id.toLowerCase());
      }
    });
  });

  describe('avatarSVG', () => {
    it('returns a self-contained <svg> document', () => {
      const svg = avatarSVG('Google');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('</svg>');
      expect(svg).toContain('linearGradient');
    });

    it.each([
      ['Google', 'M', '#F0C080'],
      ['Apple', 'S', '#E89A88'],
      ['Facebook', 'A', '#8A5A30'],
      ['GitHub', 'A', '#E0A070'],
    ])('renders %s with letter "%s" and its gradient start color', (prov, letter, color) => {
      const svg = avatarSVG(prov);
      expect(svg).toContain(`>${letter}</text>`);
      expect(svg).toContain(color);
    });

    it('falls back to the Google palette for an unknown provider', () => {
      expect(avatarSVG('Twitter')).toBe(avatarSVG('Google'));
    });
  });

  describe('avatarDataUrl', () => {
    it('wraps the SVG in a URI-encoded data URL', () => {
      const url = avatarDataUrl('Apple');
      expect(url.startsWith('data:image/svg+xml;utf8,')).toBe(true);
      // '<' must be percent-encoded, never raw, inside a data URL.
      expect(url).not.toContain('<svg');
      expect(url).toContain('%3Csvg');
    });

    it('round-trips back to the original SVG when decoded', () => {
      const decoded = decodeURIComponent(
        avatarDataUrl('GitHub').replace('data:image/svg+xml;utf8,', ''),
      );
      expect(decoded).toBe(avatarSVG('GitHub'));
    });
  });
});
