import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Testing Library auto-cleanup runs via the `svelteTesting()` plugin, but we
// also reset localStorage between tests so persisted-locale state never leaks.
afterEach(() => {
  localStorage.clear();
});
