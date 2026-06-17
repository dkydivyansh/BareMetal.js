export function mount({ state }) {


  // Initialize state (true = expanded, false = collapsed)
  state.init('sidebarExpanded', true);

  const bindUI = () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const content = document.getElementById('main-content');

    if (!sidebar || !toggleBtn || !content) return;

    // Remove old listeners just in case
    toggleBtn.onclick = null;
    
    toggleBtn.onclick = () => {
      const isExpanded = state.get('sidebarExpanded');
      state.update('sidebarExpanded', !isExpanded);
    };

    // Make sure we update the DOM when the state changes
    state.subscribe('sidebarExpanded', (expanded) => {
      const el = document.getElementById('sidebar');
      const mainEl = document.getElementById('main-content');
      if (el && mainEl) {
        if (expanded) {
          el.style.width = '250px';
          mainEl.style.marginLeft = '250px';
        } else {
          el.style.width = '60px';
          mainEl.style.marginLeft = '60px';
        }
      }
    });
  };

  bindUI();
  
  // Rebind UI when DOM is swapped by Router
  state.on('DOM_SWAPPED', bindUI);

  return {
    destroy: () => {

      state.off('DOM_SWAPPED', bindUI);
    }
  };
}
