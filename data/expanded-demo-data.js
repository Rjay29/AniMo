const farmers = [
  ['Habi Highlands Growers', 'La Trinidad, Benguet', 'Highland vegetables and herbs', 16.455, 120.5875],
  ['Amianan Harvest Collective', 'Vigan, Ilocos Sur', 'Native grains and root crops', 17.5747, 120.3869],
  ['Cagayan Valley Seed & Soil', 'Tuguegarao, Cagayan', 'Corn, legumes, and seasonal vegetables', 17.6132, 121.727],
  ['Kapampangan Table Farm', 'San Fernando, Pampanga', 'Heritage vegetables and aromatics', 15.0343, 120.6844],
  ['Gintong Palay Cooperative', 'Cabanatuan, Nueva Ecija', 'Rice, mung beans, and corn', 15.4859, 120.9665],
  ['Sierra Madre Smallholders', 'Antipolo, Rizal', 'Citrus, leafy greens, and herbs', 14.6255, 121.1245],
  ['Tanim Quezon Community Farm', 'Lucena, Quezon', 'Coconut, banana, and vegetables', 13.9414, 121.6234],
  ['Laguna Lakeside Growers', 'Los Baños, Laguna', 'Pechay, gabi, and garden herbs', 14.178, 121.2437],
  ['Bicol Sili & Gulay', 'Legazpi, Albay', 'Chilies, pili, and tropical produce', 13.1391, 123.7438],
  ['Isla Verde Roots Collective', 'Boac, Marinduque', 'Root crops and island-grown fruit', 13.4468, 121.8401],
  ['Palawan Valley Produce', 'Puerto Princesa, Palawan', 'Tropical fruit and native vegetables', 9.7392, 118.7353],
  ['Panay Farm Circle', 'Iloilo City, Iloilo', 'Rice, vegetables, and local legumes', 10.7202, 122.5621],
  ['Negros Sugarland Growers', 'Bacolod, Negros Occidental', 'Coconut sugar, cacao, and fruit', 10.6765, 122.9509],
  ['Sugbo Fresh Harvest', 'Cebu City, Cebu', 'Leafy greens, calamansi, and herbs', 10.3157, 123.8854],
  ['Bohol Upland Organics', 'Tagbilaran, Bohol', 'Root crops, bananas, and spices', 9.6496, 123.8534],
  ['Eastern Visayas Harvest Hub', 'Tacloban, Leyte', 'Coconut, sweet potato, and greens', 11.244, 125.0039],
  ['Samar Sea-to-Soil Farm', 'Catbalogan, Samar', 'Ginger, gabi, and native vegetables', 11.7753, 124.8861],
  ['Bukidnon Mountain Growers', 'Malaybalay, Bukidnon', 'Highland corn, beans, and vegetables', 8.1575, 125.1278],
  ['Misamis Orchard Collective', 'Cagayan de Oro, Misamis Oriental', 'Cassava, banana, and tropical fruit', 8.4542, 124.6319],
  ['Davao Durian & Greens', 'Davao City, Davao del Sur', 'Tropical fruit, cacao, and greens', 7.1907, 125.4553],
  ['Zamboanga Peninsula Farm Co-op', 'Zamboanga City, Zamboanga del Sur', 'Coconut, cassava, and spices', 6.9214, 122.079],
  ['Caraga Forest Gardeners', 'Butuan, Agusan del Norte', 'Pandan, turmeric, and root crops', 8.9475, 125.5406],
  ['Surigao Island Growers', 'Surigao City, Surigao del Norte', 'Coconut, banana, and local greens', 9.7871, 125.4953],
  ['Cotabato Plains Cooperative', 'Kidapawan, Cotabato', 'Corn, mung beans, and vegetables', 7.0083, 125.0894],
  ['General Santos Community Harvest', 'General Santos, South Cotabato', 'Fruit, aromatics, and vegetables', 6.1164, 125.1716]
].map(([name, location, specialty, latitude, longitude], index) => ({
  id: `ph-farmer-${String(index + 1).padStart(2, '0')}`,
  name,
  type: index % 4 === 0 ? 'Individual producer' : 'Group of farmers',
  location,
  specialty,
  story: `${name} works with local growers to share seasonal ${specialty.toLowerCase()} and support resilient Filipino food communities.`,
  rating: Number((4.2 + ((index * 7) % 8) / 10).toFixed(1)),
  followers: 140 + ((index * 137) % 1800),
  latitude,
  longitude
}));

