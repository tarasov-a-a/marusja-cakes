import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Stars from './Stars.svelte';

const HONEY = 'var(--color-honey)';

function filledCount(container: HTMLElement): number {
  const svgs = Array.from(container.querySelectorAll('svg'));
  return svgs.filter((s) => s.getAttribute('fill') === HONEY).length;
}

describe('Stars.svelte', () => {
  it('always renders exactly five stars', () => {
    const { container } = render(Stars, { props: { value: 3 } });
    expect(container.querySelectorAll('svg')).toHaveLength(5);
  });

  it.each([
    [0, 0],
    [3, 3],
    [5, 5],
    [4.4, 4], // rounds down
    [4.6, 5], // rounds up
  ])('fills round(value) stars: value=%s -> %s filled', (value, expected) => {
    const { container } = render(Stars, { props: { value } });
    expect(filledCount(container)).toBe(expected);
  });

  it('clamps overflow gracefully (value above 5 fills all five)', () => {
    const { container } = render(Stars, { props: { value: 9 } });
    expect(filledCount(container)).toBe(5);
  });
});
