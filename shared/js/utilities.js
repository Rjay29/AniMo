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
// One card layout for products, recipes, meal kits, and farmers (see .catalog-card in components.css).
function formatCardPrice(value) {
  return typeof formatCurrency === 'function'
    ? formatCurrency(value)
    : `₱${Number(value || 0).toLocaleString('en-PH')}`;
}

function renderCard({
  image, imageAlt, placeholder, href, meta = '', metaRight = '', title,
  text = '', note = '', noteSoldOut = false, footerStart = '', action = '', variant = 'full'
}) {
  const link = escapeHTML(href);
  if (variant === 'minimal') {
    // Image, one meta line, and the name. The title link covers the whole card.
    return `
    <article class="catalog-card catalog-card-minimal">
      <div class="catalog-card-media">${renderCatalogImage(image, imageAlt, placeholder)}</div>
      <div class="catalog-card-body">
        <div class="catalog-card-meta"><span>${meta}</span>${metaRight ? `<span class="catalog-card-rating">${metaRight}</span>` : ''}</div>
        <h3 class="catalog-card-title"><a class="catalog-card-link" href="${link}">${escapeHTML(title)}</a></h3>
      </div>
    </article>`;
  }
  return `
    <article class="catalog-card">
      <a class="catalog-card-media" href="${link}" tabindex="-1" aria-hidden="true">${renderCatalogImage(image, imageAlt, placeholder)}</a>
      <div class="catalog-card-body">
        <div class="catalog-card-meta"><span>${meta}</span>${metaRight ? `<span class="catalog-card-rating">${metaRight}</span>` : ''}</div>
        <h3 class="catalog-card-title"><a href="${link}">${escapeHTML(title)}</a></h3>
        ${text ? `<p class="catalog-card-text">${text}</p>` : ''}
        ${note ? `<p class="catalog-card-note${noteSoldOut ? ' sold-out' : ''}">${note}</p>` : ''}
        <div class="catalog-card-footer">${footerStart}${action}</div>
      </div>
    </article>`;
}

function renderProductCard(product, { variant = 'full' } = {}) {
  const soldOut = Number(product.stock) < 1;
  const farmer = (window.aniMoData?.farmers || []).find((entry) => entry.name === product.farm);
  const seller = farmer
    ? `<a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}">${escapeHTML(product.farm)}</a>`
    : escapeHTML(product.farm);
  const fulfillment = [product.deliveryAvailable ? 'Delivery' : '', product.pickupAvailable ? 'Pickup' : ''].filter(Boolean);
  const stock = soldOut ? 'Sold out' : `${escapeHTML(product.stock)} ${escapeHTML(product.unit)} in stock`;
  return renderCard({
    image: product.image,
    imageAlt: product.name,
    placeholder: product.category,
    href: `../product-details/product-details.html?id=${encodeURIComponent(product.id)}`,
    meta: escapeHTML(product.location),
    metaRight: renderRating(product),
    title: product.name,
    text: `Sold by ${seller}`,
    note: [stock, ...fulfillment].join(' · '),
    noteSoldOut: soldOut,
    footerStart: `<span class="price">${formatCardPrice(product.price)} / ${escapeHTML(product.unit)}</span>`,
    action: `<button class="btn btn-primary" type="button" data-add-cart="${escapeHTML(product.id)}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>`,
    variant
  });
}

function renderRecipeCard(recipe, { variant = 'full' } = {}) {
  const href = `../recipe-details/recipe-details.html?id=${encodeURIComponent(recipe.id)}`;
  return renderCard({
    image: recipe.image,
    imageAlt: recipe.name,
    placeholder: recipe.category,
    href,
    meta: escapeHTML(recipe.category),
    metaRight: renderRating(recipe),
    title: recipe.name,
    text: escapeHTML(recipe.description),
    footerStart: `<span class="catalog-card-detail">${[recipe.time, recipe.difficulty].filter(Boolean).map(escapeHTML).join(' · ')}</span>`,
    action: `<a href="${href}" class="btn btn-secondary">View recipe</a>`,
    variant
  });
}

function renderPackageCard(pkg, { variant = 'full' } = {}) {
  const products = (pkg.productIds || []).map((id) => window.aniMoUtils?.getProductById(id)).filter(Boolean);
  const soldOut = products.length > 0 && products.every((product) => Number(product.stock) < 1);
  return renderCard({
    image: pkg.image,
    imageAlt: pkg.name,
    placeholder: 'Local meal package',
    href: `../package-details/package-details.html?id=${encodeURIComponent(pkg.id)}`,
    meta: 'Meal kit',
    metaRight: renderRating(pkg),
    title: pkg.name,
    text: escapeHTML(pkg.description),
    note: products.length ? `${products.length} ingredient${products.length === 1 ? '' : 's'}${soldOut ? ' · Sold out' : ''}` : '',
    noteSoldOut: soldOut,
    footerStart: `<span class="price">${formatCardPrice(pkg.price)}</span>`,
    action: `<button class="btn btn-primary" type="button" data-add-cart="package:${escapeHTML(pkg.id)}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>`,
    variant
  });
}

function renderFarmerCard(farmer, { variant = 'full' } = {}) {
  const href = `../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}`;
  return renderCard({
    image: farmer.image,
    imageAlt: farmer.name,
    placeholder: 'Local grower',
    href,
    meta: escapeHTML(farmer.location),
    metaRight: renderRating(farmer),
    title: farmer.name,
    text: escapeHTML(farmer.specialty),
    note: escapeHTML(farmer.type),
    footerStart: `<span class="catalog-card-detail">${escapeHTML(farmer.followers ?? 0)} followers</span>`,
    action: `<a href="${href}" class="btn btn-secondary">View profile</a>`,
    variant
  });
}

window.aniMoUtilities = {
  renderStars, renderRating, toTitleCase, escapeHTML, renderCatalogImage,
  renderCard, renderProductCard, renderRecipeCard, renderPackageCard, renderFarmerCard
};
