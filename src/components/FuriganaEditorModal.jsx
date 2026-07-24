import React, { useState } from 'react';
import { X, Check, Edit3 } from 'lucide-react';

export default function FuriganaEditorModal({ tokens, onSave, onClose }) {
  const [editableTokens, setEditableTokens] = useState(
    tokens.map(t => ({ ...t }))
  );

  const handleReadingChange = (id, newReading) => {
    setEditableTokens(prev =>
      prev.map(t => (t.id === id ? { ...t, reading: newReading } : t))
    );
  };

  const handleSave = () => {
    onSave(editableTokens);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <Edit3 size={20} color="var(--accent-pink)" />
            <span>Furigana Readings Editor</span>
          </h3>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Adjust the Hiragana/Katakana reading for each word or Kanji segment below:
        </p>

        <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
          {editableTokens.map(token => (
            <div 
              key={token.id} 
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.6rem 0.8rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: token.isKanji ? 'var(--accent-pink)' : 'var(--text-main)' }}>
                  {token.surface}
                </span>
                {token.isKanji && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginLeft: '0.5rem' }}>
                    [Kanji]
                  </span>
                )}
              </div>

              <input
                type="text"
                className="form-control"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.95rem' }}
                value={token.reading}
                onChange={e => handleReadingChange(token.id, e.target.value)}
                placeholder="Hiragana / Katakana reading"
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={18} />
            <span>Apply Furigana Readings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
