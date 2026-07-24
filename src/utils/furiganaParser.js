/**
 * High-Accuracy Kuromoji Morphological Furigana Engine
 * Powered by Kuromoji, Kuroshiro, and Pako Gzip Decompressor
 */

import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import * as pako from 'pako';
import { COMPOUND_DICTIONARY, SINGLE_KANJI_DICTIONARY } from './kanjiDictionary';

// Polyfill Zlib Gunzip with Pako for 100% reliable browser dictionary decompression
if (typeof window !== 'undefined') {
  window.global = window;
  window.Zlib = window.Zlib || {};
  window.Zlib.Gunzip = function(buffer) {
    this.buffer = buffer;
    this.decompress = function() {
      return pako.ungzip(this.buffer);
    };
  };
}

let kuroshiroInstance = null;
let kuroshiroInitPromise = null;
let isKuroshiroReady = false;

export function getDictPath() {
  if (typeof window !== 'undefined') {
    let path = window.location.pathname;
    if (!path.endsWith('/')) {
      path = path.substring(0, path.lastIndexOf('/') + 1);
    }
    return `${path}dict`.replace(/\/+/g, '/');
  }
  return './dict';
}

/**
 * Initialize Kuroshiro with local Kuromoji dictionary files
 */
export function initKuroshiro() {
  if (isKuroshiroReady && kuroshiroInstance) {
    return Promise.resolve(kuroshiroInstance);
  }

  if (kuroshiroInitPromise) {
    return kuroshiroInitPromise;
  }

  const targetDictPath = getDictPath();
  console.log('Initializing Kuromoji dict at:', targetDictPath);

  kuroshiroInstance = new Kuroshiro();

  const initPromise = kuroshiroInstance
    .init(new KuromojiAnalyzer({ dictPath: targetDictPath }))
    .then(() => {
      isKuroshiroReady = true;
      console.log('Kuromoji morphological analyzer ready!');
      return kuroshiroInstance;
    })
    .catch(err => {
      console.warn('Kuromoji dict load failed, using dictionary fallback:', err);
      isKuroshiroReady = false;
      return null;
    });

  // 4-Second Timeout Safeguard to prevent UI freezing
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      if (!isKuroshiroReady) {
        console.warn('Kuromoji dictionary load timed out, falling back to sync parser.');
        resolve(null);
      }
    }, 4000);
  });

  kuroshiroInitPromise = Promise.race([initPromise, timeoutPromise]);
  return kuroshiroInitPromise;
}

// Start preloading Kuromoji dictionary immediately
if (typeof window !== 'undefined') {
  initKuroshiro();
}

/**
 * Convert Katakana to Hiragana
 */
export function katakanaToHiragana(katakana) {
  if (!katakana) return '';
  return katakana.replace(/[\u30a1-\u30f6]/g, match => 
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
}

const KANA_TO_ROMAJI = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
};

export function containsKanji(text) {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

export function kanaToRomaji(kana) {
  if (!kana) return '';
  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length && KANA_TO_ROMAJI[kana.substring(i, i + 2)]) {
      result += KANA_TO_ROMAJI[kana.substring(i, i + 2)];
      i += 2;
    } else if (KANA_TO_ROMAJI[kana[i]]) {
      result += KANA_TO_ROMAJI[kana[i]];
      i++;
    } else if (kana[i] === 'っ' || kana[i] === 'ッ') {
      if (i + 1 < kana.length) {
        const nextRomaji = kanaToRomaji(kana[i + 1]);
        if (nextRomaji) result += nextRomaji[0];
      }
      i++;
    } else {
      result += kana[i];
      i++;
    }
  }
  return result;
}

/**
 * Smart Lyrics & Web Text Line Splitter
 */
export function smartSplitJapaneseLyrics(text) {
  if (!text) return '';
  let formatted = text;
  formatted = formatted.replace(/([。！？!?])\s*/g, '$1\n');
  formatted = formatted.replace(/[　]+/g, '\n');
  formatted = formatted.replace(/([\u3040-\u30ff\u4e00-\u9faf])\s+([\u3040-\u30ff\u4e00-\u9faf])/g, '$1\n$2');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  return formatted.trim();
}

/**
 * Async Paragraph Parser powered by Kuromoji (100% Dictionary Accuracy)
 */
export async function parseJapaneseParagraphsAsync(fullText) {
  if (!fullText) return [];

  const instance = await initKuroshiro();
  if (!instance || !isKuroshiroReady) {
    return parseJapaneseParagraphsSync(fullText);
  }

  const normalized = fullText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2028\u2029]/g, '\n');

  const lines = normalized.split('\n');
  const paragraphs = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) {
      paragraphs.push({
        id: `empty-${i}-${Math.random().toString(36).substr(2, 6)}`,
        isEmpty: true,
        text: '',
        tokens: []
      });
    } else {
      const tokens = await parseLineWithKuromoji(line, instance);
      paragraphs.push({
        id: `p-${i}-${Math.random().toString(36).substr(2, 6)}`,
        isEmpty: false,
        text: line,
        tokens: tokens
      });
    }
  }

  return paragraphs;
}

/**
 * Parses a single line using Kuroshiro / Kuromoji morphological analyzer
 */
