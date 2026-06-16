import { stateManager } from './state.js';
import { Loader, loader } from './loader.js';
import { Router } from './router.js';

const BareMetal = {
  state: stateManager,
  events: stateManager, // Aliased for backward compatibility with Pub/Sub mental model
  loader: loader,
  router: Router,

  init(config = {}) {
    if (config.debug !== undefined) Loader.setConfig({ debug: config.debug });
    if (config.keepAliveSameModules !== undefined) Loader.setConfig({ keepAliveSameModules: config.keepAliveSameModules });
    if (config.transition !== undefined) Loader.setConfig({ transition: config.transition });
    if (config.autoWrap !== undefined) Loader.setConfig({ autoWrap: config.autoWrap });
    if (config.hoverPrefetch !== undefined) Loader.setConfig({ hoverPrefetch: config.hoverPrefetch });

    // Initialize Router
    Router.init();
    Loader.log("Initialized BareMetal Engine with config:", config);
  }
};

export { BareMetal, loader };
