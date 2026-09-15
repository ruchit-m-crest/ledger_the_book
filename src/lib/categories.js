export const TILE = 'oklch(24% 0.007 265)';

export const CATEGORIES = {
  opening: { label: 'Opening Balance', short: 'Opening', letter: 'OB' },
  weekly: { label: 'Weekly Spend', short: 'Weekly', letter: 'W' },
  shopping: { label: 'Shopping', short: 'Shopping', letter: 'S' },
  sip: { label: 'SIP / Invest', short: 'SIP', letter: 'I' },
  bills: { label: 'Bills', short: 'Bills', letter: 'B' },
  food: { label: 'Food', short: 'Food', letter: 'F' },
  other: { label: 'Other', short: 'Other', letter: 'O' },
};

// Categories a user can pick when adding a transaction (opening balance is system-only).
export const PICKABLE_CATEGORIES = ['weekly', 'shopping', 'sip', 'bills', 'food', 'other'];

export function categoryMeta(catId) {
  return CATEGORIES[catId] || CATEGORIES.other;
}
