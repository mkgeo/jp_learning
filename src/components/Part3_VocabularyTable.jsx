import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Sparkles, Filter, EyeOff, Eye, ArrowRight, Lightbulb } from 'lucide-react';
import { N5_VOCABULARY_DATA, CATEGORY_LIST } from '../data/n5VocabularyData';
import { tts } from '../utils/ttsEngine';

export default function Part3_VocabularyTable({ onOpenReaderWithText }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideKana, setHideKana] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Filter items based on category and search query
  const filteredItems = N5_VOCABULARY_DATA.filter(item => {
    const matchesCategory = selectedCategory === 0 || item.categoryId === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.kanji.toLowerCase().includes(query) ||
      item.kana.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Play audio speech using Web Speech API
  const handleSpeak = (item) => {
    const textToSpeak = item.kanji || item.kana;
    tts.speak(textToSpeak, 1.0);
  };

  // Process word or example in Reader
  const handleProcessInReader = (text, title) => {
    if (onOpenReaderWithText) {
      onOpenReaderWithText(text, title);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Stats */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <BookOpen size={24} color="var(--accent-pink)" />
              <span>JLPT N5 200 核心高頻單字大全</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              涵蓋 N5 檢定與基礎會話最常出現的 220+ 核心必背單字 (內建語音發音與單字測驗模式)
            </p>
          </div>

          <button
            className="btn btn-outline-pink"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => setShowTips(!showTips)}
          >
            <Lightbulb size={16} />
            <span>{showTips ? '隱藏高效複習策略' : '顯示高效複習策略'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: showTips ? '1.25rem' : '0'
        }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-pink)' }}>220 個</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>總收錄核心單字</div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>8 大</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>主題分類</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.9rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>語音朗讀與例句</div>
          </div>
        </div>

        {/* High Efficiency Strategy Box */}
        {showTips && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            borderLeft: '4px solid var(--accent-emerald)',
            padding: '1rem 1.25rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: '0.88rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lightbulb size={18} />
              <span>💡 200 單字高效複習策略：</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              <li><strong>每日目標：</strong> 建議每天學習 1 個大主題（約 20~30 個單字），7~8 天即可完整輪空一遍。</li>
              <li><strong>遮蓋測試：</strong> 點選下方「遮蓋假名」或「遮蓋中文」開關，自我測試記憶熟悉度。</li>
              <li><strong>動詞搭配：</strong> 背動詞時連同助詞（へ、を、に、で）一同記憶，日語會話更順暢。</li>
            </ul>
          </div>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Box & Masking Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="搜尋單字、假名、中文意思或例句... (例如：電車, 食事, いくら)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Self Test Masking Toggles */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>自測遮蓋模式:</span>
              <button
                className={`btn ${hideKana ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setHideKana(!hideKana)}
              >
                {hideKana ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{hideKana ? '假名已遮蓋' : '遮蓋假名'}</span>
              </button>

              <button
                className={`btn ${hideMeaning ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setHideMeaning(!hideMeaning)}
              >
                {hideMeaning ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{hideMeaning ? '中文已遮蓋' : '遮蓋中文'}</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {CATEGORY_LIST.map(cat => {
              const count = cat.id === 0 
                ? N5_VOCABULARY_DATA.length 
                : N5_VOCABULARY_DATA.filter(i => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vocabulary Data Table */}
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '0.85rem 1rem', width: '18%' }}>單字 (Kanji)</th>
              <th style={{ padding: '0.85rem 1rem', width: '22%' }}>假名 / 讀音 (Kana)</th>
              <th style={{ padding: '0.85rem 1rem', width: '22%' }}>中文意思 (Meaning)</th>
              <th style={{ padding: '0.85rem 1rem', width: '26%' }}>例句 / 記憶說明 (Notes)</th>
              <th style={{ padding: '0.85rem 1rem', width: '12%', textAlign: 'center' }}>發音 / 研讀</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  找不到符合的 N5 單字，請嘗試切換主題或搜尋其他關鍵字。
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr 
                  key={item.id}
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease'
                  }}
                  className="vocab-row"
                >
                  {/* Kanji */}
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{item.kanji}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: 'var(--accent-amber)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '10px',
                          fontWeight: 600
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Kana / Reading (Supports Masking) */}
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-pink)', fontWeight: 600, fontSize: '1rem' }}>
                    {hideKana ? (
                      <span 
                        style={{ background: 'var(--border-color)', color: 'transparent', borderRadius: '4px', padding: '0.1rem 0.5rem', cursor: 'pointer' }}
                        title="點擊顯示假名"
                        onClick={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                      >
                        ???
                      </span>
                    ) : (
                      item.kana
                    )}
                  </td>

                  {/* Chinese Meaning (Supports Masking) */}
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                    {hideMeaning ? (
                      <span 
                        style={{ background: 'var(--border-color)', color: 'transparent', borderRadius: '4px', padding: '0.1rem 0.5rem', cursor: 'pointer' }}
                        title="點擊顯示意思"
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
                          const sentenceToProcess = item.note.includes('（') 
                            ? item.note.split('（')[0] 
                            : item.kanji;
                          handleProcessInReader(sentenceToProcess, `${item.kanji} (${item.meaning})`);
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
  );
}
