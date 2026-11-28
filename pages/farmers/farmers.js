// Farmer Directory
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const grid = document.getElementById('farmerGrid');
  if (!grid) return;
  const ui = window.aniMoUtilities;

  grid.innerHTML = window.aniMoData.farmers.map((farmer) => ui.renderFarmerCard(farmer)).join('');
});
