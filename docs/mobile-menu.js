export function mount() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  
  if (!btn || !menu) return {};

  const toggleMenu = () => {
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
  };

  btn.addEventListener('click', toggleMenu);

  return {
    destroy: () => {
      btn.removeEventListener('click', toggleMenu);
    }
  };
}
