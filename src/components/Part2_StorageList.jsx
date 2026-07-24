import React, { useState } from 'react';
import { 
  Library, Search, Star, Trash2, BookOpen, Download, Upload, Plus, Tag, Filter 
} from 'lucide-react';

export default function Part2_StorageList({ 
  items, 
  onSelectReaderItem, 
  onToggleFavorite, 
  onDeleteItem,
  onImportItems,
  onOpenNewInput 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Extract unique categories
  const categories = ['All', ...new Set(items.map(i => i.category || 'General'))];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.japaneseText || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.englishTranslation || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || (item.category || 'General') === selectedCategory;
    const matchesFavorite = !onlyFavorites || item.favorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  // Export items to JSON file
  const handleExport = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese_passages_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import items from JSON file
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          onImportItems(imported);
          alert(`Successfully imported ${imported.length} Japanese passages!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem' }}>
            <Library size={22} color="var(--accent-pink)" />
            <span>Saved Japanese Passages Library</span>
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onOpenNewInput}>
              <Plus size={16} />
              <span>Add New Text</span>
            </button>
            <button className="btn btn-secondary" onClick={handleExport} title="Backup passages to JSON">
              <Download size={16} />
              <span>Export</span>
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }} title="Import passages from JSON">
              <Upload size={16} />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search Japanese text, title, or translation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <button
            className={`btn ${onlyFavorites ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            title="Filter starred items"
          >
            <Star size={16} fill={onlyFavorites ? 'white' : 'none'} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Grid of Passage Cards */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Search size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3>No Passages Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Try adjusting your search filter or add a new Japanese text in Part 1.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.title}
                  </h3>
                  <button 
                    onClick={() => onToggleFavorite(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={18} color="var(--accent-amber)" fill={item.favorite ? 'var(--accent-amber)' : 'none'} />
                  </button>
                </div>

                <div style={{ fontSize: '1.15rem', color: 'var(--accent-pink)', marginBottom: '0.6rem', lineHeight: '1.5', fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {item.japaneseText && item.japaneseText.length > 50 
                    ? item.japaneseText.substr(0, 50) + '...' 
                    : item.japaneseText}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{item.englishTranslation && item.englishTranslation.length > 70
                    ? item.englishTranslation.substr(0, 70) + '...'
                    : item.englishTranslation}"
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    {item.category || 'General'}
                  </span>
                  {(item.tags || []).map((t, idx) => (
                    <span key={idx} className="tag-badge">#{t}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => onSelectReaderItem(item)}
                  >
                    <BookOpen size={16} />
                    <span>Open in Reader</span>
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.7rem', color: '#ef4444' }}
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete passage"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
