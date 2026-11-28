// Product Details And Ordering
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const container = document.getElementById('productDetails');
  const productId = new URLSearchParams(window.location.search).get('id') || 'okra';
  const product = window.aniMoData.products.find((item) => item.id === productId);
  const ui = window.aniMoUtilities;
  if (!container) return;
  if (!product) {
    container.innerHTML = '<div class="empty-state" role="status"><p class="empty-state-title">Product not available</p><p>This product is no longer available.</p><a class="btn btn-secondary" href="../marketplace/marketplace.html">Back to the marketplace</a></div>';
    return;
  }
  const soldOut = Number(product.stock) < 1;
  const farmer = window.aniMoData.farmers.find((entry) => entry.name === product.farm);
  const freshness = product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Not available';
  const listed = product.listedAt ? new Date(product.listedAt).toLocaleDateString() : 'Not available';

  // Product Summary Rendering
  container.innerHTML = `
    <div class="detail-media">${ui.renderCatalogImage(product.image, product.name, product.category)}</div>
    <div class="detail-content">
      <span class="eyebrow">${ui.escapeHTML(product.category)}</span>
      <h1>${ui.escapeHTML(product.name)}</h1>
      <div class="detail-meta">
        <span class="badge">${ui.renderRating(product, { showCount: true })}</span>
        <span class="badge">${ui.escapeHTML(product.location)}</span>
        <span class="badge">${Number(product.orderCount) || 0} order${Number(product.orderCount) === 1 ? '' : 's'}</span>
      </div>
      <div class="price detail-price">${formatCurrency(product.price)} / ${ui.escapeHTML(product.unit)}</div>
      <p>${ui.escapeHTML(product.description)}</p>
      <div class="detail-meta">
        ${product.deliveryAvailable ? '<span class="badge badge-check">Delivery available</span>' : ''}
        ${product.pickupAvailable ? '<span class="badge badge-check">Pickup available</span>' : ''}
      </div>
      <p class="stock-status ${soldOut ? 'sold-out' : ''}" aria-live="polite">
        ${soldOut ? 'Sold out' : `${ui.escapeHTML(product.stock)} ${ui.escapeHTML(product.unit)} in stock`}
        ${soldOut ? `<br>Estimated return: ${new Date(Date.now() + 7 * 86400000).toLocaleDateString()} (demo estimate)` : ''}
      </p>
      <p class="freshness-note">Listed ${ui.escapeHTML(listed)} · Stock last updated ${ui.escapeHTML(freshness)}</p>
      <div class="detail-actions">
        <button class="btn btn-primary" type="button" data-add-cart="${ui.escapeHTML(product.id)}" ${soldOut ? 'disabled' : ''}>Add to cart</button>
        <button class="btn btn-secondary" type="button" id="orderNowButton" ${soldOut ? 'disabled' : ''}>Get it now</button>
        ${product.ownerId ? `<a class="btn btn-secondary" href="../chat/chat.html?userId=${encodeURIComponent(product.ownerId)}">Message seller</a>` : ''}
      </div>
      <div class="product-specs">
        <h3>Details</h3>
        <ul>
          <li>Farm: ${farmer ? `<a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}">${ui.escapeHTML(product.farm)}</a>` : ui.escapeHTML(product.farm)}</li>
          <li>Category: ${ui.escapeHTML(product.category)}</li>
          <li>Stock: ${soldOut ? 'Sold out' : `${ui.escapeHTML(product.stock)} ${ui.escapeHTML(product.unit)}`}</li>
        </ul>
      </div>
    </div>`;

  // Direct Checkout Action
  document.getElementById('orderNowButton').addEventListener('click', async () => {
    if (!await window.aniMoRequireLogin({
      mode: 'popup',
      message: 'Please log in to order this item. Your item will be added to your cart after you log in.',
      pendingCart: { items: [{ id: product.id, qty: 1 }] },
      next: window.location.pathname + window.location.search
    })) return;
    window.aniMoCart.addToCart(product.id, 1);
    window.location.assign('../checkout/checkout.html');
  });

  // Review Rendering
  const reviews = document.getElementById('productReviews');
  const summary = document.getElementById('reviewSummary');
  const reviewStatus = document.getElementById('reviewStatus');
  const reviewForm = document.getElementById('reviewForm');
  const reviewEligibility = document.getElementById('reviewEligibility');

  async function loadReviews() {
    const response = await fetch(`/api/reviews?listingId=${encodeURIComponent(product.id)}`, { credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load reviews.');
    summary.innerHTML = !result.count ? '' : `
      <div class="review-summary-card">
        <div class="review-summary-score">${result.rating.toFixed(1)}</div>
        <div>
          <div class="review-summary-stars">${ui.renderStars(result.rating, 'lg')}</div>
          <p class="review-summary-meta">${result.count} rating${result.count === 1 ? '' : 's'} · ${result.orderCount} placed order${result.orderCount === 1 ? '' : 's'}</p>
        </div>
      </div>`;
    reviews.innerHTML = result.reviews.length ? result.reviews.map((review) => `
      <article class="product-review">
        <div class="product-review-head">
          <div>
            <strong class="product-review-name">${ui.escapeHTML(review.displayName)}</strong>
            <div class="product-review-meta">Verified buyer · ${ui.escapeHTML(review.created_at)}</div>
          </div>
          <div class="product-review-rating">${ui.renderStars(review.rating)}<span>${review.rating}/5</span></div>
        </div>
        <p class="product-review-comment">${ui.escapeHTML(review.comment || 'Left a rating without a written comment.')}</p>
      </article>`).join('') : '<div class="empty-state" role="status"><p class="empty-state-title">No reviews yet</p><p>Reviews appear here after delivered orders are rated.</p></div>';

    const canReview = !!result.canReview;
    reviewForm.hidden = !canReview;
    reviewEligibility.hidden = canReview;
    reviewEligibility.textContent = canReview ? '' : 'You can rate and comment on this product after your order has been delivered.';
  }
  loadReviews().catch((error) => { summary.textContent = error.message; });

  // Delivered Order Review Submission
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    reviewStatus.classList.remove('error');
    reviewStatus.textContent = 'Submitting your review…';
    try {
      await window.aniMoApi('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listingId: product.id,
          rating: Number(event.currentTarget.elements.rating.value),
          comment: event.currentTarget.elements.comment.value.trim()
        })
      });
      reviewStatus.textContent = 'Thanks for your review. It is now visible on this product.';
      reviewForm.reset();
      await loadReviews();
    } catch (error) {
      reviewStatus.textContent = error.message;
      reviewStatus.classList.add('error');
    }
  });
});
