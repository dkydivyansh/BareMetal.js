import { Loader } from './loader.js';
import { stateManager } from './state.js';

export const Router = {
  init() {
    window.addEventListener('popstate', this.handleRoute.bind(this));
    
    // Intercept all link clicks
    document.body.addEventListener('click', e => {
      // Find closest anchor tag
      const anchor = e.target.closest('a');
      if (!anchor) return;

      // Ignore external domains, target="_blank", noreferrer, or downloads
      if (
        anchor.origin !== window.location.origin || 
        anchor.target === '_blank' ||
        (anchor.rel && anchor.rel.includes('noreferrer')) ||
        anchor.hasAttribute('download')
      ) {
        return; // Let browser handle it naturally
      }

      // Intercept same-origin internal links
      e.preventDefault();
      history.pushState(null, '', anchor.href);
      this.handleRoute();
    });
  },

  reload() {
    window.location.reload();
  },

  async handleRoute() {
    const url = window.location.pathname;
    try {
      Loader.log(`Navigating to ${url}`);
      stateManager.publish('ROUTE_START', { url });

      if (Loader.config.transition && Loader.config.transition.simulatedDelay) {
        stateManager.publish('ROUTE_PROGRESS', { url, progress: 10 });
        await new Promise(r => setTimeout(r, Loader.config.transition.simulatedDelay / 2));
        stateManager.publish('ROUTE_PROGRESS', { url, progress: 30 });
        await new Promise(r => setTimeout(r, Loader.config.transition.simulatedDelay / 2));
      }

      const response = await fetch(url);
      const htmlText = await response.text();
      
      stateManager.publish('ROUTE_PROGRESS', { url, progress: 50 });

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // 1. Extract Config
      let config = null;
      const scriptTags = doc.querySelectorAll('script');
      for (const script of scriptTags) {
        if (script.textContent.includes('loader(')) {
          // Extract the JSON-like object from loader({...})
          const match = script.textContent.match(/loader\s*\(\s*(\{[\s\S]*?\})\s*\)/);
          if (match && match[1]) {
            try {
              // Using Function to safely parse object string that might not be strict JSON
              config = new Function('return ' + match[1])();
            } catch (e) {
              console.error("Failed to parse loader config in new page", e);
            }
          }
        }
      }

      // If no BareMetal loader config is found, fallback to standard navigation
      if (!config) {
        Loader.log(`No BareMetal config found on ${url}. Falling back to native navigation.`);
        window.location.assign(url);
        return;
      }

      // 2. Prepare transition: identify kept vs destroyed modules
      const modulesToLoad = await Loader.prepare(config);

      // 3. Swap DOM and Head
      document.title = doc.title;
      
      // Swap Head Styles (prevent CSS leak)
      const oldStyles = document.head.querySelectorAll('link[data-baremetal="style"], style[data-baremetal="style"]');
      oldStyles.forEach(s => s.remove());
      const newStyles = doc.head.querySelectorAll('link[data-baremetal="style"], style[data-baremetal="style"]');
      newStyles.forEach(s => document.head.appendChild(s.cloneNode(true)));

      // User Protected Elements (data-baremetal-preserve)
      const preservedNodes = [];
      const persistentElements = document.querySelectorAll('[data-baremetal-preserve]');
      
      persistentElements.forEach(el => {
        if (!el.id) return;
        if (doc.getElementById(el.id)) {
           // Synchronously detach the live node
           const placeholder = document.createElement('div');
           el.parentNode.replaceChild(placeholder, el);
           preservedNodes.push(el);
        }
      });

      // Engine Protected Elements (Immortal)
      const transitionRoot = document.getElementById('baremetal-transition-root');
      if (transitionRoot) {
        transitionRoot.parentNode.removeChild(transitionRoot);
      }

      // Brutal DOM swap (Fast, deeply nested support)
      document.body.innerHTML = doc.body.innerHTML;

      // Restore User Protected Elements into their exact new positions
      preservedNodes.forEach(el => {
        const newEl = document.getElementById(el.id);
        if (newEl) {
           // Sync attributes from the new HTML node so classes/styles update
           Array.from(el.attributes).forEach(attr => {
             if (attr.name !== 'id' && attr.name !== 'data-baremetal-preserve') el.removeAttribute(attr.name);
           });
           Array.from(newEl.attributes).forEach(attr => {
             if (attr.name !== 'id') el.setAttribute(attr.name, attr.value);
           });
           
           newEl.parentNode.replaceChild(el, newEl);
        }
      });

      if (transitionRoot) {
        document.body.appendChild(transitionRoot);
      }

      // Notify keep-alive modules that the DOM has been swapped so they can re-bind UI elements
      // Done synchronously to prevent CSS transition flashes
      stateManager.publish('DOM_SWAPPED', null);

      // 4. Mount new modules (this emits ROUTE_END)
      await Loader.loadPrepared(modulesToLoad);

    } catch (err) {
      console.error("Routing error:", err);
      stateManager.publish('ROUTE_ERROR', { url, error: err.message });
    }
  }
};
