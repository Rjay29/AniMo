// Profile Order History
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('profileStatus');
  const orderList = document.getElementById('orderList');
  const labels = { to_receive: 'To receive', to_pickup: 'To pick up', completed: 'Completed' };
  const pictureInput = document.getElementById('profilePicture');
  let picturePreview = document.getElementById('profilePicturePreview');
  const defaultPicture = '';
  let orders = [];
  let filter = 'all';
  let removePicture = false;

  // Section State
  async function api(url, options = {}) {
    try {
      return await window.aniMoApi(url, options);
    } catch (error) {
      if (error.status === 401) window.location.replace('/pages/login/login.html');
      throw error;
    }
  }

  // Html Escaping
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  // Order Rendering
  function renderOrders() {
    const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);
    orderList.innerHTML = visible.length ? visible.map((order) => `
      <article class="profile-order">
        <div class="profile-order-header"><h3>Order ${escapeHtml(order.id)}</h3><span class="order-state">${escapeHtml(labels[order.status] || order.status)}</span></div>
        <p>${escapeHtml(order.created_at)} · ${escapeHtml(order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery')} · ₱${Number(order.total).toFixed(2)}</p>
        <ul class="order-items">${order.items.map((item) => `<li>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)}${order.status === 'completed' && !item.id.startsWith('package:') ? ` · <a href="../product-details/product-details.html?id=${encodeURIComponent(item.id)}#productReviews">Rate this product</a>` : ''}</li>`).join('')}</ul>
        ${order.address ? `<p>Delivery address: ${escapeHtml(order.address)}</p>` : ''}
      </article>`).join('') : (filter === 'all'
        ? '<div class="empty-state" role="status"><p class="empty-state-title">No orders yet</p><p>Browse the market to place your first order.</p><a class="btn btn-secondary" href="../marketplace/marketplace.html">Browse the marketplace</a></div>'
        : `<div class="empty-state" role="status"><p class="empty-state-title">Nothing here</p><p>No orders in “${escapeHtml(labels[filter])}” yet.</p></div>`);
  }

  // Order Loading
  async function loadOrders() {
    const result = await api('/api/profile/orders');
    orders = result.orders;
    renderOrders();
  }

  // Profile Picture Handling
  function setProfilePicture(source) {
    if (source) {
      const image = document.createElement('img');
      image.id = 'profilePicturePreview';
      image.alt = 'Profile picture preview';
      image.src = source;
      picturePreview.replaceWith(image);
      picturePreview = image;
      return;
    }
    const placeholder = document.createElement('div');
    placeholder.id = 'profilePicturePreview';
    placeholder.className = 'profile-picture-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', 'No Profile');
    placeholder.textContent = 'No Profile';
    picturePreview.replaceWith(placeholder);
    picturePreview = placeholder;
  }

  // Image Validation
  async function resizeImage(file) {
    if (!file) return null;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Choose a JPG, PNG, or WebP profile picture.');
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('Choose a profile picture under 5 MB.');
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      const scale = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not prepare this picture.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/webp', 0.8);
      if (dataUrl.length > 1_500_000) throw new Error('Resized picture is still too large. Choose a smaller file.');
      return dataUrl;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  try {
    const { user } = await api('/api/auth/me');
    document.getElementById('profileUsername').value = user.username;
    document.getElementById('profileDisplayName').value = user.displayName;
    setProfilePicture(user.profilePicture || defaultPicture);
    await loadOrders();
  } catch (error) {
    status.textContent = error.message;
    status.classList.add('error');
    return;
  }

  document.getElementById('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('error');
    try {
      const { user } = await api('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: document.getElementById('profileDisplayName').value,
          ...(pictureInput.files[0] ? { profilePicture: await resizeImage(pictureInput.files[0]) } : {}),
          ...(removePicture ? { profilePicture: null } : {})
        })
      });
      document.getElementById('profileDisplayName').value = user.displayName;
      setProfilePicture(user.profilePicture || defaultPicture);
      pictureInput.value = '';
      removePicture = false;
      status.textContent = 'Profile updated.';
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  });
  // Input Change
  pictureInput.addEventListener('change', () => {
    const file = pictureInput.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfilePicture(objectUrl);
    const previewImage = document.getElementById('profilePicturePreview');
    previewImage.onload = () => URL.revokeObjectURL(objectUrl);
    previewImage.onerror = () => URL.revokeObjectURL(objectUrl);
    removePicture = false;
  });
  document.getElementById('removeProfilePicture').addEventListener('click', () => {
    pictureInput.value = '';
    setProfilePicture(defaultPicture);
    removePicture = true;
  });
  document.getElementById('refreshOrders').addEventListener('click', () => {
    loadOrders().catch((error) => {
      status.textContent = error.message;
      status.classList.add('error');
    });
  });
  document.querySelectorAll('.order-tab').forEach((button) => {
    // Click Interaction
    button.addEventListener('click', () => {
      filter = button.dataset.status;
      document.querySelectorAll('.order-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      renderOrders();
    });
  });
});
