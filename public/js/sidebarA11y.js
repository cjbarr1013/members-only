document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('logo-sidebar');
  if (!sidebar) return;

  const query = window.matchMedia('(min-width: 640px)'); // sm breakpoint

  const sync = () => {
    const focusableElements = sidebar.querySelectorAll('a, button');

    if (query.matches) {
      sidebar.removeAttribute('aria-hidden');
      focusableElements.forEach((el) => {
        el.removeAttribute('tabindex');
      });
    } else {
      sidebar.setAttribute('aria-hidden', true);
      focusableElements.forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
    }
  };

  // Watch for Flowbite changing aria-hidden
  const observer = new MutationObserver(() => {
    if (query.matches && sidebar.getAttribute('aria-hidden') === 'true') {
      sync();
    }
  });

  observer.observe(sidebar, {
    attributes: true,
    attributeFilter: ['aria-hidden', 'class'],
  });

  if ('addEventListener' in query) {
    query.addEventListener('change', sync);
  } else if ('addListener' in query) {
    // Safari legacy
    query.addListener(sync);
  }

  sync();
});