async function parseLineWithKuromoji(line, instance) {
  try {
    const resultTokens = await instance.convert(line, {
      to: 'hiragana',
      mode: 'furigana'
    });

    return parseRubyHtmlToTokens(resultTokens, line);
  } catch (err) {
    console.warn('Kuroshiro parseLine failed, falling back to sync parser:', err);
    return parseLineToTokensSync(line);
  }
}

/**
 * Convert Kuroshiro HTML output into clean tokens
 */
function parseRubyHtmlToTokens(htmlString, rawLine) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html');
  const container = doc.body.firstChild;

  const tokens = [];

  for (let node of container.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        tokens.push({
          id: Math.random().toString(36).substr(2, 9),
          surface: text,
          reading: text,
          isKanji: containsKanji(text),
          romaji: kanaToRomaji(text)
        });
      }
    } else if (node.nodeName === 'RUBY') {
      let kanjiSurface = '';
      let reading = '';

      for (let child of node.childNodes) {
        if (child.nodeName === 'RT') {
          reading += child.textContent;
        } else if (child.nodeName === 'RP') {
          // Ignore fallback parentheses <rp>(</rp> and <rp>)</rp>
          continue;
        } else {
          kanjiSurface += child.textContent;
        }
      }

      const cleanKanjiSurface = kanjiSurface.replace(/[()（）]/g, '').trim();
      const hiraganaReading = katakanaToHiragana(reading.replace(/[()（）]/g, '').trim());

      tokens.push({
        id: Math.random().toString(36).substr(2, 9),
        surface: cleanKanjiSurface,
        reading: hiraganaReading || cleanKanjiSurface,
        isKanji: containsKanji(cleanKanjiSurface),
        romaji: kanaToRomaji(hiraganaReading)
      });
    }
  }

  return mergeAdjacentKana(tokens);
}

/**
 * Fast Synchronous Fallback Paragraph Parser
 */
export function parseJapaneseParagraphsSync(fullText) {
  if (!fullText) return [];

  const normalized = fullText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2028\u2029]/g, '\n');

  const lines = normalized.split('\n');
  const paragraphs = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) {
      paragraphs.push({
        id: `empty-${i}-${Math.random().toString(36).substr(2, 6)}`,
        isEmpty: true,
        text: '',
        tokens: []
      });
    } else {
      const tokens = parseLineToTokensSync(line);
      paragraphs.push({
        id: `p-${i}-${Math.random().toString(36).substr(2, 6)}`,
        isEmpty: false,
        text: line,
        tokens: tokens
      });
    }
  }

  return paragraphs;
}

export function parseLineToTokensSync(line) {
  if (!line) return [];

  const explicitPattern = /\{([^|]+)\|([^}]+)\}|([^\s\[\]]+)\[([^\]]+)\]/g;
  let tokens = [];
  let lastIndex = 0;
  let hasExplicit = false;
  let match;

  while ((match = explicitPattern.exec(line)) !== null) {
    hasExplicit = true;
    if (match.index > lastIndex) {
      const remaining = line.substring(lastIndex, match.index);
      tokens.push(...tokenizeRawTextSync(remaining));
    }

    const kanji = match[1] || match[3];
    const reading = match[2] || match[4];
    tokens.push({
      id: Math.random().toString(36).substr(2, 9),
      surface: kanji,
      reading: reading,
      isKanji: containsKanji(kanji),
      romaji: kanaToRomaji(reading)
    });
    lastIndex = explicitPattern.lastIndex;
  }

  if (hasExplicit) {
    if (lastIndex < line.length) {
      tokens.push(...tokenizeRawTextSync(line.substring(lastIndex)));
    }
    return tokens;
  }

  return tokenizeRawTextSync(line);
}

function tokenizeRawTextSync(text) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    let matched = false;

    for (let len = Math.min(8, text.length - i); len >= 1; len--) {
      const sub = text.substring(i, i + len);
      if (COMPOUND_DICTIONARY[sub]) {
        tokens.push({
          id: Math.random().toString(36).substr(2, 9),
          surface: sub,
          reading: COMPOUND_DICTIONARY[sub],
          isKanji: containsKanji(sub),
          romaji: kanaToRomaji(COMPOUND_DICTIONARY[sub])
        });
        i += len;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const char = text[i];
    const isK = containsKanji(char);
    const reading = isK ? (SINGLE_KANJI_DICTIONARY[char] || char) : char;

    tokens.push({
      id: Math.random().toString(36).substr(2, 9),
      surface: char,
      reading: reading,
      isKanji: isK,
      romaji: isK ? kanaToRomaji(reading) : kanaToRomaji(char)
    });
    i++;
  }

  return mergeAdjacentKana(tokens);
}

function mergeAdjacentKana(tokens) {
  if (!tokens.length) return [];
  const merged = [];
  let current = null;

  for (const token of tokens) {
    if (!token.isKanji && token.reading === token.surface) {
      if (current && !current.isKanji && current.reading === current.surface) {
        current.surface += token.surface;
        current.reading += token.reading;
        current.romaji = kanaToRomaji(current.reading);
      } else {
        if (current) merged.push(current);
        current = { ...token };
      }
    } else {
      if (current) merged.push(current);
      current = { ...token };
    }
  }
  if (current) merged.push(current);
  return merged;
}

export function formatTokensToAnnotatedString(tokens) {
  return tokens.map(t => {
    if (t.isKanji && t.reading) {
      return `${t.surface}[${t.reading}]`;
    }
    return t.surface;
  }).join('');
}
