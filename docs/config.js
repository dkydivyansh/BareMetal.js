window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "tertiary-fixed-dim": "#b6c9d8",
        "primary-container": "#7b39fc",
        "error-container": "#93000a",
        "secondary-fixed-dim": "#b3c5ff",
        "error": "#ffb4ab",
        "surface-container": "#201f1f",
        "primary-fixed-dim": "#561dd8",
        "tertiary-container": "#d2e5f5",
        "primary-fixed": "#7b39fc",
        "on-surface": "#e5e2e1",
        "on-tertiary-container": "#556774",
        "surface-container-lowest": "#0e0e0e",
        "on-error-container": "#ffdad6",
        "surface-container-low": "#1c1b1b",
        "inverse-primary": "#506600",
        "secondary-container": "#0266ff",
        "surface-container-high": "#2a2a2a",
        "on-secondary": "#002b75",
        "outline-variant": "#4a4458",
        "on-primary-fixed": "#21005d",
        "tertiary": "#ffffff",
        "on-primary-container": "#eaddff",
        "on-error": "#690005",
        "on-primary": "#ffffff",
        "surface-container-highest": "#353534",
        "surface": "#131313",
        "on-secondary-fixed": "#001849",
        "surface-bright": "#3a3939",
        "secondary-fixed": "#dae1ff",
        "on-secondary-fixed-variant": "#003fa4",
        "on-tertiary": "#21323e",
        "on-tertiary-fixed-variant": "#374956",
        "on-background": "#e5e2e1",
        "on-secondary-container": "#f9f7ff",
        "surface-variant": "#353534",
        "inverse-surface": "#e5e2e1",
        "on-surface-variant": "#cac4d0",
        "secondary": "#b3c5ff",
        "surface-dim": "#131313",
        "tertiary-fixed": "#d2e5f5",
        "primary": "#ffffff",
        "background": "#000000ff",
        "surface-tint": "#7b39fc",
        "outline": "#938f99",
        "inverse-on-surface": "#313030",
        "on-tertiary-fixed": "#0b1d29",
        "on-primary-fixed-variant": "#3c4d00"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "container-max": "1280px",
        "margin-safe": "32px",
        "gutter": "24px",
        "unit": "4px"
      },
      "fontFamily": {
        "code-sm": ["JetBrains Mono"],
        "body-lg": ["Inter"],
        "headline-lg-mobile": ["JetBrains Mono"],
        "headline-md": ["JetBrains Mono"],
        "body-md": ["Inter"],
        "label-md": ["JetBrains Mono"],
        "headline-lg": ["JetBrains Mono"]
      },
      "fontSize": {
        "code-sm": ["13px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "1.0", "fontWeight": "500" }],
        "headline-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    }
  }
};

import { BareMetal } from 'https://cdn.jsdelivr.net/npm/baremetal.js@1.2.3/dist/baremetal.js';

BareMetal.init({
  hoverPrefetch: true,
  persistState: true,
  virtualizeDom: true,
  transition: {
    enabled: true,
    module: './transition.js',
    simulatedDelay: 0
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#mobile-menu a.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.className = 'nav-link font-code-sm text-code-sm text-primary-fixed font-bold border-b-2 border-primary-fixed pb-1 w-max';
          } else {
            link.className = 'nav-link font-code-sm text-code-sm text-on-surface-variant font-medium hover:text-primary-fixed transition-colors duration-150 active:translate-y-px w-max';
          }
        });
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));

  const setYear = () => {
    const year = new Date().getFullYear().toString();
    document.querySelectorAll('.copy-year').forEach(el => {
      if (el.textContent !== year) {
        el.textContent = year;
      }
    });
  };

  setYear();
  const bodyObserver = new MutationObserver(setYear);
  bodyObserver.observe(document.body, { childList: true, subtree: true });
});
