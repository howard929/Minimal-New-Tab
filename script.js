const STORAGE_KEYS = {
  shortcuts: "minimalNewTab.shortcuts",
  engine: "minimalNewTab.searchEngine",
  autoFocus: "minimalNewTab.autoFocus",
  useFavicons: "minimalNewTab.useFavicons",
  iconBackground: "minimalNewTab.iconBackground",
  shortcutRows: "minimalNewTab.shortcutRows",
  shortcutSize: "minimalNewTab.shortcutSize",
  backgroundColor: "minimalNewTab.backgroundColor",
  backgroundMode: "minimalNewTab.backgroundMode",
  iconSize: "minimalNewTab.iconSize",
  searchWidth: "minimalNewTab.searchWidth",
  searchFocusEffect: "minimalNewTab.searchFocusEffect",
  historySuggestions: "minimalNewTab.historySuggestions",
  historyLimit: "minimalNewTab.historyLimit",
  syncPreference: "minimalNewTab.syncPreference",
  paletteColors: "minimalNewTab.paletteColors",
  paletteIndex: "minimalNewTab.paletteIndex"
};

const DEFAULTS = {
  shortcuts: [],
  engine: "bing",
  autoFocus: true,
  useFavicons: true,
  iconBackground: true,
  shortcutRows: 1,
  shortcutSize: "large",
  backgroundColor: "#202124",
  backgroundMode: "color",
  iconSize: "small",
  searchWidth: "wide",
  searchFocusEffect: true,
  historySuggestions: false,
  historyLimit: 10,
  paletteColors: ["#000000", "#202124", "#5f6368", "#e8eaed", "#ffffff", "#87ceeb"],
  paletteIndex: 1
};

const MAX_PER_ROW = 8;
const MAX_ROWS = 3;
const DB_NAME = "MinimalNewTabDB";
const DB_VERSION = 1;
const DB_STORE = "assets";
const BG_IMAGE_KEY = "backgroundImage";
const LEGACY_SYNC_KEY = "minimalNewTab.sync.v1";
const SYNC_META_KEY = "minimalNewTab.sync.meta.v2";
const SYNC_SETTINGS_KEY = "minimalNewTab.sync.settings.v2";
const SYNC_SHORTCUT_PREFIX = "minimalNewTab.sync.shortcuts.v2.";
const SYNC_SHORTCUT_CHUNK_SIZE = 8;
const BACKUP_APP = "MinimalNewTab";
const BACKUP_VERSION = 1;

const SEARCH_WIDTHS = {
  narrow: "440px",
  medium: "560px",
  wide: "680px"
};

const searchUrls = {
  bing: query => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  google: query => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  baidu: query => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
};

const backgroundLayer = document.getElementById("backgroundLayer");
const shortcutsEl = document.getElementById("shortcuts");
const searchArea = document.getElementById("searchArea");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const suggestionsEl = document.getElementById("suggestions");

const shortcutDialog = document.getElementById("shortcutDialog");
const shortcutForm = document.getElementById("shortcutForm");
const shortcutDialogTitle = document.getElementById("shortcutDialogTitle");
const shortcutName = document.getElementById("shortcutName");
const shortcutUrl = document.getElementById("shortcutUrl");
const shortcutId = document.getElementById("shortcutId");
const cancelShortcut = document.getElementById("cancelShortcut");

const settingsButton = document.getElementById("settingsButton");
const settingsDialog = document.getElementById("settingsDialog");
const searchEngine = document.getElementById("searchEngine");
const autoFocus = document.getElementById("autoFocus");
const useFavicons = document.getElementById("useFavicons");
const iconBackground = document.getElementById("iconBackground");
const shortcutRows = document.getElementById("shortcutRows");
const shortcutSize = document.getElementById("shortcutSize");
const searchWidth = document.getElementById("searchWidth");
const searchFocusEffect = document.getElementById("searchFocusEffect");
const historySuggestions = document.getElementById("historySuggestions");
const historySuggestionLimit = document.getElementById("historySuggestionLimit");
const historyPermissionStatus = document.getElementById("historyPermissionStatus");
const grantHistoryPermission = document.getElementById("grantHistoryPermission");
const customColor = document.getElementById("customColor");
const customColorValue = document.getElementById("customColorValue");
const colorPresets = document.getElementById("colorPresets");
const backgroundImageInput = document.getElementById("backgroundImageInput");
const chooseBackgroundImage = document.getElementById("chooseBackgroundImage");
const removeBackgroundImage = document.getElementById("removeBackgroundImage");
const backgroundImageStatus = document.getElementById("backgroundImageStatus");
const importConfigInput = document.getElementById("importConfigInput");
const importConfig = document.getElementById("importConfig");
const exportConfig = document.getElementById("exportConfig");
const edgeSync = document.getElementById("edgeSync");
const syncStatus = document.getElementById("syncStatus");
const closeSettings = document.getElementById("closeSettings");
const resetData = document.getElementById("resetData");

const tileMenu = document.getElementById("tileMenu");
const editShortcut = document.getElementById("editShortcut");
const removeShortcut = document.getElementById("removeShortcut");

let activeShortcutId = null;
let draggedShortcutId = null;
let suppressShortcutClick = false;
let backgroundObjectUrl = null;
let hasStoredBackgroundImage = false;
let suggestionItems = [];
let activeSuggestionIndex = -1;
let suggestionQuerySerial = 0;
let syncTimer = null;
let applyingRemoteSync = false;
let suppressSearchFocusVisual = false;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getShortcuts() {
  const shortcuts = loadJSON(STORAGE_KEYS.shortcuts, DEFAULTS.shortcuts);
  return Array.isArray(shortcuts) ? shortcuts : [];
}

function setShortcuts(shortcuts, shouldSync = true) {
  saveJSON(STORAGE_KEYS.shortcuts, shortcuts);
  if (shouldSync) queueSync();
}

function getEngine() {
  return localStorage.getItem(STORAGE_KEYS.engine) || DEFAULTS.engine;
}

function getBool(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "true";
}

function getAutoFocus() { return getBool(STORAGE_KEYS.autoFocus, DEFAULTS.autoFocus); }
function getUseFavicons() { return getBool(STORAGE_KEYS.useFavicons, DEFAULTS.useFavicons); }
function getIconBackground() { return getBool(STORAGE_KEYS.iconBackground, DEFAULTS.iconBackground); }
function getHistorySuggestionsEnabled() { return getBool(STORAGE_KEYS.historySuggestions, DEFAULTS.historySuggestions); }
function getSearchFocusEffect() { return getBool(STORAGE_KEYS.searchFocusEffect, DEFAULTS.searchFocusEffect); }

