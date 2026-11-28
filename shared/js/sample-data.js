// Catalog Fallback
// Future Integrations
window.aniMoData = {
  products: [
    {
      id: 'okra',
      name: 'Golden Okra',
      category: 'Vegetables',
      price: 49,
      unit: 'bundle',
      farm: 'Timpla Community Farm',
      location: 'Lucena, Quezon',
      rating: 4.8,
      description: 'Fresh okra harvested early morning for a crisp bite and vibrant green color.',
      tags: ['Local', 'Farm Fresh', 'High Fiber'],
      stock: 18,
      deliveryAvailable: true,
      pickupAvailable: true
    },
    {
      id: 'coconut',
      name: 'Coconut Sugar',
      category: 'Pantry',
      price: 120,
      unit: 'jar',
      farm: 'Arawan Organic Valley',
      location: 'Bacolod, Negros',
      rating: 4.9,
      description: 'Naturally sweet coconut sugar with a caramel finish, perfect for drinks and desserts.',
      tags: ['Organic', 'Single Origin', 'Unrefined'],
      stock: 12,
      deliveryAvailable: true,
      pickupAvailable: true
    },
    {
      id: 'cassava',
      name: 'Cassava Chips',
      category: 'Snacks',
      price: 75,
      unit: 'pack',
      farm: 'Kusina ng Bukid',
      location: 'Cagayan de Oro',
      rating: 4.7,
      description: 'Crispy and lightly salted cassava chips made from farm-grown roots.',
      tags: ['Crispy', 'Snack', 'Small Batch'],
      stock: 26,
      deliveryAvailable: true,
      pickupAvailable: false
    },
    {
      id: 'native-rice',
      name: 'Native Rice',
      category: 'Grains',
      price: 68,
      unit: 'sack',
      farm: 'Bayanihan Rice Collective',
      location: 'Nueva Ecija',
      rating: 4.9,
      description: 'Aromatic native rice with a nutty scent and soft, fluffy texture.',
      tags: ['Heritage', 'Whole Grain', 'Sustainable'],
      stock: 30,
      deliveryAvailable: false,
      pickupAvailable: true
    },
    {
      id: 'malunggay',
      name: 'Malunggay Leaves',
      category: 'Vegetables',
      price: 35,
      unit: 'bundle',
      farm: 'Sibol sa Hapon',
      location: 'Cebu',
      rating: 4.6,
      description: 'Young malunggay leaves packed with nutrients and perfect in soups and stir-fries.',
      tags: ['Leafy Green', 'Nutritious', 'Local'],
      stock: 20,
      deliveryAvailable: true,
      pickupAvailable: true
    },
    {
      id: 'siling-labuyo',
      name: 'Siling Labuyo',
      category: 'Spices',
      price: 55,
      unit: 'pack',
      farm: 'Bicol Harvest Co-op',
      location: 'Legazpi, Albay',
      rating: 4.8,
      description: 'Fiery and aromatic chili peppers sourced from Bicol’s pepper farms.',
      tags: ['Hot', 'Spicy', 'Small Batch'],
      stock: 14,
      deliveryAvailable: false,
      pickupAvailable: true
    }
  ],

  // Farmer Data
  farmers: [
    {
      id: 'timpla',
      name: 'Timpla Community Farm',
      type: 'Group of farmers',
      location: 'Lucena, Quezon',
      specialty: 'Seasonal vegetables and herbs',
      story: 'A family-run farm growing vegetables using regenerative methods and traditional soil care.',
      rating: 4.9,
      followers: 1200
    },
    {
      id: 'arawan',
      name: 'Arawan Organic Valley',
      type: 'Group of farmers',
      location: 'Bacolod, Negros',
      specialty: 'Organic sweeteners and pantry goods',
      story: 'We cultivate coconut and sugar cane with a low-waste approach to support healthier communities.',
      rating: 4.8,
      followers: 980
    },
    {
      id: 'kusina',
      name: 'Kusina ng Bukid',
      type: 'Individual producer',
      location: 'Cagayan de Oro',
      specialty: 'Root crops and snacks',
      story: 'From a village kitchen and a small-holder farm, local harvests become comforting pantry favorites.',
      rating: 4.7,
      followers: 860
    }
  ],

  // Recipe Data
  recipes: [
    {
      id: 'ginataang-labong',
      name: 'Ginataang Labong',
      category: 'Comfort Meal',
      time: '35 min',
      difficulty: 'Easy',
      ingredients: ['bamboo shoots', 'coconut milk', 'chili', 'malunggay'],
      productIds: ['malunggay', 'siling-labuyo', 'coconut'],
      description: 'A rich and creamy Filipino dish featuring local greens and tropical coconut flavor.',
      steps: [
        'Rinse and slice the bamboo shoots. Blanch them for 5 minutes, then drain.',
        'Simmer coconut milk in a pot over medium heat. Stir gently so it does not scorch.',
        'Add the bamboo shoots and chili. Simmer until tender, about 15 minutes.',
        'Fold in malunggay leaves and cook for 2 more minutes.',
        'Season to taste and serve warm with rice.'
      ]
    },
    {
      id: 'vegetable-adobo',
      name: 'Vegetable Adobo Bowl',
      category: 'Healthy Bowl',
      time: '25 min',
      difficulty: 'Easy',
      ingredients: ['okra', 'eggplant', 'native rice', 'soy'],
      productIds: ['okra', 'native-rice'],
      description: 'A savory adobo-inspired bowl using locally grown vegetables and fragrant rice.',
      steps: [
        'Cook native rice according to its package directions.',
        'Mix soy sauce, vinegar, garlic, and pepper in a small bowl.',
        'Sear sliced okra and eggplant in a hot pan until lightly browned.',
        'Pour in the sauce and simmer until the vegetables are tender.',
        'Serve the vegetables and sauce over warm native rice.'
      ]
    },
    {
      id: 'banana-coco-smoothie',
      name: 'Banana Coconut Smoothie',
      category: 'Drink',
      time: '10 min',
      difficulty: 'Easy',
      ingredients: ['coconut sugar', 'banana', 'milk'],
      productIds: ['coconut'],
      description: 'A naturally sweet smoothie quickly made with local ingredients and a tropical taste.',
      steps: [
        'Peel and slice a ripe banana.',
        'Add banana, chilled milk, and coconut sugar to a blender.',
        'Blend until smooth, then taste and adjust sweetness.',
        'Pour into a glass and serve immediately.'
      ]
    },
    {
      id: 'spicy-cassava-bites',
      name: 'Spicy Cassava Bites',
      category: 'Snack',
      time: '20 min',
      difficulty: 'Easy',
      ingredients: ['cassava', 'chili', 'garlic'],
      productIds: ['cassava', 'siling-labuyo'],
      description: 'A crisp, spicy snack inspired by regional cassava and chili harvests.',
      steps: [
        'Cut peeled cassava into bite-sized pieces and boil until just tender.',
        'Drain thoroughly and pat the pieces dry.',
        'Toss with minced garlic, chopped chili, and a pinch of salt.',
        'Pan-fry until golden and crisp on the outside.',
        'Cool briefly and serve as a snack or side.'
      ]
    },
    {
      id: 'malunggay-rice-soup',
      name: 'Malunggay Rice Soup',
      category: 'Comfort Meal',
      time: '30 min',
      difficulty: 'Easy',
      ingredients: ['malunggay', 'native rice', 'coconut milk'],
      productIds: ['malunggay', 'native-rice', 'coconut'],
      description: 'A simple, nourishing rice soup finished with local greens and coconut milk.',
      steps: [
        'Rinse the rice and simmer it in water until soft.',
        'Stir in coconut milk and simmer gently for 5 minutes.',
        'Add malunggay leaves and cook until just wilted.',
        'Season with salt and pepper, then serve warm.'
      ]
    }
  ],

  // Meal Package Data
  recipePackages: [
    {
      id: 'sinigang-kit',
      name: 'Sinigang Starter Kit',
      price: 420,
      productIds: ['okra', 'malunggay', 'siling-labuyo'],
      description: 'Includes tamarind, greens, peppers, and fresh vegetables for a classic sour soup.'
    },
    {
      id: 'adobo-kit',
      name: 'Adobo Essentials',
      price: 390,
      productIds: ['okra', 'native-rice', 'siling-labuyo'],
      description: 'A complete package for a delicious local adobo with ingredients handpicked by nearby farms.'
    },
    {
      id: 'vegetable-bowl-kit',
      name: 'Vegetable Bowl Kit',
      price: 280,
      productIds: ['okra', 'malunggay', 'native-rice'],
      description: 'Fresh vegetables and native rice for a quick, balanced local meal.'
    },
    {
      id: 'merienda-kit',
      name: 'Local Merienda Kit',
      price: 195,
      productIds: ['cassava', 'siling-labuyo'],
      description: 'Small-batch cassava snacks with a spicy local dip.'
    },
    {
      id: 'coconut-breakfast-kit',
      name: 'Coconut Breakfast Kit',
      price: 240,
      productIds: ['coconut', 'native-rice'],
      description: 'Coconut sugar and local pantry essentials for a bright breakfast.'
    }
  ],

  // Ingredient Options
  ingredients: [
    'bamboo shoots', 'banana', 'cassava', 'chili', 'coconut milk',
    'coconut sugar', 'eggplant', 'garlic', 'malunggay', 'native rice',
    'okra', 'soy'
  ]
};

