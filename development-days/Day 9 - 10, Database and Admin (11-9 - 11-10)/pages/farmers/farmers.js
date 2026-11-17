// Farmer Directory
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const grid = document.getElementById('farmerGrid');
  if (!grid) return;
  const ui = window.aniMoUtilities;

  grid.innerHTML = window.aniMoData.farmers.map((farmer) => `
    <article class="farmer-card">
      <!-- Image Placeholder -->
      ${ui.renderCatalogImage(farmer.image, farmer.name, 'Local grower')}
      <div class="body">
        <div class="card-meta"><span>${ui.escapeHTML(farmer.location)}</span><strong>${renderStars(farmer.rating)}</strong></div>
        <h3>${ui.escapeHTML(farmer.name)}</h3>
        <p>${ui.escapeHTML(farmer.specialty)}</p>
        <p><strong>Seller type:</strong> ${ui.escapeHTML(farmer.type)}</p>
        <div class="card-footer">
          <span class="badge">${ui.escapeHTML(farmer.followers)} followers</span>
          <a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(farmer.id)}" class="btn btn-secondary">View profile</a>
        </div>
      </div>
    </article>
  `).join('');
});
