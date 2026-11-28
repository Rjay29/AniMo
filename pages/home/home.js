// Home Page Initialization
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  document.getElementById('product-listing-count').textContent = String(window.aniMoData.products.length);
  document.getElementById('farmer-listing-count').textContent = String(window.aniMoData.farmers.length);
  const featuredContainer = document.getElementById('featured-products');
  const recipeContainer = document.getElementById('recipe-cards');
  const packageContainer = document.getElementById('package-cards');
  const farmerContainer = document.getElementById('farmer-cards');
  const ui = window.aniMoUtilities;
  let featuredProducts = [];
  try {
    const response = await fetch('/api/featured');
    if (response.ok) {
      const featured = await response.json();
      featuredProducts = featured.products;
      document.getElementById('featured-listing-count').textContent = String(featured.count);
      document.getElementById('featured-description').textContent = featured.count
        ? `${featured.count} product${featured.count === 1 ? '' : 's'} qualify this week; ties at the top-five cutoff are included.`
        : 'No product has reached 10 orders yet. Qualifying products and top-five ties appear here automatically.';
      document.getElementById('seasonal-title').textContent = `Featured this week: ${featured.count} product${featured.count === 1 ? '' : 's'}`;
    }
  } catch (error) {
    document.getElementById('featured-listing-count').textContent = '0';
    document.getElementById('featured-description').textContent = 'Featured listings could not be loaded.';
  }

  // Seasonal Picks
  if (featuredContainer) {
    featuredContainer.innerHTML = featuredProducts.length
      ? featuredProducts.map((product) => ui.renderProductCard(product, { showOrders: true })).join('')
      : '<div class="empty-state" role="status"><p class="empty-state-title">No featured products yet</p><p>Products appear here once they reach 10 verified orders.</p></div>';
  }

  // Recipe Highlights
  if (recipeContainer) {
    recipeContainer.innerHTML = window.aniMoData.recipes.slice(0, 5).map((recipe) => ui.renderRecipeCard(recipe)).join('');
  }

  // Featured Meal Kits
  if (packageContainer) {
    packageContainer.innerHTML = window.aniMoData.recipePackages.slice(0, 5).map((recipePackage) => ui.renderPackageCard(recipePackage)).join('');
  }

  // Farmer Preview
  if (farmerContainer) {
    farmerContainer.innerHTML = window.aniMoData.farmers.slice(0, 3).map((farmer) => ui.renderFarmerCard(farmer)).join('');
  }

});
