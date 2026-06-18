/**
 * baremetal.js v1.2.1
 * A lightweight, dependency-free Vanilla JavaScript SPA engine prioritizing extreme performance, native browser features, and explicit lifecycle management.
 * (c) 2026 dkydivyansh
 * Released under the GPL-3.0 License
 */

export function mount({ state }) {
  console.log('[Transition Module] Mounted');

  let root = document.getElementById('baremetal-transition-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'baremetal-transition-root';
    document.body.appendChild(root);
  }

  const progressBar = document.createElement('div');
  progressBar.style.position = 'fixed';
  progressBar.style.top = '0';
  progressBar.style.left = '0';
  progressBar.style.height = '3px';
  progressBar.style.backgroundColor = '#3498db';
  progressBar.style.width = '0%';
  progressBar.style.zIndex = '999999';
  progressBar.style.transition = 'width 0.2s ease-out, opacity 0.3s ease';
  progressBar.style.opacity = '0';
  progressBar.style.pointerEvents = 'none';

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  overlay.style.zIndex = '999998';
  overlay.style.transition = 'opacity 0.3s ease';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';

  root.appendChild(overlay);
  root.appendChild(progressBar);

  const unsubs = [];

  unsubs.push(state.on('ROUTE_START', () => {
    progressBar.style.backgroundColor = '#3498db';
    progressBar.style.opacity = '1';
    progressBar.style.width = '5%';

    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
  }));

  unsubs.push(state.on('ROUTE_PROGRESS', (payload) => {
    if (payload && payload.progress !== undefined) {
      progressBar.style.width = `${payload.progress}%`;
    }
  }));

  unsubs.push(state.on('ROUTE_END', () => {
    progressBar.style.width = '100%';

    setTimeout(() => {
      progressBar.style.opacity = '0';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';

      setTimeout(() => {
        progressBar.style.width = '0%';
      }, 300);
    }, 200);
  }));

  unsubs.push(state.on('ROUTE_ERROR', () => {
    progressBar.style.backgroundColor = '#e74c3c';
    setTimeout(() => {
      progressBar.style.opacity = '0';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }, 1000);
  }));

  return {
    destroy: () => {
      console.log('[Transition Module] Destroyed');
      unsubs.forEach(u => u());
      if (root.parentNode) root.parentNode.removeChild(root);
    }
  };
}
