import { Loader } from './loader.js';
import { stateManager } from './state.js';

export const Router = {
  htmlCache: {},
  scrollMemory: {},
  historyStack: [],
  currentAbortController: null,
  lastPathAndSearch: '',

  init() {
    this.lastPathAndSearch = window.location.pathname + window.location.search;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.addEventListener('popstate', this.handleRoute.bind(this));

    document.body.addEventListener('click', e => {

      const anchor = e.target.closest('a');
      if (!anchor) return;

      if (
        anchor.origin !== window.location.origin ||
        anchor.target === '_blank' ||
        (anchor.rel && anchor.rel.includes('noreferrer')) ||
        anchor.hasAttribute('download') ||
        (anchor.getAttribute('href') || '').startsWith('#')
      ) {
        return;
      }

      e.preventDefault();

      this.historyStack.push(window.location.pathname);
      this.scrollMemory[window.location.pathname] = window.scrollY;

      history.pushState(null, '', anchor.href);
      this.handleRoute();
    });

    document.body.addEventListener('mouseover', e => {
      if (!Loader.config.hoverPrefetch) return;
      const anchor = e.target.closest('a');
      if (!anchor) return;
      if (
        anchor.origin === window.location.origin &&
        anchor.target !== '_blank' &&
        !anchor.hasAttribute('download') &&
        !(anchor.getAttribute('href') || '').startsWith('#') &&
        !this.htmlCache[anchor.href]
      ) {
        this.htmlCache[anchor.href] = 'fetching';
        fetch(anchor.href)
          .then(res => {
             if (res.ok) return res.text();
             throw new Error('Failed to prefetch');
          })
          .then(html => this.htmlCache[anchor.href] = html)
          .catch(() => delete this.htmlCache[anchor.href]);
      }
    });
  },

  back() {

    if (this.historyStack.length > 0) {
      const prevUrl = this.historyStack.pop();
      history.pushState(null, '', prevUrl);
      this.handleRoute();
    } else {
      history.back();
    }
  },

  reload() {
    window.location.reload();
  },

  async handleRoute(e) {
    const currentPathAndSearch = window.location.pathname + window.location.search;
    if (this.lastPathAndSearch === currentPathAndSearch) {
      return; // Ignore navigations that only change the #hash
    }
    this.lastPathAndSearch = currentPathAndSearch;

    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

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

      let htmlText;
      const fullUrl = new URL(url, document.baseURI).href;

      if (Loader.config.hoverPrefetch && this.htmlCache[fullUrl] && this.htmlCache[fullUrl] !== 'fetching') {
        htmlText = this.htmlCache[fullUrl];
        Loader.log(`Used pre-fetched cache for ${url}`);
      } else {
        const response = await fetch(url, { signal });
        
        if (response.redirected) {
          const newUrl = new URL(response.url);
          Loader.log(`Redirect detected to ${newUrl.pathname}. Continuing SPA transition to new destination.`);
          // Sync the URL bar and router state to the redirect destination
          history.replaceState(null, '', newUrl.pathname + newUrl.search);
          this.lastPathAndSearch = newUrl.pathname + newUrl.search;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        htmlText = await response.text();
      }

      stateManager.publish('ROUTE_PROGRESS', { url, progress: 50 });

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      let config = null;
      const scriptTags = doc.querySelectorAll('script');
      for (const script of scriptTags) {
        if (script.textContent.includes('loader(')) {

          const match = script.textContent.match(/loader\s*\(\s*(\{[\s\S]*?\})\s*\)/);
          if (match && match[1]) {
            try {

              config = new Function('return ' + match[1])();
            } catch (e) {
              console.error("Failed to parse loader config in new page", e);
            }
          }
        }
      }

      if (!config) {
        Loader.log(`No BareMetal config found on ${url}. Falling back to native navigation.`);
        window.location.assign(url);
        return;
      }

      const modulesToLoad = await Loader.prepare(config);

      document.title = doc.title;

      const oldStyles = document.head.querySelectorAll('link[data-baremetal="style"], style[data-baremetal="style"]');
      oldStyles.forEach(s => s.remove());
      const newStyles = doc.head.querySelectorAll('link[data-baremetal="style"], style[data-baremetal="style"]');
      newStyles.forEach(s => document.head.appendChild(s.cloneNode(true)));

      const preservedNodes = [];
      const persistentElements = document.querySelectorAll('[data-baremetal-preserve]');

      persistentElements.forEach(el => {
        if (!el.id) return;
        if (doc.getElementById(el.id)) {

           const placeholder = document.createElement('div');
           el.parentNode.replaceChild(placeholder, el);
           preservedNodes.push(el);
        }
      });

      const transitionRoot = document.getElementById('baremetal-transition-root');
      if (transitionRoot) {
        transitionRoot.parentNode.removeChild(transitionRoot);
      }

      const executeDOMSwap = () => {
        document.body.innerHTML = doc.body.innerHTML;

        preservedNodes.forEach(el => {
          const newEl = document.getElementById(el.id);
          if (newEl) {

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

        stateManager.publish('DOM_SWAPPED', null);
      };

      const doSwap = () => {
        executeDOMSwap();
        window.scrollTo(0, this.scrollMemory[url] || 0);
      };

      if (Loader.config.transition && Loader.config.transition.useViewTransitions && document.startViewTransition) {
        document.startViewTransition(() => {
          doSwap();
        });
      } else {
        doSwap();
      }

      await Loader.loadPrepared(modulesToLoad);

    } catch (err) {
      if (err.name === 'AbortError') {
        Loader.log(`Aborted fetch for ${url} due to new navigation.`);
        return;
      }
      console.error("Routing error:", err);
      stateManager.publish('ROUTE_ERROR', { url, error: err.message });

      if (Loader.config.showErrorNotification) {

        if (this.historyStack.length > 0) {
          const prev = this.historyStack.pop();
          history.replaceState(null, '', prev);
        }

        const notif = document.createElement('div');
        notif.style.position = 'fixed';
        notif.style.bottom = '20px';
        notif.style.left = '20px';
        notif.style.background = '#e74c3c';
        notif.style.color = 'white';
        notif.style.padding = '15px 20px';
        notif.style.borderRadius = '8px';
        notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notif.style.zIndex = '999999';
        notif.style.fontFamily = 'sans-serif';
        notif.style.transition = 'opacity 0.3s ease';
        notif.innerHTML = `<strong>Navigation Failed:</strong> ${err.message}`;

        document.body.appendChild(notif);

        setTimeout(() => {
          notif.style.opacity = '0';
          setTimeout(() => notif.remove(), 300);
        }, 4000);
      } else {

        if (this.historyStack.length > 0) {
          const prev = this.historyStack.pop();
          history.replaceState(null, '', prev);
        }
        window.location.assign(url);
      }
    }
  }
};
