// Admin Catalog And Orders
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('adminStatus');
  const form = document.getElementById('listingForm');
  const typeSelect = document.getElementById('listingType');
  const fields = document.getElementById('listingFields');
  const list = document.getElementById('listingGroups');
  const photo = document.getElementById('listingPhoto');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  const saveButton = document.getElementById('saveListing');
  const cancelEditButton = document.getElementById('cancelEdit');
  const assistantDataForm = document.getElementById('assistantDataForm');
  const assistantDataList = document.getElementById('assistantDataList');
  const saveAssistantDataButton = document.getElementById('saveAssistantData');
  const cancelAssistantEditButton = document.getElementById('cancelAssistantEdit');
  const statusNames = { to_receive: 'To receive', to_pickup: 'To pick up', completed: 'Completed' };
  const assistantCategories = [
    'Orders & checkout', 'Payments & vouchers', 'Delivery & pickup',
    'Products & farmers', 'Recipes & meal kits', 'Accounts & privacy',
    'Website help', 'Other'
  ];
  const typeNames = {
    products: 'Marketplace products',
    farmers: 'Farmers',
    recipes: 'Recipes',
    recipePackages: 'Meal kits'
  };
  let catalog = { products: [], farmers: [], recipes: [], recipePackages: [] };
  let editingId = null;
  let existingImage = null;
  let assistantRecords = [];
  let editingAssistantId = null;

  // Section State
  async function api(url, options = {}) {
    try {
      return await window.aniMoApi(url, options);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        window.location.href = '/pages/login/login.html?next=%2Fadmin%2F';
      }
      throw error;
    }
  }

  // Status Display
  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('error', isError);
  }

  // Html Escaping
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  // Form Field Validation
  function inputField(name, label, options = {}) {
    const id = `listing-${name}`;
    if (options.type === 'checkbox') {
      return `<label class="admin-check admin-field${options.full ? ' admin-field-full' : ''}" for="${id}">
        <input id="${id}" name="${name}" type="checkbox" /><span>${escapeHtml(label)}</span>
      </label>`;
    }
    if (options.type === 'select') {
      return `<div class="admin-field${options.full ? ' admin-field-full' : ''}"><label for="${id}">${escapeHtml(label)}</label>
        <select class="select" id="${id}" name="${name}">${options.choices.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join('')}</select>
      </div>`;
    }
    if (options.type === 'textarea') {
      return `<div class="admin-field${options.full ? ' admin-field-full' : ''}"><label for="${id}">${escapeHtml(label)}</label>
        <textarea class="textarea" id="${id}" name="${name}"${options.required ? ' required' : ''}></textarea>
      </div>`;
    }
    if (options.type === 'products') {
      const choices = catalog.products.map((product) => `<label><input type="checkbox" name="productIds" value="${escapeHtml(product.id)}" /><span>${escapeHtml(product.name)}</span></label>`).join('');
      return `<div class="admin-field admin-field-full"><span class="manager-label">${escapeHtml(label)}</span>
        <div class="admin-product-picker">${choices || '<span class="muted">Add products before linking them here.</span>'}</div>
      </div>`;
    }
    const constraints = [
      options.min ? ` min="${options.min}"` : '',
      options.max ? ` max="${options.max}"` : '',
      options.step ? ` step="${options.step}"` : ''
    ].join('');
    return `<div class="admin-field${options.full ? ' admin-field-full' : ''}"><label for="${id}">${escapeHtml(label)}</label>
      <input class="input" id="${id}" name="${name}" type="${options.type || 'text'}"${constraints}${options.required ? ' required' : ''} />
      ${name === 'rating' ? `<output class="admin-rating-preview" data-rating-preview="${id}" for="${id}">Current rating: 0.0 / 5</output>` : ''}
    </div>`;
  }

  const fieldSchemas = {
    products: () => [
      inputField('name', 'Product name', { required: true }),
      inputField('category', 'Category', { required: true }),
      inputField('price', 'Price in PHP', { type: 'number', min: '0.01', step: '0.01', required: true }),
      inputField('unit', 'Sold per (bundle, jar, pack...)', { required: true }),
      inputField('farm', 'Farmer or seller name', { required: true }),
      inputField('location', 'Location', { required: true }),
      inputField('rating', 'Rating (0–5)', { type: 'number', min: '0', max: '5', step: '0.1', required: true }),
      inputField('stock', 'Stock quantity', { type: 'number', min: '0', step: '1', required: true }),
      inputField('description', 'Description', { type: 'textarea', full: true, required: true }),
      inputField('deliveryAvailable', 'Delivery available', { type: 'checkbox' }),
      inputField('pickupAvailable', 'Pickup available', { type: 'checkbox' })
    ],
    farmers: () => [
      inputField('name', 'Farmer or group name', { required: true }),
      inputField('type', 'Seller type', { type: 'select', choices: ['Individual person', 'Group of farmers'] }),
      inputField('location', 'Location', { required: true }),
      inputField('specialty', 'What they grow or sell', { required: true }),
      inputField('rating', 'Rating (0–5)', { type: 'number', min: '0', max: '5', step: '0.1', required: true }),
      inputField('followers', 'Community followers', { type: 'number', min: '0', step: '1', required: true }),
      inputField('story', 'Farmer story', { type: 'textarea', full: true, required: true })
    ],
    recipes: () => [
      inputField('name', 'Recipe name', { required: true }),
      inputField('category', 'Recipe category', { required: true }),
      inputField('time', 'Preparation time', { required: true }),
      inputField('difficulty', 'Difficulty', { type: 'select', choices: ['Easy', 'Medium', 'Hard'] }),
      inputField('description', 'Description', { type: 'textarea', full: true, required: true }),
      inputField('ingredients', 'Ingredients (one per line)', { type: 'textarea', full: true, required: true }),
      inputField('steps', 'Cooking steps (one per line)', { type: 'textarea', full: true, required: true }),
      inputField('productIds', 'Products included in recipe ordering', { type: 'products' })
    ],
    recipePackages: () => [
      inputField('name', 'Meal kit name', { required: true }),
      inputField('price', 'Price in PHP', { type: 'number', min: '0.01', step: '0.01', required: true }),
      inputField('description', 'What is included', { type: 'textarea', full: true, required: true }),
      inputField('productIds', 'Products included in the meal kit', { type: 'products' })
    ]
  };

  // Listing Type
  function currentType() { return typeSelect.value; }

  // Admin Form Rendering
  function renderFields(entry = {}) {
    const type = currentType();
    const normalized = { ...entry };
    if (type === 'recipes') {
      normalized.ingredients = (entry.ingredients || []).join('\n');
      normalized.steps = (entry.steps || []).join('\n');
    }
    fields.innerHTML = fieldSchemas[type]().join('');
    for (const [name, value] of Object.entries(normalized)) {
      const controls = [...fields.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
      if (!controls.length) continue;
      if (name === 'productIds' && Array.isArray(value)) {
        controls.forEach((control) => { control.checked = value.includes(control.value); });
      } else if (controls[0].type === 'checkbox') controls[0].checked = Boolean(value);
      else controls[0].value = String(value ?? '');
    }
    if (Array.isArray(entry.productIds)) {
      fields.querySelectorAll('input[name="productIds"]').forEach((input) => {
        input.checked = entry.productIds.includes(input.value);
      });
    }
    updateRatingPreview();
  }

  // Rating Preview Updates
  function updateRatingPreview() {
    const ratingInput = fields.querySelector('[name="rating"]');
    const preview = fields.querySelector('.admin-rating-preview');
    if (ratingInput && preview) {
      const rating = Number(ratingInput.value);
      preview.textContent = `Current rating: ${(Number.isFinite(rating) ? rating : 0).toFixed(1)} / 5`;
    }
  }

  // Listing Rendering
  function renderListings() {
    const groups = Object.keys(typeNames).map((type) => {
      const entries = Array.isArray(catalog[type]) ? catalog[type] : [];
      return `
      <section class="listing-group"><h3>${typeNames[type]} <span class="muted">(${entries.length})</span></h3>
        ${entries.length ? entries.map((entry) => `
          <article class="listing-row">
            ${entry.image ? `<img src="${entry.image}" alt="" />` : '<span class="listing-image-empty" aria-hidden="true">No photo</span>'}
            <span class="listing-name">${escapeHtml(typeof entry.name === 'string' && entry.name.trim() && entry.name.trim().toLowerCase() !== 'undefined' ? entry.name : `Unnamed listing (${entry.id})`)}</span>
            <span class="listing-actions">
              <button class="btn btn-secondary" type="button" data-edit-type="${type}" data-edit-id="${escapeHtml(entry.id)}">Edit</button>
              <button class="btn btn-secondary" type="button" data-delete-type="${type}" data-delete-id="${escapeHtml(entry.id)}">Remove</button>
            </span>
          </article>`).join('') : '<p class="muted">No listings yet.</p>'}
      </section>`;
    }).join('');
    list.innerHTML = groups;
  }

  // Catalog Loading
  async function loadCatalog() {
    catalog = await api('/api/admin/listings');
    renderFields();
    renderListings();
  }

  // Assistant Data Rendering
  function renderAssistantData() {
    assistantDataList.innerHTML = assistantRecords.length ? assistantRecords.map((record) => `
      <article class="assistant-data-entry">
        <div class="assistant-data-heading">
          <div><span class="muted">${escapeHtml(record.category)}</span><h3>${escapeHtml(record.title)}</h3></div>
          <label class="assistant-data-toggle"><input type="checkbox" data-assistant-enabled="${record.id}"${record.enabled ? ' checked' : ''} /> Enabled</label>
        </div>
        <p>${escapeHtml(record.content)}</p>
        <div class="listing-actions">
          <button class="btn btn-secondary" type="button" data-assistant-edit="${record.id}">Edit</button>
          <button class="btn btn-secondary" type="button" data-assistant-delete="${record.id}">Remove</button>
        </div>
      </article>`).join('') : '<p class="muted">No assistant data has been added yet.</p>';
  }

  // Assistant Data Loading
  async function loadAssistantData() {
    const result = await api('/api/admin/assistant-data');
    assistantRecords = result.records;
    renderAssistantData();
  }

  // Assistant Data Validation
  function resetAssistantDataForm() {
    editingAssistantId = null;
    assistantDataForm.reset();
    document.getElementById('assistantDataFormTitle').textContent = 'Add assistant data';
    saveAssistantDataButton.textContent = 'Save assistant data';
    cancelAssistantEditButton.hidden = true;
  }

  // Assistant Categories
  function setAssistantCategory(category) {
    const categorySelect = assistantDataForm.elements.category;
    if (!assistantCategories.includes(category)
      && ![...categorySelect.options].some((option) => option.value === category)) {
      const legacyOption = document.createElement('option');
      legacyOption.value = category;
      legacyOption.textContent = category;
      categorySelect.add(legacyOption);
    }
    categorySelect.value = category;
  }

  // Image Validation
  async function resizeImage(file) {
    if (!file) return existingImage;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP photo.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Choose a photo under 5 MB.');
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not prepare this photo.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/webp', 0.8);
      if (dataUrl.length > 1_300_000) throw new Error('Resized photo is still too large. Choose a smaller file.');
      return dataUrl;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Assistant Entry Validation
  function readEntry() {
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    const numbers = (name) => Number(data.get(name));
    const checked = (name) => data.has(name);
    const selected = data.getAll('productIds').map(String);
    if (currentType() === 'products') {
      return {
        id: editingId, name: value('name'), category: value('category'), price: numbers('price'),
        unit: value('unit'), farm: value('farm'), location: value('location'),
        rating: numbers('rating'), stock: numbers('stock'), description: value('description'),
        tags: [], deliveryAvailable: checked('deliveryAvailable'), pickupAvailable: checked('pickupAvailable')
      };
    }
    if (currentType() === 'farmers') {
      return {
        id: editingId, name: value('name'), type: value('type'), location: value('location'),
        specialty: value('specialty'), rating: numbers('rating'), followers: numbers('followers'),
        story: value('story')
      };
    }
    if (currentType() === 'recipes') {
      return {
        id: editingId, name: value('name'), category: value('category'), time: value('time'),
        difficulty: value('difficulty'), description: value('description'),
        ingredients: value('ingredients').split('\n').map((item) => item.trim()).filter(Boolean),
        steps: value('steps').split('\n').map((item) => item.trim()).filter(Boolean),
        productIds: selected
      };
    }
    return {
      id: editingId, name: value('name'), price: numbers('price'),
      description: value('description'), productIds: selected
    };
  }

  // Form Validation
  function resetForm() {
    editingId = null;
    existingImage = null;
    form.reset();
    typeSelect.disabled = false;
    saveButton.textContent = 'Add listing';
    document.getElementById('listingFormTitle').textContent = 'Add listing';
    cancelEditButton.hidden = true;
    photoPreview.hidden = true;
    photoPreview.removeAttribute('src');
    photoPlaceholder.hidden = false;
    renderFields();
  }

  // Order Loading
  async function loadOrders() {
    const { orders } = await api('/api/admin/orders');
    document.getElementById('adminOrders').innerHTML = orders.length ? orders.map((order) => `
      <article class="admin-order">
        <div><strong>${escapeHtml(order.id)}</strong> · ${escapeHtml(order.username)}
          <p>${escapeHtml(order.items.map((item) => `${item.name} × ${item.quantity}`).join(', '))}</p>
          <span class="muted">${escapeHtml(order.fulfillment)} · ₱${Number(order.total).toFixed(2)} · ${escapeHtml(order.created_at)}</span>
        </div>
        <select class="select" data-order-status="${escapeHtml(order.id)}" aria-label="Status for ${escapeHtml(order.id)}">
          ${Object.entries(statusNames).map(([status, label]) => `<option value="${status}"${order.status === status ? ' selected' : ''}>${label}</option>`).join('')}
        </select>
      </article>`).join('') : '<p class="muted">There are no customer orders yet.</p>';
  }

  try {
    const { user } = await api('/api/auth/me');
    if (user.role !== 'admin') {
      window.location.href = '/pages/home/home.html';
      return;
    }
    document.getElementById('adminIdentity').textContent = `Signed in as ${user.username}`;
    await Promise.all([loadCatalog(), loadAssistantData()]);
  } catch (error) {
    showStatus(error.message, true);
    return;
  }

  // Input Change
  typeSelect.addEventListener('change', () => {
    editingId = null;
    existingImage = null;
    form.reset();
    photoPreview.hidden = true;
    photoPreview.removeAttribute('src');
    photoPlaceholder.hidden = false;
    saveButton.textContent = 'Add listing';
    document.getElementById('listingFormTitle').textContent = 'Add listing';
    cancelEditButton.hidden = true;
    renderFields();
  });
  // Input Interaction
  fields.addEventListener('input', (event) => {
    if (event.target.matches('[name="rating"]')) updateRatingPreview();
  });
  // Input Change
  photo.addEventListener('change', () => {
    const file = photo.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    photoPreview.onload = () => URL.revokeObjectURL(objectUrl);
    photoPreview.onerror = () => URL.revokeObjectURL(objectUrl);
    photoPreview.src = objectUrl;
    photoPreview.hidden = false;
    photoPlaceholder.hidden = true;
  });

  // Form Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = photo.files[0];
    if (!editingId && !file) return showStatus('Choose a photo before saving a new listing.', true);
    if (currentType() === 'recipePackages' && !form.querySelector('[name="productIds"]:checked')) {
      return showStatus('Select at least one marketplace product for the meal kit.', true);
    }
    if (currentType() === 'recipes' && !form.querySelector('[name="ingredients"]').value.trim()) {
      return showStatus('Add at least one recipe ingredient.', true);
    }
    if (currentType() === 'recipes' && !form.querySelector('[name="steps"]').value.trim()) {
      return showStatus('Add at least one cooking step.', true);
    }
    saveButton.disabled = true;
    showStatus('Saving listing...');
    try {
      const entry = readEntry();
      entry.image = await resizeImage(file) || null;
      const path = editingId ? `/api/admin/listings/${encodeURIComponent(editingId)}` : '/api/admin/listings';
      const result = await api(path, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ type: currentType(), entry })
      });
      showStatus(`${result.entry.name} saved to the database.`);
      resetForm();
      await loadCatalog();
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
    }
  });

  // Click Interaction
  list.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-id]');
    const remove = event.target.closest('[data-delete-id]');
    if (edit) {
      const type = edit.dataset.editType;
      const entry = catalog[type].find((item) => item.id === edit.dataset.editId);
      if (!entry) return showStatus('Listing no longer exists. Refresh and try again.', true);
      editingId = entry.id;
      existingImage = entry.image || null;
      typeSelect.value = type;
      typeSelect.disabled = true;
      renderFields(entry);
      if (existingImage) {
        photoPreview.src = existingImage;
        photoPreview.hidden = false;
        photoPlaceholder.hidden = true;
      }
      saveButton.textContent = 'Save changes';
      document.getElementById('listingFormTitle').textContent = 'Edit listing';
      cancelEditButton.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (remove) {
      if (!window.confirm('Remove this listing from AniMo?')) return;
      try {
        await api(`/api/admin/listings/${encodeURIComponent(remove.dataset.deleteId)}`, { method: 'DELETE' });
        showStatus('Listing removed from the database.');
        await loadCatalog();
      } catch (error) {
        showStatus(error.message, true);
      }
    }
  });

  // Click Interaction
  cancelEditButton.addEventListener('click', resetForm);
  document.getElementById('refreshCatalog').addEventListener('click', () => loadCatalog().catch((error) => showStatus(error.message, true)));
  document.getElementById('refreshOrders').addEventListener('click', () => loadOrders().catch((error) => showStatus(error.message, true)));
  document.getElementById('refreshAssistantData').addEventListener('click', () => loadAssistantData().catch((error) => showStatus(error.message, true)));
  // Form Submission
  assistantDataForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    saveAssistantDataButton.disabled = true;
    showStatus('Saving assistant data...');
    const entry = {
      category: assistantDataForm.elements.category.value.trim(),
      title: assistantDataForm.elements.title.value.trim(),
      content: assistantDataForm.elements.content.value.trim(),
      enabled: assistantDataForm.elements.enabled.checked
    };
    try {
      await api(
        editingAssistantId ? `/api/admin/assistant-data/${editingAssistantId}` : '/api/admin/assistant-data',
        { method: editingAssistantId ? 'PUT' : 'POST', body: JSON.stringify(entry) }
      );
      resetAssistantDataForm();
      await loadAssistantData();
      showStatus('Assistant data saved.');
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveAssistantDataButton.disabled = false;
    }
  });
  // Click Interaction
  cancelAssistantEditButton.addEventListener('click', resetAssistantDataForm);
  // Click Interaction
  assistantDataList.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-assistant-edit]');
    const remove = event.target.closest('[data-assistant-delete]');
    if (edit) {
      const record = assistantRecords.find((item) => item.id === Number(edit.dataset.assistantEdit));
      if (!record) return showStatus('Assistant data entry no longer exists. Refresh and try again.', true);
      editingAssistantId = record.id;
      setAssistantCategory(record.category);
      assistantDataForm.elements.title.value = record.title;
      assistantDataForm.elements.content.value = record.content;
      assistantDataForm.elements.enabled.checked = Boolean(record.enabled);
      document.getElementById('assistantDataFormTitle').textContent = 'Edit assistant data';
      saveAssistantDataButton.textContent = 'Save changes';
      cancelAssistantEditButton.hidden = false;
      assistantDataForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (remove) {
      if (!window.confirm('Remove this assistant data entry?')) return;
      try {
        await api(`/api/admin/assistant-data/${remove.dataset.assistantDelete}`, { method: 'DELETE' });
        if (editingAssistantId === Number(remove.dataset.assistantDelete)) resetAssistantDataForm();
        await loadAssistantData();
        showStatus('Assistant data entry removed.');
      } catch (error) {
        showStatus(error.message, true);
      }
    }
  });
  // Input Change
  assistantDataList.addEventListener('change', async (event) => {
    const toggle = event.target.closest('[data-assistant-enabled]');
    if (!toggle) return;
    const record = assistantRecords.find((item) => item.id === Number(toggle.dataset.assistantEnabled));
    if (!record) return showStatus('Assistant data entry no longer exists. Refresh and try again.', true);
    toggle.disabled = true;
    try {
      await api(`/api/admin/assistant-data/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...record, enabled: toggle.checked })
      });
      await loadAssistantData();
      showStatus('Assistant data setting updated.');
    } catch (error) {
      showStatus(error.message, true);
      await loadAssistantData();
    }
  });
  document.getElementById('adminOrders').addEventListener('change', async (event) => {
    const select = event.target.closest('[data-order-status]');
    if (!select) return;
    try {
      await api(`/api/admin/orders/${encodeURIComponent(select.dataset.orderStatus)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: select.value })
      });
      showStatus('Order status updated.');
    } catch (error) {
      showStatus(error.message, true);
      await loadOrders();
    }
  });
  document.querySelectorAll('.admin-tab').forEach((button) => {
    // Click Interaction
    button.addEventListener('click', async () => {
      document.querySelectorAll('.admin-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      for (const section of ['listings', 'orders', 'assistantData']) {
        document.getElementById(`${section}Section`).hidden = button.dataset.tab !== section;
      }
      try {
        if (button.dataset.tab === 'orders') await loadOrders();
        if (button.dataset.tab === 'assistantData') await loadAssistantData();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
  document.getElementById('adminLogout').addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST', body: '{}' });
      window.location.replace('/pages/login/login.html');
    } catch (error) {
      showStatus(error.message, true);
    }
  });
});
