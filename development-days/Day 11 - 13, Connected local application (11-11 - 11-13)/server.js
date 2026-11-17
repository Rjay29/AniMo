// Runtime Dependencies
const { createHash, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
// Runtime Dependencies
const { createServer } = require('node:http');
// Runtime Dependencies
const { DatabaseSync } = require('node:sqlite');
// Runtime Dependencies
const { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } = require('node:fs');
// Runtime Dependencies
const { extname, resolve, sep } = require('node:path');
// Script Runtime
const vm = require('node:vm');

// Project Paths
const root = __dirname;
// Database Directory
const dataDirectory = resolve(root, 'data');
// Server Configuration
const port = Number(process.env.PORT || 8000);
// Session Timing
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
// Request Limits
const maxRequestBytes = 10 * 1024 * 1024;
// Image Limits
const maxImageBytes = 1024 * 1024;
// Session Cookie
const sessionCookie = 'animo_session';
mkdirSync(dataDirectory, { recursive: true });

// User Database
const usersDb = new DatabaseSync(resolve(dataDirectory, 'users.sqlite'));
usersDb.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash BLOB NOT NULL,
    password_salt BLOB NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    profile_picture TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('to_receive', 'to_pickup', 'completed')),
    fulfillment TEXT NOT NULL CHECK (fulfillment IN ('delivery', 'pickup')),
    contact_name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    total REAL NOT NULL,
    items_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
