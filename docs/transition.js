export function mount({ state }) {
  let root = document.getElementById('baremetal-transition-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'baremetal-transition-root';
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.width = '100%';
    root.style.height = '4px';
    root.style.zIndex = '999999';
    root.style.pointerEvents = 'none';
    document.body.appendChild(root);
  }

  // Create progress bar with brutalist/cyberpunk glow
  const bar = document.createElement('div');
  bar.style.height = '100%';
  bar.style.width = '0%';
  bar.style.backgroundColor = '#7b39fc'; // Primary Fixed accent color
  bar.style.boxShadow = '0 0 10px #7b39fc, 0 0 20px #7b39fc'; // Glow effect
  bar.style.transition = 'width 0.1s ease-out, opacity 0.3s ease-out';
  bar.style.opacity = '0';
  root.appendChild(bar);

  const unsubs = [];

  unsubs.push(state.on('ROUTE_START', () => {
    bar.style.opacity = '1';
    bar.style.width = '5%';
  }));

  unsubs.push(state.on('ROUTE_PROGRESS', (payload) => {
    bar.style.width = `${payload.progress}%`;
  }));

  unsubs.push(state.on('ROUTE_END', () => {
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => {
        bar.style.width = '0%';
      }, 300);
    }, 200);
  }));

  unsubs.push(state.on('ROUTE_ERROR', () => {
    bar.style.backgroundColor = '#ffb4ab'; // Error color
    bar.style.boxShadow = '0 0 10px #ffb4ab, 0 0 20px #ffb4ab';
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => {
        bar.style.width = '0%';
        bar.style.backgroundColor = '#7b39fc';
        bar.style.boxShadow = '0 0 10px #7b39fc, 0 0 20px #7b39fc';
      }, 300);
    }, 2000);
  }));

  return {
    destroy: () => {
      unsubs.forEach(u => u());
      if (root.parentNode) root.parentNode.removeChild(root);
    }
  };
}
