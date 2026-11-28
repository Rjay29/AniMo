(function () {
  const KEY = 'animo-theme';
  const apply = (theme) => { document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'; };
  apply(localStorage.getItem(KEY) || 'light');

  const sun = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5h1.5v3H12V2Zm0 17h1.5v3H12v-3ZM2 12V10.5h3V12H2Zm17 0v-1.5h3V12h-3ZM4.22 5.64l1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12Zm12.38 12.38 1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12Zm2.12-13.44 1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12ZM6.34 16.96l1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12Z"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14.5 2a1 1 0 0 1 .95 1.32 8 8 0 0 0 10.23 10.23A1 1 0 0 1 27 14.5 11 11 0 1 1 14.5 2Zm-1.6 2.1A9 9 0 1 0 24.9 16.1 10 10 0 0 1 12.9 4.1Z"/></svg>'.replace('27 14.5 11 11 0 1 1 14.5 2','22 14.5 10 10 0 1 1 14.5 2').replace('viewBox="0 0 24 24"','viewBox="0 0 24 24"');

  function iconFor(theme) {
    if (theme === 'dark') {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5h1.5v3H12V2Zm0 17h1.5v3H12v-3ZM2 12V10.5h3V12H2Zm17 0v-1.5h3V12h-3ZM4.22 5.64l1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12Zm12.38 12.38 1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12Zm2.12-13.44 1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12ZM6.34 16.96l1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12Z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034 10 10 0 1 0 21.966 14.27a1 1 0 0 0-1.224-1.225Z"/></svg>';
  }

  function syncButtons() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.innerHTML = iconFor(isDark ? 'dark' : 'light');
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-pressed', String(isDark));
    });
  }

  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(KEY, next);
    syncButtons();
  }

  window.AniMoTheme = { apply, toggle, sync: syncButtons };
  document.addEventListener('DOMContentLoaded', () => {
    syncButtons();
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      if (btn.dataset.themeBound) return;
      btn.dataset.themeBound = 'true';
      btn.addEventListener('click', toggle);
    });
  });
})();