function getShortcutRows() {
  const value = Number(localStorage.getItem(STORAGE_KEYS.shortcutRows) || DEFAULTS.shortcutRows);
  if (!Number.isInteger(value)) return DEFAULTS.shortcutRows;
  return Math.min(MAX_ROWS, Math.max(1, value));
}

function getShortcutCapacity() { return getShortcutRows() * MAX_PER_ROW; }
function getShortcutSize() {
  const value = localStorage.getItem(STORAGE_KEYS.shortcutSize) || DEFAULTS.shortcutSize;
  return ["small", "large"].includes(value) ? value : DEFAULTS.shortcutSize;
}
function getBackgroundColor() { return localStorage.getItem(STORAGE_KEYS.backgroundColor) || DEFAULTS.backgroundColor; }
function getBackgroundMode() { return localStorage.getItem(STORAGE_KEYS.backgroundMode) || DEFAULTS.backgroundMode; }
function getIconSize() { return "small"; }
function getSearchWidth() { return localStorage.getItem(STORAGE_KEYS.searchWidth) || DEFAULTS.searchWidth; }

function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value || "");
}

function getPaletteColors() {
  const stored = loadJSON(STORAGE_KEYS.paletteColors, DEFAULTS.paletteColors);
  if (!Array.isArray(stored) || stored.length !== 6 || !stored.every(isHexColor)) {
    return [...DEFAULTS.paletteColors];
  }
  return stored.map(color => color.toLowerCase());
}

function setPaletteColors(colors) {
  saveJSON(STORAGE_KEYS.paletteColors, colors);
}

function getPaletteIndex() {
  const value = Number(localStorage.getItem(STORAGE_KEYS.paletteIndex));
  return Number.isInteger(value) && value >= 0 && value < 6 ? value : DEFAULTS.paletteIndex;
}

function setPaletteIndex(index) {
  localStorage.setItem(STORAGE_KEYS.paletteIndex, String(Math.min(5, Math.max(0, Number(index) || 0))));
}

function getHistoryLimit() {
  const value = Number(localStorage.getItem(STORAGE_KEYS.historyLimit) || DEFAULTS.historyLimit);
  return [5, 10, 15, 20].includes(value) ? value : DEFAULTS.historyLimit;
}

function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return "";
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value)) return value;
  if (/^(mailto:|edge:|about:)/i.test(value)) return value;
  return `https://${value}`;
}

function looksLikeUrl(value) {
  const text = value.trim();
  if (!text || /\s/.test(text)) return false;
  return (
    /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(text) ||
    /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(text) ||
    /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(text) ||
    /^[^\s]+\.[^\s]+$/.test(text)
  );
}

function firstGlyph(name) {
  const text = (name || "?").trim();
  return text.charAt(0).toUpperCase() || "?";
}

