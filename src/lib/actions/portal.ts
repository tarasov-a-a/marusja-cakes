import type { Action } from 'svelte/action';

/** Move the node to <body> so fixed-position overlays escape transformed ancestors. */
export const portal: Action = (node) => {
  document.body.appendChild(node);
  return {
    destroy() {
      node.remove();
    },
  };
};
