// Shared Navigation And Assistant
// Assistant Capabilities
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-links');
  const toggle = document.querySelector('.mobile-toggle');
  const homeUrl = '../home/home.html';
  const navItems = [
    ['Home', homeUrl],
    ['Farmers', '../farmers/farmers.html'],
    ['Local map', `${homeUrl}#local-map`],
    ['Chats', '../chat/chat.html']
  ];

  document.querySelectorAll('.brand').forEach((brand) => {
    if (brand.querySelector('.brand-logo')) return;
    const wordmark = brand.textContent.trim();
    brand.replaceChildren();
    const logo = document.createElement('img');
    logo.className = 'brand-logo';
    logo.src = '/shared/assets/logo.png';
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'brand-wordmark';
    text.textContent = wordmark;
    brand.append(logo, text);
  });

  // Navigation Links
  if (nav) {
    nav.innerHTML = `
      ${navItems.slice(0, 1).map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
      <details class="nav-dropdown nav-dropdown-shop">
        <summary>Shop &amp; Cook</summary>
        <div>
          <a href="../marketplace/marketplace.html">Marketplace</a>
          <a href="../recipe-discovery/recipe-discovery.html">Recipes</a>
          <a href="../recipe-packages/recipe-packages.html">Meal Kits</a>
        </div>
      </details>
      ${navItems.slice(1).map(([label, href]) => (
      `<a href="${href}">${label}</a>`
      )).join('')}`;
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach((link, index) => {
      if (index !== navItems.length - 1
        && link.getAttribute('href').split('/').pop().split('#')[0] === currentPath) {
        link.classList.add('active');
      }

      // Protected Shopping Action
      window.aniMoPromptLogin = function (options = {}) {
        const next = options.next || `${window.location.pathname}${window.location.search}`;
        const message = options.message || 'Please log in to continue.';
        if (options.pendingCart) {
          localStorage.setItem('animo-pending-cart', JSON.stringify(options.pendingCart));
        }
        const existing = document.getElementById('loginPromptModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'loginPromptModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(20,30,24,.45);display:grid;place-items:center;z-index:10000;padding:16px;';
        modal.innerHTML = `
          <div role="dialog" aria-modal="true" aria-label="Log in required" style="background:var(--card,#fffdf7);color:var(--dark,#21342b);max-width:420px;width:100%;border-radius:16px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.18);">
            <h2 style="margin:0 0 8px;font-size:1.35rem;">Log in required</h2>
            <p style="margin:0 0 18px;color:var(--muted,#5f6f65);line-height:1.5;">${message}</p>
            <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary" data-login-prompt-cancel>Cancel</button>
              <a class="btn btn-primary" href="/pages/login/login.html?next=${encodeURIComponent(next)}">Log in</a>
            </div>
          </div>`;
        modal.addEventListener('click', (e) => {
          if (e.target === modal || e.target.closest('[data-login-prompt-cancel]')) modal.remove();
        });
        document.body.appendChild(modal);
        return false;
      };

      window.aniMoRequireLogin = async function (options = {}) {
        try {
          const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
          if (response.ok) return true;
        } catch {}
        const next = options.next || `${window.location.pathname}${window.location.search}`;
        if (options.pendingCart) {
          localStorage.setItem('animo-pending-cart', JSON.stringify(options.pendingCart));
        }
        if (options.mode === 'popup') {
          window.aniMoPromptLogin({ ...options, next });
          return false;
        }
        window.location.assign(`/pages/login/login.html?next=${encodeURIComponent(next)}`);
        return false;
      };
    });
  }

  if (toggle && nav) {
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    // Click Interaction
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const navActions = document.querySelector('.nav-actions');
  const savedTheme = localStorage.getItem('animo-theme');
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
  const savedAccessibility = JSON.parse(localStorage.getItem('animo-accessibility') || '{}');
  document.documentElement.style.setProperty('--accessibility-scale', savedAccessibility.largeText ? '1.12' : '1');
  if (savedAccessibility.highContrast) document.documentElement.dataset.contrast = 'high';
  if (savedAccessibility.reducedMotion) document.documentElement.dataset.motion = 'reduced';
  if (navActions && !document.querySelector('.account-logout')) {
    const authBtn = document.createElement('a');
    authBtn.className = 'btn btn-secondary account-logout';
    authBtn.href = '/pages/login/login.html';
    authBtn.textContent = 'Log in';
    authBtn.hidden = true;
    navActions.insertBefore(authBtn, toggle || null);
    const setGuestMode = () => {
      authBtn.hidden = false;
      authBtn.href = `/pages/login/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      authBtn.textContent = 'Log in';
      authBtn.onclick = null;
      document.querySelectorAll('a.cart-pill').forEach((el) => { el.style.display = 'none'; });
      nav.querySelectorAll('a').forEach((link) => {
        if ((link.textContent || '').trim() === 'Chats') link.style.display = 'none';
      });
    };
    const setAuthMode = (user) => {
      authBtn.hidden = false;
      authBtn.href = '#';
      authBtn.textContent = 'Log out';
      authBtn.onclick = async (e) => {
        e.preventDefault();
        authBtn.style.pointerEvents = 'none';
        try {
          const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
          const contentType = response.headers.get('content-type') || '';
          const result = contentType.includes('application/json') ? await response.json() : null;
          if (!response.ok || !result?.ok) throw new Error('Could not log out. Please try again.');
          window.location.replace('/pages/login/login.html');
        } catch (error) {
          console.error('AniMo logout failed:', error);
          authBtn.style.pointerEvents = '';
          authBtn.textContent = 'Logout failed - retry';
        }
      };
      document.querySelectorAll('a.cart-pill').forEach((el) => { el.style.display = ''; });
      nav.querySelectorAll('a').forEach((link) => {
        if ((link.textContent || '').trim() === 'Chats') link.style.display = '';
      });
      const replayPendingCart = () => {
        const raw = localStorage.getItem('animo-pending-cart');
        if (!raw) return false;
        try {
          const pending = JSON.parse(raw);
          const items = Array.isArray(pending?.items)
            ? pending.items
            : (pending?.productId ? [{ id: pending.productId, qty: pending.qty || 1 }] : []);
          if (!items.length) { localStorage.removeItem('animo-pending-cart'); return false; }
          if (!window.aniMoCart || typeof window.aniMoCart.addToCart !== 'function') return false;
          items.forEach((item) => { if (item?.id) window.aniMoCart.addToCart(item.id, Number(item.qty) || 1); });
          localStorage.removeItem('animo-pending-cart');
          return true;
        } catch { localStorage.removeItem('animo-pending-cart'); return false; }
      };
      if (!replayPendingCart()) {
        window.addEventListener('DOMContentLoaded', () => { replayPendingCart(); }, { once: true });
        setTimeout(replayPendingCart, 400);
        setTimeout(replayPendingCart, 1200);
      }
      return user;
    };
    fetch('/api/auth/me', { credentials: 'same-origin' }).then(async (response) => {
      if (!response.ok) { setGuestMode(); return; }
      const { user } = await response.json();
      setAuthMode(user);
      const accountLink = document.createElement('a');
      accountLink.className = 'profile-avatar-link';
      accountLink.href = '/pages/profile/profile.html';
      accountLink.setAttribute('aria-label', `View profile for ${user.displayName || user.username}`);
      if (user.profilePicture) {
        const avatar = document.createElement('img');
        avatar.src = user.profilePicture;
        avatar.alt = '';
        accountLink.appendChild(avatar);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'profile-avatar-fallback';
        fallback.textContent = (user.displayName || user.username || '?').trim().slice(0, 1).toUpperCase();
        fallback.setAttribute('aria-hidden', 'true');
        accountLink.appendChild(fallback);
      }
      navActions.insertBefore(accountLink, authBtn);
      if (user.role === 'farmer' && !document.querySelector('.farmer-dashboard-link')) {
        const farmerLink = document.createElement('a');
        farmerLink.className = 'btn btn-secondary farmer-dashboard-link';
        farmerLink.href = '/pages/farmer-dashboard/farmer-dashboard.html';
        farmerLink.textContent = 'Farmer dashboard';
        navActions.insertBefore(farmerLink, authBtn);
      }
      if (user.role === 'admin' && !document.querySelector('.admin-dashboard-link')) {
        const adminLink = document.createElement('a');
        adminLink.className = 'btn btn-secondary admin-dashboard-link';
        adminLink.href = '/admin/';
        adminLink.textContent = 'Admin dashboard';
        navActions.insertBefore(adminLink, authBtn);
      }
    }).catch(() => { setGuestMode(); });
  }

  // Public Display Settings (icon-only controls)
  if (navActions && !document.querySelector('.display-settings')) {
    const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3a.7.7 0 0 0-.86-.86A10 10 0 1 0 21.86 15.36a.7.7 0 0 0-.86-.86Z"/></svg>';
    const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17.8a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l.85.85A1 1 0 1 1 5.07 6.5l-.85-.85a1 1 0 0 1 0-1.42Zm12.29 12.29a1 1 0 0 1 1.42 0l.85.85a1 1 0 0 1-1.42 1.42l-.85-.85a1 1 0 0 1 0-1.42ZM2 12a1 1 0 0 1 1-1h1.2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm16.8 0a1 1 0 0 1 1-1H21a1 1 0 1 1 0 2h-1.2a1 1 0 0 1-1-1ZM4.22 19.78a1 1 0 0 1 0-1.42l.85-.85a1 1 0 1 1 1.42 1.42l-.85.85a1 1 0 0 1-1.42 0Zm12.29-12.29a1 1 0 0 1 0-1.42l.85-.85a1 1 0 1 1 1.42 1.42l-.85.85a1 1 0 0 1-1.42 0Z"/></svg>';
    const accessIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2Zm8 5.3a1 1 0 0 1-.78 1.18c-1.83.4-3.44.7-4.72.88V22a1 1 0 1 1-2 0v-5.5h-1V22a1 1 0 1 1-2 0V9.36c-1.28-.18-2.89-.48-4.72-.88A1 1 0 1 1 5.22 6.5c2.67.59 4.84.9 6.78.9s4.11-.31 6.78-.9a1 1 0 0 1 1.22.8Z"/></svg>';

    const themeButton = document.createElement('button');
    themeButton.className = 'icon-btn display-settings';
    themeButton.type = 'button';
    const setThemeUi = (isDark) => {
      themeButton.innerHTML = isDark ? sunIcon : moonIcon;
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      themeButton.setAttribute('aria-label', label);
      themeButton.setAttribute('aria-pressed', String(isDark));
    };
    setThemeUi(document.documentElement.dataset.theme === 'dark');
    themeButton.addEventListener('click', () => {
      const enabled = document.documentElement.dataset.theme !== 'dark';
      document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
      localStorage.setItem('animo-theme', enabled ? 'dark' : 'light');
      setThemeUi(enabled);
    });

    const accessibilityButton = document.createElement('button');
    accessibilityButton.className = 'icon-btn accessibility-settings-toggle';
    accessibilityButton.type = 'button';
    accessibilityButton.innerHTML = accessIcon;
    accessibilityButton.setAttribute('aria-label', 'Accessibility settings');
    accessibilityButton.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('section');
    panel.className = 'accessibility-settings-panel card';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Accessibility settings');
    panel.innerHTML = `
      <strong>Display preferences</strong>
      <label><input type="checkbox" data-setting="largeText" ${savedAccessibility.largeText ? 'checked' : ''}/> Larger text</label>
      <label><input type="checkbox" data-setting="highContrast" ${savedAccessibility.highContrast ? 'checked' : ''}/> High contrast</label>
      <label><input type="checkbox" data-setting="reducedMotion" ${savedAccessibility.reducedMotion ? 'checked' : ''}/> Reduce motion</label>`;
    accessibilityButton.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      accessibilityButton.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.querySelectorAll('[data-setting]').forEach((input) => {
      input.addEventListener('change', () => {
        const settings = JSON.parse(localStorage.getItem('animo-accessibility') || '{}');
        settings[input.dataset.setting] = input.checked;
        localStorage.setItem('animo-accessibility', JSON.stringify(settings));
        if (input.dataset.setting === 'largeText') {
          document.documentElement.style.setProperty('--accessibility-scale', input.checked ? '1.12' : '1');
        }
        if (input.dataset.setting === 'highContrast') document.documentElement.dataset.contrast = input.checked ? 'high' : 'normal';
        if (input.dataset.setting === 'reducedMotion') document.documentElement.dataset.motion = input.checked ? 'reduced' : 'normal';
      });
    });
    navActions.insertBefore(themeButton, toggle || null);
    navActions.insertBefore(accessibilityButton, toggle || null);
    navActions.appendChild(panel);
  }

  // Cart Label (icon-only)
  document.querySelectorAll('a.cart-pill').forEach((link) => {
    const count = link.querySelector('.cart-count');
    link.replaceChildren();
    const icon = document.createElement('img');
    icon.className = 'cart-icon';
    icon.src = '/shared/assets/icons/cart.png';
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    link.append(icon);
    if (count) link.append(count);
    link.setAttribute('aria-label', 'Cart');
  });

  // Cart Event Delegation
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-add-cart]');
    if (!button) return;

    const productId = button.getAttribute('data-add-cart');
    if (!productId || !window.aniMoCart || !window.aniMoCart.getItemByCartId(productId)) return;
    if (!await window.aniMoRequireLogin({ pendingCart: { items: [{ id: productId, qty: 1 }] } })) return;

    window.aniMoCart.addToCart(productId, 1);
    const oldLabel = button.textContent;
    button.textContent = 'Added';
    setTimeout(() => { button.textContent = oldLabel; }, 1200);
  });

  document.addEventListener('click', async (event) => {
    const orderLink = event.target.closest('a[href*="checkout/checkout.html"], a[href*="/checkout"], [data-require-login-order]');
    if (!orderLink) return;
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (response.ok) return;
    } catch {}
    event.preventDefault();
    const href = orderLink.href ? new URL(orderLink.href, window.location.origin) : null;
    const next = href ? (href.pathname + href.search) : window.location.pathname;
    window.aniMoPromptLogin({
      message: 'Please log in to place your order.',
      next
    });
  });

  // Assistant Panel
  const assistant = document.createElement('aside');
  assistant.className = 'assistant-widget';
  assistant.innerHTML = `
    <button class="assistant-launcher" type="button" aria-label="Open AniMo assistant" aria-expanded="false">
      <svg class="assistant-launcher-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2Z"/></svg>
    </button>
    <section class="assistant-panel" aria-label="AniMo assistant" hidden>
      <header class="assistant-header">
        <div class="assistant-header-brand">
          <span class="assistant-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a5 5 0 0 1 5 5v1h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1.1a5 5 0 0 1-9.8 0H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v1h6V7a3 3 0 0 0-3-3Zm-3 9a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 9 13Zm6 0a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 15 13Z"/></svg></span>
          <div><strong>AniMo Assistant</strong><small class="assistant-status">AniMo help · AI status appears after your first question</small></div>
        </div>
        <button class="assistant-close" type="button" aria-label="Close assistant"><img src="/shared/assets/icons/x.png" alt="" /></button>
      </header>
      <div class="assistant-messages" aria-live="polite">
        <p class="assistant-message assistant-message-bot">Hi! I'm your AniMo assistant. I can help you find products, generate recipe ideas from AniMo ingredients, guide you around the website, or help with the Philippines map.</p>
        <div class="assistant-quick-actions">
          <button type="button" data-assistant-mode="recipe" data-assistant-prompt="Suggest a Filipino recipe I can cook using ingredients available on AniMo.">Recipe idea</button>
          <button type="button" data-assistant-mode="guide" data-assistant-prompt="How do I place an order on AniMo?">Website guide</button>
          <button type="button" data-assistant-mode="chat" data-assistant-prompt="What products are available near Lucena, Quezon?">Find local products</button>
          <button type="button" data-assistant-mode="guide" data-assistant-prompt="How do I use the local map on AniMo?">Map help</button>
        </div>
      </div>
      <form class="assistant-form">
        <label class="sr-only" for="assistantInput">Ask AniMo Assistant</label>
        <input id="assistantInput" class="input" type="text" placeholder="Ask about products, recipes, or the map..." autocomplete="off" />
        <button class="btn btn-primary assistant-send" type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    </section>
  `;
  document.body.appendChild(assistant);

  const panel = assistant.querySelector('.assistant-panel');
  const messages = assistant.querySelector('.assistant-messages');
  const input = assistant.querySelector('#assistantInput');
  const launcher = assistant.querySelector('.assistant-launcher');
  const assistantStatus = assistant.querySelector('.assistant-status');
  const assistantSessionId = sessionStorage.getItem('animo-assistant-session') || `animo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem('animo-assistant-session', assistantSessionId);
  let assistantKnowledge = [];
  let assistantBusy = false;

  fetch('/api/assistant/knowledge').then(async (response) => {
    if (!response.ok) return;
    const result = await response.json();
    assistantKnowledge = Array.isArray(result.records) ? result.records : [];
  }).catch(() => {});

  function appendMessage(text, kind) {
    const message = document.createElement('p');
    message.className = `assistant-message assistant-message-${kind}`;
    message.style.whiteSpace = 'pre-wrap';
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function localAnswer(question) {
    const normalized = question.toLowerCase();
    const stopWords = new Set(['about', 'and', 'can', 'does', 'for', 'how', 'the', 'what', 'when', 'where', 'with', 'you', 'animo']);
    const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !stopWords.has(term));
    const matches = assistantKnowledge.map((record) => {
      const haystack = `${record.title} ${record.category} ${record.content}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { record, score };
    }).sort((left, right) => right.score - left.score);
    if (matches[0]?.score) return matches[0].record.content;
    if (normalized.includes('recipe') || normalized.includes('ingredient')) return 'Open Recipes to browse dishes, or ask me for a recipe idea using AniMo ingredients. I can suggest options based on available products and clearly note anything missing.';
    if (normalized.includes('map') || normalized.includes('location') || normalized.includes('near')) return 'Use the Local map on the Home page to search Philippine locations, pin your location, and view nearby AniMo sellers.';
    if (normalized.includes('order') || normalized.includes('cart') || normalized.includes('buy')) return 'Browse the Marketplace, add items to your cart, review vouchers in Cart, then continue to Checkout to place your order.';
    return 'I can help with AniMo products, farmers, recipes, meal kits, orders, and the Philippines map. Ask me a specific question and I\'ll do my best.';
  }

  async function sendMessage(text, mode = 'chat') {
    const question = text.trim();
    if (!question || assistantBusy) return;
    appendMessage(question, 'user');
    assistantBusy = true;
    input.disabled = true;
    const typing = appendMessage('Thinking...', 'bot');
    typing.dataset.typing = 'true';
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, sessionId: assistantSessionId, mode })
      });
      const result = await response.json().catch(() => ({}));
      typing.remove();
      if (response.ok && result.reply) {
        appendMessage(result.reply, 'bot');
        assistantStatus.textContent = result.source === 'knowledge'
          ? 'Assistant Data · exact answer'
          : result.aiAvailable
            ? `AI online · ${result.model || 'local model'}`
            : 'AI offline · Ollama required';
        assistantStatus.title = result.warning || '';
      } else {
        appendMessage(localAnswer(question), 'bot');
        assistantStatus.textContent = 'Local AniMo help · assistant service unavailable';
        assistantStatus.title = result.error || '';
      }
    } catch {
      typing.remove();
      appendMessage(localAnswer(question), 'bot');
      assistantStatus.textContent = 'Local AniMo help · assistant service unavailable';
      assistantStatus.title = 'Could not reach the AniMo assistant service.';
    } finally {
      assistantBusy = false;
      input.disabled = false;
      input.focus();
    }
  }

  launcher.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    launcher.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) input.focus();
  });
  assistant.querySelector('.assistant-close').addEventListener('click', () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
  });
  assistant.querySelector('.assistant-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    sendMessage(value, 'chat');
  });
  assistant.querySelectorAll('[data-assistant-prompt]').forEach((button) => {
    button.addEventListener('click', () => sendMessage(button.dataset.assistantPrompt, button.dataset.assistantMode || 'chat'));
  });

  // Progressive UI enhancements loader
  if (!document.querySelector('script[data-animo-ui-enhancements]')) {
    const uiScript = document.createElement('script');
    uiScript.src = '/shared/js/ui-enhancements.js';
    uiScript.defer = true;
    uiScript.dataset.animoUiEnhancements = 'true';
    document.body.appendChild(uiScript);
  }
});