function faviconURL(pageUrl, size = 32) {
  try {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", normalizeUrl(pageUrl));
    url.searchParams.set("size", String(size));
    return url.toString();
  } catch {
    return "";
  }
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 32, g: 33, b: 36 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function perceivedLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function applyPageContrast(color, forceImageMode = false) {
  const light = !forceImageMode && perceivedLuminance(color) > 0.68;
  document.body.classList.toggle("light-page", light);
  document.body.classList.toggle("image-background", forceImageMode);
  document.documentElement.style.setProperty("--page-text", light ? "#202124" : "#f1f3f4");
  document.documentElement.style.setProperty("--page-muted", light ? "#5f6368" : "#c4c7c5");
}

function applyUiSettings() {
  // Legacy favicon-size setting remains normalized; shortcut card size is now
  // controlled separately by the small / large preset.
  localStorage.setItem(STORAGE_KEYS.iconSize, "small");
  document.body.classList.remove("icon-size-small", "icon-size-large");
  document.body.classList.toggle("icon-background-enabled", getIconBackground());
  document.body.classList.toggle("search-focus-effect-enabled", getSearchFocusEffect());
  if (!getSearchFocusEffect()) document.body.classList.remove("search-active");

  const size = getShortcutSize();
  document.body.classList.toggle("shortcut-size-small", size === "small");
  document.body.classList.toggle("shortcut-size-large", size === "large");

  document.documentElement.style.setProperty("--search-max-width", SEARCH_WIDTHS[getSearchWidth()] || SEARCH_WIDTHS.wide);
}

function updateColorControls(color) {
  const palette = getPaletteColors();
  const selectedIndex = getPaletteIndex();
  const normalizedColor = isHexColor(color) ? color.toLowerCase() : getBackgroundColor().toLowerCase();

  customColor.value = normalizedColor;
  customColorValue.textContent = normalizedColor.toUpperCase();

  colorPresets.querySelectorAll(".color-swatch").forEach((button, index) => {
    const swatchColor = palette[index] || DEFAULTS.paletteColors[index];
    button.style.backgroundColor = swatchColor;
    button.title = `颜色储存位 ${index + 1} · ${swatchColor.toUpperCase()}`;
    button.setAttribute("aria-label", `颜色储存位 ${index + 1}，${swatchColor.toUpperCase()}`);
    button.classList.toggle("active", index === selectedIndex);
  });
}

function openBackgroundDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putBackgroundImage(file) {
  const db = await openBackgroundDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(file, BG_IMAGE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getBackgroundImageBlob() {
  const db = await openBackgroundDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const request = tx.objectStore(DB_STORE).get(BG_IMAGE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function deleteBackgroundImage() {
  const db = await openBackgroundDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(BG_IMAGE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function revokeBackgroundObjectUrl() {
  if (backgroundObjectUrl) {
    URL.revokeObjectURL(backgroundObjectUrl);
    backgroundObjectUrl = null;
  }
}

async function applyBackground() {
  const color = getBackgroundColor();
  backgroundLayer.style.backgroundColor = color;
  backgroundLayer.style.backgroundImage = "";
  backgroundLayer.classList.remove("with-image");
  revokeBackgroundObjectUrl();

  let imageBlob = null;
  try { imageBlob = await getBackgroundImageBlob(); } catch { imageBlob = null; }

  hasStoredBackgroundImage = Boolean(imageBlob);
  backgroundImageStatus.textContent = imageBlob ? "已保存一张本地背景图片" : "未选择图片";
  removeBackgroundImage.disabled = !imageBlob;

  const useImage = getBackgroundMode() === "image" && imageBlob;
  if (useImage) {
    backgroundObjectUrl = URL.createObjectURL(imageBlob);
    backgroundLayer.style.backgroundImage = `url("${backgroundObjectUrl}")`;
    backgroundLayer.classList.add("with-image");
    applyPageContrast(color, true);
  } else {
    localStorage.setItem(STORAGE_KEYS.backgroundMode, "color");
    applyPageContrast(color, false);
  }

  updateColorControls(color);
}

function createIcon(item) {
  const icon = document.createElement("div");
  icon.className = "tile-icon";
  const fallback = document.createElement("span");
  fallback.className = "tile-fallback";
  fallback.textContent = firstGlyph(item.name);

  if (!getUseFavicons()) {
    icon.appendChild(fallback);
    return icon;
  }

  const src = faviconURL(item.url, 32);
  if (!src) {
    icon.appendChild(fallback);
    return icon;
  }

  const img = document.createElement("img");
  img.className = "tile-favicon";
  img.alt = "";
  img.draggable = false;
  img.src = src;
  img.addEventListener("error", () => {
    img.remove();
    if (!icon.contains(fallback)) icon.appendChild(fallback);
  });
  icon.appendChild(img);
  return icon;
}

function getTilePositions() {
  const map = new Map();
  shortcutsEl.querySelectorAll(".shortcut[data-id]").forEach(tile => map.set(tile.dataset.id, tile.getBoundingClientRect()));
  return map;
}

function animateMovedTiles(before) {
  shortcutsEl.querySelectorAll(".shortcut[data-id]").forEach(tile => {
    if (tile.dataset.id === draggedShortcutId) return;
    const first = before.get(tile.dataset.id);
    const last = tile.getBoundingClientRect();
    if (!first) return;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (dx === 0 && dy === 0) return;
    tile.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
      { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  });
}

function commitDomOrder() {
  const ids = [...shortcutsEl.querySelectorAll(".shortcut[data-id]")].map(tile => tile.dataset.id);
  const byId = new Map(getShortcuts().map(item => [item.id, item]));
  setShortcuts(ids.map(id => byId.get(id)).filter(Boolean));
}

function findDropTarget(event) {
  const candidates = [...shortcutsEl.querySelectorAll(".shortcut[data-id]:not(.dragging)")];
  if (!candidates.length) return null;

  let best = null;
  let bestDistance = Infinity;
  for (const child of candidates) {
    const box = child.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy * 1.25);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { child, box, dx, dy };
    }
  }

  if (!best) return null;
  const sameRow = Math.abs(best.dy) < best.box.height * 0.55;
  if (sameRow && best.dx > 0) return best.child.nextElementSibling;
  if (!sameRow && best.dy > 0) return best.child.nextElementSibling;
  return best.child;
}

function createShortcutTile(item) {
  const tile = document.createElement("div");
  tile.className = "shortcut";
  tile.dataset.id = item.id;
  tile.title = item.url;
  tile.tabIndex = 0;
  tile.setAttribute("role", "link");
  tile.setAttribute("aria-label", item.name);
  tile.draggable = true;

  const icon = createIcon(item);
  const label = document.createElement("div");
  label.className = "tile-label";
  label.textContent = item.name;

  const more = document.createElement("button");
  more.className = "tile-more";
  more.type = "button";
  more.textContent = "";
  more.title = "更多";
  more.setAttribute("aria-label", `${item.name} 更多操作`);
  more.draggable = false;

  more.addEventListener("click", event => {
    event.stopPropagation();
    activeShortcutId = item.id;
    openTileMenu(more);
  });

  tile.addEventListener("click", event => {
    if (suppressShortcutClick) return;
    if (event.target.closest(".tile-more")) return;
    window.location.href = normalizeUrl(item.url);
  });

  tile.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = normalizeUrl(item.url);
    }
  });

  tile.addEventListener("dragstart", event => {
    if (event.target.closest?.(".tile-more")) {
      event.preventDefault();
      return;
    }
    draggedShortcutId = item.id;
    suppressShortcutClick = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.id);
    closeTileMenu();
    requestAnimationFrame(() => tile.classList.add("dragging"));
  });

  tile.addEventListener("dragend", () => {
    tile.classList.remove("dragging");
    draggedShortcutId = null;
    commitDomOrder();
    setTimeout(() => { suppressShortcutClick = false; }, 100);
  });

  tile.append(icon, label, more);
  return tile;
}

function createAddTile() {
  const tile = document.createElement("button");
  tile.className = "shortcut add";
  tile.type = "button";
  tile.draggable = false;

  const icon = document.createElement("div");
  icon.className = "tile-icon";

  const addIconBox = document.createElement("span");
  addIconBox.className = "add-icon-box";
  addIconBox.setAttribute("aria-hidden", "true");
  icon.appendChild(addIconBox);

  const label = document.createElement("div");
  label.className = "tile-label";
  label.textContent = "添加快捷方式";
  tile.addEventListener("click", () => openShortcutDialog());
  tile.append(icon, label);
  return tile;
}

function renderShortcuts() {
  shortcutsEl.replaceChildren();
  const shortcuts = getShortcuts();
  const capacity = getShortcutCapacity();
  for (const item of shortcuts) shortcutsEl.appendChild(createShortcutTile(item));
  if (shortcuts.length < capacity) shortcutsEl.appendChild(createAddTile());
}

shortcutsEl.addEventListener("dragover", event => {
  if (!draggedShortcutId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const dragged = shortcutsEl.querySelector(`.shortcut[data-id="${CSS.escape(draggedShortcutId)}"]`);
  if (!dragged) return;
  const addTile = shortcutsEl.querySelector(".shortcut.add");
  const target = findDropTarget(event);
  const before = getTilePositions();

  if (target && target !== dragged && target !== dragged.nextElementSibling) {
    shortcutsEl.insertBefore(dragged, target);
    animateMovedTiles(before);
  } else if (!target && addTile && dragged.nextElementSibling !== addTile) {
    shortcutsEl.insertBefore(dragged, addTile);
    animateMovedTiles(before);
  } else if (!target && !addTile && dragged !== shortcutsEl.lastElementChild) {
    shortcutsEl.appendChild(dragged);
    animateMovedTiles(before);
  }
});

shortcutsEl.addEventListener("drop", event => {
  if (!draggedShortcutId) return;
  event.preventDefault();
  commitDomOrder();
});

function openShortcutDialog(item = null) {
  closeTileMenu();
  shortcutDialogTitle.textContent = item ? "编辑快捷方式" : "添加快捷方式";
  shortcutId.value = item?.id || "";
  shortcutName.value = item?.name || "";
  shortcutUrl.value = item?.url || "";
  shortcutDialog.showModal();
  setTimeout(() => shortcutName.focus(), 0);
}

function openTileMenu(anchor) {
  const rect = anchor.getBoundingClientRect();
  tileMenu.hidden = false;
  const width = 120;
  tileMenu.style.left = `${Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width))}px`;
  tileMenu.style.top = `${Math.min(window.innerHeight - 90, rect.bottom + 6)}px`;
}

function closeTileMenu() {
  tileMenu.hidden = true;
  activeShortcutId = null;
}

shortcutForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = shortcutName.value.trim();
  const url = shortcutUrl.value.trim();
  const id = shortcutId.value.trim();
  if (!name || !url) return;

  const shortcuts = getShortcuts();
  if (id) {
    const index = shortcuts.findIndex(item => item.id === id);
    if (index !== -1) shortcuts[index] = { ...shortcuts[index], name, url };
  } else {
    if (shortcuts.length >= getShortcutCapacity()) {
      window.alert(`当前已达到 ${getShortcutCapacity()} 个快捷方式上限。请先在设置中增加栏位行数。`);
      return;
    }
    shortcuts.push({ id: crypto.randomUUID(), name, url });
  }

  setShortcuts(shortcuts);
  renderShortcuts();
  shortcutDialog.close();
});

cancelShortcut.addEventListener("click", () => shortcutDialog.close());

editShortcut.addEventListener("click", () => {
  const item = getShortcuts().find(shortcut => shortcut.id === activeShortcutId);
  if (item) openShortcutDialog(item);
});

removeShortcut.addEventListener("click", () => {
  if (!activeShortcutId) return;
  setShortcuts(getShortcuts().filter(item => item.id !== activeShortcutId));
  closeTileMenu();
  renderShortcuts();
});

document.addEventListener("click", event => {
  if (!tileMenu.hidden && !tileMenu.contains(event.target) && !event.target.closest(".tile-more")) closeTileMenu();
});
window.addEventListener("resize", closeTileMenu);

function hideSuggestions() {
  suggestionsEl.hidden = true;
  suggestionsEl.replaceChildren();
  suggestionItems = [];
  activeSuggestionIndex = -1;
  searchInput.setAttribute("aria-expanded", "false");
}

function setActiveSuggestion(index) {
  if (!suggestionItems.length) return;
  activeSuggestionIndex = Math.max(-1, Math.min(index, suggestionItems.length - 1));
  [...suggestionsEl.querySelectorAll(".suggestion-item")].forEach((el, i) => {
    el.classList.toggle("active", i === activeSuggestionIndex);
  });
}

function historyPermissionContains() {
  return chrome.permissions.contains({ permissions: ["history"] });
}

async function updateHistoryPermissionUi() {
  if (!historyPermissionStatus || !grantHistoryPermission) return;

  const preferred = getHistorySuggestionsEnabled();
  const permitted = await historyPermissionContains();

  historySuggestions.checked = preferred;

  if (!preferred) {
    historyPermissionStatus.textContent = "本机权限状态：历史建议未开启";
    grantHistoryPermission.hidden = true;
    return;
  }

  if (permitted) {
    historyPermissionStatus.textContent = "本机权限状态：已授权读取本机浏览历史";
    grantHistoryPermission.hidden = true;
  } else {
    historyPermissionStatus.textContent = "已同步/保存为开启，但当前设备尚未授权浏览历史。";
    grantHistoryPermission.hidden = false;
  }
}

async function getHistorySuggestions(query, limit) {
  const permitted = await historyPermissionContains();
  if (!permitted || !getHistorySuggestionsEnabled()) return [];

  const raw = await chrome.history.search({
    text: query.trim(),
    startTime: 0,
    maxResults: Math.max(100, limit * 12)
  });

  const now = Date.now();
  const q = query.trim().toLowerCase();

  return raw
    .filter(item => item.url && /^https?:\/\//i.test(item.url))
    .map(item => {
      let host = "";
      try { host = new URL(item.url).hostname.replace(/^www\./, ""); } catch {}
      const title = item.title || host || item.url;
      const urlLower = item.url.toLowerCase();
      const hostLower = host.toLowerCase();
      const titleLower = title.toLowerCase();
      const typed = item.typedCount || 0;
      const visits = item.visitCount || 0;
      const ageHours = Math.max(0, (now - (item.lastVisitTime || 0)) / 3600000);
      const recency = Math.max(0, 120 - Math.log2(ageHours + 1) * 12);

      let score = typed * 14 + Math.log2(visits + 1) * 10 + recency;
      if (q) {
        if (hostLower === q) score += 1100;
        else if (hostLower.startsWith(q)) score += 900;
        else if (hostLower.includes(q)) score += 650;
        if (titleLower.startsWith(q)) score += 500;
        else if (titleLower.includes(q)) score += 280;
        if (urlLower.startsWith(q) || urlLower.startsWith(`https://${q}`) || urlLower.startsWith(`http://${q}`)) score += 520;
        else if (urlLower.includes(q)) score += 180;
      } else {
        score += (item.lastVisitTime || 0) / 1e10;
      }

      return { url: item.url, title, host, score, lastVisitTime: item.lastVisitTime || 0 };
    })
    .sort((a, b) => q ? b.score - a.score : b.lastVisitTime - a.lastVisitTime)
    .slice(0, limit);
}

function renderSuggestions(items) {
  suggestionsEl.replaceChildren();
  suggestionItems = items;
  activeSuggestionIndex = -1;

  if (!items.length) {
    hideSuggestions();
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("button");
    row.className = "suggestion-item";
    row.type = "button";
    row.setAttribute("role", "option");

    const iconWrap = document.createElement("div");
    iconWrap.className = "suggestion-favicon-wrap";
    const img = document.createElement("img");
    img.className = "suggestion-favicon";
    img.alt = "";
    img.src = faviconURL(item.url, 32);
    img.addEventListener("error", () => img.remove());
    iconWrap.appendChild(img);

    const text = document.createElement("div");
    text.className = "suggestion-text";
    const title = document.createElement("div");
    title.className = "suggestion-title";
    title.textContent = item.title;
    const url = document.createElement("div");
    url.className = "suggestion-url";
    url.textContent = item.url;
    text.append(title, url);

    row.addEventListener("mousedown", event => event.preventDefault());
    row.addEventListener("mouseenter", () => setActiveSuggestion(index));
    row.addEventListener("click", () => { window.location.href = item.url; });
    row.append(iconWrap, text);
    suggestionsEl.appendChild(row);
  });

  suggestionsEl.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}

async function refreshSuggestions() {
  if (!getHistorySuggestionsEnabled()) {
    hideSuggestions();
    return;
  }

  const serial = ++suggestionQuerySerial;
  try {
    const items = await getHistorySuggestions(searchInput.value, getHistoryLimit());
    if (serial !== suggestionQuerySerial || document.activeElement !== searchInput) return;
    renderSuggestions(items);
  } catch {
    if (serial === suggestionQuerySerial) hideSuggestions();
  }
}

function setSearchFocusVisual(active) {
  const enabled = getSearchFocusEffect();
  document.body.classList.toggle("search-active", Boolean(active) && enabled);
}

// Only explicit interaction with the search box should start the background
// effect. Clicking elsewhere must never be able to arm or briefly flash it.
searchInput.addEventListener("pointerdown", () => {
  setSearchFocusVisual(true);
});

// Keyboard focus (for example Tab) can still use the effect, but programmatic
// auto-focus is suppressed separately.
searchInput.addEventListener("focus", () => {
  if (!suppressSearchFocusVisual) setSearchFocusVisual(true);
  refreshSuggestions();
});

// Hide the effect immediately on blur. Suggestion rows already prevent the
// input from losing focus on mousedown, so the previous delay is unnecessary
// and could make a one-frame focus race visible as a blur/zoom flash.
searchInput.addEventListener("blur", () => {
  setSearchFocusVisual(false);
  hideSuggestions();
});

// Defensive guard: when the user presses/clicks anywhere outside the search
// area, force the visual state off before the browser performs its focus
// change. This prevents an initial auto-focus race from becoming visible.
document.addEventListener("pointerdown", event => {
  if (!searchArea.contains(event.target)) {
    setSearchFocusVisual(false);
  }
}, true);

searchInput.addEventListener("input", refreshSuggestions);
searchInput.addEventListener("keydown", event => {
  if (!suggestionItems.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestionIndex < suggestionItems.length - 1 ? activeSuggestionIndex + 1 : 0);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestionIndex > 0 ? activeSuggestionIndex - 1 : suggestionItems.length - 1);
  } else if (event.key === "Enter" && activeSuggestionIndex >= 0) {
    event.preventDefault();
    window.location.href = suggestionItems[activeSuggestionIndex].url;
  } else if (event.key === "Escape") {
    hideSuggestions();
  }
});

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;
  if (looksLikeUrl(value)) {
    window.location.href = normalizeUrl(value);
    return;
  }
  const buildSearch = searchUrls[getEngine()] || searchUrls.bing;
  window.location.href = buildSearch(value);
});

