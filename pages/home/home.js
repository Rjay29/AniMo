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
    featuredContainer.innerHTML = featuredProducts.length ? featuredProducts.map((product) => `
      <article class="product-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(product.image, product.name, product.category)}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(product.location)}</span><strong>${renderStars(product.rating)}</strong></div>
          <h4>${ui.escapeHTML(product.name)}</h4>
          <p>${ui.escapeHTML(product.farm)} · ${Number(product.orderCount) || 0} orders</p>
          <div class="availability-list">
            ${product.deliveryAvailable ? '<span class="badge">Delivery available</span>' : ''}
            ${product.pickupAvailable ? '<span class="badge">Pickup available</span>' : ''}
          </div>
          <p class="stock-status ${Number(product.stock) < 1 ? 'sold-out' : ''}">${Number(product.stock) < 1 ? 'Sold out' : `${ui.escapeHTML(product.stock)} ${ui.escapeHTML(product.unit)} in stock`}</p>
          <div class="card-footer">
            <span class="price">${formatCurrency(product.price)}</span>
            <button class="btn btn-primary" type="button" data-add-cart="${ui.escapeHTML(product.id)}" ${Number(product.stock) < 1 ? 'disabled' : ''}>Add to cart</button>
          </div>
        </div>
      </article>
    `).join('') : '<p class="card">Featured products appear after they reach 10 verified orders.</p>';
  }

  // Recipe Highlights
  if (recipeContainer) {
    recipeContainer.innerHTML = window.aniMoData.recipes.slice(0, 5).map((recipe) => `
      <article class="recipe-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(recipe.image, recipe.name, recipe.category)}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(recipe.category)}</span><strong>${ui.escapeHTML(recipe.time)}</strong></div>
          <h4>${ui.escapeHTML(recipe.name)}</h4>
          <p>${ui.escapeHTML(recipe.description)}</p>
          <div class="availability-list">${(recipe.productIds || []).map((id) => window.aniMoUtils.getProductById(id)).filter(Boolean).map((product) => `<span class="badge${Number(product.stock) < 1 ? ' sold-out' : ''}">${ui.escapeHTML(product.name)} · ${Number(product.stock) < 1 ? 'Sold out' : `${ui.escapeHTML(product.stock)} in stock`}</span>`).join('')}</div>
          <a href="../recipe-details/recipe-details.html?id=${encodeURIComponent(recipe.id)}" class="btn btn-secondary">View recipe</a>
        </div>
      </article>
    `).join('');
  }

  // Featured Meal Kits
  if (packageContainer) {
    packageContainer.innerHTML = window.aniMoData.recipePackages.slice(0, 5).map((recipePackage) => `
      <article class="package-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(recipePackage.image, recipePackage.name, 'Local meal package')}
        <div class="body">
          <h4>${ui.escapeHTML(recipePackage.name)}</h4>
          <p>${ui.escapeHTML(recipePackage.description)}</p>
          <div class="availability-list">${recipePackage.productIds.map((id) => window.aniMoUtils.getProductById(id)).filter(Boolean).map((product) => `<span class="badge${Number(product.stock) < 1 ? ' sold-out' : ''}">${ui.escapeHTML(product.name)} · ${Number(product.stock) < 1 ? 'Sold out' : `${ui.escapeHTML(product.stock)} in stock`}</span>`).join('')}</div>
          <div class="card-footer">
            <span class="price">${formatCurrency(recipePackage.price)}</span>
            <a href="../package-details/package-details.html?id=${encodeURIComponent(recipePackage.id)}" class="btn btn-secondary">View package</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Farmer Preview
  if (farmerContainer) {
    farmerContainer.innerHTML = window.aniMoData.farmers.slice(0, 3).map((farmer) => `
      <article class="farmer-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(farmer.image, farmer.name, 'Local grower')}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(farmer.location)}</span><strong>${renderStars(farmer.rating)}</strong></div>
          <h4>${ui.escapeHTML(farmer.name)}</h4>
          <p>${ui.escapeHTML(farmer.specialty)}</p>
          <div class="card-footer">
            <span class="badge">${ui.escapeHTML(farmer.type)}</span>
            <a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}" class="btn btn-secondary">Profile</a>
          </div>
        </div>
      </article>
    `).join('');
  }

});
