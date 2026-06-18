// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { stateManager } from '../src/state.js';

describe('StateManager', () => {
  it('should initialize and get state', () => {
    stateManager.init('user', 'Alice');
    expect(stateManager.get('user')).toBe('Alice');
  });

  it('should update state and trigger subscribers', () => {
    stateManager.init('count', 0);
    const callback = vi.fn();
    stateManager.subscribe('count', callback);
    
    // Subscribe triggers immediately with initial value
    expect(callback).toHaveBeenCalledWith(0);

    stateManager.update('count', 1);
    expect(callback).toHaveBeenCalledWith(1);
  });

  it('should allow unsubscribing', () => {
    stateManager.init('theme', 'light');
    const callback = vi.fn();
    const unsub = stateManager.subscribe('theme', callback);
    unsub();
    stateManager.update('theme', 'dark');
    
    // Callback was called once on subscribe, but not on update
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle pub/sub events', () => {
    const callback = vi.fn();
    stateManager.on('TEST_EVENT', callback);
    stateManager.publish('TEST_EVENT', { payload: 42 });
    expect(callback).toHaveBeenCalledWith({ payload: 42 });
  });
});
