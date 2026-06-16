# BareMetal.js

A lightweight, dependency-free Vanilla JavaScript SPA engine prioritizing extreme performance, native browser features, and explicit lifecycle management.

## Advanced Features

### 🚀 Hover Pre-fetching (0ms Latency)
BareMetal anticipates user actions. When a user hovers over an internal link, the engine instantly fetches the HTML in the background. By the time they click, the page is already cached, resulting in instantaneous, zero-latency transitions.

### 🧠 Smart Module Keep-Alive
Share state and complex UI modules (like persistent sidebars or floating media players) across page transitions without destroying them. Native `<video>` and `<audio>` tags are preserved and re-injected into the new DOM layout without interrupting playback!

### 🔄 Scroll Memory & Programmatic Back
BareMetal maintains a persistent internal history stack. When navigating away from a page, it saves your exact scroll position. When hitting the "Back" button (or calling `BareMetal.router.back()`), it instantly restores your exact scroll depth on the previous page.

### ⚡ Reactive State Management
Use a clean, built-in publish/subscribe Signals pattern to prevent race conditions. Modules interact safely via the State Manager instead of mutating each other's variables directly.

---

## Folder Structure

```
├── src/                  # The BareMetal Engine Source Code
│   ├── index.js          # Main export
│   ├── router.js         # The Navigator & DOM Patcher
│   ├── loader.js         # The Module Loader & Orchestrator
│   └── state.js          # The Reactive State Manager & Event Bus
├── demo/                 # Demo Application showing usage
│   ├── index.html        # Entry HTML
│   ├── main.js           # Global config and engine initialization
│   ├── assets/js/        # Page-specific widgets and modules
```

## How to Run the Demo

To test the demo and the advanced features across page navigation, serve the directory via any local static server.

Using `npx`:
```bash
npx serve .
```

Then visit: `http://localhost:3000/page1.html`

## Global Configuration

Initialize the engine in your main entry file to toggle advanced features:

```javascript
import { BareMetal } from './src/index.js';

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

## Module Definition

A BareMetal module must export a `mount` function. The engine injects the `state` manager into `mount`. It must return an object containing a `destroy()` function to prevent memory leaks when the user navigates away.

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

## Page Configuration

On your HTML pages, tell BareMetal which modules are required for that specific page via an inline module script.

```html
<script type="module">
  import { loader } from './src/index.js';
  loader({
    sharedSidebar: "./js/sidebar.js",
    dashboard: "./js/dashboard.js"
  });
</script>
```
