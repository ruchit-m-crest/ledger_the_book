const STORAGE_KEY = 'ledger.categoryPrefs.v1';

// Built-in categories. Each gets its own default colour so tiles are
// distinguishable at a glance; users can override any of these from Settings.
const DEFAULT_CATEGORIES = {
  opening: { label: 'Opening Balance', short: 'Opening', letter: 'OB', color: '#5b6472' },
  weekly: { label: 'Weekly Spend', short: 'Weekly', letter: 'W', color: '#3062d6' },
  shopping: { label: 'Shopping', short: 'Shopping', letter: 'S', color: '#c93f8c' },
  sip: { label: 'SIP / Invest', short: 'SIP', letter: 'I', color: '#1f9e6b' },
  bills: { label: 'Bills', short: 'Bills', letter: 'B', color: '#c9720f' },
  food: { label: 'Food', short: 'Food', letter: 'F', color: '#d64545' },
  other: { label: 'Other', short: 'Other', letter: 'O', color: '#6b7280' },
};

// Categories that exist to make the app work (opening balance) or as a
// guaranteed fallback (other) — they can be recoloured but not removed.
const PROTECTED = ['opening', 'other'];

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { colors: {}, custom: [], removed: [] };
    const parsed = JSON.parse(raw);
    return {
      colors: parsed.colors && typeof parsed.colors === 'object' ? parsed.colors : {},
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
    };
  } catch {
    return { colors: {}, custom: [], removed: [] };
  }
}

function savePrefs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (private browsing, quota) — edits just won't persist.
  }
}

let prefs = loadPrefs();

function slugify(label) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'category';
}

function uniqueId(label) {
  const base = slugify(label);
  const taken = new Set([...Object.keys(DEFAULT_CATEGORIES), ...prefs.custom.map((c) => c.id)]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// Full merged category map: defaults (minus removed, plus colour overrides) + custom ones.
export function getCategoryList() {
  const list = [];
  for (const [id, meta] of Object.entries(DEFAULT_CATEGORIES)) {
    if (prefs.removed.includes(id)) continue;
    list.push({ id, ...meta, color: prefs.colors[id] || meta.color, removable: !PROTECTED.includes(id) });
  }
  for (const c of prefs.custom) {
    list.push({ ...c, color: prefs.colors[c.id] || c.color, removable: true, custom: true });
  }
  return list;
}

// Categories a user can pick when adding a transaction (opening balance is system-only).
export function getPickableCategories() {
  return getCategoryList()
    .filter((c) => c.id !== 'opening')
    .map((c) => c.id);
}

export function categoryMeta(catId) {
  const found = getCategoryList().find((c) => c.id === catId);
  if (found) return found;
  return DEFAULT_CATEGORIES[catId] ? { id: catId, ...DEFAULT_CATEGORIES[catId] } : { id: catId, ...DEFAULT_CATEGORIES.other };
}

export function setCategoryColor(id, color) {
  prefs.colors[id] = color;
  savePrefs();
}

export function addCategory({ label, letter, color }) {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const id = uniqueId(trimmed);
  const badge = (letter || trimmed).trim().slice(0, 2).toUpperCase() || 'C';
  prefs.custom.push({ id, label: trimmed, short: trimmed, letter: badge, color });
  savePrefs();
  return id;
}

export function removeCategory(id) {
  if (PROTECTED.includes(id)) return;
  if (DEFAULT_CATEGORIES[id]) {
    prefs.removed = [...new Set([...prefs.removed, id])];
  } else {
    prefs.custom = prefs.custom.filter((c) => c.id !== id);
  }
  delete prefs.colors[id];
  savePrefs();
}

export function resetCategories() {
  prefs = { colors: {}, custom: [], removed: [] };
  savePrefs();
}
