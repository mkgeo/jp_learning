import React, { useState, useEffect } from 'react';
import { PenTool, Sparkles, Languages, Edit3, Save, CheckCircle2, Wand2, HelpCircle } from 'lucide-react';
import { 
  parseJapaneseParagraphsAsync, 
  parseJapaneseParagraphsSync,
  formatTokensToAnnotatedString, 
  smartSplitJapaneseLyrics 
} from '../utils/furiganaParser';
import { translateJapaneseToEnglish } from '../utils/translator';
import FuriganaEditorModal from './FuriganaEditorModal';

const PRESET_SAMPLES = [
  {
    title: '日常会話 (Daily Conversation)',
    text: "こんにちは！\n今日[きょう]はとてもいい天気[てんき]ですね。\n全集中[ぜんしゅうちゅう]の呼吸[こきゅう]で勉強[べんきょう]を楽しみましょう[たのしみましょう]！",
    category: 'Conversation',
    tags: ['N5', 'Daily']
  },
  {
    title: '富士山と桜 (Mount Fuji & Cherry Blossoms)',
    text: "富士山[ふじさん]は日本[にほん]で一番[いちばん]高[たか]い山[やま]です。\n春[はる]には美しい[うつくしい]桜[さくら]が満開[まんかい]に咲きます[さきます]。\n毎年[まいとし]多くの[おおくの]観光客[かんこうきゃく]が訪れます[おとずれます]。",
    category: 'Culture & Nature',
    tags: ['N4', 'Sightseeing']
  },
  {
    title: 'カフェで注文 (Ordering at Cafe)',
    text: "いらっしゃいませ！何名様[なんめいさま]ですか？\n一人[ひとり]です。メニューを見せて[みせて]ください。\n美味しい[おいしい]ラーメンと水[みず]をお願いします[おねがいします]。",
    category: 'Food',
    tags: ['N5', 'Order']
  }
];

