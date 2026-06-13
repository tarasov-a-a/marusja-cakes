export type ProviderId = 'Google' | 'Apple' | 'Facebook' | 'GitHub';

export interface Provider {
  id: ProviderId;
  color: string;
  text: string;
  border: string;
  /** Which glyph to render inside the button. */
  glyph: 'google' | 'apple' | 'facebook' | 'github';
}

export const PROVIDERS: Provider[] = [
  { id: 'Google', color: '#fff', text: '#3c4043', border: '#dadce0', glyph: 'google' },
  { id: 'Apple', color: '#000', text: '#fff', border: '#000', glyph: 'apple' },
  { id: 'Facebook', color: '#1877F2', text: '#fff', border: '#1877F2', glyph: 'facebook' },
  { id: 'GitHub', color: '#24292e', text: '#fff', border: '#24292e', glyph: 'github' },
];

export function avatarSVG(prov: string): string {
  const map: Record<string, [string, string, string]> = {
    Google: ['#F0C080', '#E0A070', 'M'],
    Apple: ['#E89A88', '#D77A66', 'S'],
    Facebook: ['#8A5A30', '#5A3416', 'A'],
    GitHub: ['#E0A070', '#8A5A30', 'A'],
  };
  const [a, b, letter] = map[prov] ?? map.Google;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="50" font-family="Georgia,serif" font-size="46" font-weight="900" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
}

export function avatarDataUrl(prov: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatarSVG(prov))}`;
}
