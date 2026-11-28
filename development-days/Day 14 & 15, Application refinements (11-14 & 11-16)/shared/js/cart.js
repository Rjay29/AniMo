// Ordering System
// Future Integrations
const CART_KEY = 'aniMoCart';

// Currency Formatting
function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Cart Retrieval
function getCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

// Cart Item Lookup
function getItemByCartId(cartId) {
  if (cartId.startsWith('package:')) {
    const recipePackage = window.aniMoData.recipePackages.find(
      (item) => item.id === cartId.slice('package:'.length)
    );
    return recipePackage ? {
      ...recipePackage,
      id: cartId,
      unit: 'package',
      farm: 'AniMo local farmer package',
      location: 'Local farms',
      category: 'Recipe package',
      isPackage: true
    } : null;
  }
  return window.aniMoUtils.getProductById(cartId);
}

// Cart Persistence
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Cart Item Creation
function addToCart(productId, qty = 1) {
  if (!getItemByCartId(productId) || !Number.isInteger(qty) || qty < 1) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ id: productId, quantity: qty });
  }

  saveCart(cart);
}

// Cart Item Removal
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

// Cart Quantity Updates
function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);

  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
}

// Cart Badge Updates
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = String(total);
    el.classList.toggle('hidden', total === 0);
  });
}

window.aniMoCart = {
  getCart,
  getItemByCartId,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  updateCartBadge,
  formatCurrency
};

// Page Initialization
window.addEventListener('DOMContentLoaded', updateCartBadge);
