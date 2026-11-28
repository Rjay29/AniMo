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
        <ul>${products.map((product) => `<li>${ui.escapeHTML(product.name)} from ${ui.escapeHTML(product.location)}</li>`).join('')}</ul>
        <button id="addPackageButton" class="btn btn-primary" type="button">Add package to cart</button>
        <a href="../recipe-packages/recipe-packages.html" class="btn btn-secondary">Back to packages</a>
      </div>
    </div>
  `;

  document.getElementById('addPackageButton').addEventListener('click', (event) => {
    window.aniMoCart.addToCart(`package:${pkg.id}`, 1);
    event.currentTarget.textContent = 'Package added to cart';
    event.currentTarget.disabled = true;
  });
});
