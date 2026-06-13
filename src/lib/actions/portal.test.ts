import { describe, expect, it } from 'vitest';
import { portal } from './portal';

describe('portal action', () => {
  it('moves the node to <body> on mount', () => {
    const host = document.createElement('div');
    const node = document.createElement('div');
    host.appendChild(node);
    document.body.appendChild(host);

    expect(node.parentElement).toBe(host);
    portal(node);
    expect(node.parentElement).toBe(document.body);

    host.remove();
  });

  it('removes the node from the DOM on destroy', () => {
    const node = document.createElement('div');
    const ret = portal(node) as { destroy: () => void };

    expect(node.parentElement).toBe(document.body);
    ret.destroy();
    expect(node.parentElement).toBeNull();
  });
});
