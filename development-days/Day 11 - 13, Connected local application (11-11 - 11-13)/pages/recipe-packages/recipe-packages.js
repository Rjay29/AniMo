// Meal Kit Catalog
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const grid = document.getElementById('packageGrid');
  if (!grid) return;
  const ui = window.aniMoUtilities;

  grid.innerHTML = window.aniMoData.recipePackages.map((pkg) => `
    <article class="package-card">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(pkg.image, pkg.name, 'Local meal package')}
      <div class="body">
        <h3>${ui.escapeHTML(pkg.name)}</h3>
        <p>${ui.escapeHTML(pkg.description)}</p>
        <div class="card-footer">
          <span class="price">${formatCurrency(pkg.price)}</span>
          <a href="../package-details/package-details.html?id=${encodeURIComponent(pkg.id)}" class="btn btn-secondary">View package</a>
        </div>
      </div>
    </article>
  `).join('');
});