function getSyncableSettings() {
  return {
    engine: getEngine(),
    autoFocus: getAutoFocus(),
    useFavicons: getUseFavicons(),
    iconBackground: getIconBackground(),
    shortcutRows: getShortcutRows(),
    shortcutSize: getShortcutSize(),
    backgroundColor: getBackgroundColor(),
    paletteColors: getPaletteColors(),
    paletteIndex: getPaletteIndex(),
    searchWidth: getSearchWidth(),
    searchFocusEffect: getSearchFocusEffect(),
    historySuggestions: getHistorySuggestionsEnabled(),
    historyLimit: getHistoryLimit()
  };
}

function getSyncableConfig() {
  return {
    shortcuts: getShortcuts(),
    ...getSyncableSettings()
  };
}

function applySyncableConfig(config) {
  if (!config || typeof config !== "object") return;

  const shortcuts = Array.isArray(config.shortcuts)
    ? config.shortcuts.slice(0, MAX_ROWS * MAX_PER_ROW)
    : getShortcuts();
  const minRows = Math.max(1, Math.ceil(shortcuts.length / MAX_PER_ROW));
  setShortcuts(shortcuts, false);

  if (["bing", "google", "baidu"].includes(config.engine)) {
    localStorage.setItem(STORAGE_KEYS.engine, config.engine);
  }
  if (typeof config.autoFocus === "boolean") {
    localStorage.setItem(STORAGE_KEYS.autoFocus, String(config.autoFocus));
  }
  if (typeof config.useFavicons === "boolean") {
    localStorage.setItem(STORAGE_KEYS.useFavicons, String(config.useFavicons));
  }
  if (typeof config.iconBackground === "boolean") {
    localStorage.setItem(STORAGE_KEYS.iconBackground, String(config.iconBackground));
  }
  if (["small", "large"].includes(config.shortcutSize)) {
    localStorage.setItem(STORAGE_KEYS.shortcutSize, config.shortcutSize);
  }

  const rows = Number(config.shortcutRows);
  if (Number.isInteger(rows)) {
    localStorage.setItem(
      STORAGE_KEYS.shortcutRows,
      String(Math.min(MAX_ROWS, Math.max(minRows, rows)))
    );
  }

  if (isHexColor(config.backgroundColor)) {
    localStorage.setItem(STORAGE_KEYS.backgroundColor, config.backgroundColor.toLowerCase());
  }

  if (
    Array.isArray(config.paletteColors) &&
    config.paletteColors.length === 6 &&
    config.paletteColors.every(isHexColor)
  ) {
    setPaletteColors(config.paletteColors.map(color => color.toLowerCase()));
  }

  if (
    Number.isInteger(Number(config.paletteIndex)) &&
    Number(config.paletteIndex) >= 0 &&
    Number(config.paletteIndex) < 6
  ) {
    setPaletteIndex(Number(config.paletteIndex));
  }

  // Background images remain local to each device.
  // If the local device is currently using an image, keep that local choice;
  // otherwise the synced background color/palette applies normally.

  localStorage.setItem(STORAGE_KEYS.iconSize, "small");

  if (["narrow", "medium", "wide"].includes(config.searchWidth)) {
    localStorage.setItem(STORAGE_KEYS.searchWidth, config.searchWidth);
  }

  if (typeof config.searchFocusEffect === "boolean") {
    localStorage.setItem(STORAGE_KEYS.searchFocusEffect, String(config.searchFocusEffect));
  }

  if (typeof config.historySuggestions === "boolean") {
    localStorage.setItem(STORAGE_KEYS.historySuggestions, String(config.historySuggestions));
  }

  if ([5, 10, 15, 20].includes(Number(config.historyLimit))) {
    localStorage.setItem(STORAGE_KEYS.historyLimit, String(Number(config.historyLimit)));
  }

  applyUiSettings();
  renderShortcuts();
  applyBackground();
  updateHistoryPermissionUi();
}

