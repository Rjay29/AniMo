// Presentation Helpers
// Rating Display
function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const rounded = Math.round(value);
  return `<span class="rating-stars" role="img" aria-label="Rated ${value.toFixed(1)} out of 5">${
    Array.from({ length: 5 }, (_, index) => `<img src="/shared/assets/icons/star.png" alt=""${index >= rounded ? ' class="rating-star-empty"' : ''} />`).join('')
  }</span>`;
}

// Title Formatting
function toTitleCase(text) {
  return text.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

// Html Escaping
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

const stockImagePools = {
  farmers: [
    '/shared/assets/farmers/stock-farmer-01.jpg',
    '/shared/assets/farmers/stock-farmer-02.jpg',
    '/shared/assets/farmers/stock-farmer-04.jpg',
    '/shared/assets/farmers/stock-farmer-05.jpg',
    '/shared/assets/farmers/stock-farmer-06.jpg',
    '/shared/assets/farmers/stock-farmer-07.jpg',
    '/shared/assets/farmers/stock-farmer-08.jpg',
    '/shared/assets/farmers/stock-farmer-10.jpg'
  ],
  vegetables: [
    '/shared/assets/marketplace/stock-market-vegetables.jpg',
    '/shared/assets/marketplace/stock-leafy-greens.jpg',
    '/shared/assets/marketplace/stock-zucchini-01.jpg',
    '/shared/assets/marketplace/stock-zucchini-02.jpg',
    '/shared/assets/marketplace/stock-produce-harvest.jpg',
    '/shared/assets/marketplace/stock-fruit-market.jpg'
  ],
  fruit: [
    '/shared/assets/marketplace/stock-tropical-fruit.jpg',
    '/shared/assets/marketplace/stock-clementines.jpg',
    '/shared/assets/marketplace/stock-fruit-still-life.jpg'
  ],
  roots: [
    '/shared/assets/marketplace/stock-sweet-potatoes.jpg',
    '/shared/assets/marketplace/stock-sweet-potatoes-field.jpg',
    '/shared/assets/marketplace/stock-sweet-potato-basket.jpg'
  ],
  greens: [
    '/shared/assets/marketplace/stock-leafy-greens.jpg',
    '/shared/assets/marketplace/stock-market-vegetables.jpg',
    '/shared/assets/marketplace/stock-produce-harvest.jpg'
  ],
  grains: [
    '/shared/assets/marketplace/stock-rice-field.jpg',
    '/shared/assets/marketplace/stock-grain-harvest.jpg'
  ],
  legumes: [
    '/shared/assets/marketplace/stock-legumes.jpg',
    '/shared/assets/marketplace/stock-grain-harvest.jpg'
  ],
  pantry: [
    '/shared/assets/marketplace/stock-legumes.jpg',
    '/shared/assets/marketplace/stock-market-vegetables.jpg',
    '/shared/assets/marketplace/stock-sweet-potato-basket.jpg'
  ],
  mealKits: [
    '/shared/assets/meal_kits/abodo_essentials.png',
    '/shared/assets/meal_kits/sinigang_starter_kit.jpg',
    '/shared/assets/meal_kits/vegetable_bowl_kit.png',
    '/shared/assets/meal_kits/coconut_breakfast_kit.png',
    '/shared/assets/meal_kits/local_merienda_kit.jpg'
  ]
};

function stableImageIndex(value, length) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

function fallbackCatalogImage(category, alt) {
  const label = String(category ?? '').toLowerCase();
  let pool = stockImagePools.vegetables;

  if (label.includes('grower') || label.includes('farmer')) pool = stockImagePools.farmers;
  else if (label.includes('meal package')) pool = stockImagePools.mealKits;
  else if (label.includes('fruit')) pool = stockImagePools.fruit;
  else if (label.includes('root')) pool = stockImagePools.roots;
  else if (label.includes('grain') || label.includes('rice')) pool = stockImagePools.grains;
  else if (label.includes('legume') || label.includes('bean')) pool = stockImagePools.legumes;
  else if (label.includes('herb') || label.includes('aromatic') || label.includes('spice')) pool = stockImagePools.greens;
  else if (label.includes('pantry') || label.includes('snack')) pool = stockImagePools.pantry;

  const stableKey = `${label}:${String(alt ?? '')}`;
  return pool[stableImageIndex(stableKey, pool.length)];
}

// Catalog Image Rendering
function renderCatalogImage(image, alt, placeholder, className = '') {
  const safeAlt = escapeHTML(alt);
  const safeClass = escapeHTML(className);
  const safePlaceholder = escapeHTML(placeholder);
  const isEmbeddedImage = typeof image === 'string'
    && /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(image);
  const isLocalImage = typeof image === 'string'
    && /^\/shared\/assets\/(?:marketplace|farmers|recipes|meal_kits)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g)$/.test(image);
  const source = isEmbeddedImage || isLocalImage ? image : fallbackCatalogImage(placeholder, alt);
  const imageAlt = isEmbeddedImage || isLocalImage
    ? safeAlt
    : `${safePlaceholder || 'Produce'} representative image for ${safeAlt}`;
  return `<img class="catalog-card-image ${safeClass}" src="${escapeHTML(source)}" alt="${imageAlt}" loading="lazy" decoding="async" />`;
}

window.aniMoUtilities = { renderStars, toTitleCase, escapeHTML, renderCatalogImage };
