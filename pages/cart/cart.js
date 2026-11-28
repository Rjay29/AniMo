// Cart And Voucher Management
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const cartItems = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  const overlay = document.getElementById('voucherOverlay');
  const voucherList = document.getElementById('voucherList');
  const voucherKey = 'aniMoVoucher';
  const ui = window.aniMoUtilities;
  const vouchers = [
    { code: 'FARMER10', title: '10% off local harvests', details: '10% off orders of ₱300 or more (up to ₱100).', minSpend: 300, type: 'percent', value: 10, cap: 100 },
    { code: 'LOCAL50', title: '₱50 community voucher', details: '₱50 off orders of ₱200 or more.', minSpend: 200, type: 'fixed', value: 50 },
    { code: 'LOCAL25', title: '₱25 local reward', details: '₱25 off orders of ₱150 or more.', minSpend: 150, type: 'fixed', value: 25 }
  ];

  // Voucher Retrieval
  function getAppliedVoucher() {
    const code = localStorage.getItem(voucherKey);
    return vouchers.find((voucher) => voucher.code === code) || null;
  }

  // Voucher Discount
  function calculateDiscount(subtotal, voucher) {
    if (!voucher || subtotal < voucher.minSpend) return 0;
    const discount = voucher.type === 'percent'
      ? Math.round((subtotal * voucher.value) / 100)
      : voucher.value;
    return Math.min(discount, voucher.cap || subtotal, subtotal);
  }

  // Cart Rendering
  function render() {
    const items = window.aniMoCart.getCart().map((entry) => {
      const product = window.aniMoCart.getItemByCartId(entry.id);
      return product ? { ...entry, product } : null;
    }).filter(Boolean);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 45 : 0;
    const voucher = getAppliedVoucher();
    const discount = calculateDiscount(subtotal, voucher);
    const total = subtotal + shipping - discount;

    if (!items.length) {
      cartItems.innerHTML = '<div class="empty-state" role="status"><p class="empty-state-title">Your cart is empty</p><p>Add products or meal kits to see them here.</p><a class="btn btn-primary" href="../marketplace/marketplace.html">Browse the marketplace</a></div>';
    } else {
      cartItems.innerHTML = items.map((item) => `
        <article class="cart-item">
          <!-- Image Placeholder -->
          ${ui.renderCatalogImage(item.product.image, item.product.name, item.product.category, 'cart-item-placeholder')}
          <div>
            <h3>${ui.escapeHTML(item.product.name)}</h3>
            <p>${ui.escapeHTML(item.product.farm)} · ${ui.escapeHTML(item.product.location)}</p>
            <div class="qty-controls">
              <button data-action="minus" data-id="${ui.escapeHTML(item.id)}" type="button" aria-label="Decrease ${ui.escapeHTML(item.product.name)} quantity"><img src="/shared/assets/icons/minus.png" alt="" /></button>
              <strong>${item.quantity}</strong>
              <button data-action="plus" data-id="${ui.escapeHTML(item.id)}" type="button" aria-label="Increase ${ui.escapeHTML(item.product.name)} quantity"><img src="/shared/assets/icons/plus.png" alt="" /></button>
            </div>
          </div>
          <div class="cart-item-price">
            <strong>${formatCurrency(item.product.price * item.quantity)}</strong>
            <button class="btn btn-secondary" data-id="${ui.escapeHTML(item.id)}" data-remove="true" type="button">Remove</button>
          </div>
        </article>
      `).join('');
    }

    // Voucher Selection
    summary.innerHTML = `
      <h3>Order summary</h3>
      <button class="voucher-open-button" id="openVoucherButton" type="button">
        <span>${voucher ? `Voucher applied: ${voucher.code}` : 'Choose voucher'}</span><strong>›</strong>
      </button>
      ${voucher && !discount ? '<p class="voucher-warning">This voucher needs a higher subtotal to apply.</p>' : ''}
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
      <div class="summary-row"><span>Delivery</span><strong>${formatCurrency(shipping)}</strong></div>
      ${discount ? `<div class="summary-row discount-row"><span>${voucher.code} discount</span><strong>−${formatCurrency(discount)}</strong></div>` : ''}
      <div class="summary-row summary-total"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
      <a href="${items.length ? '../checkout/checkout.html' : '../marketplace/marketplace.html'}" class="btn btn-primary checkout-link">${items.length ? 'Checkout' : 'Continue shopping'}</a>
    `;

    cartItems.querySelectorAll('[data-action]').forEach((button) => {
      // Click Interaction
      button.addEventListener('click', () => {
        window.aniMoCart.updateQuantity(button.dataset.id, button.dataset.action === 'plus' ? 1 : -1);
        render();
      });
    });
    cartItems.querySelectorAll('[data-remove]').forEach((button) => {
      // Click Interaction
      button.addEventListener('click', () => {
        window.aniMoCart.removeFromCart(button.dataset.id);
        render();
      });
    });
    document.getElementById('openVoucherButton').addEventListener('click', openVoucherMenu);
  }

  // Voucher Modal
  function openVoucherMenu() {
    const subtotal = window.aniMoCart.getCart().reduce((sum, item) => {
      const product = window.aniMoCart.getItemByCartId(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    voucherList.innerHTML = vouchers.map((voucher) => `
      <article class="voucher-option">
        <div><strong>${voucher.title}</strong><p>${voucher.details}</p><span>Code: ${voucher.code}</span></div>
        <button class="btn btn-primary" type="button" data-voucher="${voucher.code}" ${subtotal < voucher.minSpend ? 'disabled' : ''}>
          ${subtotal < voucher.minSpend ? 'Not eligible' : 'Apply'}
        </button>
      </article>
    `).join('');
    voucherList.querySelectorAll('[data-voucher]').forEach((button) => {
      // Click Interaction
      button.addEventListener('click', () => {
        localStorage.setItem(voucherKey, button.dataset.voucher);
        overlay.hidden = true;
        render();
      });
    });
    overlay.hidden = false;
  }

  document.getElementById('closeVoucherButton').addEventListener('click', () => { overlay.hidden = true; });
  document.getElementById('removeVoucherButton').addEventListener('click', () => {
    localStorage.removeItem(voucherKey);
    overlay.hidden = true;
    render();
  });
  // Click Interaction
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.hidden = true;
  });
  // Keyboard Interaction
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') overlay.hidden = true;
  });

  render();
});
