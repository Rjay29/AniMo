// Farmer Profile
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const container = document.getElementById('farmerProfile');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'timpla';
  const farmer = window.aniMoData.farmers.find((entry) => entry.id === id) || window.aniMoData.farmers[0];
  const ui = window.aniMoUtilities;

  if (!container) return;

  container.innerHTML = `
    <div class="detail-media">${ui.renderCatalogImage(farmer.image, farmer.name, 'Local grower')}</div>
    <div class="detail-content">
      <span class="eyebrow">Local grower</span>
      <h1>${ui.escapeHTML(farmer.name)}</h1>
      <div class="detail-meta">
        <span class="badge">${ui.escapeHTML(farmer.location)}</span>
        <span class="badge">${ui.renderRating(farmer, { showCount: true })}</span>
        <span class="badge">${ui.escapeHTML(farmer.type)}</span>
      </div>
      <p>${ui.escapeHTML(farmer.story)}</p>
      <div class="detail-meta">
        <span class="tag">${ui.escapeHTML(farmer.specialty)}</span>
        <span class="tag">${ui.escapeHTML(farmer.followers)} community followers</span>
      </div>
      <h3>What they offer</h3>
      <ul>
        <li>Seasonal vegetables and fresh herbs</li>
        <li>Small-batch pantry goods from local harvests</li>
        <li>Transparent pricing and direct farmer support</li>
      </ul>
      <div class="detail-actions">
        ${farmer.ownerId ? `<a href="../chat/chat.html?userId=${encodeURIComponent(farmer.ownerId)}" class="btn btn-primary">Message this farmer</a>` : ''}
        <a href="../farmers/farmers.html" class="btn btn-secondary">Back to farmers</a>
      </div>
    </div>
  `;
  const products = window.aniMoData.products.filter((product) => (
    product.farm === farmer.name || (farmer.ownerId && product.ownerId === farmer.ownerId)
  ));
  const productGrid = document.getElementById('farmerProductGrid');
  productGrid.innerHTML = products.length
    ? products.map((product) => ui.renderProductCard(product)).join('')
    : '<div class="empty-state" role="status"><p class="empty-state-title">No products yet</p><p>This farmer has no approved product listings yet.</p></div>';
});
