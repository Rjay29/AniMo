// Meal Kit Details
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const container = document.getElementById('packageDetail');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'sinigang-kit';
  const pkg = window.aniMoData.recipePackages.find((item) => item.id === id) || window.aniMoData.recipePackages[0];
  const ui = window.aniMoUtilities;
  const products = pkg.productIds.map((productId) => window.aniMoUtils.getProductById(productId)).filter(Boolean);
  const unavailable = products.filter((product) => Number(product.stock) < 1);
  const available = products.filter((product) => Number(product.stock) > 0);

  container.innerHTML = `
    <div class="package-detail">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(pkg.image, pkg.name, 'Local meal package', 'package-detail-image')}
      <div>
        <span class="eyebrow">Meal kit</span>
        <h1>${ui.escapeHTML(pkg.name)}</h1>
        <p>${ui.escapeHTML(pkg.description)}</p>
        <div class="price" style="font-size:2rem; margin-bottom: 16px;">${formatCurrency(pkg.price)}</div>
        <div class="tag-list"><span class="tag">Local ingredients</span><span class="tag">Easy prep</span><span class="tag">Farmer sourced</span></div>
        <h2>Package ingredients</h2>
        <ul>${products.map((product) => `<li${Number(product.stock) < 1 ? ' class="sold-out"' : ''}>${ui.escapeHTML(product.name)} from ${ui.escapeHTML(product.location)} · ${Number(product.stock) < 1 ? 'SOLD OUT' : `${ui.escapeHTML(product.stock)} in stock`}</li>`).join('')}</ul>
        ${unavailable.length ? `<p class="sold-out" role="status">Unavailable ingredients: ${unavailable.map((product) => ui.escapeHTML(product.name)).join(', ')}.</p>` : ''}
        <button id="addPackageButton" class="btn btn-primary" type="button" ${available.length ? '' : 'disabled'}>${unavailable.length ? 'Add available ingredients only' : 'Add package to cart'}</button>
        <a href="../recipe-packages/recipe-packages.html" class="btn btn-secondary">Back to packages</a>
      </div>
    </div>
  `;

  document.getElementById('addPackageButton').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (unavailable.length && !window.confirm(`Unavailable ingredients: ${unavailable.map((product) => product.name).join(', ')}. Continue with available ingredients only?`)) return;
    const pendingItems = unavailable.length
      ? available.map((product) => ({ id: product.id, qty: 1 }))
      : [{ id: `package:${pkg.id}`, qty: 1 }];
    if (!await window.aniMoRequireLogin({ pendingCart: { items: pendingItems } })) return;
    pendingItems.forEach((item) => window.aniMoCart.addToCart(item.id, item.qty));
    button.textContent = 'Package added to cart';
    button.disabled = true;
  });
});
