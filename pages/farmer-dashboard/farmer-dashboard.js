// Farmer Listing And Delivery Controls
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('farmerListingForm');
  const status = document.getElementById('farmerStatus');
  const typeField = form.elements.type;
  const productChoices = document.getElementById('farmerProductChoices');
  let catalog;
  let editingId = null;
  let existingImage = null;

  // Farmer Authorization
  try {
    const { user } = await window.aniMoApi('/api/auth/me');
    if (user.role !== 'farmer') {
      status.textContent = 'Only verified farmer accounts can manage listings.';
      form.hidden = true;
      return;
    }
  } catch (error) {
    status.textContent = error.message;
    form.hidden = true;
    return;
  }
  await window.aniMoDataReady;
  catalog = window.aniMoData;
  const escape = window.aniMoUtilities.escapeHTML;
  productChoices.innerHTML = catalog.products.map((product) => `<label><input type="checkbox" name="productIds" value="${escape(product.id)}" /><span>${escape(product.name)} · ${escape(product.stock)} in stock</span></label>`).join('');

  // Listing Form Type
  function updateTypeFields() {
    const type = typeField.value;
    const productFields = form.querySelector('.farmer-product-fields');
    const recipeFields = form.querySelector('.farmer-recipe-fields');
    const categoryField = document.getElementById('categoryField');
    const price = form.elements.price;
    const stock = form.elements.stock;
    const unit = form.elements.unit;
    const farm = form.elements.farm;
    const location = form.elements.location;
    productFields.hidden = type !== 'products';
    [price, stock, unit, farm, location].forEach((input) => {
      input.required = type === 'products' || (type === 'recipePackages' && input === price);
    });
    recipeFields.hidden = type !== 'recipes';
    [...recipeFields.querySelectorAll('input,textarea,select')].forEach((input) => {
      input.required = type === 'recipes' && ['time', 'ingredients', 'steps'].includes(input.name);
    });
    categoryField.hidden = type !== 'products' && type !== 'recipes';
    form.elements.category.required = type === 'products' || type === 'recipes';
    document.getElementById('farmerFormHeading').textContent = editingId ? 'Edit your listing' : 'Submit a listing';
  }
  typeField.addEventListener('change', updateTypeFields);
  updateTypeFields();

  // Listing And Order Rendering
  async function loadListings() {
    const { entries } = await window.aniMoApi('/api/farmer/listings');
    document.getElementById('farmerListings').innerHTML = entries.length ? entries.map((entry) => `
      <article class="farmer-list-row farmer-listing-row">
        ${window.aniMoUtilities.renderCatalogImage(
          entry.image,
          entry.name,
          entry.listingType === 'recipePackages' ? 'Local meal package' : entry.category || (entry.listingType === 'recipes' ? 'Herbs' : 'Vegetables'),
          'farmer-list-thumbnail'
        )}
        <div class="farmer-list-row-copy"><strong>${escape(entry.name)}</strong><span class="farmer-review-state ${entry.status === 'approved' ? 'approved' : ''}">${escape(entry.status)}</span>
          <p>${entry.listingType === 'products' ? `${escape(entry.stock)} ${escape(entry.unit)} in stock` : escape(entry.listingType)}</p></div>
        <button class="btn btn-secondary" type="button" data-edit-listing="${escape(entry.id)}">Edit / stock</button>
      </article>`).join('') : '<p>No listings yet. New submissions are reviewed before appearing publicly.</p>';
  }
  async function loadOrders() {
    const { orders } = await window.aniMoApi('/api/farmer/orders');
    document.getElementById('farmerOrders').innerHTML = orders.length ? orders.map((order) => `
      <article class="farmer-list-row">
        <div><strong>${escape(order.id)} · ${escape(order.username)}</strong><p>${order.items.map((item) => `${escape(item.name)} × ${escape(item.quantity)}`).join(', ')}</p><small>${escape(order.fulfillment)} · ${escape(order.status)} · ${escape(order.address)}</small></div>
        ${order.status === 'completed' ? '<span class="badge">Delivered</span>' : `<button class="btn btn-primary" type="button" data-deliver-order="${escape(order.id)}">Mark delivered</button>`}
      </article>`).join('') : '<p>No orders for your listings yet.</p>';
  }
  try {
    await Promise.all([loadListings(), loadOrders()]);
  } catch (error) {
    status.textContent = error.message;
  }

  // Listing Form Helpers
  function selectedProducts() {
    return [...form.querySelectorAll('[name="productIds"]:checked')].map((input) => input.value);
  }
  function lines(name) {
    return form.elements[name].value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  }
  async function imageData(file) {
    if (!file) return existingImage;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error('Choose a JPG, PNG, or WebP listing photo under 5 MB.');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read the selected photo.'));
      reader.readAsDataURL(file);
    });
  }
  function resetForm() {
    editingId = null;
    existingImage = null;
    form.reset();
    document.getElementById('cancelListingEdit').hidden = true;
    typeField.disabled = false;
    document.getElementById('farmerFormHeading').textContent = 'Submit a listing';
    updateTypeFields();
  }

  // Listing Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const type = typeField.value;
    try {
      const entry = {
        name: form.elements.name.value.trim(),
        description: form.elements.description.value.trim(),
        image: await imageData(form.elements.image.files[0])
      };
      if (type === 'products') Object.assign(entry, {
      category: form.elements.category.value.trim(),
      price: Number(form.elements.price.value),
      stock: Number(form.elements.stock.value),
      unit: form.elements.unit.value.trim(),
      farm: form.elements.farm.value.trim(),
      location: form.elements.location.value.trim(),
      rating: 5,
      deliveryAvailable: true,
      pickupAvailable: true,
      tags: []
    });
      if (type === 'recipes') Object.assign(entry, {
      category: form.elements.category.value.trim(),
      time: form.elements.time.value.trim(),
      difficulty: form.elements.difficulty.value,
      ingredients: lines('ingredients'),
      steps: lines('steps'),
      productIds: selectedProducts()
    });
      if (type === 'recipePackages') Object.assign(entry, {
      price: Number(form.elements.price.value),
      productIds: selectedProducts()
    });
      const path = editingId ? `/api/farmer/listings/${encodeURIComponent(editingId)}` : '/api/farmer/listings';
      const result = await window.aniMoApi(path, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ type, entry })
      });
      status.textContent = `${result.entry.name} submitted. It remains hidden from buyers until admin approval.`;
      resetForm();
      await loadListings();
    } catch (error) {
      status.textContent = error.message || 'Could not submit this listing.';
      status.classList.add('error');
    }
  });

  // Listing Edit And Delivery Actions
  document.getElementById('farmerListings').addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit-listing]');
    if (!button) return;
    window.aniMoApi('/api/farmer/listings').then(({ entries }) => {
      const entry = entries.find((item) => item.id === button.dataset.editListing);
      if (!entry) throw new Error('Listing no longer exists.');
      editingId = entry.id;
      existingImage = entry.image || null;
      typeField.value = entry.listingType;
      typeField.disabled = true;
      updateTypeFields();
      for (const [key, value] of Object.entries(entry)) {
        if (form.elements[key] && !['type', 'image'].includes(key) && typeof value !== 'object') form.elements[key].value = value;
      }
      if (entry.listingType === 'recipes') {
        form.elements.ingredients.value = (entry.ingredients || []).join('\n');
        form.elements.steps.value = (entry.steps || []).join('\n');
      }
      form.querySelectorAll('[name="productIds"]').forEach((input) => { input.checked = (entry.productIds || []).includes(input.value); });
      document.getElementById('cancelListingEdit').hidden = false;
      document.getElementById('farmerFormHeading').textContent = 'Edit your listing / stock';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch((error) => { status.textContent = error.message; });
  });
  document.getElementById('farmerOrders').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-deliver-order]');
    if (!button) return;
    button.disabled = true;
    try {
      await window.aniMoApi(`/api/farmer/orders/${encodeURIComponent(button.dataset.deliverOrder)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      });
      status.textContent = 'Order marked delivered and available stock deducted.';
      await Promise.all([loadOrders(), loadListings()]);
    } catch (error) {
      status.textContent = error.message;
      button.disabled = false;
    }
  });
  document.getElementById('cancelListingEdit').addEventListener('click', resetForm);
  document.getElementById('refreshFarmerListings').addEventListener('click', () => loadListings().catch((error) => { status.textContent = error.message; }));
  document.getElementById('refreshFarmerOrders').addEventListener('click', () => loadOrders().catch((error) => { status.textContent = error.message; }));
});
