import { describe, it, expect, vi } from 'vitest';
import type { AppDispatch } from '@store/index';
import { createPlaybackCommands } from './playerCommands';
import {
  togglePlayPause,
  nextTrack,
  prevTrack,
  updateProgress,
} from '@features/music/store/musicSlice';

describe('createPlaybackCommands', () => {
  it('dispatches music slice actions', () => {
    const dispatch = vi.fn();
    const cmds = createPlaybackCommands(dispatch as unknown as AppDispatch);

    cmds.togglePlayPause();
    expect(dispatch).toHaveBeenCalledWith(togglePlayPause());

    cmds.next();
    expect(dispatch).toHaveBeenCalledWith(nextTrack());

    cmds.prev();
    expect(dispatch).toHaveBeenCalledWith(prevTrack());

    cmds.reportProgress(12.5);
    expect(dispatch).toHaveBeenCalledWith(updateProgress(12.5));
  });
});
