import { BareMetal } from '../src/index.js';

// Initialize the BareMetal engine with our desired config
BareMetal.init({
  debug: true,
  keepAliveSameModules: true,
  autoWrap: false,
  hoverPrefetch: false,
  showErrorNotification: false,
  transition: {
    enabled: true,
    simulatedDelay: 500 // Adds a half-second artificial delay to see the progress bar in local dev
  }
});

// For demonstration purposes, we will expose state to the window 
// so we can see the reactive updates in action via console if desired.
window.appState = BareMetal.state;
