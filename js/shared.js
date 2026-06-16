export function mount({ state }) {


  // Initialize state if not exists
  state.init('transCount', 0);

  // Re-attach UI to state
  const btn = document.getElementById('btn-translate');
  const display = document.getElementById('trans-count');

  // We store the handler on the module level so we can remove it on destroy if needed
  // But wait, if this module is kept alive across page transitions where the DOM body is swapped,
  // the old DOM elements are removed and replaced by new identical ones from the fetch!
  // So a keep-alive module must re-bind its DOM elements whenever the DOM changes.
  
  // To handle the SPA HTML-swap paradigm:
  // When a module is kept alive, its `mount` is NOT called again.
  // Instead, the framework should either preserve the exact DOM elements during the swap,
  // OR the module needs an `update()` lifecycle method.
  
  // For this simple demo, let's assume the router replaces the whole body.
  // Thus, we need a way to re-bind. We can listen to a global event 'PAGE_CHANGED'.
  
  const bindUI = () => {
    const btn = document.getElementById('btn-translate');
    const display = document.getElementById('trans-count');
    
    if (btn) {
      // Avoid duplicate listeners
      btn.onclick = () => {
        const current = state.get('transCount');
        state.update('transCount', current + 1);
      };
    }
    
    // Subscribe to state to update UI
    // We use a unique listener to update whatever the current DOM element is
    state.subscribe('transCount', (val) => {
      const currentDisplay = document.getElementById('trans-count');
      if (currentDisplay) currentDisplay.innerText = val;
    });
  };

  bindUI();
  
  // Listen for route changes to re-bind UI since DOM body is swapped
  state.on('DOM_SWAPPED', bindUI);

  // Return destroy method
  return {
    destroy: () => {

      state.off('DOM_SWAPPED', bindUI);
    }
  };
}
