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

  // Local Map Search
  initializeLocalMap();
});

// Feature Initialization Local Map
function initializeLocalMap() {
  const search = document.getElementById('mapSearch');
  const searchButton = document.getElementById('mapSearchButton');
  const locateButton = document.getElementById('locateButton');
  const clearRouteButton = document.getElementById('clearRouteButton');
  const mapSurface = document.getElementById('mapSurface');
  const status = document.getElementById('mapStatus');
  const title = document.getElementById('nearbyTitle');
  const description = document.getElementById('nearbyDescription');
  const nearbyProducts = document.getElementById('nearbyProducts');
  const ui = window.aniMoUtilities || { escapeHTML: (v) => String(v ?? '') };

  nearbyProducts.addEventListener('keydown', (event) => {
    if (event.target !== nearbyProducts) return;
    let nextScrollTop = nearbyProducts.scrollTop;
    const pageStep = Math.max(80, nearbyProducts.clientHeight - 48);
    if (event.key === 'ArrowDown') nextScrollTop += 48;
    else if (event.key === 'ArrowUp') nextScrollTop -= 48;
    else if (event.key === 'PageDown') nextScrollTop += pageStep;
    else if (event.key === 'PageUp') nextScrollTop -= pageStep;
    else if (event.key === 'Home') nextScrollTop = 0;
    else if (event.key === 'End') nextScrollTop = nearbyProducts.scrollHeight;
    else return;
    event.preventDefault();
    nearbyProducts.scrollTop = Math.max(0, Math.min(
      nextScrollTop,
      nearbyProducts.scrollHeight - nearbyProducts.clientHeight
    ));
  });

  if (!window.L || !mapSurface) {
    status.textContent = 'The map could not be loaded right now. Please refresh the page.';
    return;
  }

  const phBounds = L.latLngBounds([[4.5, 116], [21.5, 127]]);
  const map = L.map(mapSurface, {
    center: [12.8797, 121.774],
    zoom: 6,
    minZoom: 5,
    maxZoom: 18,
    maxBounds: phBounds.pad(0.05),
    maxBoundsViscosity: 1
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    crossOrigin: true
  }).addTo(map);
  const sellerIcon = L.icon({
    iconUrl: '/shared/assets/icons/map_pin.png',
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -30]
  });

  let sellers = [];
  let userMarker = null;
  let searchMarker = null;
  let routeLayer = null;
  let activePoint = null;

  function setStatus(message) { status.textContent = message; }
  function isWithinPH(lat, lng) { return lat >= 4.5 && lat <= 21.5 && lng >= 116 && lng <= 127; }
  function clearRoute() {
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  }

  function renderSellers(list, heading, detail) {
    title.textContent = heading;
    description.textContent = detail;
    if (!list.length) {
      nearbyProducts.innerHTML = '<p class="map-empty">No Philippine seller locations are available for this view.</p>';
      return;
    }
    nearbyProducts.innerHTML = list.map((seller) => `
      <article class="nearby-item" role="listitem">
        ${ui.renderCatalogImage(seller.image, seller.name, 'Local grower', 'nearby-seller-avatar')}
        <div class="nearby-item-copy">
          <strong>${ui.escapeHTML(seller.name)}</strong>
          <span>${ui.escapeHTML(seller.location || 'Philippines')} · ${ui.escapeHTML(seller.specialty || 'Local seller')}</span>
          <div class="nearby-actions">
            <a href="${ui.escapeHTML(seller.href)}">View seller</a>
            <button type="button" class="btn btn-secondary btn-sm" data-route-seller="${ui.escapeHTML(seller.id)}">Directions</button>
          </div>
        </div>
      </article>
    `).join('');
    nearbyProducts.querySelectorAll('[data-route-seller]').forEach((button) => {
      button.addEventListener('click', () => {
        const seller = sellers.find((item) => String(item.id) === button.dataset.routeSeller);
        if (seller) routeToSeller(seller);
      });
    });
  }

  async function routeToSeller(seller) {
    const start = activePoint;
    if (!start || !isWithinPH(start.lat, start.lng)) {
      setStatus('Search a Philippine location or use your location first, then request directions.');
      return;
    }
    if (!isWithinPH(Number(seller.latitude), Number(seller.longitude))) {
      setStatus('That seller location is outside the supported Philippines map area.');
      return;
    }
    setStatus(`Getting directions to ${seller.name}...`);
    try {
      const params = new URLSearchParams({
        startLat: String(start.lat), startLng: String(start.lng),
        endLat: String(seller.latitude), endLng: String(seller.longitude)
      });
      const response = await fetch(`/api/map/route?${params.toString()}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.geometry) throw new Error(result.error || 'Route unavailable');
      clearRoute();
      routeLayer = L.geoJSON(result.geometry, { style: { color: '#315a4b', weight: 5, opacity: 0.85 } }).addTo(map);
      map.fitBounds(routeLayer.getBounds().pad(0.2));
      const km = (Number(result.distanceMeters) / 1000).toFixed(1);
      const mins = Math.max(1, Math.round(Number(result.durationSeconds) / 60));
      setStatus(`Route to ${seller.name}: about ${km} km, ${mins} min by road.`);
    } catch (error) {
      setStatus(error.message || 'Could not load directions right now.');
    }
  }

  function focusSeller(seller) {
    if (!isWithinPH(Number(seller.latitude), Number(seller.longitude))) return;
    map.setView([seller.latitude, seller.longitude], 12);
    renderSellers([seller, ...sellers.filter((item) => item.id !== seller.id).slice(0, 4)], `Near ${seller.location || 'seller'}`, `${seller.name} is based in ${seller.location || 'the Philippines'}. Select Directions to draw a route from your chosen Philippine location.`);
  }

  async function loadSellers() {
    try {
      const response = await fetch('/api/map/sellers');
      const result = await response.json().catch(() => ({}));
      const farmerById = new Map((window.aniMoData.farmers || []).map((farmer) => [String(farmer.id), farmer]));
      sellers = Array.isArray(result.sellers)
        ? result.sellers
          .filter((seller) => isWithinPH(Number(seller.latitude), Number(seller.longitude)))
          .map((seller) => {
            const farmer = farmerById.get(String(seller.id));
            return { ...seller, image: farmer ? farmer.image : seller.image };
          })
        : [];
      sellers.forEach((seller) => {
        const marker = L.marker([seller.latitude, seller.longitude], { icon: sellerIcon }).addTo(map);
        marker.bindPopup(`<strong>${ui.escapeHTML(seller.name)}</strong><br>${ui.escapeHTML(seller.location || 'Philippines')}`);
        marker.on('click', () => focusSeller(seller));
        seller.marker = marker;
      });
      if (sellers.length) {
        const group = L.featureGroup(sellers.map((seller) => seller.marker));
        map.fitBounds(group.getBounds().pad(0.2));
        renderSellers(sellers, 'Local sellers', 'Seller pins are loaded from AniMo records and limited to locations within the Philippines.');
        setStatus('Showing AniMo sellers within the Philippines. Search a place or use your location for directions.');
      } else {
        renderSellers([], 'Local sellers', 'No Philippine seller coordinates are available yet.');
        setStatus('No Philippine seller locations are available yet.');
      }
    } catch {
      renderSellers([], 'Local sellers', 'Seller locations could not be loaded right now.');
      setStatus('Could not load seller locations. Please try again.');
    }
  }

  async function searchLocation() {
    const q = search.value.trim();
    if (!q) { setStatus('Enter a Philippine city, town, or province to search.'); search.focus(); return; }
    setStatus('Searching Philippine locations...');
    try {
      const response = await fetch(`/api/map/geocode?q=${encodeURIComponent(q)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.location) throw new Error(result.error || 'Location not found in the Philippines.');
      const { lat, lng, label } = result.location;
      if (!isWithinPH(Number(lat), Number(lng))) throw new Error('That location is outside the Philippines.');
      activePoint = { lat: Number(lat), lng: Number(lng), label };
      if (searchMarker) map.removeLayer(searchMarker);
      searchMarker = L.marker([lat, lng], { icon: sellerIcon }).addTo(map).bindPopup(ui.escapeHTML(label)).openPopup();
      map.setView([lat, lng], 12);
      clearRoute();
      setStatus(`Showing ${label}. Select a seller and choose Directions for a Philippines-only route.`);
      renderSellers(sellers.slice(0, 5), `Near ${label}`, 'Choose a seller to view details or get directions from this searched Philippine location.');
    } catch (error) {
      setStatus(error.message || 'Could not search that location.');
    }
  }

  searchButton.addEventListener('click', searchLocation);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); searchLocation(); }
  });
  locateButton.addEventListener('click', () => {
    if (!navigator.geolocation) { setStatus('Location access is not available in this browser.'); return; }
    setStatus('Requesting your location...');
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = Number(position.coords.latitude);
      const lng = Number(position.coords.longitude);
      if (!isWithinPH(lat, lng)) {
        setStatus('Your current location is outside the Philippines. Please search for a Philippine location instead.');
        return;
      }
      activePoint = { lat, lng, label: 'Your location' };
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lng], { icon: sellerIcon }).addTo(map).bindPopup('Your location').openPopup();
      map.setView([lat, lng], 13);
      clearRoute();
      setStatus('Your location is within the Philippines. Select a seller pin for directions.');
      renderSellers(sellers.slice(0, 5), 'Near your location', 'Choose a seller to view details or get directions from your current Philippine location.');
    }, () => {
      setStatus('Could not access your location. You can still search for a Philippine place.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  });
  clearRouteButton.addEventListener('click', () => {
    clearRoute();
    setStatus('Route cleared. Seller pins remain available on the map.');
  });

  loadSellers();
}
