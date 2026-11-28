// Product Detail Ordering
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const container = document.getElementById('productDetails');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'okra';
  const product = window.aniMoData.products.find((item) => item.id === id) || window.aniMoData.products[0];
  const ui = window.aniMoUtilities;

  if (!container) return;

  container.innerHTML = `
    <div class="product-gallery">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(product.image, product.name, product.category)}
    </div>
    <div class="product-info">
      <span class="eyebrow">${ui.escapeHTML(product.category)}</span>
      <h1>${ui.escapeHTML(product.name)}</h1>
      <div class="product-meta">
        <span class="badge">${renderStars(product.rating)} ${product.rating}</span>
        <span class="badge">${ui.escapeHTML(product.location)}</span>
      </div>
      <div class="price" style="font-size:2rem;">${formatCurrency(product.price)} / ${ui.escapeHTML(product.unit)}</div>
      <p>${ui.escapeHTML(product.description)}</p>
      <div class="product-meta">
        ${product.deliveryAvailable ? '<span class="badge">Delivery available</span>' : ''}
        ${product.pickupAvailable ? '<span class="badge">Pickup available</span>' : ''}
      </div>
      <div class="product-actions">
        <button class="btn btn-primary" type="button" data-add-cart="${ui.escapeHTML(product.id)}">Add to cart</button>
        <a class="btn btn-secondary" href="../marketplace/marketplace.html">Back to market</a>
      </div>
      <div class="product-specs">
        <h3>Details</h3>
        <ul>
          <li>Farm: ${ui.escapeHTML(product.farm)}</li>
          <li>Category: ${ui.escapeHTML(product.category)}</li>
          <li>Availability: ${ui.escapeHTML(product.stock)} ${ui.escapeHTML(product.unit)} in stock</li>
          <li>Best used for: soups, sautees, and grilled dishes</li>
        </ul>
      </div>
    </div>
  `;
});
