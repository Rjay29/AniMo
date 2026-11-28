// Local Checkout And Address Book
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const form = document.getElementById('checkoutForm');
  const summary = document.getElementById('checkoutSummary');
  const status = document.getElementById('checkoutStatus');
  const fulfillment = document.getElementById('fulfillment');
  const address = document.getElementById('deliveryAddress');
  const addressField = document.getElementById('addressField');
  const pin = document.querySelector('.address-map-pin');
  let coordinates = null;
  const hierarchy = {
    NCR: { 'Metro Manila': { 'Quezon City': { 'Batasan Hills': '1126', 'Commonwealth': '1121' }, 'Makati City': { 'Bel-Air': '1209' } } },
    CALABARZON: { Quezon: { 'Lucena City': { Cotta: '4301', Ibabang_Dupay: '4301' }, 'Tayabas City': { Angeles: '4327' } } },
    'Central Visayas': { Cebu: { 'Cebu City': { Lahug: '6000', Guadalupe: '6000' } } },
    'Central Luzon': { 'Nueva Ecija': { 'Cabanatuan City': { Aduas: '3100' } } }
  };
  const region = document.getElementById('addressRegion');
  const province = document.getElementById('addressProvince');
  const city = document.getElementById('addressCity');
  const barangay = document.getElementById('addressBarangay');
  const postal = document.getElementById('addressPostal');
  const selectOptions = (select, values, placeholder) => {
    select.innerHTML = `<option value="">${placeholder}</option>${values.map((value) => `<option value="${value}">${value.replaceAll('_', ' ')}</option>`).join('')}`;
    select.disabled = !values.length;
  };
  const updateSummaryAddress = () => {
    const parts = [document.getElementById('addressStreet').value, barangay.value, city.value, province.value, region.value, postal.value].filter(Boolean);
    address.value = parts.join(', ');
  };
  selectOptions(region, Object.keys(hierarchy), 'Choose a region');
  selectOptions(province, [], 'Choose a province');
  selectOptions(city, [], 'Choose a city / municipality');
  selectOptions(barangay, [], 'Choose a barangay');
  region.addEventListener('change', () => {
    selectOptions(province, Object.keys(hierarchy[region.value] || {}), 'Choose a province');
    selectOptions(city, [], 'Choose a city / municipality');
    selectOptions(barangay, [], 'Choose a barangay');
    postal.value = '';
    updateSummaryAddress();
  });
  province.addEventListener('change', () => {
    selectOptions(city, Object.keys(hierarchy[region.value]?.[province.value] || {}), 'Choose a city / municipality');
    selectOptions(barangay, [], 'Choose a barangay');
    postal.value = '';
    updateSummaryAddress();
  });
  city.addEventListener('change', () => {
    selectOptions(barangay, Object.keys(hierarchy[region.value]?.[province.value]?.[city.value] || {}), 'Choose a barangay');
    postal.value = '';
    updateSummaryAddress();
  });
  barangay.addEventListener('change', () => {
    postal.value = hierarchy[region.value]?.[province.value]?.[city.value]?.[barangay.value] || '';
    updateSummaryAddress();
  });
  ['addressStreet', 'addressTag'].forEach((id) => document.getElementById(id).addEventListener('input', updateSummaryAddress));

  // Saved Address Handling
  const savedAddressSelect = document.getElementById('savedAddressSelect');
  function getSavedAddresses() {
    try { return JSON.parse(localStorage.getItem('animo-addresses') || '[]'); } catch { return []; }
  }
  function renderSavedAddresses() {
    savedAddressSelect.innerHTML = '<option value="">Enter a new address</option>' + getSavedAddresses()
      .map((saved, index) => `<option value="${index}">${saved.tag}: ${saved.summary.replace(/[<>]/g, '')}</option>`).join('');
  }
  renderSavedAddresses();
  savedAddressSelect.addEventListener('change', () => {
    if (savedAddressSelect.value === '') return;
    const saved = getSavedAddresses()[Number(savedAddressSelect.value)];
    if (!saved) return;
    region.value = saved.region;
    region.dispatchEvent(new Event('change'));
    province.value = saved.province;
    province.dispatchEvent(new Event('change'));
    city.value = saved.city;
    city.dispatchEvent(new Event('change'));
    barangay.value = saved.barangay;
    barangay.dispatchEvent(new Event('change'));
    document.getElementById('addressStreet').value = saved.street;
    document.getElementById('addressTag').value = saved.tag;
    coordinates = saved.coordinates;
    pin.hidden = !coordinates;
    if (coordinates) {
      pin.style.left = `${((coordinates.longitude - 116.9) / 9.7) * 100}%`;
      pin.style.top = `${((21.2 - coordinates.latitude) / 16.5) * 100}%`;
      document.getElementById('pinCoordinates').textContent = `Pinned ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
    }
    updateSummaryAddress();
  });

  // Approximate Map Pin
  const addressMap = document.getElementById('addressMap');
  const placePin = (x, y) => {
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));
    coordinates = {
      latitude: Number((21.2 - boundedY * 16.5).toFixed(4)),
      longitude: Number((116.9 + boundedX * 9.7).toFixed(4))
    };
    pin.hidden = false;
    pin.style.left = `${boundedX * 100}%`;
    pin.style.top = `${boundedY * 100}%`;
    document.getElementById('pinCoordinates').textContent = `Approximate pin: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
  };
  addressMap.addEventListener('click', (event) => {
    const bounds = addressMap.getBoundingClientRect();
    placePin((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
  });
  addressMap.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      placePin(.5, .5);
    }
  });
  document.getElementById('saveAddressButton').addEventListener('click', () => {
    updateSummaryAddress();
    if (!address.value.trim() || !coordinates) {
      status.textContent = 'Complete your address and drop a map pin before saving it.';
      status.classList.add('error');
      return;
    }
    const saved = getSavedAddresses();
    saved.push({
      tag: document.getElementById('addressTag').value,
      region: region.value, province: province.value, city: city.value, barangay: barangay.value,
      street: document.getElementById('addressStreet').value,
      summary: address.value, coordinates
    });
    localStorage.setItem('animo-addresses', JSON.stringify(saved));
    renderSavedAddresses();
    status.textContent = 'Address saved in this browser.';
    status.classList.remove('error');
  });

  // Cart Summary
  const items = window.aniMoCart.getCart().map((entry) => {
    const listing = window.aniMoCart.getItemByCartId(entry.id);
    return listing ? { ...entry, listing } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const shipping = subtotal && fulfillment.value === 'delivery' ? 45 : 0;
  summary.innerHTML = `
    ${items.map((item) => `<div class="summary-line"><span>${window.aniMoUtilities.escapeHTML(item.listing.name)} × ${item.quantity}</span><strong>${formatCurrency(item.listing.price * item.quantity)}</strong></div>`).join('') || '<p>Your cart is empty.</p>'}
    <div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
    <div class="summary-line"><span>Delivery estimate</span><strong id="checkoutShipping">${formatCurrency(shipping)}</strong></div>
    <p class="checkout-demo-note">The server checks current prices, fulfillment, and voucher eligibility when the order is submitted.</p>`;
  try {
    const { user } = await window.aniMoApi('/api/auth/me');
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
    [...addressField.querySelectorAll('input,select,textarea')].forEach((control) => {
      control.required = needsAddress && control.id !== 'savedAddressSelect';
    });
    const estimate = document.getElementById('checkoutShipping');
    if (estimate) estimate.textContent = formatCurrency(needsAddress && subtotal ? 45 : 0);
  }
  fulfillment.addEventListener('change', updateFulfillment);
  updateFulfillment();

  // Place Order
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('error');
    if (!items.length) {
      status.textContent = 'Your cart is empty. Add a product or meal kit before checking out.';
      status.classList.add('error');
      return;
    }
    updateSummaryAddress();
    if (fulfillment.value === 'delivery' && !coordinates) {
      status.textContent = 'Drop a delivery map pin before placing this order.';
      status.classList.add('error');
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Checking availability and placing your order…';
    try {
      const result = await window.aniMoApi('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          fulfillment: fulfillment.value,
          contactName: document.getElementById('contactName').value,
          address: address.value,
          paymentMethod: document.getElementById('paymentMethod').value,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          voucher: localStorage.getItem('aniMoVoucher')
        })
      });
      localStorage.removeItem('aniMoCart');
      localStorage.removeItem('aniMoVoucher');
      window.location.assign(`../profile/profile.html?placed=${encodeURIComponent(result.order.id)}`);
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
      submit.disabled = false;
    }
  });
});
