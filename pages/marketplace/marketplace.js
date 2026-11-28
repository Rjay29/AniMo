// Marketplace
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const products = window.aniMoData.products;
  const grid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const sortSelect = document.getElementById('sortSelect');
  const ui = window.aniMoUtilities;

  // Product Categories
  [...new Set(products.map((product) => product.category))].forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Marketplace Rendering
  function renderProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;
    let filtered = products.filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.farm} ${product.location}`.toLowerCase();
      return searchable.includes(term) && (category === 'all' || product.category === category);
    });

    if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

    grid.innerHTML = filtered.map((product) => `
      <article class="product-card marketplace-product-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(product.image, product.name, product.category)}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(product.location)}</span><strong>${renderStars(product.rating)}</strong></div>
          <h3>${ui.escapeHTML(product.name)}</h3>
          <p>Sold by ${(() => {
            const farmer = window.aniMoData.farmers.find((entry) => entry.name === product.farm);
            return farmer ? `<a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}">${ui.escapeHTML(product.farm)}</a>` : ui.escapeHTML(product.farm);
          })()}</p>
          <p class="stock-status ${Number(product.stock) < 1 ? 'sold-out' : ''}">${Number(product.stock) < 1 ? `Sold out · Estimated restock ${new Date(Date.now() + 7 * 86400000).toLocaleDateString()}` : `${ui.escapeHTML(product.stock)} ${ui.escapeHTML(product.unit)} in stock`}</p>
          <small class="freshness-note">Updated ${ui.escapeHTML(product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'recently')} · ${Number(product.orderCount) || 0} orders</small>
          <div class="availability-list">
            ${product.deliveryAvailable ? '<span class="badge">Delivery available</span>' : ''}
            ${product.pickupAvailable ? '<span class="badge">Pickup available</span>' : ''}
          </div>
          <div class="marketplace-card-bottom">
            <div class="marketplace-price">
              <span class="price">${formatCurrency(product.price)} / ${ui.escapeHTML(product.unit)}</span>
            </div>
            <button class="btn btn-primary" type="button" data-add-cart="${ui.escapeHTML(product.id)}" ${Number(product.stock) < 1 ? 'disabled' : ''}>Add to cart</button>
            <a href="../product-details/product-details.html?id=${encodeURIComponent(product.id)}" class="btn btn-secondary product-details-link">View details</a>
          </div>
        </div>
      </article>
    `).join('');

    if (!filtered.length) {
      grid.innerHTML = '<div class="card no-products">No products found. Try another search or category.</div>';
    }
  }

  // Marketplace Filters
  [searchInput, categorySelect, sortSelect].forEach((element) => {
    // Input Interaction
    element.addEventListener('input', renderProducts);
    // Input Change
    element.addEventListener('change', renderProducts);
  });
  renderProducts();
});
