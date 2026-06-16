export function mount({ state }) {
  console.log('[Transition Module] Mounted');

  // Create Protected Root
  let root = document.getElementById('baremetal-transition-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'baremetal-transition-root';
    document.body.appendChild(root);
  }

  // Create Progress Bar
  const progressBar = document.createElement('div');
  progressBar.style.position = 'fixed';
  progressBar.style.top = '0';
  progressBar.style.left = '0';
  progressBar.style.height = '3px';
  progressBar.style.backgroundColor = '#3498db'; // YouTube blue-ish
  progressBar.style.width = '0%';
  progressBar.style.zIndex = '999999';
  progressBar.style.transition = 'width 0.2s ease-out, opacity 0.3s ease';
  progressBar.style.opacity = '0';
  progressBar.style.pointerEvents = 'none';

  // Create Fade Overlay
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

  // Subscriptions
  const unsubs = [];

  unsubs.push(state.on('ROUTE_START', () => {
    progressBar.style.opacity = '1';
    progressBar.style.width = '5%';
    
    overlay.style.pointerEvents = 'all'; // block clicks during load
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
      
      // Reset after fade out
      setTimeout(() => {
        progressBar.style.width = '0%';
      }, 300);
    }, 200);
  }));

  unsubs.push(state.on('ROUTE_ERROR', () => {
    progressBar.style.backgroundColor = '#e74c3c'; // red
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
