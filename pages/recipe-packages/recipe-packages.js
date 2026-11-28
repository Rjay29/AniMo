// Meal Kit Catalog
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const grid = document.getElementById('packageGrid');
  if (!grid) return;
  const ui = window.aniMoUtilities;

  grid.innerHTML = window.aniMoData.recipePackages.map((pkg) => {
    const products = pkg.productIds.map((id) => window.aniMoUtils.getProductById(id)).filter(Boolean);
    const unavailable = products.filter((product) => Number(product.stock) < 1);
    const allUnavailable = products.length > 0 && unavailable.length === products.length;
    return `
    <article class="package-card">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(pkg.image, pkg.name, 'Local meal package')}
      <div class="body">
        <h3>${ui.escapeHTML(pkg.name)}</h3>
        <p>${ui.escapeHTML(pkg.description)}</p>
        <div class="availability-list">${products.map((product) => `<span class="badge${Number(product.stock) < 1 ? ' sold-out' : ''}">${ui.escapeHTML(product.name)} · ${Number(product.stock) < 1 ? 'Sold out' : `${ui.escapeHTML(product.stock)} in stock`}</span>`).join('')}</div>
        <div class="card-footer">
          <span class="price">${formatCurrency(pkg.price)}</span>
          <div class="package-card-actions">
            <button class="btn btn-primary" type="button" data-add-cart="package:${ui.escapeHTML(pkg.id)}" ${allUnavailable ? 'disabled' : ''}>${allUnavailable ? 'Sold out' : 'Add to cart'}</button>
            <a href="../package-details/package-details.html?id=${encodeURIComponent(pkg.id)}" class="btn btn-secondary">View package</a>
          </div>
        </div>
      </div>
    </article>`;
  }).join('');
});