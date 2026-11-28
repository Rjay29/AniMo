// Presentation Helpers
// Rating Display
// Five stars filled to the rating, rounded to the nearest half star (styled by .rating-stars).
function renderStars(rating, size = '') {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const filled = (Math.round(value * 2) / 2 / 5) * 100;
  return `<span class="rating-stars${size ? ` rating-stars-${size}` : ''}" role="img" aria-label="Rated ${value.toFixed(1)} out of 5" style="--rating: ${filled}%"></span>`;
}

// A listing's rating from real buyer reviews, or "No reviews yet" when it has none.
function renderRating(item, { showCount = false } = {}) {
  const count = Number(item?.reviewCount) || 0;
  if (!count || !Number(item.rating)) return '<span class="rating-none">No reviews yet</span>';
  const summary = showCount
    ? ` <span class="rating-value">${Number(item.rating).toFixed(1)} · ${count} review${count === 1 ? '' : 's'}</span>`
    : '';
  return `<span class="rating-summary">${renderStars(item.rating)}${summary}</span>`;
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

// Shared Catalog Card
// One card for products, recipes, meal kits, and farmers (see .catalog-card in components.css).
// variant 'minimal': image, one meta line with the rating, and the name.
// variant 'footer': the same, plus the price and one button pinned to the bottom.
// The title link's click area covers the whole card; the footer button sits above it.
function formatCardPrice(value) {
  return typeof formatCurrency === 'function'
    ? formatCurrency(value)
    : `₱${Number(value || 0).toLocaleString('en-PH')}`;
}

function renderCard({ image, imageAlt, placeholder, href, meta = '', rating = '', title, price = null, action = '', variant = 'minimal' }) {
  const footer = variant === 'footer'
    ? `<div class="catalog-card-footer"><span class="price">${formatCardPrice(price)}</span>${action}</div>`
    : '';
  return `
    <article class="catalog-card${footer ? ' catalog-card-with-footer' : ''}">
      <div class="catalog-card-media">${renderCatalogImage(image, imageAlt, placeholder)}</div>
      <div class="catalog-card-body">
        <div class="catalog-card-meta"><span>${meta}</span>${rating ? `<span class="catalog-card-rating">${rating}</span>` : ''}</div>
        <h3 class="catalog-card-title"><a class="catalog-card-link" href="${escapeHTML(href)}">${escapeHTML(title)}</a></h3>
        ${footer}
      </div>
    </article>`;
}

function renderCartButton(cartId, soldOut) {
  return `<button class="btn btn-primary catalog-card-button" type="button" data-add-cart="${escapeHTML(cartId)}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>`;
}

function renderProductCard(product, { variant = 'footer' } = {}) {
  return renderCard({
    image: product.image,
    imageAlt: product.name,
    placeholder: product.category,
    href: `../product-details/product-details.html?id=${encodeURIComponent(product.id)}`,
    meta: escapeHTML(product.location),
    rating: renderRating(product),
    title: product.name,
    price: product.price,
    action: renderCartButton(product.id, Number(product.stock) < 1),
    variant
  });
}

function renderRecipeCard(recipe, { variant = 'minimal' } = {}) {
  return renderCard({
    image: recipe.image,
    imageAlt: recipe.name,
    placeholder: recipe.category,
    href: `../recipe-details/recipe-details.html?id=${encodeURIComponent(recipe.id)}`,
    meta: escapeHTML(recipe.category),
    rating: renderRating(recipe),
    title: recipe.name,
    variant
  });
}

function renderPackageCard(pkg, { variant = 'footer' } = {}) {
  const products = (pkg.productIds || []).map((id) => window.aniMoUtils?.getProductById(id)).filter(Boolean);
  const soldOut = products.length > 0 && products.every((product) => Number(product.stock) < 1);
  return renderCard({
    image: pkg.image,
    imageAlt: pkg.name,
    placeholder: 'Local meal package',
    href: `../package-details/package-details.html?id=${encodeURIComponent(pkg.id)}`,
    meta: 'Meal kit',
    rating: renderRating(pkg),
    title: pkg.name,
    price: pkg.price,
    action: renderCartButton(`package:${pkg.id}`, soldOut),
    variant
  });
}

function renderFarmerCard(farmer, { variant = 'minimal' } = {}) {
  return renderCard({
    image: farmer.image,
    imageAlt: farmer.name,
    placeholder: 'Local grower',
    href: `../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}`,
    meta: escapeHTML(farmer.location),
    rating: renderRating(farmer),
    title: farmer.name,
    variant
  });
}

window.aniMoUtilities = {
  renderStars, renderRating, toTitleCase, escapeHTML, renderCatalogImage,
  renderCard, renderProductCard, renderRecipeCard, renderPackageCard, renderFarmerCard
};
