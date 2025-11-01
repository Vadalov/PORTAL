import '@testing-library/jest-dom'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
;(global as any).IntersectionObserver = class IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(_element: Element): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(_element: Element): void {}
  disconnect(): void {}
}
