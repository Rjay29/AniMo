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
    <div class="profile-card">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(farmer.image, farmer.name, 'Local grower', 'farmer-profile-image')}
    </div>
    <div class="profile-detail">
      <span class="eyebrow">Local grower</span>
      <h1>${ui.escapeHTML(farmer.name)}</h1>
      <div class="profile-meta">
        <span class="badge">${ui.escapeHTML(farmer.location)}</span>
        <span class="badge">${renderStars(farmer.rating)}</span>
        <span class="badge">${ui.escapeHTML(farmer.type)}</span>
      </div>
      <p>${ui.escapeHTML(farmer.story)}</p>
      <div class="badges">
        <span class="tag">${ui.escapeHTML(farmer.specialty)}</span>
        <span class="tag">${ui.escapeHTML(farmer.followers)} community followers</span>
      </div>
      <h3>What they offer</h3>
      <ul>
        <li>Seasonal vegetables and fresh herbs</li>
        <li>Small-batch pantry goods from local harvests</li>
        <li>Transparent pricing and direct farmer support</li>
      </ul>
      <a href="../farmers/farmers.html" class="btn btn-secondary">Back to farmers</a>
    </div>
  `;
});
