// Ordering System
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;

  const form = document.getElementById('checkoutForm');
  const summary = document.getElementById('checkoutSummary');
  const status = document.getElementById('checkoutStatus');
  const fulfillment = document.getElementById('fulfillment');
  const address = document.getElementById('deliveryAddress');
  const addressField = document.getElementById('addressField');
  const items = window.aniMoCart.getCart().map((entry) => {
    const listing = window.aniMoCart.getItemByCartId(entry.id);
    return listing ? { ...entry, listing } : null;
  }).filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const shipping = subtotal && fulfillment.value === 'delivery' ? 45 : 0;
  summary.innerHTML = `
    ${items.map((item) => `
      <div class="summary-line"><span>${window.aniMoUtilities.escapeHTML(item.listing.name)} × ${item.quantity}</span><strong>${formatCurrency(item.listing.price * item.quantity)}</strong></div>
    `).join('') || '<p>Your cart is empty.</p>'}
    <div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
    <div class="summary-line"><span>Delivery estimate</span><strong id="checkoutShipping">${formatCurrency(shipping)}</strong></div>
    <p class="checkout-demo-note">The server checks current prices, fulfillment, and voucher eligibility when the order is submitted.</p>
  `;

  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error('Please log in before checking out.');
    const { user } = await response.json();
    document.getElementById('contactName').value = user.displayName;
  } catch (error) {
    status.textContent = error.message;
    status.classList.add('error');
    return;
  }

  // Fulfillment Selection
  function updateFulfillment() {
    const needsAddress = fulfillment.value === 'delivery';
    addressField.hidden = !needsAddress;
    address.required = needsAddress;
    const estimate = document.getElementById('checkoutShipping');
    if (estimate) estimate.textContent = formatCurrency(needsAddress && subtotal ? 45 : 0);
  }
  // Input Change
  fulfillment.addEventListener('change', updateFulfillment);
  updateFulfillment();

  // Form Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!items.length) {
      status.textContent = 'Your cart is empty. Add a product or meal kit before checking out.';
      status.classList.add('error');
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.classList.remove('error');
    status.textContent = 'Checking availability and placing your order...';
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          fulfillment: fulfillment.value,
          contactName: document.getElementById('contactName').value,
          address: address.value,
          voucher: localStorage.getItem('aniMoVoucher')
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not place order.');
      localStorage.removeItem('aniMoCart');
      localStorage.removeItem('aniMoVoucher');
      // Order Confirmation
      window.location.assign('../home/home.html');
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
      submit.disabled = false;
    }
  });
});
