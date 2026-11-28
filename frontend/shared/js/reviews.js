// Shared Rating And Review Interface
document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-listing-reviews]');
  if (!section) return;
  const listingId = new URLSearchParams(location.search).get('id');
  if (!listingId) return;
  const summary = section.querySelector('[data-review-summary]');
  const list = section.querySelector('[data-review-list]');
  const form = section.querySelector('[data-review-form]');
  const status = section.querySelector('[data-review-status]');
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  let eligibility = section.querySelector('[data-review-eligibility]');
  if (!eligibility) {
    eligibility = document.createElement('p');
    eligibility.className = 'review-eligibility';
    eligibility.setAttribute('data-review-eligibility', '');
    eligibility.setAttribute('role', 'status');
    eligibility.hidden = true;
    form.before(eligibility);
  }
  form.hidden = true;

  async function load() {
    const response = await fetch(`/api/reviews?listingId=${encodeURIComponent(listingId)}`, { credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load reviews.');
    const stars = (rating, size) => (window.aniMoUtilities ? window.aniMoUtilities.renderStars(rating, size) : '');
    const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    summary.innerHTML = !result.count ? '' : `
      <div class="review-summary-card">
        <div class="review-summary-score">${Number(result.rating).toFixed(1)}</div>
        <div>
          <div class="review-summary-stars">${stars(result.rating, 'lg')}</div>
          <p class="review-summary-meta">${count(result.count, 'rating')} · ${count(result.orderCount, 'placed order')}</p>
        </div>
      </div>`;
    list.innerHTML = result.reviews.length ? result.reviews.map((review) => `
      <article class="product-review">
        <div class="product-review-head">
          <div>
            <strong class="product-review-name">${escape(review.displayName)}</strong>
            <div class="product-review-meta">Verified buyer · ${escape(review.created_at)}</div>
          </div>
          <div class="product-review-rating">${stars(review.rating)}<span>${review.rating}/5</span></div>
        </div>
        <p class="product-review-comment">${escape(review.comment || 'Left a rating without a written comment.')}</p>
      </article>`).join('')
      : '<div class="empty-state" role="status"><p class="empty-state-title">No reviews yet</p><p>Ratings and comments appear after a delivered order.</p></div>';

    const canReview = Boolean(result.canReview);
    form.hidden = !canReview;
    eligibility.hidden = canReview;
    eligibility.textContent = canReview ? '' : 'You can rate and comment after your order for this item has been delivered.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('error');
    status.textContent = '';
    try {
      await window.aniMoApi('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listingId,
          rating: Number(form.elements.rating.value),
          comment: form.elements.comment.value
        })
      });
      status.textContent = 'Thanks for your review.';
      form.reset();
      await load();
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  });
  load().catch((error) => { summary.textContent = error.message; });
});