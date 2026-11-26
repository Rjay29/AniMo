// Progressive UI enhancements: scroll reveals and dynamic polish
(function () {
  function prefersReducedMotion() {
    return document.documentElement.dataset.motion === 'reduced'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function markRevealTargets() {
    const selectors = [
      '.page-hero .container > *',
      '.section .section-heading',
      '.section .board-block',
      '.section .card',
      '.product-card',
      '.recipe-card',
      '.package-card',
      '.farmer-card',
      '.post-card',
      '.filter-panel',
      '.story-card',
      '.auth-card',
      '.profile-card',
      '.dashboard-card',
      '.order-card',
      '.chat-panel',
      '.detail-card'
    ];
    const seen = new Set();
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        if (seen.has(el) || el.closest('.assistant-panel')) return;
        seen.add(el);
        if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
        if (!el.style.getPropertyValue('--reveal-delay')) {
          const delay = Math.min(index * 40, 240);
          el.style.setProperty('--reveal-delay', `${delay}ms`);
        }
      });
    });
  }

  function revealAll() {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }

  function initObserver() {
    markRevealTargets();
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => observer.observe(el));
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(() => {
    initObserver();
    // Re-run once after async content (catalog cards etc.) renders
    window.setTimeout(initObserver, 400);
    window.setTimeout(initObserver, 1200);
  });
})();