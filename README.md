# BareMetal.js

A lightweight, dependency-free Vanilla JavaScript SPA engine prioritizing extreme performance, native browser features, and explicit lifecycle management.

---

## Overview

BareMetal.js is designed to bring Single Page Application (SPA) functionality to vanilla HTML/JS projects without the overhead of heavy frameworks or build steps. It intercepts navigations to provide instantaneous page transitions while giving developers precise control over module lifecycles and state.

## Key Features

### Hover Pre-fetching (0ms Latency)
BareMetal anticipates user actions. When a user hovers over an internal link, the engine instantly fetches the HTML in the background. By the time they click, the page is already cached, resulting in instantaneous, zero-latency transitions.

### Auto-Request Cancellation
If a user is frantically clicking links, BareMetal won't clog up their network. The Router automatically utilizes the `AbortController` API to cancel any pending `fetch` requests as soon as a new navigation is triggered, saving bandwidth and preventing race conditions.

### Smart Module Keep-Alive
Share state and complex UI modules (like persistent sidebars or floating media players) across page transitions without destroying them. Native `<video>` and `<audio>` tags are preserved and re-injected into the new DOM layout without interrupting playback!

### Component Lazy Loading
Load heavy widgets only when they scroll into view! The Loader supports an `IntersectionObserver` API out of the box. Just pass a `lazy` CSS selector to the `loader({ widget: { path: './widget.js', lazy: '#widget' } })` and it defers downloading and execution until the user actually sees it.

### State Hydration (F5 Resilience)
Never lose state on a hard reload again. If enabled, BareMetal automatically serializes the `stateManager` to `sessionStorage` in real-time. If the user hits F5, the engine instantly hydrates the state and bounces right back to where they were!

### DOM Virtualization Helper
Rendering 10,000 table rows? BareMetal exposes a `Virtualizer` class that recycles DOM nodes to render massive lists with zero jank. When enabled globally, the engine automatically injects the `virtualize` helper directly into your module's `mount` context!.
- **Scroll Memory & Programmatic Back:** Maintains a persistent history stack, restoring your exact scroll depth instantly when navigating backward.
- **Reactive State Management:** Includes a built-in publish/subscribe Signals pattern, preventing race conditions and keeping your UI synced.
- **Custom Page Transitions:** Build and integrate your own loading animations and transition effects hooking into the routing lifecycle.
- **Error Boundaries:** Handles navigation failures gracefully with configurable fallback UIs.
- **Auto-Wrap Module Loader:** Can automatically wrap simple scripts into conformant lifecycle modules to prevent errors.

## Quick Start

### Installation

**Option 1: Using npm**
If you are using a bundler (like Vite, Webpack) or modern Node.js environments:
```bash
npm install baremetal.js
```
```javascript
import { BareMetal, loader } from 'baremetal.js';
```

**Option 2: Using jsDelivr CDN**
To use the latest version directly in the browser without any build tools, import it via CDN:
```javascript
import { BareMetal, loader } from 'https://cdn.jsdelivr.net/npm/baremetal.js@latest/dist/baremetal.min.js';
```

**Option 3: Manual Download**
Just clone the repository or copy the `src` folder directly into your project.

### Running the Demo

To test the demo and advanced features across page navigation, serve the directory via any local static server.

Using `npx`:

```bash
npx serve .
```

Then visit: `http://localhost:3000/demo/page1.html`

## Usage

### 1. Engine Initialization

Initialize the engine in your main entry file (e.g., `main.js`) to toggle advanced features:

```javascript
import { BareMetal } from '../src/index.js';

BareMetal.init({
  debug: false,
  keepAliveSameModules: true,
  autoWrap: false,
  hoverPrefetch: true,       // 0ms Latency Pre-fetching
  persistState: true,        // F5 Resilience
  virtualizeDom: true,       // Inject virtualizer
  showErrorNotification: true, // Error Boundaries
  transition: {
    enabled: true,
    simulatedDelay: 0
  }
});
```

### 2. Module Definition

A BareMetal module must export a `mount` function. The engine injects the `state` manager into `mount`. It must return an object containing a `destroy()` function to prevent memory leaks when navigating away.

```javascript
// my-widget.js
export function mount({ state }) {
  const btn = document.getElementById('my-btn');
  btn.onclick = () => alert('Clicked!');
  
  // Return cleanup methods
  return {
    destroy: () => {
      btn.onclick = null;
    }
  };
}
```

### 3. Page Configuration

On your HTML pages, instruct BareMetal on which modules are required for that specific page using the inline `loader()`.

```html
<script type="module">
  import { loader } from '../src/index.js';
  loader({
    sharedSidebar: "/demo/assets/js/sidebar.js",
    dashboard: "/demo/assets/js/dashboard.js"
  });
</script>
```

### Lazy Loading a Component

```html
<script type="module">
  import { loader } from './src/index.js';
  loader({
    sharedSidebar: "./js/sidebar.js",
    heavyChart: { path: "./js/chart.js", lazy: "#chart-container" } // Only loads when visible!
  });
</script>
```

## API Reference

For detailed documentation on the Configuration, Router, State Manager, and Events, please see the [API Documentation](docs/api.md).

## Custom Transitions

You can replace the default progress bar and fade overlay by pointing `config.transition.module` to your own JavaScript file. A custom transition is a standard BareMetal module that listens to routing events (`ROUTE_START`, `ROUTE_PROGRESS`, `ROUTE_END`, `ROUTE_ERROR`). Ensure your transition UI is injected into an element with `id="baremetal-transition-root"`. 

See the API Documentation for a complete example.

## Browser Support

BareMetal.js uses ES Modules natively in the browser. It supports all modern browsers (Chrome, Firefox, Safari, Edge) without any build step required.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details on how to get started.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Security

If you discover a security vulnerability, please refer to our [Security Policy](SECURITY.md).

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