function syncPreferenceEnabled() {
  return localStorage.getItem(STORAGE_KEYS.syncPreference) === "enabled";
}

function syncPreferenceExplicitlyDisabled() {
  return localStorage.getItem(STORAGE_KEYS.syncPreference) === "disabled";
}

function updateSyncUi(message = null) {
  edgeSync.checked = syncPreferenceEnabled();
  if (message) {
    syncStatus.textContent = message;
  } else {
    syncStatus.textContent = syncPreferenceEnabled()
      ? "已开启：除背景图片和设备权限外的配置会通过 Edge 账户存储同步"
      : "未开启";
  }
}

function syncShortcutChunkKey(index) {
  return `${SYNC_SHORTCUT_PREFIX}${index}`;
}

async function getRemoteSyncPayload() {
  try {
    const keys = [
      SYNC_META_KEY,
      SYNC_SETTINGS_KEY,
      LEGACY_SYNC_KEY,
      ...Array.from({ length: MAX_ROWS }, (_, index) => syncShortcutChunkKey(index))
    ];
    const result = await chrome.storage.sync.get(keys);

    const meta = result[SYNC_META_KEY];
    const settings = result[SYNC_SETTINGS_KEY];

    if (meta?.version === 2 && settings && typeof settings === "object") {
      const chunkCount = Math.min(
        MAX_ROWS,
        Math.max(0, Number(meta.shortcutChunkCount) || 0)
      );

      const shortcuts = [];
      for (let index = 0; index < chunkCount; index += 1) {
        const chunk = result[syncShortcutChunkKey(index)];
        if (Array.isArray(chunk)) shortcuts.push(...chunk);
      }

      return {
        updatedAt: Number(meta.updatedAt) || 0,
        config: {
          ...settings,
          shortcuts: shortcuts.slice(0, MAX_ROWS * MAX_PER_ROW)
        }
      };
    }

    const legacy = result[LEGACY_SYNC_KEY];
    if (legacy?.config) return legacy;

    return null;
  } catch {
    return null;
  }
}

