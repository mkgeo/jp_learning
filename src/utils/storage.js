/**
 * LocalStorage & Preset Data Manager
 */

const STORAGE_KEY = 'japanese_learning_app_items_v1';

export const DEFAULT_PRESET_ITEMS = [
  {
    id: 'preset-1',
    title: '日常の挨拶 (Daily Greetings & Paragraphs)',
    rawText: 'こんにちは！\n今日[きょう]はとてもいい天気[てんき]ですね。\n元気[げんき]ですか？日本語[にほんご]の勉強[べんきょう]を楽しみましょう[たのしみましょう]！',
    japaneseText: 'こんにちは！\n今日はとてもいい天気ですね。\n元気ですか？日本語の勉強を楽しみましょう！',
    annotatedText: 'こんにちは！\n今日[きょう]はとてもいい天気[てんき]ですね。\n元気[げんき]ですか？日本語[にほんご]の勉強[べんきょう]を楽しみましょう！',
    englishTranslation: 'Hello!\nIt is very nice weather today.\nHow are you doing? Let\'s enjoy studying Japanese!',
    category: 'Conversation',
    tags: ['N5', 'Greetings', 'Daily'],
    createdAt: new Date('2026-07-01').toISOString(),
    favorite: true
  },
  {
    id: 'preset-2',
    title: '富士山と桜 (Mount Fuji & Cherry Blossoms)',
    rawText: '富士山[ふじさん]は日本[にほん]で一番[いちばん]高[たか]い山[やま]です。\n春[はる]には美しい[うつくしい]桜[さくら]が満開[まんかい]に咲きます[さきます]。\n毎年[まいとし]多くの[おおくの]観光客[かんこうきゃく]が訪れます[おとずれます]。',
    japaneseText: '富士山は日本で一番高い山です。\n春には美しい桜が満開に咲きます。\n毎年多くの観光客が訪れます。',
    annotatedText: '富士山[ふじさん]は日本[にほん]で一番[いちばん]高[たか]い山[やま]です。\n春[はる]には美しい[うつくしい]桜[さくら]が満開[まんかい]に咲きます[さきます]。\n毎年[まいとし]多くの[おおくの]観光客[かんこうきゃく]が訪れます[おとずれます]。',
    englishTranslation: 'Mount Fuji is the highest mountain in Japan.\nIn spring, beautiful cherry blossoms bloom in full.\nEvery year, many tourists visit.',
    category: 'Culture & Nature',
    tags: ['N4', 'Travel', 'Nature'],
    createdAt: new Date('2026-07-10').toISOString(),
    favorite: true
  },
  {
    id: 'preset-3',
    title: 'レストランでのお注文 (Ordering at a Restaurant)',
    rawText: 'いらっしゃいませ！何名様[なんめいさま]ですか？\n一人[ひとり]です。メニューを見せて[みせて]ください。\n美味しい[おいしい]ラーメンと水[みず]をお願いします[おねがいします]。',
    japaneseText: 'いらっしゃいませ！何名様ですか？\n一人です。メニューを見せてください。\n美味しいラーメンと水をお願いします。',
    annotatedText: 'いらっしゃいませ！何名様[なんめいさま]ですか？\n一人[ひとり]です。メニューを見せて[みせて]ください。\n美味しい[おいしい]ラーメンと水[みず]をお願いします[おねがいします]。',
    englishTranslation: 'Welcome! How many people?\nJust one person. Please show me the menu.\nI\'d like delicious ramen and water please.',
    category: 'Travel',
    tags: ['N5', 'Food', 'Useful'],
    createdAt: new Date('2026-07-15').toISOString(),
    favorite: false
  },
  {
    id: 'preset-4',
    title: 'アニメの名言 (Anime & Dreams Inspiration)',
    rawText: 'あきらめたら、そこで試合[しあい]終了[しゅうりょう]ですよ。\n自分[じぶん]の夢[ゆめ]を信じて[しんじて]前[まえ]に進みましょう[すすみましょう]！\n失敗[しっぱい]を恐れずに[おそれずに]挑戦[ちょうせん]してください。',
    japaneseText: 'あきらめたら、そこで試合終了ですよ。\n自分の夢を信じて前に進みましょう！\n失敗を恐れずに挑戦してください。',
    annotatedText: 'あきらめたら、そこで試合[しあい]終了[しゅうりょう]ですよ。\n自分[じぶん]の夢[ゆめ]を信じて[しんじて]前[まえ]に進みましょう[すすみましょう]！\n失敗[しっぱい]を恐れずに[おそれずに]挑戦[ちょうせん]してください。',
    englishTranslation: 'If you give up, the game is already over right there.\nBelieve in your dreams and keep moving forward!\nChallenge yourself without being afraid of failure.',
    category: 'Anime & Quotes',
    tags: ['N3', 'Inspirational', 'Anime'],
    createdAt: new Date('2026-07-20').toISOString(),
    favorite: true
  }
];

export function getStoredItems() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_ITEMS));
      return DEFAULT_PRESET_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load items from storage:', e);
    return DEFAULT_PRESET_ITEMS;
  }
}

export function saveStoredItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items to storage:', e);
  }
}

export function addStoredItem(item) {
  const items = getStoredItems();
  const newItem = {
    ...item,
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    favorite: false
  };
  const updated = [newItem, ...items];
  saveStoredItems(updated);
  return newItem;
}

export function updateStoredItem(id, updates) {
  const items = getStoredItems();
  const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
  saveStoredItems(updated);
  return updated;
}

export function deleteStoredItem(id) {
  const items = getStoredItems();
  const updated = items.filter(item => item.id !== id);
  saveStoredItems(updated);
  return updated;
}
