import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Spinner from './Spinner.svelte';

// Note: jsdom re-parses the inline `style` attribute through CSSOM, so we assert
// against the normalized `.style` properties rather than the raw string.
const spinner = (container: HTMLElement) =>
  container.querySelector('.spinner') as HTMLElement;

describe('Spinner.svelte', () => {
  it('renders a single spinner element', () => {
    const { container } = render(Spinner);
    expect(container.querySelectorAll('.spinner')).toHaveLength(1);
  });

  it('defaults the leading edge to currentColor', () => {
    const { container } = render(Spinner);
    expect(spinner(container).style.borderTopColor.toLowerCase()).toBe('currentcolor');
  });

  it('drives the leading edge from a custom color', () => {
    const { container } = render(Spinner, { props: { color: '#ff0000' } });
    expect(spinner(container).style.borderTopColor).toBe('rgb(255, 0, 0)');
  });

  it('renders a translucent ring (alpha) distinct from the solid leading edge', () => {
    // 6-digit hex + "40" suffix => valid 8-digit hex => rgba ring.
    const { container } = render(Spinner, { props: { color: '#ff0000' } });
    const ring = spinner(container).style.borderRightColor;
    expect(ring).toContain('rgba');
    expect(ring).not.toBe(spinner(container).style.borderTopColor);
  });
});
