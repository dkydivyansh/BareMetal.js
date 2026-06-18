import { stateManager } from './state.js';
import { Loader, loader } from './loader.js';
import { Router } from './router.js';
import { virtualize } from './virtualize.js';

const BareMetal = {
  state: stateManager,
  events: stateManager,
  loader: loader,
  router: Router,
  virtualize: virtualize,

  init(config = {}) {
    if (config.debug !== undefined) Loader.setConfig({ debug: config.debug });
    if (config.keepAliveSameModules !== undefined) Loader.setConfig({ keepAliveSameModules: config.keepAliveSameModules });
    if (config.transition !== undefined) Loader.setConfig({ transition: config.transition });
    if (config.autoWrap !== undefined) Loader.setConfig({ autoWrap: config.autoWrap });
    if (config.hoverPrefetch !== undefined) Loader.setConfig({ hoverPrefetch: config.hoverPrefetch });
    if (config.showErrorNotification !== undefined) Loader.setConfig({ showErrorNotification: config.showErrorNotification });

    if (config.persistState !== undefined) {
      Loader.setConfig({ persistState: config.persistState });
      if (config.persistState) {
        window.__baremetal_persist_state = true;
        stateManager.initPersistence();
      }
    }

    if (config.virtualizeDom !== undefined) Loader.setConfig({ virtualizeDom: config.virtualizeDom });

    Router.init();
    Loader.log("Initialized BareMetal Engine with config:", config);
  }
};

export { BareMetal, loader };
