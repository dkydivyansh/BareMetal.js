// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '../src/router.js';
import { Loader } from '../src/loader.js';

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Router.historyStack = [];
    Router.currentAbortController = null;
    Router.lastPathAndSearch = '';
    
    // Polyfill window.location for JSDOM
    delete window.location;
    window.location = { pathname: '/page1', search: '', reload: vi.fn() };
  });

  it('should initialize popstate listener', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    Router.init();
    expect(addEventSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('should cancel pending fetches when navigating rapidly', async () => {
    // Mock Loader logic since it touches the DOM heavily
    vi.spyOn(Loader, 'log').mockImplementation(() => {});
    vi.spyOn(Loader, 'loadPrepared').mockResolvedValue(true);
    
    // Mock global fetch to return a hanging promise to simulate a pending request
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    
    // Fake the first route request
    window.location.pathname = '/page2';
    Router.handleRoute(new Event('popstate'));
    const firstController = Router.currentAbortController;
    expect(firstController).not.toBeNull();
    
    // Fake a second rapid route request while the first fetch is hanging
    window.location.pathname = '/page3';
    Router.handleRoute(new Event('popstate'));
    const secondController = Router.currentAbortController;
    
    // The first controller should have been aborted
    expect(firstController.signal.aborted).toBe(true);
    // And a new controller was generated
    expect(secondController).not.toBe(firstController);
    expect(secondController.signal.aborted).toBe(false);
  });
});
