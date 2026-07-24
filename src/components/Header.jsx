import React from 'react';
import { BookOpen, Moon, Sun, Sparkles, Volume2 } from 'lucide-react';

export default function Header({ theme, toggleTheme, itemCount }) {
  return (
    <header className="app-header glass-panel">
      <div className="logo-group">
        <div className="logo-badge">
          <span>日</span>
        </div>
        <div>
          <div className="logo-title">日本語 Learner Pro</div>
          <div className="logo-subtitle">Furigana • Reader • Text-to-Speech</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="tag-badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          <BookOpen size={14} />
          <span>{itemCount} Saved Texts</span>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
        </button>
      </div>
    </header>
  );
}