async function pushSyncNow() {
  if (!syncPreferenceEnabled() || applyingRemoteSync) return;

  const shortcuts = getShortcuts();
  const chunks = [];
  for (let index = 0; index < shortcuts.length; index += SYNC_SHORTCUT_CHUNK_SIZE) {
    chunks.push(shortcuts.slice(index, index + SYNC_SHORTCUT_CHUNK_SIZE));
  }

  const updatedAt = Date.now();
  const writes = {
    [SYNC_SETTINGS_KEY]: getSyncableSettings()
  };

  for (let index = 0; index < chunks.length; index += 1) {
    writes[syncShortcutChunkKey(index)] = chunks[index];
  }

  try {
    await chrome.storage.sync.set(writes);

    const obsoleteKeys = [];
    for (let index = chunks.length; index < MAX_ROWS; index += 1) {
      obsoleteKeys.push(syncShortcutChunkKey(index));
    }
    if (obsoleteKeys.length) {
      await chrome.storage.sync.remove(obsoleteKeys);
    }

    // Write metadata last so other devices read a complete settings/chunk set.
    await chrome.storage.sync.set({
      [SYNC_META_KEY]: {
        version: 2,
        updatedAt,
        shortcutChunkCount: chunks.length
      }
    });

    // Remove the old single-item payload once v2 has been written successfully.
    try { await chrome.storage.sync.remove(LEGACY_SYNC_KEY); } catch {}

    updateSyncUi("已同步到 Edge 账户存储");
  } catch (error) {
    updateSyncUi(`同步失败：${error?.message || "未知错误"}`);
  }
}

function queueSync() {
  if (!syncPreferenceEnabled() || applyingRemoteSync) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushSyncNow, 450);
}

async function enableEdgeSync() {
  const remote = await getRemoteSyncPayload();

  if (remote?.config) {
    const useRemote = window.confirm(
      "检测到已有云端配置。\n\n确定：用云端配置覆盖当前本机设置\n取消：用当前本机设置覆盖云端配置"
    );

    localStorage.setItem(STORAGE_KEYS.syncPreference, "enabled");

    if (useRemote) {
      applyingRemoteSync = true;
      applySyncableConfig(remote.config);
      applyingRemoteSync = false;
      updateSyncUi("已读取云端配置");
    } else {
      await pushSyncNow();
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.syncPreference, "enabled");
    await pushSyncNow();
  }

  updateSyncUi();
}

function disableEdgeSync() {
  localStorage.setItem(STORAGE_KEYS.syncPreference, "disabled");
  updateSyncUi("已停止本机同步；云端已有配置不会被删除");
}

async function bootstrapSync() {
  updateSyncUi();

  if (syncPreferenceExplicitlyDisabled()) return;

  const remote = await getRemoteSyncPayload();

  // On a fresh installation of the same store extension, automatically adopt
  // an existing synced profile. A device that was explicitly disabled stays off.
  if (!syncPreferenceEnabled() && remote?.config) {
    localStorage.setItem(STORAGE_KEYS.syncPreference, "enabled");
  }

  if (!syncPreferenceEnabled()) return;

  if (!remote?.config) {
    await pushSyncNow();
    return;
  }

  applyingRemoteSync = true;
  applySyncableConfig(remote.config);
  applyingRemoteSync = false;
  updateSyncUi("已从 Edge 账户存储读取配置");
}

let remoteSyncRefreshTimer = null;
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !syncPreferenceEnabled()) return;

  const relevant = Object.keys(changes).some(
    key =>
      key === SYNC_META_KEY ||
      key === SYNC_SETTINGS_KEY ||
      key === LEGACY_SYNC_KEY ||
      key.startsWith(SYNC_SHORTCUT_PREFIX)
  );

  if (!relevant) return;

  clearTimeout(remoteSyncRefreshTimer);
  remoteSyncRefreshTimer = setTimeout(async () => {
    const remote = await getRemoteSyncPayload();
    if (!remote?.config) return;

    applyingRemoteSync = true;
    applySyncableConfig(remote.config);
    applyingRemoteSync = false;
    updateSyncUi("检测到其他设备的同步更新");
  }, 180);
});

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function getExportConfig() {
  return {
    shortcuts: getShortcuts(),
    engine: getEngine(),
    autoFocus: getAutoFocus(),
    useFavicons: getUseFavicons(),
    iconBackground: getIconBackground(),
    shortcutRows: getShortcutRows(),
    shortcutSize: getShortcutSize(),
    backgroundColor: getBackgroundColor(),
    backgroundMode: getBackgroundMode(),
    paletteColors: getPaletteColors(),
    paletteIndex: getPaletteIndex(),
    searchWidth: getSearchWidth(),
    searchFocusEffect: getSearchFocusEffect(),
    historySuggestions: getHistorySuggestionsEnabled(),
    historyLimit: getHistoryLimit()
  };
}