const produce = [
  ['talong', 'Eggplant', 'Vegetables', 'kg', 68, ['local', 'farm fresh']],
  ['ampalaya', 'Bitter Melon', 'Vegetables', 'kg', 82, ['local', 'seasonal']],
  ['sitaw', 'Yardlong Beans', 'Vegetables', 'bundle', 42, ['farm fresh', 'local']],
  ['kalabasa', 'Squash', 'Vegetables', 'kg', 48, ['local', 'high fiber']],
  ['pechay', 'Pechay', 'Vegetables', 'bundle', 35, ['leafy green', 'farm fresh']],
  ['gabi', 'Gabi Taro', 'Root Crops', 'kg', 72, ['local', 'staple']],
  ['kangkong', 'Kangkong', 'Vegetables', 'bundle', 28, ['leafy green', 'local']],
  ['upo', 'Bottle Gourd', 'Vegetables', 'piece', 55, ['seasonal', 'farm fresh']],
  ['patola', 'Sponge Gourd', 'Vegetables', 'piece', 52, ['local', 'seasonal']],
  ['sayote', 'Chayote', 'Vegetables', 'kg', 45, ['farm fresh', 'local']],
  ['labanos', 'White Radish', 'Vegetables', 'kg', 60, ['root crop', 'local']],
  ['mustasa', 'Mustasa Greens', 'Vegetables', 'bundle', 32, ['leafy green', 'seasonal']],
  ['saba', 'Saba Banana', 'Fruit', 'bunch', 78, ['local', 'snack']],
  ['calamansi', 'Calamansi', 'Fruit', 'kg', 95, ['citrus', 'local']],
  ['papaya', 'Solo Papaya', 'Fruit', 'piece', 68, ['tropical fruit', 'ripe']],
  ['mango', 'Carabao Mango', 'Fruit', 'kg', 145, ['tropical fruit', 'seasonal']],
  ['pineapple', 'Queen Pineapple', 'Fruit', 'piece', 88, ['tropical fruit', 'local']],
  ['kamote', 'Sweet Potato', 'Root Crops', 'kg', 58, ['root crop', 'high fiber']],
  ['cassava-root', 'Fresh Cassava Root', 'Root Crops', 'kg', 48, ['root crop', 'local']],
  ['luya', 'Fresh Ginger', 'Aromatics', 'kg', 135, ['aromatic', 'local']],
  ['luyang-dilaw', 'Fresh Turmeric', 'Aromatics', 'kg', 120, ['aromatic', 'small batch']],
  ['tanglad', 'Lemongrass', 'Herbs', 'bundle', 30, ['herb', 'local']],
  ['pandan', 'Pandan Leaves', 'Herbs', 'bundle', 35, ['herb', 'fragrant']],
  ['sibuyas', 'Red Onion', 'Aromatics', 'kg', 110, ['pantry staple', 'local']],
  ['bawang', 'Native Garlic', 'Aromatics', 'kg', 155, ['pantry staple', 'small batch']],
  ['kamatis', 'Farm Tomatoes', 'Vegetables', 'kg', 72, ['farm fresh', 'local']],
  ['monggo', 'Mung Beans', 'Legumes', 'kg', 115, ['plant protein', 'local']],
  ['mais', 'Yellow Corn', 'Grains', 'kg', 62, ['local', 'whole grain']],
  ['malagkit', 'Glutinous Rice', 'Grains', 'kg', 88, ['heritage', 'local']],
  ['cacao', 'Tablea Cacao', 'Pantry', 'pack', 135, ['small batch', 'local']],
  ['mani', 'Roasted Peanuts', 'Legumes', 'pack', 58, ['local', 'snack']],
  ['carrot', 'Carrots', 'Vegetables', 'kg', 76, ['farm fresh', 'local']],
  ['coconut', 'Fresh Coconut', 'Fruit', 'piece', 55, ['local', 'tropical']]
];

