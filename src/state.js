/**
 * baremetal.js v1.2.1
 * A lightweight, dependency-free Vanilla JavaScript SPA engine prioritizing extreme performance, native browser features, and explicit lifecycle management.
 * (c) 2026 dkydivyansh
 * Released under the GPL-3.0 License
 */

class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.eventBus = {};
  }

  initPersistence() {
    try {
      const saved = sessionStorage.getItem('baremetal_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        for (const [key, value] of Object.entries(parsed)) {
          this.state[key] = value;
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate state', e);
    }
  }

  init(key, defaultValue) {
    if (this.state[key] === undefined) {
      this.state[key] = defaultValue;
    }
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    if (this.state[key] !== undefined) {
      callback(this.state[key]);
    }

    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key, callback) {
    if (!this.listeners[key]) return;
    this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
  }

  update(key, value) {
    this.state[key] = value;
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value));
    }

    if (window.__baremetal_persist_state) {
      try {
        sessionStorage.setItem('baremetal_state', JSON.stringify(this.state));
      } catch(e) {}
    }
  }

  get(key) {
    return this.state[key];
  }

  on(event, callback) {
    if (!this.eventBus[event]) {
      this.eventBus[event] = [];
    }
    this.eventBus[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.eventBus[event]) return;
    this.eventBus[event] = this.eventBus[event].filter(cb => cb !== callback);
  }

  publish(event, data) {
    if (this.eventBus[event]) {
      this.eventBus[event].forEach(callback => callback(data));
    }
  }
}

export const stateManager = new StateManager();