async function exportBackup() {
  let backgroundImage = null;
  try {
    const blob = await getBackgroundImageBlob();
    if (blob) {
      backgroundImage = {
        name: blob.name || "background-image",
        type: blob.type || "application/octet-stream",
        dataUrl: await blobToDataUrl(blob)
      };
    }
  } catch {}

  const backup = {
    app: BACKUP_APP,
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    config: getExportConfig(),
    backgroundImage
  };

  const data = JSON.stringify(backup, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  anchor.href = url;
  anchor.download = `MinimalNewTab-backup-${stamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function importBackupFile(file) {
  const text = await file.text();
  const backup = JSON.parse(text);
  if (backup?.app !== BACKUP_APP || !backup.config) throw new Error("不是有效的 Minimal New Tab 备份文件");

  const config = backup.config;
  const shortcuts = Array.isArray(config.shortcuts) ? config.shortcuts : [];
  if (shortcuts.length > MAX_ROWS * MAX_PER_ROW) throw new Error("备份中的快捷方式超过 24 个");
  const minRows = Math.max(1, Math.ceil(shortcuts.length / MAX_PER_ROW));

  setShortcuts(shortcuts, false);
  if (["bing", "google", "baidu"].includes(config.engine)) localStorage.setItem(STORAGE_KEYS.engine, config.engine);
  if (typeof config.autoFocus === "boolean") localStorage.setItem(STORAGE_KEYS.autoFocus, String(config.autoFocus));
  if (typeof config.useFavicons === "boolean") localStorage.setItem(STORAGE_KEYS.useFavicons, String(config.useFavicons));
  if (typeof config.iconBackground === "boolean") localStorage.setItem(STORAGE_KEYS.iconBackground, String(config.iconBackground));
  if (["small", "large"].includes(config.shortcutSize)) localStorage.setItem(STORAGE_KEYS.shortcutSize, config.shortcutSize);

  const rows = Number(config.shortcutRows);
  localStorage.setItem(STORAGE_KEYS.shortcutRows, String(Number.isInteger(rows) ? Math.min(MAX_ROWS, Math.max(minRows, rows)) : minRows));

  if (/^#[0-9a-fA-F]{6}$/.test(config.backgroundColor || "")) localStorage.setItem(STORAGE_KEYS.backgroundColor, config.backgroundColor);

  if (Array.isArray(config.paletteColors) && config.paletteColors.length === 6 && config.paletteColors.every(isHexColor)) {
    setPaletteColors(config.paletteColors.map(color => color.toLowerCase()));
  }
  if (Number.isInteger(Number(config.paletteIndex)) && Number(config.paletteIndex) >= 0 && Number(config.paletteIndex) < 6) {
    setPaletteIndex(Number(config.paletteIndex));
  }

  localStorage.setItem(STORAGE_KEYS.iconSize, "small");
  if (["narrow", "medium", "wide"].includes(config.searchWidth)) localStorage.setItem(STORAGE_KEYS.searchWidth, config.searchWidth);
  if (typeof config.searchFocusEffect === "boolean") localStorage.setItem(STORAGE_KEYS.searchFocusEffect, String(config.searchFocusEffect));
  if (typeof config.historySuggestions === "boolean") localStorage.setItem(STORAGE_KEYS.historySuggestions, String(config.historySuggestions));
  if ([5, 10, 15, 20].includes(Number(config.historyLimit))) localStorage.setItem(STORAGE_KEYS.historyLimit, String(Number(config.historyLimit)));

  if (backup.backgroundImage?.dataUrl) {
    const blob = await dataUrlToBlob(backup.backgroundImage.dataUrl);
    const named = new File([blob], backup.backgroundImage.name || "background-image", { type: backup.backgroundImage.type || blob.type });
    await putBackgroundImage(named);
    localStorage.setItem(STORAGE_KEYS.backgroundMode, config.backgroundMode === "image" ? "image" : "color");
  } else {
    await deleteBackgroundImage();
    localStorage.setItem(STORAGE_KEYS.backgroundMode, "color");
  }

  applyUiSettings();
  renderShortcuts();
  await applyBackground();
  queueSync();
}

settingsButton.addEventListener("click", async () => {
  searchEngine.value = getEngine();
  autoFocus.checked = getAutoFocus();
  useFavicons.checked = getUseFavicons();
  iconBackground.checked = getIconBackground();
  shortcutRows.value = String(getShortcutRows());
  shortcutSize.value = getShortcutSize();
  searchWidth.value = getSearchWidth();
  searchFocusEffect.checked = getSearchFocusEffect();
  historySuggestionLimit.value = String(getHistoryLimit());
  historySuggestions.checked = getHistorySuggestionsEnabled();
  await updateHistoryPermissionUi();
  updateColorControls(getBackgroundColor());
  updateSyncUi();
  settingsDialog.showModal();
});

searchEngine.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.engine, searchEngine.value);
  queueSync();
});

autoFocus.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.autoFocus, String(autoFocus.checked));
  queueSync();
});

useFavicons.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.useFavicons, String(useFavicons.checked));
  renderShortcuts();
  queueSync();
});

iconBackground.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.iconBackground, String(iconBackground.checked));
  applyUiSettings();
  queueSync();
});


searchWidth.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.searchWidth, searchWidth.value);
  applyUiSettings();
  queueSync();
});

searchFocusEffect.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.searchFocusEffect, String(searchFocusEffect.checked));
  applyUiSettings();
  if (searchFocusEffect.checked && document.activeElement === searchInput) {
    setSearchFocusVisual(true);
  }
  queueSync();
});

shortcutRows.addEventListener("change", () => {
  const requested = Number(shortcutRows.value);
  const currentCount = getShortcuts().length;
  const requiredRows = Math.max(1, Math.ceil(currentCount / MAX_PER_ROW));
  if (requested < requiredRows) {
    window.alert(`你现在有 ${currentCount} 个快捷方式，至少需要 ${requiredRows} 行。`);
    shortcutRows.value = String(getShortcutRows());
    return;
  }
  localStorage.setItem(STORAGE_KEYS.shortcutRows, String(requested));
  renderShortcuts();
  queueSync();
});

shortcutSize.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.shortcutSize, shortcutSize.value);
  applyUiSettings();
  queueSync();
});

historySuggestionLimit.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.historyLimit, historySuggestionLimit.value);
  if (document.activeElement === searchInput) refreshSuggestions();
  queueSync();
});

historySuggestions.addEventListener("change", async () => {
  if (historySuggestions.checked) {
    const granted = await chrome.permissions.request({ permissions: ["history"] });
    if (!granted) {
      historySuggestions.checked = false;
      localStorage.setItem(STORAGE_KEYS.historySuggestions, "false");
      queueSync();
      await updateHistoryPermissionUi();
      return;
    }
    localStorage.setItem(STORAGE_KEYS.historySuggestions, "true");
  } else {
    localStorage.setItem(STORAGE_KEYS.historySuggestions, "false");
    hideSuggestions();
    try { await chrome.permissions.remove({ permissions: ["history"] }); } catch {}
  }

  queueSync();
  await updateHistoryPermissionUi();
});

grantHistoryPermission.addEventListener("click", async () => {
  const granted = await chrome.permissions.request({ permissions: ["history"] });
  if (granted) {
    localStorage.setItem(STORAGE_KEYS.historySuggestions, "true");
    historySuggestions.checked = true;
    if (document.activeElement === searchInput) refreshSuggestions();
  }
  await updateHistoryPermissionUi();
});

colorPresets.addEventListener("click", event => {
  const button = event.target.closest(".color-swatch");
  if (!button) return;

  const index = Number(button.dataset.slot);
  if (!Number.isInteger(index) || index < 0 || index > 5) return;

  const palette = getPaletteColors();
  const color = palette[index];

  setPaletteIndex(index);
  localStorage.setItem(STORAGE_KEYS.backgroundColor, color);
  localStorage.setItem(STORAGE_KEYS.backgroundMode, "color");
  applyBackground();
  queueSync();
});

customColor.addEventListener("input", () => {
  const color = customColor.value.toLowerCase();
  const index = getPaletteIndex();
  const palette = getPaletteColors();

  palette[index] = color;
  setPaletteColors(palette);

  customColorValue.textContent = color.toUpperCase();
  localStorage.setItem(STORAGE_KEYS.backgroundColor, color);
  localStorage.setItem(STORAGE_KEYS.backgroundMode, "color");

  backgroundLayer.style.backgroundColor = color;
  backgroundLayer.style.backgroundImage = "";
  backgroundLayer.classList.remove("with-image");
  applyPageContrast(color, false);
  updateColorControls(color);
  queueSync();
});

chooseBackgroundImage.addEventListener("click", () => backgroundImageInput.click());
backgroundImageInput.addEventListener("change", async () => {
  const file = backgroundImageInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    window.alert("请选择图片文件。");
    backgroundImageInput.value = "";
    return;
  }
  try {
    await putBackgroundImage(file);
    localStorage.setItem(STORAGE_KEYS.backgroundMode, "image");
    await applyBackground();
  } catch {
    window.alert("背景图片保存失败，请换一张图片后重试。");
  } finally {
    backgroundImageInput.value = "";
  }
});

removeBackgroundImage.addEventListener("click", async () => {
  if (!hasStoredBackgroundImage) return;
  try {
    await deleteBackgroundImage();
    localStorage.setItem(STORAGE_KEYS.backgroundMode, "color");
    await applyBackground();
  } catch {
    window.alert("移除背景图片失败，请重试。");
  }
});

exportConfig.addEventListener("click", async () => {
  try { await exportBackup(); }
  catch (error) { window.alert(`导出失败：${error?.message || "未知错误"}`); }
});

importConfig.addEventListener("click", () => importConfigInput.click());
importConfigInput.addEventListener("change", async () => {
  const file = importConfigInput.files?.[0];
  if (!file) return;
  try {
    await importBackupFile(file);
    window.alert("导入完成。浏览历史权限不会从备份中自动恢复，如需要请在设置中重新开启。 ");
  } catch (error) {
    window.alert(`导入失败：${error?.message || "文件无效"}`);
  } finally {
    importConfigInput.value = "";
  }
});

edgeSync.addEventListener("change", async () => {
  edgeSync.disabled = true;
  try {
    if (edgeSync.checked) await enableEdgeSync();
    else disableEdgeSync();
  } finally {
    edgeSync.disabled = false;
  }
});

closeSettings.addEventListener("click", () => settingsDialog.close());

settingsDialog.addEventListener("click", event => {
  if (event.target !== settingsDialog) return;

  const rect = settingsDialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (clickedOutside) settingsDialog.close();
});

resetData.addEventListener("click", async () => {
  const confirmed = window.confirm("确定要清除所有快捷方式、设置和本地背景图片吗？此操作无法撤销。\n\nEdge 云端已有同步副本不会自动删除。");
  if (!confirmed) return;

  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  try { await deleteBackgroundImage(); } catch {}
  try { await chrome.permissions.remove({ permissions: ["history"] }); } catch {}

  applyUiSettings();
  renderShortcuts();
  searchEngine.value = DEFAULTS.engine;
  autoFocus.checked = DEFAULTS.autoFocus;
  useFavicons.checked = DEFAULTS.useFavicons;
  iconBackground.checked = DEFAULTS.iconBackground;
  shortcutRows.value = String(DEFAULTS.shortcutRows);
  shortcutSize.value = DEFAULTS.shortcutSize;
  searchWidth.value = DEFAULTS.searchWidth;
  searchFocusEffect.checked = DEFAULTS.searchFocusEffect;
  historySuggestionLimit.value = String(DEFAULTS.historyLimit);
  historySuggestions.checked = false;
  await updateHistoryPermissionUi();
  updateSyncUi();
  await applyBackground();
});

applyUiSettings();
renderShortcuts();
applyBackground();
updateHistoryPermissionUi();
bootstrapSync();

if (getAutoFocus()) {
  // Focus synchronously during initialization instead of using setTimeout().
  // The delayed focus could race with the user's first click on the page:
  // the input could briefly gain focus (showing the caret) and immediately
  // lose it again, making the blur/zoom transition flash once.
  suppressSearchFocusVisual = true;
  try {
    searchInput.focus({ preventScroll: true });
  } catch {
    searchInput.focus();
  }

  // Keep suppression active through the next animation frame as an additional
  // guard against any browser-delayed focus event.
  requestAnimationFrame(() => {
    suppressSearchFocusVisual = false;
    setSearchFocusVisual(false);
  });
}
