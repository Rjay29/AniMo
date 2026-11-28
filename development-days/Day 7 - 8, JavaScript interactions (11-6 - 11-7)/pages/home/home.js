// Home Page Initialization
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const featuredContainer = document.getElementById('featured-products');
  const recipeContainer = document.getElementById('recipe-cards');
  const packageContainer = document.getElementById('package-cards');
  const farmerContainer = document.getElementById('farmer-cards');
  const ui = window.aniMoUtilities;

  // Seasonal Picks
  if (featuredContainer) {
    featuredContainer.innerHTML = window.aniMoData.products.slice(0, 5).map((product) => `
      <article class="product-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(product.image, product.name, product.category)}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(product.location)}</span><strong>${renderStars(product.rating)}</strong></div>
          <h4>${ui.escapeHTML(product.name)}</h4>
          <p>${ui.escapeHTML(product.farm)}</p>
          <div class="availability-list">
            ${product.deliveryAvailable ? '<span class="badge">Delivery available</span>' : ''}
            ${product.pickupAvailable ? '<span class="badge">Pickup available</span>' : ''}
          </div>
          <div class="card-footer">
            <span class="price">${formatCurrency(product.price)}</span>
            <button class="btn btn-primary" type="button" data-add-cart="${ui.escapeHTML(product.id)}">Add to cart</button>
          </div>
        </div>
      </article>
    `).join('');
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

  // Local Map Search
  initializeLocalMap();
});

// Feature Initialization Local Map
function initializeLocalMap() {
  const search = document.getElementById('mapSearch');
  const searchButton = document.getElementById('mapSearchButton');
  const locateButton = document.getElementById('locateButton');
  const addPinButton = document.getElementById('addPinButton');
  const mapSurface = document.getElementById('mapSurface');
  const locations = document.getElementById('mapLocations');
  const status = document.getElementById('mapStatus');
  const title = document.getElementById('nearbyTitle');
  const description = document.getElementById('nearbyDescription');
  const nearbyProducts = document.getElementById('nearbyProducts');
  const ui = window.aniMoUtilities;
  const knownLocations = [...new Set(window.aniMoData.products.map((product) => product.location))];
  if (!knownLocations.length) {
    status.textContent = 'There are no product locations to show yet. Add product listings in the Admin dashboard.';
    searchButton.disabled = true;
    locateButton.disabled = true;
    addPinButton.disabled = true;
    return;
  }
  const mapAnchors = [
    { location: knownLocations[0], x: 18, y: 25 },
    { location: knownLocations[1], x: 55, y: 34 },
    { location: knownLocations[2], x: 70, y: 65 }
  ];
  let pinMode = false;

  locations.innerHTML = knownLocations.map((location) => `<option value="${ui.escapeHTML(location)}"></option>`).join('');

  // Location Matching
  function showLocation(location, message) {
    const query = location.trim().toLowerCase();
    const matches = window.aniMoData.products.filter((product) => (
      product.location.toLowerCase().includes(query)
      || product.farm.toLowerCase().includes(query)
      || query.includes(product.location.toLowerCase())
    ));

    title.textContent = matches.length ? `Ingredients near ${location}` : 'No sample listings found';
    description.textContent = matches.length
      ? 'These sample products are sourced from this location.'
      : 'Try a listed town or producer location to see local ingredients.';
    status.textContent = message || `Showing sample results for ${location}.`;
    nearbyProducts.innerHTML = matches.map((product) => `
      <article class="nearby-item">
        <strong>${ui.escapeHTML(product.name)}</strong><span>${ui.escapeHTML(product.location)} · ${formatCurrency(product.price)}</span>
        <a href="../product-details/product-details.html?id=${encodeURIComponent(product.id)}">View ingredient</a>
      </article>
    `).join('');
  }

  // Click Interaction
  searchButton.addEventListener('click', () => {
    if (!search.value.trim()) {
      status.textContent = 'Enter a town, city, province, or producer location to search.';
      search.focus();
      return;
    }
    showLocation(search.value);
  });
  // Keyboard Interaction
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchButton.click();
    }
  });

  // Geolocation Access
  locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Location access is not available in this browser.';
      return;
    }
    status.textContent = 'Requesting location permission...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        search.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        title.textContent = 'Sample ingredients near your location';
        description.textContent = 'Your browser location is pinned. Sample listings are not live geographic data.';
        status.textContent = `Your current location is pinned (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).`;
        nearbyProducts.innerHTML = window.aniMoData.products.slice(0, 3).map((product) => `
          <article class="nearby-item">
            <strong>${ui.escapeHTML(product.name)}</strong><span>${ui.escapeHTML(product.location)} · ${formatCurrency(product.price)}</span>
            <a href="../product-details/product-details.html?id=${encodeURIComponent(product.id)}">View ingredient</a>
          </article>
        `).join('');
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. You can still search or drop a map pin.'
          : 'Could not get your location. You can still search or drop a map pin.';
        status.textContent = message;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  // Map Pin Placement
  addPinButton.addEventListener('click', () => {
    pinMode = !pinMode;
    addPinButton.setAttribute('aria-pressed', String(pinMode));
    mapSurface.classList.toggle('pin-mode', pinMode);
    status.textContent = pinMode
      ? 'Click anywhere on the map to add your pin and inspect local sample ingredients.'
      : 'Map pin placement cancelled.';
  });
  // Click Interaction
  mapSurface.addEventListener('click', (event) => {
    if (!pinMode) {
      const locationButton = event.target.closest('.map-pin');
      if (locationButton) {
        const location = locationButton.dataset.location;
        search.value = location;
        showLocation(location, `Showing sample ingredients for ${locationButton.getAttribute('aria-label')}.`);
      }
      return;
    }
    const bounds = mapSurface.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const nearestLocation = mapAnchors.reduce((nearest, anchor) => {
      const currentDistance = Math.hypot(anchor.x - x, anchor.y - y);
      const nearestDistance = Math.hypot(nearest.x - x, nearest.y - y);
      return currentDistance < nearestDistance ? anchor : nearest;
    }, mapAnchors[0]);
    const pin = document.createElement('span');
    pin.className = 'map-pin user-map-pin';
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;
    pin.style.transform = 'translate(-50%, -100%)';
    pin.innerHTML = '<img src="/shared/assets/icons/map_pin.png" alt="" />';
    pin.setAttribute('aria-label', 'Your custom map pin');
    pin.dataset.location = nearestLocation.location;
    mapSurface.querySelector('.user-map-pin')?.remove();
    mapSurface.appendChild(pin);
    pinMode = false;
    addPinButton.setAttribute('aria-pressed', 'false');
    mapSurface.classList.remove('pin-mode');
    search.value = nearestLocation.location;
    showLocation(
      nearestLocation.location,
      `Pin added at map position ${Math.round(x)}%, ${Math.round(y)}%. Showing sample ingredients nearest to ${nearestLocation.location}.`
    );
    title.textContent = `Ingredients near your pin`;
    description.textContent = `Sample local listings closest to ${nearestLocation.location}; this is not live map data.`;
  });

  mapSurface.querySelectorAll('.map-pin').forEach((pin, index) => {
    pin.dataset.location = knownLocations[index % knownLocations.length];
  });
}