export default function Part1_TextInput({ onSaveItem, onOpenReader }) {
  const [title, setTitle] = useState('');
  const [japaneseInput, setJapaneseInput] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [category, setCategory] = useState('General');
  const [tagString, setTagString] = useState('N5, Custom');
  const [paragraphs, setParagraphs] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);
  const [splitSuccessMsg, setSplitSuccessMsg] = useState(false);

  // Auto-parse furigana using Kuromoji morphological engine
  useEffect(() => {
    let isSubscribed = true;
    if (japaneseInput.trim()) {
      const syncParagraphs = parseJapaneseParagraphsSync(japaneseInput);
      setParagraphs(syncParagraphs);

      parseJapaneseParagraphsAsync(japaneseInput).then(kuromojiParagraphs => {
        if (isSubscribed && kuromojiParagraphs && kuromojiParagraphs.length > 0) {
          setParagraphs(kuromojiParagraphs);
        }
      });
    } else {
      setParagraphs([]);
    }
    return () => { isSubscribed = false; };
  }, [japaneseInput]);

  // Smart Splitter for Web / Lyrics text without newlines
  const handleSmartSplit = () => {
    if (!japaneseInput.trim()) return;
    const formatted = smartSplitJapaneseLyrics(japaneseInput);
    setJapaneseInput(formatted);
    setSplitSuccessMsg(true);
    setTimeout(() => setSplitSuccessMsg(false), 3000);
  };

  // Trigger auto translation
  const handleAutoTranslate = async () => {
    if (!japaneseInput.trim()) return;
    setIsTranslating(true);
    const result = await translateJapaneseToEnglish(japaneseInput);
    setEnglishTranslation(result);
    setIsTranslating(false);
  };

  // Load Preset Sample
  const handleLoadPreset = (sample) => {
    setTitle(sample.title);
    setJapaneseInput(sample.text);
    setCategory(sample.category);
    setTagString(sample.tags.join(', '));
    handleAutoTranslate();
  };

  // Handle save to list
  const handleSave = () => {
    if (!japaneseInput.trim()) return;

    const allTokens = paragraphs.flatMap(p => p.tokens || []);
    const tags = tagString.split(',').map(t => t.trim()).filter(Boolean);
    const annotatedText = formatTokensToAnnotatedString(allTokens);

    const newItem = {
      title: title.trim() || 'Untitled Japanese Text',
      japaneseText: japaneseInput.trim(),
      rawText: annotatedText,
      annotatedText: annotatedText,
      tokens: allTokens,
      paragraphs: paragraphs,
      englishTranslation: englishTranslation.trim() || '[No translation provided]',
      category: category,
      tags: tags.length ? tags : ['Japanese']
    };

    const saved = onSaveItem(newItem);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);

    // Open Reader Mode immediately
    if (onOpenReader) {
      onOpenReader(saved);
    }
  };

  // Check if pasted text lacks newlines but has sentence punctuation or spaces
  const hasNoNewlines = japaneseInput.length > 25 && !japaneseInput.includes('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Quick Presets Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem' }}>
            <PenTool size={22} color="var(--accent-pink)" />
            <span>Part 1: Text Input & Furigana Processing</span>
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
            {PRESET_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => handleLoadPreset(sample)}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Title & Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Passage Title
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Really Crazy Song Lyrics"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Category
            </label>
            <select
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Anime & Quotes">Anime & Lyrics</option>
              <option value="Conversation">Conversation</option>
              <option value="Travel">Travel</option>
              <option value="Culture & Nature">Culture & Nature</option>
              <option value="Food">Food</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Lyrics, J-Pop, Anime"
              value={tagString}
              onChange={e => setTagString(e.target.value)}
            />
          </div>
        </div>

        {/* Input Textarea Header Bar with Smart Splitter Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Japanese Input Text:
            </label>

            <button
              className="btn btn-outline-pink"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              onClick={handleSmartSplit}
              disabled={!japaneseInput.trim()}
              title="Automatically split text copied from Google/Web lyrics without newlines into separate lines"
            >
              <Wand2 size={15} color="var(--accent-pink)" />
              <span>{splitSuccessMsg ? '✨ Formatted into Lines!' : '🪄 Smart Split Web Lyrics / Sentences'}</span>
            </button>
          </div>

          {/* Web Lyrics Missing Newline Tip Banner */}
          {hasNoNewlines && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              border: '1px solid rgba(245, 158, 11, 0.3)', 
              padding: '0.6rem 0.9rem', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
                <HelpCircle size={16} />
                <span>Pasted web text has no line breaks? Click <strong>Smart Split Web Lyrics</strong> to auto-format into lines!</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={handleSmartSplit}
              >
                Auto-Split Now
              </button>
            </div>
          )}

          <textarea
            className="form-control"
            rows={5}
            placeholder="Paste Japanese text or lyrics here... (e.g. copied from Google Search or websites)"
            value={japaneseInput}
            onChange={e => setJapaneseInput(e.target.value)}
          />
        </div>

        {/* Furigana Interactive Preview Box */}
        {paragraphs.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--accent-pink-glow)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} />
                <span>Generated Furigana Preview:</span>
              </span>

              <button
                className="btn btn-outline-pink"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setShowEditorModal(true)}
              >
                <Edit3 size={14} />
                <span>Edit Readings</span>
              </button>
            </div>

            {/* Render Clean Aligned Paragraphs */}
            <div>
              {paragraphs.map((p, pIdx) => {
                if (p.isEmpty) {
                  return <div key={p.id || pIdx} className="paragraph-spacer" />;
                }
                return (
                  <div key={p.id || pIdx} className="japanese-paragraph">
                    {p.tokens.map((token, tIdx) => (
                      <ruby key={token.id || tIdx}>
                        <rb>{token.surface}</rb>
                        <rt>{token.isKanji ? token.reading : '\u00A0'}</rt>
                      </ruby>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* English Translation Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              English Translation:
            </label>

            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={handleAutoTranslate}
              disabled={isTranslating || !japaneseInput.trim()}
            >
              <Languages size={14} color="var(--accent-blue)" />
              <span>{isTranslating ? 'Translating...' : 'Auto-Translate'}</span>
            </button>
          </div>

          <textarea
            className="form-control"
            rows={3}
            placeholder="English translation will appear here or type custom translation..."
            value={englishTranslation}
            onChange={e => setEnglishTranslation(e.target.value)}
          />
        </div>

        {/* Save & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {savedSuccessMsg ? (
            <div style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>Saved to List & Opened Reader!</span>
            </div>
          ) : <div />}

          <button
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
            onClick={handleSave}
            disabled={!japaneseInput.trim()}
          >
            <Save size={18} />
            <span>Store in List & Open Reader</span>
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditorModal && (
        <FuriganaEditorModal
          tokens={paragraphs.flatMap(p => p.tokens || [])}
          onSave={updatedTokens => {
            const tokenMap = new Map(updatedTokens.map(t => [t.id, t]));
            setParagraphs(prev =>
              prev.map(p => ({
                ...p,
                tokens: (p.tokens || []).map(t => tokenMap.get(t.id) || t)
              }))
            );
          }}
          onClose={() => setShowEditorModal(false)}
        />
      )}
    </div>
  );
}