`);

// Listing Database
const listingsDb = new DatabaseSync(resolve(dataDirectory, 'listings.sqlite'));
listingsDb.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('products', 'farmers', 'recipes', 'recipePackages')),
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    image_data TEXT,
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS listings_type_idx ON listings(type, created_at DESC);
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Schema Migration
function ensureColumn(database, table, column, definition) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((entry) => entry.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn(usersDb, 'profiles', 'profile_picture', 'TEXT');
ensureColumn(listingsDb, 'listings', 'image_path', 'TEXT');

// Assistant Database
const aiDb = new DatabaseSync(resolve(dataDirectory, 'ai.sqlite'));
aiDb.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS knowledge_records (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Catalog Image Data
const builtInImages = {
  products: {
    okra: 'marketplace/golden_okra.jpg',
    coconut: 'marketplace/coconut_sugar.jpg',
    cassava: 'marketplace/cassava_chips.jpg',
    'native-rice': 'marketplace/native_rice.jpg',
    malunggay: 'marketplace/malunggay_leaves.jpg',
    'siling-labuyo': 'marketplace/siling_labuyo.jpg'
  },
  farmers: {
    timpla: 'farmers/timpla_community_farm.png',
    arawan: 'farmers/arawan_organic_valley.png',
    kusina: 'farmers/kusina_ng_bukid.jpg'
  },
  recipes: {
    'ginataang-labong': 'recipes/ginataang_labong.jpg',
    'vegetable-adobo': 'recipes/vegetable_adobo_bowl.jpg',
    'banana-coco-smoothie': 'recipes/banana_coconut_smoothie.jpg',
    'spicy-cassava-bites': 'recipes/spicy_cassava_bites.jpg'
  },
  recipePackages: {
    'sinigang-kit': 'meal_kits/sinigang_starter_kit.jpg',
    'adobo-kit': 'meal_kits/abodo_essentials.png',
    'vegetable-bowl-kit': 'meal_kits/vegetable_bowl_kit.png',
    'merienda-kit': 'meal_kits/local_merienda_kit.jpg',
    'coconut-breakfast-kit': 'meal_kits/coconut_breakfast_kit.png'
  }
};

// Feature Logic In Image
function builtInImagePath(type, id) {
  const asset = builtInImages[type]?.[id];
  return asset ? `/shared/assets/${asset}` : null;
}

// Feature Logic Password
function hashPassword(password, salt = randomBytes(16)) {
  return {
    salt,
    hash: scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
  };
}

// Feature Logic Administrator
function seedAdministrator() {
  const username = process.env.ANIMO_ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ANIMO_ADMIN_PASSWORD;
  if (!username && !password) return;
  if (!username || !password || !/^[a-z0-9._-]{3,32}$/.test(username) || password.length < 12) {
    throw new Error('Set both ANIMO_ADMIN_USERNAME and ANIMO_ADMIN_PASSWORD (at least 12 characters).');
  }
  const existing = usersDb.prepare('SELECT id, role FROM users WHERE username = ?').get(username);
  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error('The configured administrator username belongs to a customer account. Choose a different username.');
    }
    usersDb.prepare(`
      UPDATE profiles SET profile_picture = COALESCE(profile_picture, ?) WHERE user_id = ?
    `).run('/shared/assets/profile_picture_admin.jpg', existing.id);
    return;
  }
  const credentials = hashPassword(password);
  const result = usersDb.prepare(
    'INSERT INTO users (username, password_hash, password_salt, role) VALUES (?, ?, ?, ?)'
  ).run(username, credentials.hash, credentials.salt, 'admin');
  usersDb.prepare('INSERT INTO profiles (user_id, display_name, profile_picture) VALUES (?, ?, ?)')
    .run(result.lastInsertRowid, username, '/shared/assets/profile_picture_admin.jpg');
}

// Built In Catalog Seeding
function seedBuiltInListings() {
  const seeded = listingsDb.prepare('SELECT value FROM app_settings WHERE key = ?').get('built_in_catalog_seeded');
  if (seeded) return;
  const samplePath = resolve(root, 'shared', 'js', 'sample-data.js');
  const context = { window: {} };
  const sampleData = readFileSync(samplePath, 'utf8').split('window.aniMoDataReady =')[0];
  vm.runInNewContext(sampleData, context, { filename: samplePath });
  const data = context.window.aniMoData;
  const insert = listingsDb.prepare(
    'INSERT OR IGNORE INTO listings (id, type, name, data_json, image_data, image_path) VALUES (?, ?, ?, ?, ?, ?)'
  );
  listingsDb.exec('BEGIN');
  try {
    for (const [type, records] of Object.entries({
      products: data.products,
      farmers: data.farmers,
      recipes: data.recipes,
      recipePackages: data.recipePackages
    })) {
      for (const record of records) {
        const { image, ...payload } = record;
        insert.run(record.id, type, record.name, JSON.stringify(payload), image || null, builtInImagePath(type, record.id));
      }
    }
    listingsDb.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)').run('built_in_catalog_seeded', 'true');
    listingsDb.exec('COMMIT');
  } catch (error) {
    listingsDb.exec('ROLLBACK');
    throw error;
  }
}

seedAdministrator();
seedBuiltInListings();
for (const [type, records] of Object.entries(builtInImages)) {
  const updateImage = listingsDb.prepare(`
    UPDATE listings SET image_path = ?
    WHERE type = ? AND id = ? AND image_path IS NULL AND (image_data IS NULL OR image_data = '')
  `);
  for (const [id, asset] of Object.entries(records)) {
    updateImage.run(`/shared/assets/${asset}`, type, id);
  }
}

// Feature Logic Response
function jsonResponse(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(data));
}

// Section State
function redirect(response, location) {
  response.writeHead(302, { Location: location, 'Cache-Control': 'no-store' });
  response.end();
}

// Data Parsing Cookies
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return ['', ''];
    const name = part.slice(0, separator).trim();
    try {
      return [name, decodeURIComponent(part.slice(separator + 1).trim())];
    } catch {
      return [name, ''];
    }
  }).filter(([name]) => name));
}

// Feature Logic Cookie Header
function sessionCookieHeader(token, request) {
  const secure = process.env.NODE_ENV === 'production' || request.socket.encrypted;
  return `${sessionCookie}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionLifetime / 1000)}${secure ? '; Secure' : ''}`;
}

// Feature Logic Session Cookie
function clearSessionCookie(request) {
  const secure = process.env.NODE_ENV === 'production' || request.socket.encrypted;
  return `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

