import { describe, it, expect } from 'vitest';
import { formatPlayerTime } from './formatTime';

describe('formatPlayerTime', () => {
  it('formats whole minutes and pads seconds', () => {
    expect(formatPlayerTime(0)).toBe('0:00');
    expect(formatPlayerTime(59)).toBe('0:59');
    expect(formatPlayerTime(60)).toBe('1:00');
    expect(formatPlayerTime(125)).toBe('2:05');
  });

  it('returns 0:00 for NaN', () => {
    expect(formatPlayerTime(NaN)).toBe('0:00');
  });
});
