// Meal Kit Catalog
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const grid = document.getElementById('packageGrid');
  if (!grid) return;
  const ui = window.aniMoUtilities;

  grid.innerHTML = window.aniMoData.recipePackages.map((pkg) => ui.renderPackageCard(pkg)).join('');
});