// Catalog Loading Skeletons
document.querySelectorAll('#featured-products, #recipe-cards, #package-cards, #farmer-cards, #productGrid, #recipeGrid, #packageGrid, #farmerGrid').forEach((container) => {
  container.setAttribute('aria-busy', 'true');
  if (!container.querySelector('.skeleton, .skeleton-card')) {
    container.innerHTML = '<div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div>';
  }
});

// Catalog Loading
(function initCatalog() {
  let settled = false;
  const fallbackData = {
    products: window.aniMoData.products.slice(),
    farmers: window.aniMoData.farmers.slice(),
    recipes: window.aniMoData.recipes.slice(),
    recipePackages: window.aniMoData.recipePackages.slice(),
    ingredients: window.aniMoData.ingredients.slice()
  };

  function useFallback(reason) {
    if (settled) return false;
    settled = true;
    window.aniMoCatalogFallback = true;
    if (reason) console.warn('Using embedded AniMo catalog fallback:', reason);
    ['products', 'farmers', 'recipes', 'recipePackages', 'ingredients'].forEach((key) => {
      if (!Array.isArray(window.aniMoData[key]) || !window.aniMoData[key].length) {
        window.aniMoData[key] = fallbackData[key].slice();
      }
    });
    return true;
  }

  const fetchCatalog = fetch('/api/catalog', { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
    const catalog = await response.json();
    ['products', 'farmers', 'recipes', 'recipePackages'].forEach((collection) => {
      if (!Array.isArray(catalog[collection])) throw new Error(`Catalog collection "${collection}" is invalid.`);
    });
    if (settled) return;
    settled = true;
    ['products', 'farmers', 'recipes', 'recipePackages'].forEach((collection) => {
      window.aniMoData[collection] = catalog[collection];
    });
    window.aniMoData.ingredients = Array.isArray(catalog.ingredients) ? catalog.ingredients : fallbackData.ingredients.slice();
  }).catch((error) => {
    if (useFallback(error)) return;
  });

  const timeoutFallback = new Promise((resolve) => {
    window.setTimeout(() => { useFallback('timeout'); resolve();     }, 2000);
  });
  const minSkeletonDelay = new Promise((resolve) => window.setTimeout(resolve, 2000));

  window.aniMoDataReady = Promise.all([
    Promise.race([fetchCatalog.then(() => undefined), timeoutFallback]).catch(() => { useFallback('error'); }),
    minSkeletonDelay
  ]).then(() => undefined);

  window.aniMoDataReady.finally(() => {
    document.querySelectorAll('[aria-busy="true"]').forEach((container) => container.removeAttribute('aria-busy'));
    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const img = (src, name, category, className = '') => {
      const renderer = window.aniMoUtilities && window.aniMoUtilities.renderCatalogImage;
      if (typeof renderer === 'function') return renderer(src, name, category, className);
      const validSource = typeof src === 'string'
        && (/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(src)
          || /^\/shared\/assets\/(?:marketplace|farmers|recipes|meal_kits)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g)$/.test(src));
      const safeSource = validSource ? src : '/shared/assets/marketplace/stock-market-vegetables.jpg';
      return `<img class="catalog-card-image ${esc(className)}" src="${esc(safeSource)}" alt="${esc(name)}" loading="lazy" decoding="async" />`;
    };
    const fallbackHtml = (id) => {
      const d = window.aniMoData || {};
      const ui = window.aniMoUtilities || {};
      const homeGrids = new Set(['featured-products', 'recipe-cards', 'package-cards', 'farmer-cards']);
      const options = homeGrids.has(id) ? { variant: 'minimal' } : {};
      const cards = (items, render) => (items.length && typeof render === 'function' ? items.map((item) => render(item, options)).join('') : '');
      if (id === 'featured-products' || id === 'productGrid') return cards((d.products || []).slice(0, id === 'featured-products' ? 3 : 12), ui.renderProductCard);
      if (id === 'recipe-cards' || id === 'recipeGrid') return cards((d.recipes || []).slice(0, id === 'recipe-cards' ? 3 : 12), ui.renderRecipeCard);
      if (id === 'package-cards' || id === 'packageGrid') return cards((d.recipePackages || []).slice(0, id === 'package-cards' ? 3 : 12), ui.renderPackageCard);
      if (id === 'farmer-cards' || id === 'farmerGrid') return cards((d.farmers || []).slice(0, id === 'farmer-cards' ? 3 : 12), ui.renderFarmerCard);
      if (id === 'nearbyProducts') {
        const items = (d.farmers || []).slice(0, 12);
        return items.length ? items.map((f) => `<article class="nearby-item" role="listitem">${img(f.image, f.name, 'Local grower', 'nearby-seller-avatar')}<div class="nearby-item-copy"><strong>${esc(f.name)}</strong><span>${esc(f.location || 'Philippines')} · ${esc(f.specialty || 'Local seller')}</span><a href="../farmer-profile/farmer-profile.html?id=${encodeURIComponent(f.id)}">View seller</a></div></article>`).join('') : '';
      }
      return '';
    };
    const catalogFallbackIds = new Set(['featured-products', 'productGrid', 'recipe-cards', 'recipeGrid', 'package-cards', 'packageGrid', 'farmer-cards', 'farmerGrid', 'nearbyProducts']);
    const clearStuckSkeletons = () => {
      document.querySelectorAll('.skeleton-card, .skeleton[aria-hidden="true"]').forEach((el) => {
        const container = el.parentElement;
        if (!container) return;
        const hasRealContent = Array.from(container.children).some((child) =>
          !child.classList.contains('skeleton-card') && !child.classList.contains('skeleton') && child.nodeType === 1
        );
        if (hasRealContent) return;
        const html = !window.aniMoCatalogLoadError ? fallbackHtml(container.id) : '';
        if (html) { container.innerHTML = html; return; }
        if (!catalogFallbackIds.has(container.id)) return;
        container.innerHTML = window.aniMoCatalogLoadError
          ? '<div class="empty-state" role="status"><p class="empty-state-title">Listings could not load</p><p>Check that the local server is running, then refresh the page.</p></div>'
          : '<p class="card" role="status">Content is taking longer than expected. Please refresh.</p>';
      });
    };
    window.setTimeout(clearStuckSkeletons, 0);
    window.setTimeout(clearStuckSkeletons, 1500);
  });
})();

// Catalog Lookup
window.aniMoUtils = {
  getProductById(productId) {
    return window.aniMoData.products.find((product) => product.id === productId) || null;
  },
  getFarmerById(farmerId) {
    return window.aniMoData.farmers.find((farmer) => farmer.id === farmerId) || null;
  },
  getRecipeById(recipeId) {
    return window.aniMoData.recipes.find((recipe) => recipe.id === recipeId) || null;
  }
};
