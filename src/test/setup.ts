import { afterEach, vi } from 'vitest';

// Only run DOM-related setup if we're in a browser-like environment
if (typeof window !== 'undefined') {
  // Import jest-dom matchers for DOM testing (dynamic to avoid issues in node env)
  await import('@testing-library/jest-dom');

  // Import cleanup for React testing
  const { cleanup } = await import('@testing-library/react');

  // Cleanup after each test
  afterEach(() => {
    cleanup();
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
}
