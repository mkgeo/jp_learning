import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Volume2, Eye, EyeOff, 
  Languages, Gauge, Sparkles, BookOpen, Star, Share2, Highlighter
} from 'lucide-react';
import { parseJapaneseParagraphsAsync, parseJapaneseParagraphsSync } from '../utils/furiganaParser';
import { tts } from '../utils/ttsEngine';
import WordModal from './WordModal';

export default function Part2_Reader({ activeItem, onToggleFavorite }) {
  const [furiganaMode, setFuriganaMode] = useState('always'); // 'always' | 'hover' | 'hidden'
  const [showTranslation, setShowTranslation] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [activeTokenIndex, setActiveTokenIndex] = useState(-1);
  const [ttsState, setTtsState] = useState({ isSpeaking: false, isPaused: false });
  const [paragraphs, setParagraphs] = useState([]);

  const readerRef = useRef(null);

  useEffect(() => {
    let isSubscribed = true;
    if (activeItem) {
      if (activeItem.paragraphs && activeItem.paragraphs.length > 0) {
        setParagraphs(activeItem.paragraphs);
      } else if (activeItem.japaneseText || activeItem.rawText) {
        const textToParse = activeItem.japaneseText || activeItem.rawText;
        setParagraphs(parseJapaneseParagraphsSync(textToParse));

        parseJapaneseParagraphsAsync(textToParse).then(kuromojiParagraphs => {
          if (isSubscribed && kuromojiParagraphs && kuromojiParagraphs.length > 0) {
            setParagraphs(kuromojiParagraphs);
          }
        });
      } else {
        setParagraphs([]);
      }
    }
    return () => { isSubscribed = false; };
  }, [activeItem]);

  // Subscribe to TTS state changes
  useEffect(() => {
    const unsubscribe = tts.subscribeStateChange(state => {
      setTtsState({ isSpeaking: state.isSpeaking, isPaused: state.isPaused });
      if (!state.isSpeaking) {
        setActiveTokenIndex(-1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Mouse Selection for Highlight-to-Speak
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  // Play full text or highlighted text
  const handlePlayAll = () => {
    if (!activeItem) return;
    tts.setRate(speed);

    const flatTokens = paragraphs.flatMap(p => p.tokens);
    const fullText = activeItem.japaneseText || flatTokens.map(t => t.surface).join('\n');
    
    // Simulate token boundary highlight
    tts.speak(
      fullText, 
      (charIndex) => {
        let currentLen = 0;
        for (let i = 0; i < flatTokens.length; i++) {
          currentLen += flatTokens[i].surface.length;
          if (charIndex < currentLen) {
            setActiveTokenIndex(i);
            break;
          }
        }
      },
      () => setActiveTokenIndex(-1)
    );
  };

  const handlePlayHighlight = () => {
    if (!selectedText) return;
    tts.setRate(speed);
    tts.speak(selectedText);
  };

  const handlePause = () => tts.pause();
  const handleResume = () => tts.resume();
  const handleStop = () => {
    tts.stop();
    setActiveTokenIndex(-1);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    tts.setRate(newSpeed);
  };

  if (!activeItem) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <BookOpen size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
        <h3>No Japanese Text Selected</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Please input text in Part 1 or select a passage from your Saved Library to start reading and listening.
        </p>
      </div>
    );
  }

  const allFlatTokens = paragraphs.flatMap(p => p.tokens || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Passage Title Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{activeItem.title}</h2>
              <button 
                onClick={() => onToggleFavorite && onToggleFavorite(activeItem.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                title="Favorite Passage"
              >
                <Star size={20} color="var(--accent-amber)" fill={activeItem.favorite ? 'var(--accent-amber)' : 'none'} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                {activeItem.category || 'General'}
              </span>
              {(activeItem.tags || []).map((t, idx) => (
                <span key={idx} className="tag-badge">#{t}</span>
              ))}
            </div>
          </div>

          {/* Reader Display Mode Toggles */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Furigana Mode Selector */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn ${furiganaMode === 'always' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setFuriganaMode('always')}
                title="Always show Hiragana/Katakana Furigana"
              >
                <Eye size={14} />
                <span>Furigana: On</span>
              </button>
              <button
                className={`btn ${furiganaMode === 'hover' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setFuriganaMode('hover')}
                title="Show Furigana only when hovering over Kanji"
              >
                <Highlighter size={14} />
                <span>On Hover</span>
              </button>
              <button
                className={`btn ${furiganaMode === 'hidden' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setFuriganaMode('hidden')}
                title="Hide Furigana (Kanji quiz mode)"
              >
                <EyeOff size={14} />
                <span>Hidden</span>
              </button>
            </div>

            {/* Translation Toggle */}
            <button
              className={`btn ${showTranslation ? 'btn-outline-pink' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setShowTranslation(!showTranslation)}
            >
              <Languages size={16} />
              <span>{showTranslation ? 'Translation: Shown' : 'Translation: Hidden'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio & Speech Control Toolbar */}
      <div className="audio-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!ttsState.isSpeaking ? (
            <button className="btn btn-primary" onClick={handlePlayAll}>
              <Play size={18} fill="white" />
              <span>Listen All</span>
            </button>
          ) : ttsState.isPaused ? (
            <button className="btn btn-primary" onClick={handleResume}>
              <Play size={18} fill="white" />
              <span>Resume</span>
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handlePause}>
              <Pause size={18} />
              <span>Pause</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={handleStop} disabled={!ttsState.isSpeaking}>
            <Square size={16} />
            <span>Stop</span>
          </button>

          {/* Highlight-to-Speak Action Button */}
          {selectedText && (
            <button 
              className="btn btn-outline-pink" 
              onClick={handlePlayHighlight}
              style={{ animation: 'pulse 1.5s infinite' }}
            >
              <Volume2 size={16} />
              <span>Speak Highlighted ("{selectedText.length > 12 ? selectedText.substr(0, 12) + '...' : selectedText}")</span>
            </button>
          )}
        </div>

        {/* Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Volume2 size={15} />
            <span>Speed:</span>
          </span>

          {[0.5, 0.75, 1.0, 1.25].map((sRate) => (
            <button
              key={sRate}
              className={`btn ${speed === sRate ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              onClick={() => handleSpeedChange(sRate)}
            >
              {sRate === 0.5 ? '0.5x (Slow)' : `${sRate}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Japanese Display Surface with Aligned Ruby formatting */}
      <div 
        className={`glass-panel furigana-${furiganaMode}`} 
        ref={readerRef}
        onMouseUp={handleTextSelection}
        style={{ padding: '2.5rem', minHeight: '220px' }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} color="var(--accent-pink)" />
          <span>Click any word to hear pronunciation and view breakdown. Highlight any phrase for instant audio playback.</span>
        </div>

        {/* Paragraphs with Perfect Baseline Alignment */}
        <div>
          {paragraphs.map((p, pIdx) => {
            if (p.isEmpty) {
              return <div key={p.id || pIdx} className="paragraph-spacer" />;
            }
            return (
              <div key={p.id || pIdx} className="japanese-paragraph">
                {p.tokens.map((token, tIdx) => {
                  const globalIdx = allFlatTokens.indexOf(token);
                  const isActive = globalIdx !== -1 && globalIdx === activeTokenIndex;
                  return (
                    <span
                      key={token.id || tIdx}
                      className={`word-token ${isActive ? 'is-active-speech' : ''}`}
                      onClick={() => {
                        tts.speak(token.surface);
                        setSelectedWord(token);
                      }}
                    >
                      <ruby>
                        <rb>{token.surface}</rb>
                        <rt>{token.isKanji ? token.reading : '\u00A0'}</rt>
                      </ruby>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* English Translation View */}
        {showTranslation && (
          <div style={{ 
            marginTop: '2.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Languages size={20} color="var(--accent-blue)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                English Translation
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '0.35rem', fontStyle: 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                "{activeItem.englishTranslation}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word Inspector Modal */}
      {selectedWord && (
        <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
}
