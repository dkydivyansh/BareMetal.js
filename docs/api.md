# BareMetal.js - Exposed Methods

BareMetal exports its core engine as a global configuration object. Here are the documented methods available for developers.

## 1. Core Engine Initialization

### `BareMetal.init(config)`
Initializes the engine, sets up the Router, and binds global configurations.

**Configuration Reference:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable verbose console logs. |
| `keepAliveSameModules` | boolean | `true` | Prevent destruction of modules shared between routes. |
| `autoWrap` | boolean | `true` | Automatically wrap modules that do not export a `mount` function. |
| `hoverPrefetch` | boolean | `false` | Enable 0ms latency pre-fetching on link hover. |
| `persistState` | boolean | `false` | Automatically serialize `stateManager` to `sessionStorage` for F5 resilience. |
| `virtualizeDom` | boolean | `false` | Inject the `Virtualizer` helper into module mount contexts. |
| `showErrorNotification` | boolean | `false` | Enable floating error boundaries on navigation failures. |
| `transition.enabled` | boolean | `false` | Enable the protected transition module. |
| `transition.module` | string | `null` | Path to a custom transition module (defaults to `/src/transition.js`). |
| `transition.simulatedDelay` | number | `0` | Artificial delay (ms) for testing transitions. |
| `transition.useViewTransitions` | boolean | `false` | Enables the native View Transitions API for smooth cross-fades during navigation. |

---

## 2. Router Navigation

### `BareMetal.router.reload()`
Executes a hard reload of the current SPA page by calling `window.location.reload()`. This is useful when you want to force the browser to wipe the entire SPA state and fetch fresh assets.

### `BareMetal.router.handleRoute()`
Forces the router to evaluate the current `window.location.pathname`, fetch the corresponding HTML, and swap the DOM. Usually called automatically via `popstate` or link clicks.

---

## 3. Reactive State & Event Bus

The state manager is accessible via `BareMetal.state` (or its alias `BareMetal.events`).

### `state.init(key, defaultValue)`
Initializes a piece of state. If the key already exists, it is ignored.

### `state.update(key, value)`
Updates a state variable and synchronously triggers all callbacks subscribed to this specific key.

### `state.get(key)`
Returns the current synchronous value of the state key.

### `state.subscribe(key, callback)`
Subscribes a function to changes on a specific state key.
- **Returns:** A function that, when called, unsubscribes the callback.
- *Note:* The callback is invoked immediately upon subscription with the current value.

### `state.publish(event, payload)`
Fires a standard, one-off Pub/Sub event across the application.

### `state.on(event, callback)`
Listens for a Pub/Sub event.
- **Returns:** An unsubscribe function.

---

## 4. Module Auto-Cleanup & Sandboxing

BareMetal provides a safe cleanup registry during module `mount` to help manage memory and global pollution, reducing boilerplate.

### `context.onCleanup(callback)`
Instead of explicitly returning a `destroy` function from your module, you can register cleanup tasks using `onCleanup`. The engine will automatically execute all registered callbacks when the module unmounts.

This is highly recommended for cleaning up:
1. Global `window` function assignments.
2. `window.addEventListener` / `document.addEventListener`.
3. Local class instances (like third-party editors).

**Example:**
```javascript
export function mount({ state, onCleanup }) {
  const chart = new Chart(document.getElementById('chart'), config);
  
  window.myCustomFunc = () => console.log('hello');
  
  // Register manual cleanups
  onCleanup(() => {
    chart.destroy();
    delete window.myCustomFunc;
  });
  
  // Alternatively, you can still return an explicit destroy function:
  // return { destroy: () => { ... } };
}
```

---

## 4. Writing Custom Page Transitions

You can replace the default progress bar and fade overlay by pointing `config.transition.module` to your own JavaScript file. A custom transition is just a standard BareMetal module that listens to routing events.

**Rules for Custom Transitions:**
1. **The Protected Node:** You must inject your transition UI into an element with `id="baremetal-transition-root"`. The Router explicitly protects this specific ID from being destroyed when it swaps the `document.body.innerHTML`.
2. **Listen to Events:** Use `state.on()` to listen to `ROUTE_START`, `ROUTE_PROGRESS`, `ROUTE_END`, and `ROUTE_ERROR`.

**Example:**
```javascript
// custom_transition.js
export function mount({ state }) {
  // 1. Create or get the protected root node
  let root = document.getElementById('baremetal-transition-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'baremetal-transition-root';
    document.body.appendChild(root);
  }

  // 2. Build your custom UI (e.g., a spinner)
  const spinner = document.createElement('div');
  spinner.innerText = "Loading...";
  spinner.style.display = 'none';
  root.appendChild(spinner);

  const unsubs = [];

  // 3. Listen to Router events
  unsubs.push(state.on('ROUTE_START', () => {
    spinner.style.display = 'block';
  }));

  unsubs.push(state.on('ROUTE_PROGRESS', (payload) => {
    // payload.progress goes from 0 to 100
    spinner.innerText = `Loading... ${Math.round(payload.progress)}%`;
  }));

  unsubs.push(state.on('ROUTE_END', () => {
    spinner.style.display = 'none';
  }));

  return {
    destroy: () => {
      unsubs.forEach(u => u());
      if (root.parentNode) root.parentNode.removeChild(root);
    }
  };
}
```
