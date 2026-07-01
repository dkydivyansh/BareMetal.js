import { stateManager } from './state.js';

export const Loader = {
  activeModules: {},
  config: { keepAliveSameModules: true, debug: false, autoWrap: true, hoverPrefetch: false, showErrorNotification: false, persistState: false, virtualizeDom: false, transition: { enabled: false, simulatedDelay: 0, module: null, useViewTransitions: false } },

  setConfig(globalConfig) {
    this.config = { ...this.config, ...globalConfig };
  },

  log(...args) {
    if (this.config.debug) console.log('[BareMetal Loader]', ...args);
  },

  async prepare(newConfig) {

    if (this.config.transition && this.config.transition.enabled) {
      const transitionPath = this.config.transition.module || '/src/transition.js';
      newConfig['__baremetal_transition'] = transitionPath;
    }

    const modulesToKeep = {};
    const modulesToDestroy = [];
    const modulesToLoad = {};

    for (const [key, mod] of Object.entries(this.activeModules)) {
      const isImmortal = key === '__baremetal_transition';
      const newPath = typeof newConfig[key] === 'string' ? newConfig[key] : (newConfig[key] ? newConfig[key].path : null);
      if ((this.config.keepAliveSameModules || isImmortal) && newPath === mod.path) {

        modulesToKeep[key] = mod;
        this.log(`Keep-Alive: ${key} (${mod.path})`);
      } else {

        modulesToDestroy.push(mod);
      }
    }

    for (const mod of modulesToDestroy) {
      this.log(`Destroying module: ${mod.path}`);
      if (mod.module && typeof mod.module.destroy === 'function') {
        try {
          mod.module.destroy();
        } catch (e) {
          console.error(`Error destroying module ${mod.path}`, e);
        }
      }
    }

    for (const [key, path] of Object.entries(newConfig)) {
      if (!modulesToKeep[key]) {
        modulesToLoad[key] = path;
      }
    }

    this.activeModules = modulesToKeep;

    return modulesToLoad;
  },

  async loadPrepared(modulesToLoad) {
    const total = Object.keys(modulesToLoad).length;
    let loaded = 0;

    const loadPromises = Object.entries(modulesToLoad).map(async ([key, modDef]) => {
      const path = typeof modDef === 'string' ? modDef : modDef.path;
      const lazySelector = typeof modDef === 'string' ? null : modDef.lazy;

      this.log(`Preparing module: ${path}`);

      const doImport = async () => {
        try {
          const resolvedPath = new URL(path, document.baseURI).href;
          const loadPath = this.config.debug ? `${resolvedPath}?t=${Date.now()}` : resolvedPath;

          let module;

          if (this.config.autoWrap) {
            const response = await fetch(loadPath);
            if (!response.ok) throw new Error(`Failed to fetch ${loadPath}`);
            const sourceText = await response.text();

            const hasMount = /export\s+(function|const|let|var)\s+mount\b/.test(sourceText) || /export\s+\{.*?\bmount\b.*?\}/.test(sourceText);

            if (!hasMount) {
              console.warn(`[BareMetal] WARNING: Module ${path} does not explicitly export a mount() function. Auto-wrapping it...`);
              const wrappedSource = `export async function mount(context) { const { state } = context; ${sourceText} }`;
              const blob = new Blob([wrappedSource], { type: 'application/javascript' });
              const blobUrl = URL.createObjectURL(blob);
              module = await import(blobUrl);
              URL.revokeObjectURL(blobUrl);
            } else {
              module = await import(loadPath);
            }
          } else {
            module = await import(loadPath);
          }

          if (typeof module.mount === 'function') {
            this.log(`Mounting module: ${path}`);

            const context = { state: stateManager };
            if (this.config.virtualizeDom) {
              const { virtualize } = await import('./virtualize.js');
              context.virtualize = virtualize;
            }

            // Safe Cleanup Registry
            const cleanups = [];
            context.onCleanup = (cb) => cleanups.push(cb);

            const instance = await module.mount(context);

            const autoDestroy = () => {
                cleanups.forEach(cb => { try { cb(); } catch(e) { console.error(e); } });
                if (instance && typeof instance.destroy === 'function') {
                    try { instance.destroy(); } catch(e) { console.error(e); }
                }
            };

            this.activeModules[key] = {
              path: path,
              module: { destroy: autoDestroy }
            };
          } else {
            console.error(`[BareMetal] Module ${path} failed to provide a mount function even after wrapping.`);
          }
        } catch (err) {
          console.error(`Failed to load module: ${path}`, err);
        }
      };

      if (lazySelector) {
        const element = document.querySelector(lazySelector);
        if (element && window.IntersectionObserver) {
          this.log(`Deferred loading of module ${path} until ${lazySelector} is visible`);
          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              observer.disconnect();
              doImport();
            }
          });
          observer.observe(element);

          loaded++;
          if (total > 0) {
            const progress = 50 + (loaded / total) * 50;
            stateManager.publish('ROUTE_PROGRESS', { url: window.location.pathname, progress });
          }
          return Promise.resolve();
        } else {

          await doImport();
        }
      } else {
        await doImport();
      }

      loaded++;
      if (total > 0) {
        const progress = 50 + (loaded / total) * 50;
        stateManager.publish('ROUTE_PROGRESS', { url: window.location.pathname, progress });
      }
    });

    await Promise.all(loadPromises);
    stateManager.publish('ROUTE_END', { url: window.location.pathname });
  },

  async load(config) {
    const modulesToLoad = await this.prepare(config);
    await this.loadPrepared(modulesToLoad);
  }
};

export function loader(config) {
  return Loader.load(config);
}
