import React from 'react';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { tts } from '../utils/ttsEngine';

export default function WordModal({ word, onClose }) {
  if (!word) return null;

  const handleSpeak = () => {
    tts.speak(word.surface);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--ruby-color)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {word.reading}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)' }}>
            {word.surface}
          </div>
          {word.romaji && (
            <div style={{ fontSize: '1rem', color: 'var(--accent-blue)', fontStyle: 'italic' }}>
              {word.romaji}
            </div>
          )}
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.25)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Token Detail
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <strong>Type:</strong> {word.isKanji ? 'Kanji Word' : 'Kana / Grammar Particle'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleSpeak} style={{ width: '100%' }}>
            <Volume2 size={20} />
            <span>Pronounce Word</span>
          </button>
        </div>
      </div>
    </div>
  );
}
