export function mount({ state }) {
  const container = document.getElementById('page2-widget');
  if (container) {
    const btn = document.createElement('button');
    btn.innerText = "Click Me";
    btn.onclick = () => alert("Hello from Page 2 specific module!");
    container.appendChild(btn);
  }

  return {
    destroy: () => {
      // Cleanup if needed
    }
  };
}