// Feature Logic User
function currentUser(request) {
  const token = parseCookies(request.headers.cookie)[sessionCookie];
  if (!token || token.length > 200) return null;
  const now = Date.now();
  usersDb.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return usersDb.prepare(`
    SELECT users.id, users.username, users.role, profiles.display_name, profiles.profile_picture
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    JOIN profiles ON profiles.user_id = users.id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, now) || null;
}

// Element Creation Session
function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  usersDb.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    tokenHash, userId, Date.now() + sessionLifetime
  );
  return token;
}

// Request Body Parsing
function readJson(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxRequestBytes) {
        rejectBody(Object.assign(new Error('Request body is too large.'), { status: 413 }));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!body) return resolveBody({});
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Request body must be a JSON object.');
        }
        resolveBody(parsed);
      } catch {
        rejectBody(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', rejectBody);
  });
}

// Access Control Same Origin
function requireSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return parsed.host === request.headers.host
      && parsed.protocol === (request.socket.encrypted ? 'https:' : 'http:');
  } catch {
    return false;
  }
}

// Feature Logic User
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    profilePicture: user.profile_picture || null,
    role: user.role
  };
}

// Listing Request Parsing
function readListing(row) {
  return {
    ...JSON.parse(row.data_json),
    id: row.id,
    image: row.image_path || row.image_data || undefined,
    listingType: row.type
  };
}

// Types Data
const types = new Set(['products', 'farmers', 'recipes', 'recipePackages']);
// Username Validation
const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/;
// Scrypt Dummy Data
const scryptDummy = hashPassword('AniMo invalid login timing value');
// Login Attempts Data
const loginAttempts = new Map();
// Mime Types Data
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

// Image Validation
function validImage(image, folder) {
  if (image === undefined || image === null || image === '') return null;
  if (typeof image !== 'string') {
    throw Object.assign(new Error('Image must be JPG, PNG, or WebP.'), { status: 400 });
  }
  if (image.startsWith('/shared/assets/')) {
    const match = new RegExp(`^/shared/assets/${folder}/[A-Za-z0-9._-]+\\.(?:webp|png|jpe?g)$`).exec(image);
    if (!match || !existsSync(resolve(root, `.${image}`))) {
      throw Object.assign(new Error('Choose a valid image from this listing folder.'), { status: 400 });
    }
    return image;
  }
  const match = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/]+=*)$/.exec(image);
  if (!match) throw Object.assign(new Error('Image must be JPG, PNG, or WebP.'), { status: 400 });
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > maxImageBytes) throw Object.assign(new Error('Resized image must be under 1 MB.'), { status: 413 });
  return image;
}

// Image Validation
function storeImage(folder, identifier, image) {
  if (!image || image.startsWith('/shared/assets/')) return image;
  const match = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/]+=*)$/.exec(image);
  if (!match) throw Object.assign(new Error('Image must be JPG, PNG, or WebP.'), { status: 400 });
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const filename = `upload-${String(identifier).replace(/[^a-zA-Z0-9_-]/g, '-')}-${randomBytes(8).toString('hex')}.${extension}`;
  const directory = resolve(root, 'shared', 'assets', folder);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, filename), Buffer.from(match[2], 'base64'), { flag: 'wx' });
  return `/shared/assets/${folder}/${filename}`;
}

// Element Removal Uploaded Image
function removeUploadedImage(imagePath) {
  const match = /^\/shared\/assets\/(marketplace|farmers|recipes|meal_kits|profiles)\/(upload-[A-Za-z0-9_-]+)\.(?:webp|png|jpg)$/.exec(imagePath || '');
  if (!match) return;
  const file = resolve(root, 'shared', 'assets', match[1], `${match[2]}${extname(imagePath)}`);
  if (!existsSync(file)) return;
  try {
    unlinkSync(file);
  } catch (error) {
    console.error('Could not remove replaced AniMo image:', error);
  }
}

// Input Validation Listing
function validateListing(type, entry) {
  if (!types.has(type) || !entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw Object.assign(new Error('Choose a valid listing type and entry.'), { status: 400 });
  }
  if (typeof entry.name !== 'string' || !entry.name.trim() || entry.name.length > 140) {
    throw Object.assign(new Error('Listing name is required and must be under 140 characters.'), { status: 400 });
  }
  const numeric = (value) => Number.isFinite(value) && value >= 0;
  if (type === 'products') {
    if (!entry.category || !entry.unit || !entry.farm || !entry.location || !entry.description
      || !numeric(entry.price) || entry.price <= 0 || !numeric(entry.stock)
      || !numeric(entry.rating) || entry.rating > 5
      || typeof entry.deliveryAvailable !== 'boolean' || typeof entry.pickupAvailable !== 'boolean') {
      throw Object.assign(new Error('Product listings need a category, unit, seller, location, description, valid price, stock, rating, and fulfillment choices.'), { status: 400 });
    }
  } else if (type === 'farmers') {
    if (!['Individual person', 'Individual producer', 'Group of farmers'].includes(entry.type)
      || !entry.location || !entry.specialty || !entry.story
      || !numeric(entry.rating) || entry.rating > 5 || !numeric(entry.followers)) {
      throw Object.assign(new Error('Farmer listings need a valid type, location, specialty, story, rating, and follower count.'), { status: 400 });
    }
  } else if (type === 'recipes') {
    if (!entry.category || !entry.time || !entry.difficulty || !entry.description
      || !Array.isArray(entry.ingredients) || !entry.ingredients.length
      || !entry.ingredients.every((item) => typeof item === 'string')
      || !Array.isArray(entry.steps) || !entry.steps.length
      || !entry.steps.every((item) => typeof item === 'string')
      || !Array.isArray(entry.productIds) || !entry.productIds.every((item) => typeof item === 'string')) {
      throw Object.assign(new Error('Recipe listings need a category, time, difficulty, description, ingredients, steps, and linked product IDs.'), { status: 400 });
    }
  } else if (!numeric(entry.price) || entry.price <= 0 || !entry.description
    || !Array.isArray(entry.productIds) || !entry.productIds.length
    || !entry.productIds.every((item) => typeof item === 'string')) {
    throw Object.assign(new Error('Meal kits need a valid price, description, and at least one linked product.'), { status: 400 });
  }
  if (type === 'recipes' || type === 'recipePackages') {
    for (const productId of entry.productIds) {
      const product = listingsDb.prepare('SELECT type FROM listings WHERE id = ?').get(productId);
      if (!product || product.type !== 'products') {
        throw Object.assign(new Error(`Linked product "${productId}" does not exist.`), { status: 400 });
      }
    }
  }
  const imageFolder = {
    products: 'marketplace',
    farmers: 'farmers',
    recipes: 'recipes',
    recipePackages: 'meal_kits'
  }[type];
  const image = validImage(entry.image, imageFolder);
  const payload = { ...entry };
  delete payload.id;
  if (type !== 'farmers') delete payload.type;
  delete payload.image;
  return { name: entry.name.trim(), payload, image };
}

// Feature Logic Catalog
function listCatalog() {
  const catalog = { products: [], farmers: [], recipes: [], recipePackages: [] };
  const rows = listingsDb.prepare('SELECT * FROM listings ORDER BY created_at DESC, rowid DESC').all();
  for (const row of rows) catalog[row.type].push(readListing(row));
  catalog.ingredients = [...new Set(catalog.recipes.flatMap((recipe) => recipe.ingredients || []))];
  return catalog;
}

// Feature Logic Assistant Knowledge
function listAssistantKnowledge(includeDisabled = false) {
  const where = includeDisabled ? '' : 'WHERE enabled = 1';
  return aiDb.prepare(`
    SELECT id, category, title, content, enabled, updated_at
    FROM knowledge_records ${where}
    ORDER BY category COLLATE NOCASE, title COLLATE NOCASE, id
  `).all();
}

// Input Validation Assistant Knowledge
function validateAssistantKnowledge(body) {
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!category || category.length > 80 || !title || title.length > 140 || !content || content.length > 4000) {
    throw Object.assign(new Error('Enter a category (up to 80 characters), title (up to 140 characters), and answer (up to 4,000 characters).'), { status: 400 });
  }
  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    throw Object.assign(new Error('Enabled must be true or false.'), { status: 400 });
  }
  return { category, title, content, enabled: body.enabled === false ? 0 : 1 };
}

// Element Creation Order
function createOrder(userId, body) {
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) {
    throw Object.assign(new Error('Your cart is empty or contains too many items.'), { status: 400 });
  }
  if (!['delivery', 'pickup'].includes(body.fulfillment)) {
    throw Object.assign(new Error('Choose delivery or pickup.'), { status: 400 });
  }
  if (typeof body.contactName !== 'string' || !body.contactName.trim() || body.contactName.trim().length > 100) {
    throw Object.assign(new Error('Enter the name for this order.'), { status: 400 });
  }
  if (body.fulfillment === 'delivery'
    && (typeof body.address !== 'string' || !body.address.trim() || body.address.trim().length > 500)) {
    throw Object.assign(new Error('Enter a delivery address.'), { status: 400 });
  }
  const orderItems = [];
  for (const item of body.items) {
    if (!item || typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw Object.assign(new Error('Cart contains an invalid item or quantity.'), { status: 400 });
    }
    const row = listingsDb.prepare('SELECT * FROM listings WHERE id = ?').get(item.id.replace(/^package:/, ''));
    if (!row) throw Object.assign(new Error('A cart item is no longer available.'), { status: 400 });
    const listing = readListing(row);
    const isPackage = item.id.startsWith('package:');
    if (!isPackage && row.type !== 'products') {
      throw Object.assign(new Error('Only marketplace products and meal kits can be ordered.'), { status: 400 });
    }
    if (isPackage && row.type !== 'recipePackages') {
      throw Object.assign(new Error('A meal kit in your cart is no longer available.'), { status: 400 });
    }
    if (isPackage) {
      if (!Array.isArray(listing.productIds) || !listing.productIds.length) {
        throw Object.assign(new Error(`${listing.name} has no available products and cannot be ordered.`), { status: 400 });
      }
      for (const productId of listing.productIds) {
        const productRow = listingsDb.prepare('SELECT * FROM listings WHERE id = ? AND type = ?').get(productId, 'products');
        const product = productRow && readListing(productRow);
        if (!product || product.stock < item.quantity
          || (body.fulfillment === 'delivery' && !product.deliveryAvailable)
          || (body.fulfillment === 'pickup' && !product.pickupAvailable)) {
          throw Object.assign(new Error(`${listing.name} contains an item unavailable for the selected fulfillment or quantity.`), { status: 400 });
        }
      }
    }
    if (!isPackage && (listing.stock < item.quantity
      || (body.fulfillment === 'delivery' && !listing.deliveryAvailable)
      || (body.fulfillment === 'pickup' && !listing.pickupAvailable))) {
      throw Object.assign(new Error(`${listing.name} is unavailable for the selected fulfillment or quantity.`), { status: 400 });
    }
    orderItems.push({
      id: item.id,
      name: listing.name,
      quantity: item.quantity,
      unitPrice: listing.price,
      unit: isPackage ? 'package' : listing.unit
    });
  }
  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = body.fulfillment === 'delivery' ? 45 : 0;
  const vouchers = {
    FARMER10: { minimum: 300, percent: 10, cap: 100 },
    LOCAL50: { minimum: 200, amount: 50 },
    LOCAL25: { minimum: 150, amount: 25 }
  };
  const voucher = typeof body.voucher === 'string' ? vouchers[body.voucher] : null;
  const discount = voucher && subtotal >= voucher.minimum
    ? Math.min(voucher.amount || Math.round(subtotal * voucher.percent / 100), voucher.cap || subtotal)
    : 0;
  const total = Math.round((subtotal + shipping - discount) * 100) / 100;
  const orderId = `AN-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const status = body.fulfillment === 'delivery' ? 'to_receive' : 'to_pickup';
  usersDb.prepare(
    'INSERT INTO orders (id, user_id, status, fulfillment, contact_name, address, total, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(orderId, userId, status, body.fulfillment, body.contactName.trim(),
    body.fulfillment === 'delivery' ? body.address.trim() : '', total, JSON.stringify(orderItems));
  return { id: orderId, status, fulfillment: body.fulfillment, total, items: orderItems };
}

// Api Request Handling
async function handleApi(request, response, url) {
  const method = request.method;
  const pathname = url.pathname;
  if (method === 'GET' && pathname === '/api/health') {
    return jsonResponse(response, 200, { ok: true, databases: ['users', 'listings', 'ai'] });
  }
  if (method === 'GET' && pathname === '/api/catalog') {
    return jsonResponse(response, 200, listCatalog());
  }
  if (pathname.startsWith('/api/') && !requireSameOrigin(request)) {
    return jsonResponse(response, 403, { error: 'Request origin was rejected.' });
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await readJson(request);
    if (typeof body.username !== 'string' || !usernamePattern.test(body.username)
      || typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 256) {
      return jsonResponse(response, 400, { error: 'Choose a username of 3–32 letters, numbers, dots, dashes, or underscores and a password of 8–256 characters.' });
    }
    const username = body.username.toLowerCase();
    const credentials = hashPassword(body.password);
    try {
      const result = usersDb.prepare(
        'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)'
      ).run(username, credentials.hash, credentials.salt);
      usersDb.prepare('INSERT INTO profiles (user_id, display_name) VALUES (?, ?)').run(result.lastInsertRowid, username);
      const user = usersDb.prepare(`
        SELECT users.id, users.username, users.role, profiles.display_name, profiles.profile_picture
        FROM users JOIN profiles ON profiles.user_id = users.id WHERE users.id = ?
      `).get(result.lastInsertRowid);
      const token = createSession(user.id);
      return jsonResponse(response, 201, { user: publicUser(user) }, { 'Set-Cookie': sessionCookieHeader(token, request) });
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return jsonResponse(response, 409, { error: 'That username is already taken.' });
      }
      throw error;
    }
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await readJson(request);
    const username = typeof body.username === 'string' ? body.username.toLowerCase() : '';
    const address = request.socket.remoteAddress || 'unknown';
    const attemptKey = `${address}:${username}`;
    const attempt = loginAttempts.get(attemptKey) || { count: 0, until: 0 };
    if (attempt.until > Date.now()) return jsonResponse(response, 429, { error: 'Too many login attempts. Wait a few minutes and try again.' });
    const user = usersDb.prepare(`
      SELECT users.id, users.username, users.role, users.password_hash, users.password_salt,
        profiles.display_name, profiles.profile_picture
      FROM users JOIN profiles ON profiles.user_id = users.id WHERE users.username = ?
    `).get(username);
    const credentials = user ? {
      hash: Buffer.from(user.password_hash),
      salt: Buffer.from(user.password_salt)
    } : scryptDummy;
    const supplied = hashPassword(typeof body.password === 'string' ? body.password : '', credentials.salt).hash;
    const matches = supplied.length === credentials.hash.length && timingSafeEqual(supplied, credentials.hash);
    if (!user || !matches) {
      attempt.count += 1;
      if (attempt.count >= 8) attempt.until = Date.now() + 5 * 60 * 1000;
      loginAttempts.set(attemptKey, attempt);
      return jsonResponse(response, 401, { error: 'Username or password is incorrect.' });
    }
    loginAttempts.delete(attemptKey);
    const token = createSession(user.id);
    return jsonResponse(response, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookieHeader(token, request) });
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = parseCookies(request.headers.cookie)[sessionCookie];
    if (token) usersDb.prepare('DELETE FROM sessions WHERE token_hash = ?').run(
      createHash('sha256').update(token).digest('hex')
    );
    return jsonResponse(response, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(request) });
  }

  const user = currentUser(request);
  if (method === 'GET' && pathname === '/api/auth/me') {
    if (!user) return jsonResponse(response, 401, { error: 'Please log in.' });
    return jsonResponse(response, 200, { user: publicUser(user) });
  }
  if (method === 'GET' && pathname === '/api/assistant/knowledge') {
    return jsonResponse(response, 200, { records: listAssistantKnowledge() });
  }
  if (pathname.startsWith('/api/') && !user) return jsonResponse(response, 401, { error: 'Please log in.' });

  if (method === 'PATCH' && pathname === '/api/profile') {
    const body = await readJson(request);
    if (typeof body.displayName !== 'string' || !body.displayName.trim() || body.displayName.trim().length > 80) {
      return jsonResponse(response, 400, { error: 'Display name is required and must be under 80 characters.' });
    }
    const hasProfilePicture = Object.hasOwn(body, 'profilePicture');
    let profilePicture = user.profile_picture || null;
    if (hasProfilePicture) {
      const validatedImage = validImage(body.profilePicture, 'profiles');
      profilePicture = storeImage('profiles', `user-${user.id}`, validatedImage);
    }
    usersDb.prepare(`
      UPDATE profiles
      SET display_name = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(body.displayName.trim(), profilePicture, user.id);
    if (hasProfilePicture && user.profile_picture !== profilePicture) {
      removeUploadedImage(user.profile_picture);
    }
    return jsonResponse(response, 200, {
      user: publicUser(usersDb.prepare(`
        SELECT users.id, users.username, users.role, profiles.display_name, profiles.profile_picture
        FROM users JOIN profiles ON profiles.user_id = users.id WHERE users.id = ?
      `).get(user.id))
    });
  }
  if (method === 'GET' && pathname === '/api/profile/orders') {
    const orders = usersDb.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id)
      .map((order) => ({ ...order, items: JSON.parse(order.items_json) }));
    return jsonResponse(response, 200, { orders });
  }
  if (method === 'POST' && pathname === '/api/orders') {
    const order = createOrder(user.id, await readJson(request));
    return jsonResponse(response, 201, { order });
  }

  if (pathname.startsWith('/api/admin/') && user.role !== 'admin') {
    return jsonResponse(response, 403, { error: 'Administrator access is required.' });
  }
  if (method === 'GET' && pathname === '/api/admin/assistant-data') {
    return jsonResponse(response, 200, { records: listAssistantKnowledge(true) });
  }
  if (method === 'POST' && pathname === '/api/admin/assistant-data') {
    const data = validateAssistantKnowledge(await readJson(request));
    const result = aiDb.prepare(`
      INSERT INTO knowledge_records (category, title, content, enabled)
      VALUES (?, ?, ?, ?)
    `).run(data.category, data.title, data.content, data.enabled);
    return jsonResponse(response, 201, {
      record: aiDb.prepare('SELECT * FROM knowledge_records WHERE id = ?').get(result.lastInsertRowid)
    });
  }
  const assistantDataMatch = /^\/api\/admin\/assistant-data\/(\d+)$/.exec(pathname);
  if (assistantDataMatch && method === 'PUT') {
    const data = validateAssistantKnowledge(await readJson(request));
    const result = aiDb.prepare(`
      UPDATE knowledge_records
      SET category = ?, title = ?, content = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(data.category, data.title, data.content, data.enabled, Number(assistantDataMatch[1]));
    if (!result.changes) return jsonResponse(response, 404, { error: 'Assistant data entry not found.' });
    return jsonResponse(response, 200, {
      record: aiDb.prepare('SELECT * FROM knowledge_records WHERE id = ?').get(Number(assistantDataMatch[1]))
    });
  }
  if (assistantDataMatch && method === 'DELETE') {
    const result = aiDb.prepare('DELETE FROM knowledge_records WHERE id = ?').run(Number(assistantDataMatch[1]));
    return result.changes
      ? jsonResponse(response, 200, { ok: true })
      : jsonResponse(response, 404, { error: 'Assistant data entry not found.' });
  }
  if (method === 'GET' && pathname === '/api/admin/listings') {
    return jsonResponse(response, 200, listCatalog());
  }
  if (method === 'POST' && pathname === '/api/admin/listings') {
    const body = await readJson(request);
    const { type, entry } = body;
    if (!types.has(type)) return jsonResponse(response, 400, { error: 'Choose a valid listing type.' });
    const validated = validateListing(type, entry);
    const id = typeof entry.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(entry.id)
      ? entry.id
      : `${type === 'recipePackages' ? 'kit' : type.slice(0, -1)}-${randomBytes(8).toString('hex')}`;
    if (listingsDb.prepare('SELECT 1 FROM listings WHERE id = ?').get(id)) {
      return jsonResponse(response, 409, { error: 'A listing with that ID already exists.' });
    }
    const imageFolder = { products: 'marketplace', farmers: 'farmers', recipes: 'recipes', recipePackages: 'meal_kits' }[type];
    const imagePath = storeImage(imageFolder, id, validated.image);
    try {
      listingsDb.prepare(
        'INSERT INTO listings (id, type, name, data_json, image_path) VALUES (?, ?, ?, ?, ?)'
      ).run(id, type, validated.name, JSON.stringify(validated.payload), imagePath);
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) return jsonResponse(response, 409, { error: 'A listing with that ID already exists.' });
      throw error;
    }
    return jsonResponse(response, 201, { entry: readListing(listingsDb.prepare('SELECT * FROM listings WHERE id = ?').get(id)) });
  }
  const listingMatch = /^\/api\/admin\/listings\/([a-zA-Z0-9_-]+)$/.exec(pathname);
  if (listingMatch && method === 'PUT') {
    const row = listingsDb.prepare('SELECT * FROM listings WHERE id = ?').get(listingMatch[1]);
    if (!row) return jsonResponse(response, 404, { error: 'Listing not found.' });
    const body = await readJson(request);
    if (body.type !== row.type) return jsonResponse(response, 400, { error: 'Listing type cannot be changed while editing.' });
    const validated = validateListing(row.type, body.entry);
    const imageFolder = { products: 'marketplace', farmers: 'farmers', recipes: 'recipes', recipePackages: 'meal_kits' }[row.type];
    const imagePath = storeImage(imageFolder, row.id, validated.image);
    listingsDb.prepare(`
      UPDATE listings SET name = ?, data_json = ?, image_data = NULL, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(validated.name, JSON.stringify(validated.payload), imagePath, row.id);
    if (imagePath !== row.image_path) removeUploadedImage(row.image_path);
    return jsonResponse(response, 200, { entry: readListing(listingsDb.prepare('SELECT * FROM listings WHERE id = ?').get(row.id)) });
  }
  if (listingMatch && method === 'DELETE') {
    const row = listingsDb.prepare('SELECT type, image_path FROM listings WHERE id = ?').get(listingMatch[1]);
    if (!row) return jsonResponse(response, 404, { error: 'Listing not found.' });
    if (row.type === 'products') {
      const referencing = listingsDb.prepare('SELECT name, data_json FROM listings WHERE type IN (?, ?)').all('recipes', 'recipePackages')
        .filter((entry) => (JSON.parse(entry.data_json).productIds || []).includes(listingMatch[1]))
        .map((entry) => entry.name);
      if (referencing.length) {
        return jsonResponse(response, 409, {
          error: `This product is linked to ${referencing.join(', ')}. Update or remove those listings first.`
        });
      }
    }
    const result = listingsDb.prepare('DELETE FROM listings WHERE id = ?').run(listingMatch[1]);
    if (result.changes) removeUploadedImage(row.image_path);
    return result.changes ? jsonResponse(response, 200, { ok: true }) : jsonResponse(response, 404, { error: 'Listing not found.' });
  }
  if (method === 'GET' && pathname === '/api/admin/orders') {
    const orders = usersDb.prepare(`
      SELECT orders.*, users.username
      FROM orders JOIN users ON users.id = orders.user_id
      ORDER BY orders.created_at DESC
    `).all().map((order) => ({ ...order, items: JSON.parse(order.items_json) }));
    return jsonResponse(response, 200, { orders });
  }
  const orderMatch = /^\/api\/admin\/orders\/([a-zA-Z0-9_-]+)$/.exec(pathname);
  if (orderMatch && method === 'PATCH') {
    const body = await readJson(request);
    if (!['to_receive', 'to_pickup', 'completed'].includes(body.status)) {
      return jsonResponse(response, 400, { error: 'Choose a valid order status.' });
    }
    const result = usersDb.prepare('UPDATE orders SET status = ? WHERE id = ?').run(body.status, orderMatch[1]);
    return result.changes ? jsonResponse(response, 200, { ok: true }) : jsonResponse(response, 404, { error: 'Order not found.' });
  }

  return jsonResponse(response, 404, { error: 'API route not found.' });
}

// Static File Serving
function serveStatic(request, response, url, user) {
  if (url.pathname === '/server.js' || url.pathname.startsWith('/data/')) return response.writeHead(404).end('Not found');
  if (url.pathname === '/admin') return redirect(response, '/admin/');
  if (url.pathname === '/' || url.pathname === '/index.html') return redirect(response, '/pages/login/login.html');
  const isAuthPage = ['/pages/login/login.html', '/pages/register/register.html'].includes(url.pathname);
  const isPageDocument = url.pathname.endsWith('.html');
  if (!user && isPageDocument && url.pathname.startsWith('/pages/') && !isAuthPage) {
    const next = `${url.pathname}${url.search}`;
    return redirect(response, `/pages/login/login.html?next=${encodeURIComponent(next)}`);
  }
  if (user && isAuthPage) return redirect(response, '/pages/home/home.html');
  const adminFile = url.pathname.startsWith('/admin/');
  if (adminFile && (!user || user.role !== 'admin')) {
    if (url.pathname === '/admin/' || url.pathname === '/admin/index.html') {
      return redirect(response, user ? '/pages/home/home.html' : '/pages/login/login.html?next=%2Fadmin%2F');
    }
    return response.writeHead(404).end('Not found');
  }
  let pathname;
  try {
    const resourcePath = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
    pathname = decodeURIComponent(resourcePath);
  } catch {
    return response.writeHead(400).end('Bad request');
  }
  if (pathname.startsWith('/shared/assets/profiles/') && !user) return response.writeHead(404).end('Not found');
  const file = resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${sep}`) || file === root) return response.writeHead(403).end('Forbidden');
  if (!existsSync(file)) return response.writeHead(404).end('Not found');
  const extension = extname(file).toLowerCase();
  if (!mimeTypes[extension]) return response.writeHead(404).end('Not found');
  try {
    const content = readFileSync(file);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension],
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self' data: blob:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      'Cache-Control': extension === '.html' ? 'no-store' : 'public, max-age=300'
    });
    response.end(content);
  } catch (error) {
    console.error('Could not serve static file:', error);
    response.writeHead(500).end('Could not read page');
  }
}

// Http Server
const server = createServer(async (request, response) => {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(request, response, url);
    return serveStatic(request, response, url, currentUser(request));
  } catch (error) {
    console.error('Request failed:', error);
    if (!response.headersSent) return jsonResponse(response, error.status || 500, {
      error: error.status ? error.message : 'The server could not complete the request.'
    });
    response.destroy();
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`AniMo is available at http://127.0.0.1:${port}`);
  console.log(`User, listing, and AI databases are stored separately in ${dataDirectory}`);
  if (!process.env.ANIMO_ADMIN_USERNAME) console.warn('Set ANIMO_ADMIN_USERNAME and ANIMO_ADMIN_PASSWORD before opening /admin/.');
});

// Database Shutdown
function closeDatabases() {
  server.close();
  usersDb.close();
  listingsDb.close();
  aiDb.close();
}
process.on('SIGINT', closeDatabases);
process.on('SIGTERM', closeDatabases);
