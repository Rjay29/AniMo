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
    const avg = result.rating ? Number(result.rating).toFixed(1) : '';
    summary.textContent = result.rating
      ? `${avg} average · ${result.count} rating${result.count === 1 ? '' : 's'} · ${result.orderCount} placed order${result.orderCount === 1 ? '' : 's'}`
      : `No reviews yet · ${result.orderCount} placed order${result.orderCount === 1 ? '' : 's'}`;
    const stars = (rating) => (window.aniMoUtilities ? window.aniMoUtilities.renderStars(rating) : '');
    list.innerHTML = result.reviews.length ? result.reviews.map((review) => `
      <article class="product-review"><strong>${escape(review.displayName)}</strong><span class="badge">${stars(review.rating)} ${review.rating}/5</span>
      <p>${escape(review.comment || 'Rating only')}</p><small>Verified order · ${escape(review.created_at)}</small></article>`).join('')
      : '<p>No reviews yet. Ratings and comments appear after a delivered order.</p>';

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