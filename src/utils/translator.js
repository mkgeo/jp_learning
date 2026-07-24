/**
 * Translator Utility
 * Provides translation for Japanese text into English with free online API + fallback dictionary
 */

const FALLBACK_DICTIONARY = {
  '日本語の勉強はとても楽しいです。': 'Studying Japanese is very fun.',
  'こんにちは！お元気ですか？': 'Hello! How are you?',
  '富士山は日本で一番高い山です。春には桜がとても綺麗に咲きます。': 'Mount Fuji is the highest mountain in Japan. In spring, cherry blossoms bloom very beautifully.',
  'すみません、駅はどこですか？': 'Excuse me, where is the station?',
  'これをください。': 'Please give me this.',
  '美味しいものを食べに行きましょう！': 'Let\'s go eat something delicious!',
  'ありがとう': 'Thank you',
  'さようなら': 'Goodbye',
  '私': 'I / me',
  '友達': 'Friend',
  '学校': 'School',
  '日本語': 'Japanese language'
};

/**
 * Translates Japanese text into English
 */
export async function translateJapaneseToEnglish(text) {
  if (!text || !text.trim()) return '';

  const cleanText = text.trim();

  // Check fallback dictionary first for exact matches
  if (FALLBACK_DICTIONARY[cleanText]) {
    return FALLBACK_DICTIONARY[cleanText];
  }

  try {
    const encodedText = encodeURIComponent(cleanText);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ja|en`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API request failed');

    const data = await response.json();
    if (data && data.responseData && data.responseData.translatedText) {
      const translation = data.responseData.translatedText;
      // If valid translation returned
      if (translation && !translation.includes('MYMEMORY WARNING')) {
        return translation;
      }
    }
  } catch (error) {
    console.warn('Online translation failed, using simple fallback:', error);
  }

  // Basic word-based fallback translation if API fails
  let fallbackText = cleanText;
  for (const [key, val] of Object.entries(FALLBACK_DICTIONARY)) {
    if (fallbackText.includes(key)) {
      return val;
    }
  }

  return '[Translation pending or manual translation can be entered below]';
}
