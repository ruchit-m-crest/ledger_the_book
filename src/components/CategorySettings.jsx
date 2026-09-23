import { useState } from 'react';
import { getCategoryList, setCategoryColor, addCategory, removeCategory, resetCategories } from '../lib/categories';
import { ChevronLeftIcon, TrashIcon } from './Icons';

const PRESET_COLORS = [
  '#3062d6', '#1f9e6b', '#c93f8c', '#c9720f', '#d64545', '#6b7280',
  '#7c3aed', '#0891b2', '#ca8a04', '#059669', '#dc2626', '#475569',
];

export default function CategorySettings({ onBack }) {
  const [categories, setCategories] = useState(() => getCategoryList());
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLetter, setNewLetter] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function refresh() {
    setCategories(getCategoryList());
  }

  function handleColorChange(id, color) {
    setCategoryColor(id, color);
    refresh();
  }

  function handleRemove(id) {
    removeCategory(id);
    refresh();
  }

  function handleAdd() {
    if (!newLabel.trim()) return;
    addCategory({ label: newLabel, letter: newLetter, color: newColor });
    setNewLabel('');
    setNewLetter('');
    setAdding(false);
    refresh();
  }

  return (
    <div className="screen">
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '20px 4px 0', margin: 0 }}
      >
        <ChevronLeftIcon />
        <span style={{ color: 'var(--blue)', fontSize: 17 }}>Profile</span>
      </button>

      <div className="large-title" style={{ padding: '6px 4px 14px' }}>Categories</div>

      <div className="sec-label">Colours & categories</div>
      <div className="card">
        {categories.map((c) => (
          <div className="row" key={c.id}>
            <div className="tile" style={{ background: c.color }}>
              {c.letter}
            </div>
            <span style={{ flex: 1, fontSize: 15.5 }}>{c.label}</span>
            <label className="color-swatch" style={{ background: c.color }}>
              <input type="color" value={c.color} onChange={(e) => handleColorChange(c.id, e.target.value)} />
            </label>
            {c.removable ? (
              <button
                onClick={() => handleRemove(c.id)}
                aria-label={`Remove ${c.label}`}
                style={{ background: 'none', border: 'none', padding: 6, margin: '0 -6px 0 2px' }}
              >
                <TrashIcon />
              </button>
            ) : (
              <span style={{ width: 29 }} />
            )}
          </div>
        ))}
      </div>

      <div className="sec-label" style={{ marginTop: 20 }}>
        Add category
      </div>
      <div className="card" style={{ padding: 16 }}>
        {!adding ? (
          <button className="primary-btn" style={{ marginTop: 0 }} onClick={() => setAdding(true)}>
            + Add Category
          </button>
        ) : (
          <>
            <input
              className="text-field"
              style={{ marginTop: 0 }}
              placeholder="Category name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              maxLength={24}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
              <input
                className="text-field"
                style={{ marginTop: 0, width: 64, textAlign: 'center', textTransform: 'uppercase' }}
                placeholder="Badge"
                value={newLetter}
                onChange={(e) => setNewLetter(e.target.value.toUpperCase())}
                maxLength={2}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    aria-label={`Choose ${color}`}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: color,
                      border: newColor === color ? '2px solid var(--label)' : '2px solid transparent',
                      padding: 0,
                    }}
                  />
                ))}
                <label className="color-swatch" style={{ background: newColor, width: 24, height: 24 }}>
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                className="primary-btn"
                style={{ marginTop: 0, background: 'var(--seg-track)', color: 'var(--label)' }}
                onClick={() => {
                  setAdding(false);
                  setNewLabel('');
                  setNewLetter('');
                }}
              >
                Cancel
              </button>
              <button className="primary-btn" style={{ marginTop: 0 }} onClick={handleAdd} disabled={!newLabel.trim()}>
                Add
              </button>
            </div>
          </>
        )}
      </div>

      <button
        className="link-btn"
        style={{ marginTop: 8 }}
        onClick={() => {
          resetCategories();
          refresh();
        }}
      >
        Reset colours & categories to default
      </button>
    </div>
  );
}
