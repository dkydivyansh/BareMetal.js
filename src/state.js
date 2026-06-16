class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.eventBus = {};
  }

  // --- Reactive State ---

  /**
   * Initialize a state property with a default value
   */
  init(key, defaultValue) {
    if (this.state[key] === undefined) {
      this.state[key] = defaultValue;
    }
  }

  /**
   * Subscribe to changes on a specific state key
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    
    // Call immediately with current value if exists
    if (this.state[key] !== undefined) {
      callback(this.state[key]);
    }

    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from a state key
   */
  unsubscribe(key, callback) {
    if (!this.listeners[key]) return;
    this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
  }

  /**
   * Update a state value and trigger listeners
   */
  update(key, value) {
    this.state[key] = value;
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value));
    }
  }

  /**
   * Get current state value
   */
  get(key) {
    return this.state[key];
  }

  // --- Event Bus (Pub/Sub) for one-off actions ---

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
