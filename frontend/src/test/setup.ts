import '@testing-library/jest-dom/vitest';

const storage = new Map<string, string>();
const ls = {
  getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clear();
  },
  key: (i: number) => Array.from(storage.keys())[i] ?? null,
  get length() {
    return storage.size;
  },
} as Storage;

Object.defineProperty(globalThis, 'localStorage', {
  value: ls,
  configurable: true,
  writable: true,
});
