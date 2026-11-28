// Recipe Discovery
// Future Integrations
document.addEventListener('DOMContentLoaded', async () => {
  await window.aniMoDataReady;
  if (window.aniMoCatalogLoadError) return;
  const search = document.getElementById('ingredientSearch');
  const suggestions = document.getElementById('ingredientSuggestions');
  const selectedContainer = document.getElementById('selectedIngredients');
  const grid = document.getElementById('recipeGrid');
  const emptyState = document.getElementById('emptyRecipes');
  const makeRecipeButton = document.getElementById('makeRecipeButton');
  const ui = window.aniMoUtilities;
  const selected = new Set();
  const generatedKey = 'aniMoGeneratedRecipes';

  // Recipe Restoration
  const storedRecipes = JSON.parse(localStorage.getItem(generatedKey) || '[]');
  const generatedRecipes = Array.isArray(storedRecipes) ? storedRecipes : [];
  window.aniMoData.recipes.push(...generatedRecipes.filter((recipe) => (
    !window.aniMoData.recipes.some((existing) => existing.id === recipe.id)
  )));

  // Ingredient Selection
  function renderSelected() {
    selectedContainer.innerHTML = [...selected].map((ingredient) => `
      <span class="selected-chip">
        ${ui.escapeHTML(ingredient)}
        <button type="button" data-remove-ingredient="${ui.escapeHTML(ingredient)}" aria-label="Remove ${ui.escapeHTML(ingredient)}" title="Remove ${ui.escapeHTML(ingredient)}">×</button>
      </span>
    `).join('') || '<span class="muted-note">Choose ingredients from the search suggestions.</span>';
    selectedContainer.querySelectorAll('[data-remove-ingredient]').forEach((button) => {
      // Click Interaction
      button.addEventListener('click', () => {
        selected.delete(button.dataset.removeIngredient);
        renderSelected();
        renderRecipes();
      });
    });
  }

  // Ingredient Suggestions
  function renderSuggestions() {
    const term = search.value.trim().toLowerCase();
    const matches = term
      ? window.aniMoData.ingredients.filter((ingredient) => (
        ingredient.includes(term) && !selected.has(ingredient)
      )).slice(0, 7)
      : [];
    suggestions.innerHTML = matches.map((ingredient) => (
      `<button type="button" role="option" data-add-ingredient="${ui.escapeHTML(ingredient)}">${ui.escapeHTML(ingredient)}</button>`
    )).join('');
    suggestions.hidden = matches.length === 0;
    suggestions.querySelectorAll('[data-add-ingredient]').forEach((button) => {
      // Click Interaction
      button.addEventListener('click', () => addIngredient(button.dataset.addIngredient));
    });
  }

  // Ingredient Suggestion Creation
  function addIngredient(ingredient) {
    selected.add(ingredient);
    search.value = '';
    suggestions.hidden = true;
    renderSelected();
    renderRecipes();
    search.focus();
  }

  // Recipe Matching
  function renderRecipes() {
    const matches = window.aniMoData.recipes.filter((recipe) => (
      [...selected].every((ingredient) => recipe.ingredients.includes(ingredient))
    ));
    grid.innerHTML = matches.map((recipe) => `
      <article class="recipe-card">
        <!-- Image Placeholder -->
        ${ui.renderCatalogImage(recipe.image, recipe.name, recipe.category)}
        <div class="body">
          <div class="card-meta"><span>${ui.escapeHTML(recipe.category)}</span><strong>${ui.escapeHTML(recipe.time)}</strong></div>
          <h3>${ui.escapeHTML(recipe.name)}</h3>
          <p>${ui.escapeHTML(recipe.description)}</p>
          <div class="tag-list">${recipe.ingredients.map((ingredient) => `<span class="tag">${ui.escapeHTML(ingredient)}</span>`).join('')}</div>
          <div class="availability-list">${(recipe.productIds || []).map((id) => window.aniMoUtils.getProductById(id)).filter(Boolean).map((product) => `<span class="badge${Number(product.stock) < 1 ? ' sold-out' : ''}">${ui.escapeHTML(product.name)} · ${Number(product.stock) < 1 ? 'Sold out' : `${ui.escapeHTML(product.stock)} in stock`}</span>`).join('')}</div>
          <a href="../recipe-details/recipe-details.html?id=${encodeURIComponent(recipe.id)}" class="btn btn-secondary recipe-link">View recipe and steps</a>
        </div>
      </article>
    `).join('');
    emptyState.hidden = matches.length > 0;
  }

  // Recipe Suggestions
  makeRecipeButton.addEventListener('click', () => {
    if (!selected.size) return;
    const ingredients = [...selected];
    const generated = {
      id: `ai-recipe-${Date.now()}`,
      name: `AniMo AI-inspired ${ingredients[0]} dish`,
      category: 'AI-inspired sample',
      time: '25 min',
      difficulty: 'Easy',
      ingredients,
      productIds: ingredients.map((ingredient) => {
        const normalizedIngredient = ingredient.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        return window.aniMoData.products.find((product) => (
          product.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().includes(normalizedIngredient)
          && Number(product.stock) > 0
        ))?.id;
      }).filter(Boolean),
      description: `A sample recipe idea using ${ingredients.join(', ')}.`,
      steps: [
        `Wash and prepare the selected ingredients: ${ingredients.join(', ')}.`,
        'Warm a pan or pot and add a little cooking oil or water.',
        `Cook the ingredients until tender, adding ${ingredients.join(' and ')} gradually.`,
        'Season to taste, check that everything is cooked through, and serve warm.'
      ]
    };
    generatedRecipes.push(generated);
    localStorage.setItem(generatedKey, JSON.stringify(generatedRecipes));
    window.aniMoData.recipes.push(generated);
    renderRecipes();
  });

  // Input Interaction
  search.addEventListener('input', renderSuggestions);
  // Keyboard Interaction
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const firstSuggestion = suggestions.querySelector('[data-add-ingredient]');
      if (firstSuggestion) {
        event.preventDefault();
        firstSuggestion.click();
      }
    }
    if (event.key === 'Escape') suggestions.hidden = true;
  });
  // Click Interaction
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.ingredient-search')) suggestions.hidden = true;
  });

  renderSelected();
  renderRecipes();
});
