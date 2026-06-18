# BareMetal.js

A lightweight, dependency-free Vanilla JavaScript SPA engine prioritizing extreme performance, native browser features, and explicit lifecycle management.

---

## Overview

BareMetal.js is designed to bring Single Page Application (SPA) functionality to vanilla HTML/JS projects without the overhead of heavy frameworks or build steps. It intercepts navigations to provide instantaneous page transitions while giving developers precise control over module lifecycles and state.

## Key Features

- **Hover Pre-fetching (0ms Latency):** BareMetal anticipates user actions by fetching HTML in the background when a user hovers over an internal link, resulting in instant transitions upon click.
- **Smart Module Keep-Alive:** Share state and complex UI modules across page transitions without destroying them. Native `<video>` and `<audio>` tags can be preserved and re-injected into the new DOM seamlessly.
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
import { BareMetal, loader } from 'https://cdn.jsdelivr.net/npm/baremetal.js@latest/src/index.js';
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

## Project Structure

```
├── src/                        # The BareMetal Engine Source Code
│   ├── index.js
│   ├── router.js
│   ├── loader.js
│   ├── state.js
│   └── transition.js
├── demo/                       # Demo Application
│   ├── page1.html
│   ├── page2.html
│   ├── page3_normal.html
│   ├── main.js
│   └── assets/                 # Page-specific widgets and media
├── docs/
│   └── api.md                  # Comprehensive API Reference
```

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

## Configuration Reference

The `BareMetal.init(config)` method accepts the following configuration object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable verbose console logs. |
| `keepAliveSameModules` | boolean | `true` | Prevent destruction of modules shared between routes. |
| `autoWrap` | boolean | `true` | Automatically wrap modules that do not export a `mount` function. |
| `hoverPrefetch` | boolean | `false` | Enable 0ms latency pre-fetching on link hover. |
| `transition.enabled` | boolean | `false` | Enable the protected transition module. |
| `transition.module` | string | `null` | Path to a custom transition module. |
| `transition.simulatedDelay` | number | `0` | Artificial delay (ms) for testing transitions. |
| `offline` | object | `{}` | Configure offline service worker support. See API docs for details. |
| `transition.useViewTransitions` | boolean | `false` | Enables the native View Transitions API for smooth cross-fades during navigation. |

## API Reference

For detailed documentation on the Router, State Manager, and Events, please see the [API Documentation](docs/api.md).

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