const recipeIdeas = [
  ['Pinakbet sa Bukid', 'Comfort Meal', ['eggplant', 'bitter melon', 'yardlong beans', 'squash'], 'A vegetable-forward pinakbet inspired by seasonal harvests.'],
  ['Laing with Gabi Leaves', 'Comfort Meal', ['gabi taro', 'ginger', 'lemongrass'], 'Creamy gabi leaves simmered with coconut milk and aromatics.'],
  ['Ginataang Kalabasa at Sitaw', 'Comfort Meal', ['squash', 'yardlong beans'], 'Squash and sitaw gently simmered in coconut milk.'],
  ['Adobong Kangkong', 'Quick Meal', ['kangkong', 'native garlic'], 'A quick savory vegetable dish with garlic and pantry staples.'],
  ['Tortang Talong', 'Vegetarian', ['eggplant', 'red onion', 'farm tomatoes'], 'Charred eggplant folded into an easy homestyle omelet.'],
  ['Ginisang Monggo', 'Comfort Meal', ['mung beans', 'native garlic', 'malunggay'], 'A filling mung bean stew finished with fresh greens.'],
  ['Sinigang na Gulay', 'Comfort Meal', ['white radish', 'tomatoes', 'yardlong beans'], 'A bright sour vegetable soup with local produce.'],
  ['Ensaladang Papaya', 'Fresh Salad', ['solo papaya', 'calamansi', 'red onion'], 'A crisp green papaya salad with calamansi dressing.'],
  ['Paksiw na Talong', 'Quick Meal', ['eggplant', 'native garlic', 'ginger'], 'Tender eggplant braised with a tangy garlic sauce.'],
  ['Lumpiang Gulay', 'Snack', ['squash', 'yardlong beans', 'carrot'], 'Crisp vegetable rolls using a fresh market filling.'],
  ['Ginisang Sayote', 'Quick Meal', ['chayote', 'red onion', 'farm tomatoes'], 'A simple saute of chayote, onion, and tomatoes.'],
  ['Kamote at Saba Merienda', 'Snack', ['sweet potato', 'saba banana'], 'A naturally sweet merienda of steamed kamote and saba.'],
  ['Calamansi-Ginger Cooler', 'Drink', ['calamansi', 'fresh ginger'], 'A refreshing citrus drink with a gentle ginger kick.'],
  ['Pandan Glutinous Rice', 'Dessert', ['glutinous rice', 'pandan leaves'], 'Fragrant sticky rice infused with pandan.'],
  ['Ginataang Mais', 'Dessert', ['yellow corn', 'glutinous rice'], 'Sweet corn and rice in a warm coconut dessert.'],
  ['Champorado sa Tablea', 'Breakfast', ['tablea cacao', 'glutinous rice'], 'A classic chocolate rice porridge using Filipino tablea.'],
  ['Fresh Mango-Calamansi Bowl', 'Fresh Snack', ['carabao mango', 'calamansi'], 'Ripe mango with a bright squeeze of calamansi.'],
  ['Turmeric-Ginger Vegetable Soup', 'Comfort Meal', ['fresh turmeric', 'fresh ginger', 'pechay'], 'A warming vegetable soup with fresh aromatics.'],
  ['Cassava and Peanut Bites', 'Snack', ['fresh cassava root', 'roasted peanuts'], 'A hearty snack pairing cassava with toasted peanuts.'],
  ['Upo and Tomato Guisado', 'Quick Meal', ['bottle gourd', 'farm tomatoes', 'native garlic'], 'Soft bottle gourd simmered with tomato and garlic.']
];

const mealKitIdeas = [
  ['Pinakbet Market Kit', ['talong', 'ampalaya', 'sitaw', 'kalabasa']],
  ['Laing & Gabi Kit', ['gabi', 'luya', 'tanglad']],
  ['Ginataang Gulay Kit', ['kalabasa', 'sitaw', 'gabi']],
  ['Adobong Kangkong Kit', ['kangkong', 'bawang', 'sibuyas']],
  ['Tortang Talong Kit', ['talong', 'sibuyas', 'kamatis']],
  ['Ginisang Monggo Kit', ['monggo', 'bawang', 'malagkit']],
  ['Sinigang Gulay Kit', ['labanos', 'kamatis', 'sitaw']],
  ['Fresh Calamansi Kit', ['calamansi', 'luya', 'pandan']],
  ['Pandan Rice Dessert Kit', ['malagkit', 'pandan', 'mani']],
  ['Ginataang Mais Kit', ['mais', 'malagkit', 'coconut']],
  ['Tablea Champorado Kit', ['cacao', 'malagkit', 'mani']],
  ['Tropical Merienda Kit', ['saba', 'kamote', 'mani']],
  ['Turmeric Soup Kit', ['luyang-dilaw', 'luya', 'pechay']],
  ['Cassava Snack Kit', ['cassava-root', 'mani', 'calamansi']],
  ['Fresh Island Fruit Kit', ['mango', 'papaya', 'pineapple', 'calamansi']]
];

