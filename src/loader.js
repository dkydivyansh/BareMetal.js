import { stateManager } from './state.js';

export const Loader = {
  activeModules: {}, // { key: { path: "./dash.js", module: exportedModule } }
  config: { keepAliveSameModules: true, debug: false, autoWrap: true, transition: { enabled: false, simulatedDelay: 0, module: null } },
  
  setConfig(globalConfig) {
    this.config = { ...this.config, ...globalConfig };
  },

  log(...args) {
    if (this.config.debug) console.log('[BareMetal Loader]', ...args);
  },

  /**
   * Prepares the transition by destroying obsolete modules and identifying new ones.
   */
  async prepare(newConfig) {
    // Auto-inject transition module if enabled
    if (this.config.transition && this.config.transition.enabled) {
      const transitionPath = this.config.transition.module || '/src/transition.js';
      newConfig['__baremetal_transition'] = transitionPath;
    }

    const modulesToKeep = {};
    const modulesToDestroy = [];
    const modulesToLoad = {};

    for (const [key, mod] of Object.entries(this.activeModules)) {
      const isImmortal = key === '__baremetal_transition';
      if ((this.config.keepAliveSameModules || isImmortal) && newConfig[key] === mod.path) {
        // Keep alive
        modulesToKeep[key] = mod;
        this.log(`Keep-Alive: ${key} (${mod.path})`);
      } else {
        // Mark for destruction
        modulesToDestroy.push(mod);
      }
    }

    // Destroy obsolete modules
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

    // Determine what's new
    for (const [key, path] of Object.entries(newConfig)) {
      if (!modulesToKeep[key]) {
        modulesToLoad[key] = path;
      }
    }

    // Temporarily update active modules to only the kept ones
    this.activeModules = modulesToKeep;

    return modulesToLoad;
  },

  /**
   * Loads the prepared modules. Called by Router after DOM swap.
   */
  async loadPrepared(modulesToLoad) {
    const total = Object.keys(modulesToLoad).length;
    let loaded = 0;

    const loadPromises = Object.entries(modulesToLoad).map(async ([key, path]) => {
      this.log(`Importing module: ${path}`);
      try {
        const resolvedPath = new URL(path, document.baseURI).href;
        const noCachePath = `${resolvedPath}?t=${Date.now()}`;
        
        let module;

        if (this.config.autoWrap) {
          // Fetch source to check if it needs auto-wrapping
          const response = await fetch(noCachePath);
          if (!response.ok) throw new Error(`Failed to fetch ${noCachePath}`);
          const sourceText = await response.text();

          const hasMount = /export\s+(function|const|let|var)\s+mount\b/.test(sourceText) || /export\s+\{.*?\bmount\b.*?\}/.test(sourceText);

          if (!hasMount) {
            console.warn(`[BareMetal] WARNING: Module ${path} does not explicitly export a mount() function. Auto-wrapping it...`);
            
            const wrappedSource = `
              export async function mount(context) {
                const { state } = context;
                ${sourceText}
              }
            `;
            
            const blob = new Blob([wrappedSource], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            module = await import(blobUrl);
            URL.revokeObjectURL(blobUrl);
          } else {
            module = await import(noCachePath);
          }
        } else {
          // Auto-wrapping disabled, load natively
          module = await import(noCachePath);
        }
        
        if (typeof module.mount === 'function') {
          this.log(`Mounting module: ${path}`);
          const instance = await module.mount({ state: stateManager });
          
          this.activeModules[key] = {
            path: path,
            module: instance ? { destroy: instance.destroy } : module
          };
        } else {
          console.error(`[BareMetal] Module ${path} failed to provide a mount function even after wrapping.`);
        }
      } catch (err) {
        console.error(`Failed to load module: ${path}`, err);
      } finally {
        loaded++;
        if (total > 0) {
          const progress = 50 + (loaded / total) * 50;
          stateManager.publish('ROUTE_PROGRESS', { url: window.location.pathname, progress });
        }
      }
    });

    await Promise.all(loadPromises);
    stateManager.publish('ROUTE_END', { url: window.location.pathname });
  },

  /**
   * Legacy standalone load (used on first page load directly)
   */
  async load(config) {
    const modulesToLoad = await this.prepare(config);
    await this.loadPrepared(modulesToLoad);
  }
};

// The user-facing API
export function loader(config) {
  return Loader.load(config);
}
