import { describe, expect, it } from 'vitest';
import { LOGO } from './logo';

describe('logo', () => {
  it('is a base64 JPEG data URL', () => {
    expect(LOGO.startsWith('data:image/jpeg;base64,')).toBe(true);
  });

  it('carries a non-trivial, validly-encoded payload', () => {
    const payload = LOGO.replace('data:image/jpeg;base64,', '');
    expect(payload.length).toBeGreaterThan(1000);
    expect(payload).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('decodes to bytes beginning with the JPEG magic marker (0xFFD8)', () => {
    const payload = LOGO.replace('data:image/jpeg;base64,', '');
    const bytes = Buffer.from(payload, 'base64');
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);
  });
});