const assistantFaq = [
  ['Getting started', 'How do I browse AniMo?', 'Open Marketplace for produce and pantry listings, Recipes for cooking ideas, Meal Kits for bundled ingredients, or Farmers to meet local growers. Select a card for its details.'],
  ['Ordering', 'How do I place an order?', 'Add available products or meal kits to your cart, review quantities and fulfillment options, apply an eligible voucher if desired, then continue to Checkout and submit the order.'],
  ['Ordering', 'How can I check my order status?', 'Sign in and open your Profile. The Orders area shows current and completed orders. A delivery marked completed means it has been delivered in this demo.'],
  ['Cart', 'How do I change an item quantity?', 'Open Cart and adjust the quantity beside the item. The cart checks current stock and recalculates the order total.'],
  ['Delivery', 'How do delivery and pickup work?', 'Each product listing indicates whether delivery, pickup, or both are supported. Select an option offered by every item in the cart and enter a delivery address when required.'],
  ['Payment', 'What payment methods are available?', 'Payment choices are shown during checkout. The current demo supports the methods offered by the checkout page; review the summary before placing the order.'],
  ['Vouchers', 'How do I use a voucher?', 'In Cart, choose an available voucher. A discount applies only when its minimum subtotal is met; the updated total appears before checkout.'],
  ['Products', 'Are product prices and stock guaranteed?', 'Prices and stock shown are the current AniMo listing data. They may change; verify the item in your cart and checkout before placing an order.'],
  ['Products', 'How do I find locally sourced ingredients?', 'Browse Marketplace by product, category, or location, or use the Local Map (in the navigation bar or on the Home page) to explore seller locations across the Philippines.'],
  ['Recipes', 'How do I find a recipe by ingredient?', 'Open Recipes and use its ingredient filters or search. Recipe details show ingredients, steps, and links to matching AniMo products when available.'],
  ['Recipes', 'Can the assistant suggest a recipe?', 'Yes. Ask for a recipe idea or name ingredients. Suggestions use AniMo recipe and product records when available and will identify items not listed in the marketplace.'],
  ['Meal Kits', 'What is included in a meal kit?', 'Open a meal kit listing to see its description and linked products. Availability of linked items is checked when you add the kit to your cart.'],
  ['Farmers', 'How do I view a farmer profile?', 'Open Farmers or select a seller pin on the Local Map (its own page or the Home page), then choose the profile link to see the farmer’s listing and story.'],
  ['Farmers', 'How can I become a farmer on AniMo?', 'Register with a farmer account and submit the requested profile and verification documents. Farmer listings become available after administrator review.'],
  ['Map', 'How do I search the local map?', 'On the Local map page or the Home page map, enter a Philippine city, town, or province and choose Search location. The map geocodes Philippine results and shows AniMo seller pins with available coordinates.'],
  ['Map', 'How do I get directions to a seller?', 'Search a Philippine location or choose Use my location while physically in the Philippines. Then select a seller and Directions. Routes are limited to Philippine coordinates.'],
  ['Map', 'Why is my location not accepted?', 'AniMo limits the map and routes to the Philippines. Browser location access must be granted, and coordinates outside the map’s Philippines bounds are rejected.'],
  ['Map', 'Does the local map show every farmer?', 'The map displays approved AniMo farmer listings with valid Philippine coordinates. Listings without usable coordinates are not placed on the map.'],
  ['Reviews', 'When can I rate a product?', 'Rating and comment controls are available only after an order containing that item is marked delivered/completed. Sign in with the account that placed the order.'],
  ['Reviews', 'Why can’t I leave a comment?', 'You need to be signed in and have a completed order containing the listing. Reviews are tied to the account that placed the delivered order.'],
  ['Account', 'How do I update my profile?', 'Sign in and open Profile to update your display name and profile picture.'],
  ['Account', 'How do I change my profile picture?', 'Use the profile picture control in Profile and select a JPG, PNG, or WebP image within the displayed size limit. AniMo saves the uploaded image as a file in its assets folder.'],
  ['Chat', 'How do I message a farmer?', 'Open a farmer profile and choose its chat action, or open Chats to continue an existing buyer–farmer conversation.'],
  ['Chat', 'Are chats private?', 'Buyer–farmer conversations are visible to their participants and authorized administrators. Do not send passwords, payment credentials, or other sensitive information in chat.'],
  ['Accessibility', 'How do I enable dark mode?', 'Use the moon/sun control in the navigation. The preference is saved in this browser.'],
  ['Accessibility', 'How do I make the text larger?', 'Open Accessibility settings in the navigation and enable Larger text. The setting is saved in this browser.'],
  ['Security', 'How do I log out?', 'Choose Log out in the navigation. AniMo will end the current session and return you to the login page.'],
  ['Troubleshooting', 'Why can’t I add a product to my cart?', 'The item may be out of stock, the quantity may exceed available stock, or the selected delivery/pickup option may not be supported. Check the listing and cart message.'],
  ['Troubleshooting', 'Why is the AI model offline?', 'The AniMo assistant uses Google Gemini for generated answers. It is offline when the server has no GEMINI_API_KEY, the key is invalid, or the free usage limit has been reached (wait a minute and try again). AniMo’s built-in catalog and help answers remain available while it is offline.'],
  ['Support', 'How can I contact support?', 'Use the Chats feature to contact a farmer about a listing. For account, payment, or technical concerns, use the contact information provided by the AniMo project administrator.']
];

