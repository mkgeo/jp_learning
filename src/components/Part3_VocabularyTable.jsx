import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Volume2, Sparkles, Filter, EyeOff, Eye, 
  ArrowRight, Lightbulb, RotateCcw, Shuffle, CheckCircle, 
  ChevronLeft, ChevronRight, LayoutGrid, List, Layers, VolumeX
} from 'lucide-react';
import { N5_VOCABULARY_DATA, CATEGORY_LIST } from '../data/n5VocabularyData';
import { tts } from '../utils/ttsEngine';

export default function Part3_VocabularyTable({ onOpenReaderWithText }) {
  // View mode: 'flashcard' | 'table' | 'grid'
  const [viewMode, setViewMode] = useState('flashcard');
  
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideKana, setHideKana] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Flashcard Mode States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());
  const [cardDeck, setCardDeck] = useState(N5_VOCABULARY_DATA);

  // Filter items based on category and search query
  const filteredItems = cardDeck.filter(item => {
    const matchesCategory = selectedCategory === 0 || item.categoryId === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.kanji.toLowerCase().includes(query) ||
      item.kana.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Reset card index when category or filter changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, searchQuery]);

  // Current active card
  const currentCard = filteredItems[currentCardIndex] || filteredItems[0];

  // Play audio speech using Web Speech API with primary Kana (100% accurate pronunciation)
  const handleSpeak = (item, e) => {
    if (e) e.stopPropagation();
    if (!item) return;
    const primaryKana = item.kana ? item.kana.split('/')[0].trim() : item.kanji;
    tts.speak(primaryKana, 1.0);
  };

  // Process word or example in Reader
  const handleProcessInReader = (text, title, itemObj, e) => {
    if (e) e.stopPropagation();
    if (onOpenReaderWithText) {
      onOpenReaderWithText(text, title, itemObj);
    }
  };

  // Next Card
  const handleNextCard = () => {
    if (filteredItems.length === 0) return;
    setIsFlipped(false);
    const nextIdx = (currentCardIndex + 1) % filteredItems.length;
    setCurrentCardIndex(nextIdx);
    if (autoPlayAudio && filteredItems[nextIdx]) {
      setTimeout(() => handleSpeak(filteredItems[nextIdx]), 250);
    }
  };

  // Previous Card
  const handlePrevCard = () => {
    if (filteredItems.length === 0) return;
    setIsFlipped(false);
    const prevIdx = (currentCardIndex - 1 + filteredItems.length) % filteredItems.length;
    setCurrentCardIndex(prevIdx);
    if (autoPlayAudio && filteredItems[prevIdx]) {
      setTimeout(() => handleSpeak(filteredItems[prevIdx]), 250);
    }
  };

  // Shuffle deck
  const handleShuffleDeck = () => {
    const shuffled = [...cardDeck].sort(() => Math.random() - 0.5);
    setCardDeck(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Toggle Mastered status
  const handleToggleMastered = (id, e) => {
    if (e) e.stopPropagation();
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // remove from review if mastered
        setReviewIds(r => {
          const nr = new Set(r);
          nr.delete(id);
          return nr;
        });
      }
      return next;
    });
  };

  // Toggle Need Review status
  const handleToggleReview = (id, e) => {
    if (e) e.stopPropagation();
    setReviewIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // remove from mastered if needing review
        setMasteredIds(m => {
          const nm = new Set(m);
          nm.delete(id);
          return nm;
        });
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Stats */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <BookOpen size={24} color="var(--accent-pink)" />
              <span>JLPT N5 800 核心單字終極寶典</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              全面覆蓋 JLPT N5 檢定全量 662 核心單字 ｜ 支援單字卡 (Flashcards) 與清單列表模式
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn ${viewMode === 'flashcard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => setViewMode('flashcard')}
            >
              <Layers size={16} />
              <span>📇 單字卡模式</span>
            </button>

            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
              <span>🎴 卡片牆</span>
            </button>

            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
              <span>📋 表格清單</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: showTips ? '1.25rem' : '0'
        }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-pink)' }}>662 個</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>總收錄核心單字</div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>15 大</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>主題模組分類</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{masteredIds.size} 個</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>已熟記單字</div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{reviewIds.size} 個</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>待複習單字</div>
          </div>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <Filter size={16} color="var(--accent-pink)" />
          <span>主題分類篩選 (Filter by Category):</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CATEGORY_LIST.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 0 
              ? N5_VOCABULARY_DATA.length 
              : N5_VOCABULARY_DATA.filter(i => i.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{ 
                  background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '10px',
                  fontSize: '0.75rem'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. FLASHCARD MODE (單字卡學習模式) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'flashcard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
          {/* Card Control Bar */}
          <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>卡片進度：</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
                {filteredItems.length > 0 ? currentCardIndex + 1 : 0}
              </strong>
              <span>/ {filteredItems.length}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Auto speak audio toggle */}
              <button
                className={`btn ${autoPlayAudio ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="切換卡片時自動播放語音"
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
              >
                {autoPlayAudio ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{autoPlayAudio ? '自動發音: 開' : '自動發音: 關'}</span>
              </button>

              {/* Shuffle deck */}
              <button
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="隨機洗牌卡片"
                onClick={handleShuffleDeck}
              >
                <Shuffle size={15} />
                <span>隨機洗牌</span>
              </button>
            </div>
          </div>

          {/* Flashcard Component */}
          {currentCard ? (
            <div
              style={{
                width: '100%',
                maxWidth: '750px',
                minHeight: '380px',
                perspective: '1000px',
                cursor: 'pointer'
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div style={{
                width: '100%',
                minHeight: '380px',
                borderRadius: 'var(--radius-lg)',
                background: isFlipped 
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))' 
                  : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                border: isFlipped 
                  ? '2px solid var(--accent-pink)' 
                  : '2px solid var(--border-color)',
                boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.4), var(--shadow-glow)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {/* Top Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: 'var(--accent-pink)', 
                    background: 'rgba(236, 72, 153, 0.15)', 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: '15px' 
                  }}>
                    {currentCard.icon} {currentCard.categoryName}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Speak Button */}
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title="播放發音"
                      onClick={(e) => handleSpeak(currentCard, e)}
                    >
                      <Volume2 size={18} color="var(--accent-pink)" />
                    </button>

                    {/* Mastered Button */}
                    <button
                      className={`btn ${masteredIds.has(currentCard.id) ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.65rem' }}
                      title={masteredIds.has(currentCard.id) ? '已熟記' : '標記為熟記'}
                      onClick={(e) => handleToggleMastered(currentCard.id, e)}
                    >
                      <CheckCircle size={18} color={masteredIds.has(currentCard.id) ? '#ffffff' : 'var(--accent-emerald)'} />
                    </button>
                  </div>
                </div>

                {/* Center Content */}
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  {!isFlipped ? (
                    /* FRONT SIDE: Kanji Word */
                    <div>
                      <div style={{ fontSize: '3.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        {currentCard.kanji}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <RotateCcw size={15} />
                        <span>點擊卡片翻面查看平假名讀音與釋義 (Click to Flip)</span>
                      </div>
                    </div>
                  ) : (
                    /* BACK SIDE: Furigana, Meaning, Example */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                      {/* Kanji with Furigana */}
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
                        {currentCard.kanji}
                      </div>

                      {/* Kana Reading */}
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 1.2rem', borderRadius: '25px' }}>
                        【 {currentCard.kana} 】
                      </div>

                      {/* Chinese Meaning */}
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {currentCard.meaning}
                      </div>

                      {/* Note / Example */}
                      {currentCard.note && currentCard.note !== '-' && (
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                          💡 說明 / 例句：{currentCard.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button
                    className={`btn ${reviewIds.has(currentCard.id) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    onClick={(e) => handleToggleReview(currentCard.id, e)}
                  >
                    <span>{reviewIds.has(currentCard.id) ? '⭐ 待複習中' : '加入複習清單'}</span>
                  </button>

                  <button
                    className="btn btn-outline-pink"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      const primaryKana = currentCard.kana ? currentCard.kana.split('/')[0].trim() : '';
                      let textToProcess = currentCard.kanji;
                      if (currentCard.note && currentCard.note.includes('（')) {
                        const rawNote = currentCard.note.split('（')[0].trim();
                        if (rawNote.includes(currentCard.kanji) && primaryKana) {
                          textToProcess = rawNote.replace(currentCard.kanji, `${currentCard.kanji}[${primaryKana}]`);
                        } else {
                          textToProcess = rawNote;
                        }
                      } else if (currentCard.kanji && primaryKana && currentCard.kanji !== primaryKana) {
                        textToProcess = `${currentCard.kanji}[${primaryKana}]`;
                      }
                      handleProcessInReader(textToProcess, `${currentCard.kanji} (${currentCard.meaning})`, currentCard, e);
                    }}
                  >
                    <span>在 Reader 中研讀</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              沒有符合條件的單字卡！
            </div>
          )}

          {/* Bottom Card Navigation Controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', borderRadius: '30px' }}
              onClick={handlePrevCard}
            >
              <ChevronLeft size={20} />
              <span>上一張 (Prev)</span>
            </button>

            <button
              className="btn btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', borderRadius: '30px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <RotateCcw size={18} />
              <span>{isFlipped ? '看題目 (Show Kanji)' : '看答案 (Flip Card)'}</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', borderRadius: '30px' }}
              onClick={handleNextCard}
            >
              <span>下一張 (Next)</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. GRID CARDS VIEW (網格卡片牆模式) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                border: masteredIds.has(item.id) ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', fontWeight: 700 }}>
                  {item.icon} {item.categoryName.split('（')[0]}
                </span>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.45rem' }}
                  onClick={(e) => handleSpeak(item, e)}
                >
                  <Volume2 size={14} color="var(--accent-pink)" />
                </button>
              </div>

              <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.kanji}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                  {item.kana}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {item.meaning}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  className={`btn ${masteredIds.has(item.id) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={(e) => handleToggleMastered(item.id, e)}
                >
                  {masteredIds.has(item.id) ? '✓ 已熟記' : '標記熟記'}
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    const primaryKana = item.kana ? item.kana.split('/')[0].trim() : '';
                    const textToProcess = (item.kanji && primaryKana && item.kanji !== primaryKana)
                      ? `${item.kanji}[${primaryKana}]`
                      : item.kanji;
                    handleProcessInReader(textToProcess, `${item.kanji} (${item.meaning})`, item, e);
                  }}
                >
                  <span>Reader</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. TABLE LIST VIEW (表格清單模式) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          {/* Controls: Search & Masking */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem', fontSize: '0.92rem' }}
                placeholder="搜尋單字、假名、中文或例句..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Masking Toggles */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className={`btn ${hideKana ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setHideKana(!hideKana)}
              >
                {hideKana ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{hideKana ? '顯示假名' : '遮蓋假名'}</span>
              </button>

              <button
                className={`btn ${hideMeaning ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setHideMeaning(!hideMeaning)}
              >
                {hideMeaning ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{hideMeaning ? '顯示中文' : '遮蓋中文'}</span>
              </button>
            </div>
          </div>

          {/* Table Surface */}
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '22%' }}>單字（漢字/平假名）</th>
                  <th style={{ padding: '0.85rem 1rem', width: '22%' }}>讀音（假名）</th>
                  <th style={{ padding: '0.85rem 1rem', width: '22%' }}>中文釋義</th>
                  <th style={{ padding: '0.85rem 1rem', width: '22%' }}>說明 / 例句</th>
                  <th style={{ padding: '0.85rem 1rem', width: '12%', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      沒有找到符合的單字項目
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr 
                      key={item.id}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.15s ease'
                      }}
                      className="table-row-hover"
                    >
                      {/* Kanji */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{item.kanji}</span>
                          {item.badge && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kana Reading (Hideable) */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-pink)', fontWeight: 600 }}>
                        {hideKana ? (
                          <span 
                            style={{ 
                              background: 'rgba(236, 72, 153, 0.2)', 
                              color: 'transparent', 
                              userSelect: 'none', 
                              borderRadius: '4px',
                              padding: '0.1rem 0.5rem',
                              cursor: 'pointer'
                            }}
                            title="點擊顯示"
                            onClick={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                          >
                            ???
                          </span>
                        ) : (
                          item.kana
                        )}
                      </td>

                      {/* Chinese Meaning (Hideable) */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {hideMeaning ? (
                          <span 
                            style={{ 
                              background: 'rgba(59, 130, 246, 0.2)', 
                              color: 'transparent', 
                              userSelect: 'none', 
                              borderRadius: '4px',
                              padding: '0.1rem 0.5rem',
                              cursor: 'pointer'
                            }}
                            title="點擊顯示"
                            onClick={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                          >
                            ???
                          </span>
                        ) : (
                          item.meaning
                        )}
                      </td>

                      {/* Note / Example */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {item.note}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          {/* Audio Button */}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title={`發音: ${item.kanji}`}
                            onClick={() => handleSpeak(item)}
                          >
                            <Volume2 size={16} color="var(--accent-pink)" />
                          </button>

                          {/* Process in Reader */}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="在 Reader 中開啟研讀"
                            onClick={() => {
                              const primaryKana = item.kana ? item.kana.split('/')[0].trim() : '';
                              let textToProcess = item.kanji;
                              if (item.note && item.note.includes('（')) {
                                const rawNote = item.note.split('（')[0].trim();
                                if (rawNote.includes(item.kanji) && primaryKana) {
                                  textToProcess = rawNote.replace(item.kanji, `${item.kanji}[${primaryKana}]`);
                                } else {
                                  textToProcess = rawNote;
                                }
                              } else if (item.kanji && primaryKana && item.kanji !== primaryKana) {
                                textToProcess = `${item.kanji}[${primaryKana}]`;
                              }
                              handleProcessInReader(textToProcess, `${item.kanji} (${item.meaning})`, item);
                            }}
                          >
                            <ArrowRight size={16} color="var(--accent-blue)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
