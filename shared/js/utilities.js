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

// Catalog Image Rendering
function renderCatalogImage(image, alt, placeholder, className = '') {
  const safeAlt = escapeHTML(alt);
  const safeClass = escapeHTML(className);
  const safePlaceholder = escapeHTML(placeholder);
  if (typeof image === 'string'
    && /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(image)) {
    return `<img class="catalog-card-image ${safeClass}" src="${image}" alt="${safeAlt}" loading="lazy" />`;
  }
  if (typeof image === 'string' && /^\/shared\/assets\/(?:marketplace|farmers|recipes|meal_kits)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g)$/.test(image)) {
    return `<img class="catalog-card-image ${safeClass}" src="${image}" alt="${safeAlt}" loading="lazy" />`;
  }
  return `<div class="image-placeholder ${safeClass}">${safePlaceholder}</div>`;
}

window.aniMoUtilities = { renderStars, toTitleCase, escapeHTML, renderCatalogImage };