function createExpandedDemoData() {
  const products = [];
  const farmerForListing = (index) => farmers[(index * 17 + Math.floor(index / 7) * 11 + 3) % farmers.length];

  for (let index = 0; index < 155; index += 1) {
    const produceIndex = index % produce.length;
    const offerIndex = Math.floor(index / produce.length);
    const [key, name, category, unit, basePrice, tags] = produce[produceIndex];
    const farmer = farmerForListing(index);
    const locationName = farmer.location.split(',')[0];
    products.push({
      id: `ph-${key}-${String(offerIndex + 1).padStart(2, '0')}`,
      name: `${name} (${locationName} harvest)`,
      category,
      price: basePrice + (offerIndex * 13) + (produceIndex % 4) * 3,
      unit,
      farm: farmer.name,
      location: farmer.location,
      rating: Number((4 + ((index * 7) % 10) / 10).toFixed(1)),
      description: `Seasonal ${name.toLowerCase()} grown by ${farmer.name} in ${farmer.location}. Harvest quantities and availability vary with the season.`,
      tags: [...tags, 'Philippine-grown'],
      stock: 8 + ((index * 11) % 45),
      deliveryAvailable: index % 5 !== 0,
      pickupAvailable: index % 7 !== 0
    });
  }

  const productIdsFor = (names) => names.map((name) => {
    const foundIndex = produce.findIndex((entry) => entry[1].toLowerCase() === name.toLowerCase());
    if (foundIndex < 0) return products[0].id;
    return products[foundIndex].id;
  });

  const recipes = recipeIdeas.map(([name, category, ingredients, description], index) => {
    const farmer = farmerForListing(index * 3 + 9);
    const linked = productIdsFor(ingredients);
    return {
      id: `ph-recipe-${String(index + 1).padStart(2, '0')}`,
      name,
      category,
      time: `${15 + (index * 7) % 35} min`,
      difficulty: index % 4 === 0 ? 'Easy' : index % 4 === 1 ? 'Moderate' : 'Easy',
      ingredients,
      productIds: [...new Set(linked)],
      description,
      farm: farmer.name,
      location: farmer.location,
      steps: [
        `Wash and prepare the ${ingredients.slice(0, 2).join(' and ')}.`,
        'Warm a pan or pot and gently cook the aromatics until fragrant.',
        `Add the prepared ${ingredients.slice(0, 2).join(' and ')} and cook until tender.`,
        'Season to taste, add a little water or coconut milk if needed, and simmer until the flavors come together.',
        'Serve warm and enjoy with rice or as a fresh local side.'
      ]
    };
  });

  const recipePackages = mealKitIdeas.map(([name, keys], index) => {
    const farmer = farmerForListing(index * 5 + 2);
    const productIds = keys.map((key) => products.find((product) => product.id.startsWith(`ph-${key}-`))?.id).filter(Boolean);
    return {
      id: `ph-kit-${String(index + 1).padStart(2, '0')}`,
      name,
      price: 180 + ((index * 47) % 360),
      productIds: [...new Set(productIds)],
      description: `A convenient local meal kit featuring seasonal ingredients from ${farmer.name} in ${farmer.location}. See linked product details for current stock and fulfillment options.`,
      farm: farmer.name,
      location: farmer.location
    };
  });

  return {
    farmers: farmers.map((farmer) => ({ ...farmer })),
    products,
    recipes,
    recipePackages,
    assistantFaq
  };
}

module.exports = { createExpandedDemoData };
