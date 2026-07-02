# BareMetal.js - LLM Context

This document provides a comprehensive overview of the BareMetal.js framework based on its official documentation. It serves as context for LLMs to understand the architecture, configuration, and APIs of the engine.

## Overview
BareMetal.js is a lightweight, dependency-free Vanilla JavaScript SPA (Single Page Application) engine. It prioritizes performance, native browser features (such as the History API and View Transitions API), and explicit lifecycle management over virtual DOM diffing.

---

## 1. The Golden Rule: Loader Requirement
Every HTML page participating in the SPA **must** include a `<script>` tag that imports and calls the `loader({...})` function. 

The Router explicitly parses newly fetched HTML pages looking for this function call. If it's missing, the router assumes it is not a BareMetal page and falls back to a full native browser reload.

```html
<script type="module">
  import { loader } from 'baremetal.js';
  // Required even if empty
  loader({}); 
</script>
```

---

## 2. Core Initialization & Configuration (Multi-Page Setup)
The engine is initialized globally via `BareMetal.init(config)`. In a multi-page setup, the standard practice is to create a single, shared `config.js` file that calls `BareMetal.init()` and then include that config script in the `<head>` of every HTML page.

```javascript
// config.js
import { BareMetal } from 'baremetal.js';

BareMetal.init({
  debug: false,
  keepAliveSameModules: true,
  // ... other global options
});
```

```html
<!-- Example: Included in the <head> of index.html, about.html, etc. -->
<head>
  <script type="module" src="/config.js"></script>
</head>
```

### Configuration Options:
- `debug` (boolean, default `false`): Enables verbose console logs.
- `keepAliveSameModules` (boolean, default `true`): Prevents destroying modules shared between the outgoing and incoming routes.
- `autoWrap` (boolean, default `true`): Automatically wraps JS modules that don't export a `mount` function into a valid `mount(context)` block.
- `hoverPrefetch` (boolean, default `false`): Fetches HTML payloads in the background on link hover for 0ms latency navigation.
- `persistState` (boolean, default `false`): Serializes the global `stateManager` to `sessionStorage` for F5 refresh resilience.
- `virtualizeDom` (boolean, default `false`): Injects the `Virtualizer` helper into module mount contexts.
- `showErrorNotification` (boolean, default `false`): Displays a floating error boundary on navigation failures (e.g., 404).
- `transition`: An object controlling page transitions:
  - `enabled` (boolean, default `false`): Enables the protected transition module.
  - `module` (string, default `null`): Path to a custom transition JS file.
  - `simulatedDelay` (number, default `0`): Artificial delay (ms) for testing transitions.
  - `useViewTransitions` (boolean, default `false`): Uses the browser's native View Transitions API (`document.startViewTransition`) for cross-fades.

---

## 3. Router API (`BareMetal.router`)
BareMetal handles most navigation automatically by intercepting anchor clicks and `popstate`. For manual control:

- **`BareMetal.router.reload()`**: Executes a hard reload (`window.location.reload()`), wiping SPA state.
- **`BareMetal.router.handleRoute()`**: Forces the router to evaluate `window.location.pathname`, fetch the corresponding HTML, and perform the DOM swap. Use this after manual URL changes via `history.pushState()`.

---

## 4. Reactive State & Event Bus (`BareMetal.state`)
The state manager acts as a reactive store and a global Pub/Sub event bus. It is accessible via `BareMetal.state`.

- **`state.init(key, defaultValue)`**: Initializes state. Ignored if the key already exists.
- **`state.update(key, value)`**: Updates a key and synchronously triggers all subscribed callbacks.
- **`state.get(key)`**: Returns the current value.
- **`state.subscribe(key, callback)`**: Subscribes to a key. Returns an unsubscribe function. *Note: The callback is invoked immediately upon subscription.*
- **`state.publish(event, payload)`**: Fires a one-off Pub/Sub event.
- **`state.on(event, callback)`**: Listens for a Pub/Sub event. Returns an unsubscribe function.

---

## 5. Module System: Importing & Wrapping
BareMetal strictly uses ES Modules. When navigating, the engine dynamically imports scripts defined in the page's `loader({...})` configuration.

