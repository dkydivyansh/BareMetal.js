export function mount() {
  
  let timer;
  let count = 0;
  
  const container = document.getElementById('page1-widget');
  if (container) {
    const display = document.createElement('p');
    display.innerText = `Active for 0 seconds`;
    container.appendChild(display);
    
    timer = setInterval(() => {
      count++;
      display.innerText = `Active for ${count} seconds`;
    }, 1000);
  }

  return {
    destroy: () => {
      clearInterval(timer);
    }
  };
}
