// Marketplace
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const products = window.aniMoData.products;
  const grid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const sortSelect = document.getElementById('sortSelect');
  const ui = window.aniMoUtilities;

  // Product Categories
  [...new Set(products.map((product) => product.category))].forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Marketplace Rendering
  function renderProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;
    let filtered = products.filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.farm} ${product.location}`.toLowerCase();
      return searchable.includes(term) && (category === 'all' || product.category === category);
    });

    if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

    grid.innerHTML = filtered.map((product) => ui.renderProductCard(product)).join('');

    if (!filtered.length) {
      grid.innerHTML = '<div class="card no-products">No products found. Try another search or category.</div>';
    }
  }

  // Marketplace Filters
  [searchInput, categorySelect, sortSelect].forEach((element) => {
    // Input Interaction
    element.addEventListener('input', renderProducts);
    // Input Change
    element.addEventListener('change', renderProducts);
  });
  renderProducts();
});
