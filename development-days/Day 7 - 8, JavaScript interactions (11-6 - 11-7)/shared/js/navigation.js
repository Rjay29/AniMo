// Shared Navigation And Assistant
// Assistant Capabilities
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-links');
  const toggle = document.querySelector('.mobile-toggle');
  const homeUrl = '../home/home.html';
  const navItems = [
    ['Home', homeUrl],
    ['Marketplace', '../marketplace/marketplace.html'],
    ['Farmers', '../farmers/farmers.html'],
    ['Recipes', '../recipe-discovery/recipe-discovery.html'],
    ['Meal kits', '../recipe-packages/recipe-packages.html'],
    ['Local map', `${homeUrl}#local-map`]
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
    nav.innerHTML = navItems.map(([label, href]) => (
      `<a href="${href}">${label}</a>`
    )).join('');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach((link, index) => {
      if (index !== navItems.length - 1
        && link.getAttribute('href').split('/').pop().split('#')[0] === currentPath) {
        link.classList.add('active');
      }
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

  // Cart Label
  document.querySelectorAll('a.cart-pill').forEach((link) => {
    const count = link.querySelector('.cart-count');
    link.replaceChildren();
    const icon = document.createElement('img');
    icon.className = 'cart-icon';
    icon.src = '/shared/assets/icons/cart.png';
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = 'Cart';
    link.append(icon, label);
    if (count) link.append(count);
  });

  // Tooltip Accessibility
  function decorateTooltips() {
    document.querySelectorAll('button, a.icon-btn').forEach((element) => {
      const visibleText = element.textContent.trim().replace(/\s+/g, ' ');
      const label = element.getAttribute('aria-label')
        || element.getAttribute('title')
        || (element.classList.contains('cart-pill') ? 'Cart' : '')
        || visibleText;
      if (label && !element.hasAttribute('data-tooltip')) {
        element.setAttribute('data-tooltip', label);
      }
      if (label && !element.hasAttribute('aria-label')) {
        element.setAttribute('aria-label', label);
      }
      element.removeAttribute('title');
    });
  }
  decorateTooltips();
  new MutationObserver(decorateTooltips).observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cart Event Delegation
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-cart]');
    if (!button) return;

    const productId = button.getAttribute('data-add-cart');
    if (!productId || !window.aniMoCart || !window.aniMoUtils.getProductById(productId)) return;

    window.aniMoCart.addToCart(productId, 1);
    const oldLabel = button.textContent;
    button.textContent = 'Added';
    setTimeout(() => { button.textContent = oldLabel; }, 1200);
  });

  // Assistant Panel
  const assistant = document.createElement('aside');
  assistant.className = 'assistant-widget';
  assistant.innerHTML = `
    <button class="assistant-launcher" type="button" aria-label="Open AniMo assistant"><img src="/shared/assets/icons/ai.png" alt="" /></button>
    <section class="assistant-panel" aria-label="AniMo assistant" hidden>
      <header class="assistant-header">
        <div><strong>AniMo Assistant</strong><small>FAQ, help, and shopping guide</small></div>
        <button class="assistant-close" type="button" aria-label="Close assistant"><img src="/shared/assets/icons/x.png" alt="" /></button>
      </header>
      <div class="assistant-messages" aria-live="polite">
        <p class="assistant-message assistant-message-bot">Hi! Ask me about shopping, delivery, pickup, recipes, vouchers, or using AniMo.</p>
        <div class="assistant-quick-actions">
          <button type="button" data-assistant-prompt="How do I place an order?">Ordering</button>
          <button type="button" data-assistant-prompt="What are delivery and pickup options?">Delivery & pickup</button>
          <button type="button" data-assistant-prompt="How do I find a recipe?">Recipes</button>
          <button type="button" data-assistant-prompt="How do vouchers work?">Vouchers</button>
          <button type="button" data-assistant-prompt="How do I use the local map?">Map guide</button>
          <button type="button" data-assistant-prompt="Show me the AniMo FAQ and help guide.">FAQ & guide</button>
        </div>
      </div>
      <form class="assistant-form">
        <label class="sr-only" for="assistantInput">Ask AniMo Assistant</label>
        <input id="assistantInput" class="input" type="text" placeholder="Ask a question..." autocomplete="off" />
        <button class="btn btn-primary" type="submit" aria-label="Send message">Send</button>
      </form>
    </section>
  `;
  document.body.appendChild(assistant);

  const panel = assistant.querySelector('.assistant-panel');
  const messages = assistant.querySelector('.assistant-messages');
  const input = assistant.querySelector('#assistantInput');
  let assistantKnowledge = [];
  let assistantKnowledgeError = null;
  const assistantKnowledgeRequest = fetch('/api/assistant/knowledge')
    .then(async (response) => {
      if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) {
        throw new Error('Assistant knowledge could not be loaded.');
      }
      const result = await response.json();
      assistantKnowledge = result.records;
    })
    .catch((error) => {
      assistantKnowledgeError = error;
    });

  // Assistant Message Rendering
  function appendMessage(text, kind) {
    const message = document.createElement('p');
    message.className = `assistant-message assistant-message-${kind}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  // Assistant Question Processing
  function answerQuestion(question) {
    const normalized = question.toLowerCase();
    const stopWords = new Set(['about', 'and', 'can', 'does', 'for', 'how', 'the', 'what', 'when', 'where', 'with', 'you']);
    const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !stopWords.has(term));
    const matches = assistantKnowledge.map((record) => {
      const title = `${record.title} ${record.category}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 1 : 0), 0);
      return { record, score };
    }).sort((left, right) => right.score - left.score);
    if (matches[0]?.score) return matches[0].record.content;
    if (normalized.includes('deliver') || normalized.includes('pickup')) {
      return 'Each marketplace item lists whether delivery, pickup, or both are available. Check the product location and availability before adding it to your cart.';
    }
    if (normalized.includes('recipe') || normalized.includes('ingredient')) {
      return 'Open Recipes, search for an ingredient, and select it to add it to your ingredient list. Remove it with the × button. Open a recipe to see its steps or order its available ingredients.';
    }
    if (normalized.includes('voucher') || normalized.includes('discount')) {
      return 'Open your cart and choose “Choose voucher” to see sample discounts. Select a voucher to apply it to your order summary.';
    }
    if (normalized.includes('order') || normalized.includes('cart') || normalized.includes('buy')) {
      return 'Choose “Add to cart” on a product or “Order this recipe” on a recipe page. Then open Cart to adjust quantities, apply a voucher, and continue to checkout.';
    }
    if (normalized.includes('map') || normalized.includes('location') || normalized.includes('near')) {
      return 'Use the Local map section on Home to search a place, allow location access, or click the map to inspect nearby sample ingredients.';
    }
    if (normalized.includes('faq') || normalized.includes('frequently asked')) {
      return 'FAQ: Listings are sample data; fulfillment availability is shown on each product. The cart and vouchers are saved in this browser. The map uses sample listings, and location access only happens when you request it.';
    }
    if (normalized.includes('help') || normalized.includes('guide') || normalized.includes('how')) {
      return 'Start at Home, browse the Marketplace or Recipes, and use the Farmers page to learn about sellers. Add products to your cart and review it before checkout.';
    }
    return 'I can help with orders, delivery and pickup, recipes, vouchers, the local map, and how to use AniMo. What would you like to know?';
  }

  // Assistant Request Handling
  async function sendMessage(text) {
    const question = text.trim();
    if (!question) return;
    appendMessage(question, 'user');
    await assistantKnowledgeRequest;
    appendMessage(answerQuestion(question), 'bot');
    if (assistantKnowledgeError) {
      appendMessage('Saved assistant data could not be loaded, so this answer uses built-in help.', 'bot');
    }
  }

  assistant.querySelector('.assistant-launcher').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) input.focus();
  });
  assistant.querySelector('.assistant-close').addEventListener('click', () => {
    panel.hidden = true;
  });
  assistant.querySelector('.assistant-form').addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
    input.value = '';
  });
  assistant.querySelectorAll('[data-assistant-prompt]').forEach((button) => {
    // Click Interaction
    button.addEventListener('click', () => sendMessage(button.dataset.assistantPrompt));
  });

  decorateTooltips();
});