### Module Cleanup & `onCleanup` Hook
To prevent memory leaks across SPA navigations, modules must clean up global assignments (`window.someFunc`), event listeners, and class instances. 

You can use the `onCleanup` hook provided in the `context` to register cleanup callbacks, which keeps your setup and teardown logic colocated:

```javascript
// /assets/js/my-module.js
export function mount({ state, onCleanup }) {
  state.init('counter', 0);
  
  const chart = new Chart('#canvas', config);
  window.myFunc = () => {};

  // Colocate cleanup for local variables and globals
  onCleanup(() => {
    chart.destroy();
    delete window.myFunc;
  });
  
  // Alternatively, you can explicitly return a destroy function:
  /*
  const unsub = state.subscribe('counter', () => {});
  return {
    destroy: () => {
      unsub(); // Cleanup to prevent memory leaks
    }
  };
  */
}
```

### Loading Modules in HTML (Per-Page Basis)
While the `config.js` initialization is shared across all pages, the `loader({...})` function is called at the bottom of the `<body>` on *each individual page* to declare the specific modules required for that particular route.

```html
<!-- Example on /about.html -->
<script type="module">
  import { loader } from 'baremetal.js';
  
  // Define modules specific to this page only
  loader({
    myModule: '/assets/js/my-module.js',
    aboutLogic: '/assets/js/about.js'
  });
</script>
```

### Auto-Wrapping
If `autoWrap: true` (default), plain JS files without a `mount` export are automatically wrapped by the engine:
```javascript
export async function mount(context) {
  const { state } = context;
  // ... original script content ...
}
```

---

## 6. Custom Transitions
You can replace the default loading bar by providing a custom transition module path in `config.transition.module`.

**Rules:**
1. **Protected Node**: Inject transition UI into an element with `id="baremetal-transition-root"`. The Router explicitly protects this ID during DOM swaps.
2. **Listen to Events**: Hook into `state.on()` for the following lifecycle events:
   - `ROUTE_START`
   - `ROUTE_PROGRESS` (includes `payload.progress` from 0 to 100)
   - `ROUTE_END`
   - `ROUTE_ERROR`

---

## 7. DOM Swapping & Page-Specific Assets
When the BareMetal Router performs an SPA navigation, it swaps the `<body>` using `innerHTML`. This introduces two critical web security/architecture caveats you MUST account for when loading external libraries on specific pages (e.g., WYSIWYG editors, charts):

1. **Page-Specific Styles (`data-baremetal="style"`)**
   The router deliberately strips out all `<link>` and `<style>` tags from the `<head>` of the newly fetched page to prevent CSS bloat, **unless** they include the `data-baremetal="style"` attribute. 

   If a page has custom CSS (like a `<style>` block) or external CSS dependencies, you MUST add this attribute so the router preserves it:
   ```html
   <link rel="stylesheet" href="external-lib.css" data-baremetal="style" />
   <style data-baremetal="style"> .my-custom-class { color: red; } </style>
   ```

2. **Page-Specific Scripts (`<script src="...">`)**
   Browsers **do not execute** `<script>` tags injected via `innerHTML`. If a page relies on an external `<script src="...">` tag placed in its `<body>`, it will completely fail to load during SPA navigation.
   **Solution:** You must either:
   - Make the library a global dependency by placing it in the `<head>` of the initial app load (e.g., `index.php` or `header.php`).
   - Or, dynamically inject the `<script>` tag via JS using `document.createElement('script')` inside your module's `mount()` function.

3. **Bypassing the SPA Router (`data-baremetal="ignore"`)**
   The router intercepts all internal `<a>` links and fetches them asynchronously. If a link points to an internal API endpoint that redirects (e.g., SSO Login, file downloads, external redirects), the router will follow the redirect in the background (causing CORS errors) instead of navigating the browser.
   To bypass the SPA router and force a hard native browser navigation, add the `data-baremetal="ignore"` attribute to the anchor tag:
   ```html
   <a href="/public/api/auth/sso_login" data-baremetal="ignore">Login with SSO</a>
   ```
