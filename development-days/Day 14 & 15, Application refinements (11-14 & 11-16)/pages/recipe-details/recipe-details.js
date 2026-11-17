// Recipe Details And Ordering
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const container = document.getElementById('recipeDetail');
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id') || 'ginataang-labong';
  const generated = JSON.parse(localStorage.getItem('aniMoGeneratedRecipes') || '[]');
  const recipes = [...window.aniMoData.recipes, ...generated];
  const recipe = recipes.find((item) => item.id === recipeId) || window.aniMoData.recipes[0];
  const ui = window.aniMoUtilities;
  const products = (recipe.productIds || [])
    .map((productId) => window.aniMoUtils.getProductById(productId))
    .filter(Boolean);

  // Recipe Instructions
  container.innerHTML = `
    <article class="recipe-detail-card">
      <div>
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(recipe.image, recipe.name, recipe.category, 'recipe-detail-image')}
      </div>
      <div class="recipe-detail-copy">
        <span class="eyebrow">${ui.escapeHTML(recipe.category)}</span>
        <h1>${ui.escapeHTML(recipe.name)}</h1>
        <p>${ui.escapeHTML(recipe.description)}</p>
        <div class="recipe-facts"><span class="badge">${ui.escapeHTML(recipe.time)}</span><span class="badge">${ui.escapeHTML(recipe.difficulty)}</span></div>
        <h2>Ingredients</h2>
        <ul>${recipe.ingredients.map((ingredient) => `<li>${ui.escapeHTML(ingredient)}</li>`).join('')}</ul>
        <h2>Step-by-step recipe</h2>
        <ol>${recipe.steps.map((step) => `<li>${ui.escapeHTML(step)}</li>`).join('')}</ol>
        <div class="recipe-order">
          <strong>Order this recipe</strong>
          <p>${products.length
            ? `Add ${products.map((product) => ui.escapeHTML(product.name)).join(', ')} from local sellers to your cart.`
            : 'No matching sample products are available to order for this recipe.'}</p>
          <button class="btn btn-primary" type="button" id="orderRecipeButton" ${products.length ? '' : 'disabled'}>Order this recipe</button>
        </div>
        <a href="../recipe-discovery/recipe-discovery.html" class="btn btn-secondary recipe-back-link">Back to recipes</a>
      </div>
    </article>
  `;

  const orderButton = document.getElementById('orderRecipeButton');
  // Click Interaction
  orderButton.addEventListener('click', () => {
    products.forEach((product) => window.aniMoCart.addToCart(product.id, 1));
    orderButton.textContent = 'Ingredients added to cart';
    orderButton.disabled = true;
  });
});
