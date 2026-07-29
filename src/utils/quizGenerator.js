/**
 * Dynamic JLPT N5 Quiz Generator
 * Generates randomized 4-choice Multiple Choice questions across 3 types:
 * Type 1: Kanji -> Kana (Readings)
 * Type 2: Sentence with missing Kanji -> Kana
 * Type 3: Audio Listening -> Kanji
 */

import { N5_VOCABULARY_DATA } from '../data/n5VocabularyData';

// Helper to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate distractor options excluding target
function getDistractors(pool, targetKey, keyExtractor, count = 3) {
  const filtered = pool.filter(item => keyExtractor(item) !== targetKey);
  const shuffled = shuffleArray(filtered);
  const set = new Set();
  const distractors = [];

  for (const item of shuffled) {
    const val = keyExtractor(item);
    if (!set.has(val) && val !== targetKey && val.trim()) {
      set.add(val);
      distractors.push(val);
      if (distractors.length === count) break;
    }
  }

  return distractors;
}

/**
 * Generate Quiz Questions
 * @param {Object} config - { typeFilter: 'all'|'type1'|'type2'|'type3', questionCount: 10, categoryId: 0 }
 */
export function generateQuiz(config = {}) {
  const { typeFilter = 'all', questionCount = 10, categoryId = 0 } = config;

  // Filter pool by category if specified
  const pool = categoryId === 0 
    ? N5_VOCABULARY_DATA 
    : N5_VOCABULARY_DATA.filter(item => item.categoryId === categoryId);

  if (pool.length < 4) return [];

  const shuffledPool = shuffleArray(pool);
  const selectedTargets = shuffledPool.slice(0, Math.min(questionCount, shuffledPool.length));

  const questions = [];

  selectedTargets.forEach((target, index) => {
    // Determine question type based on filter
    let qType = typeFilter;
    if (qType === 'all') {
      const types = ['type1', 'type2', 'type3'];
      qType = types[Math.floor(Math.random() * types.length)];
    }

    if (qType === 'type1') {
      // Type 1: Kanji -> Kana Reading
      const correctAnswer = target.kana;
      const distractors = getDistractors(N5_VOCABULARY_DATA, correctAnswer, item => item.kana, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      questions.push({
        id: `q-${index}-${Date.now()}`,
        type: 'type1',
        typeLabel: '1. 漢字看音 (Kanji → Kana)',
        questionText: target.kanji,
        audioText: target.kanji,
        correctAnswer: correctAnswer,
        options: options,
        targetItem: target,
        explanation: `${target.kanji}【${target.kana}】: ${target.meaning} (${target.note})`
      });

    } else if (qType === 'type2') {
      // Type 2: Sentence with missing Kanji -> Kana
      let sentence = '';
      let chineseHint = target.meaning;

      if (target.note && target.note !== '-' && !target.note.includes('外來語') && !target.note.includes('反義詞')) {
        const parts = target.note.split('（');
        const rawSentence = parts[0].trim();
        const noteHint = parts[1] ? parts[1].replace('）', '') : '';
        
        if (rawSentence.includes(target.kanji)) {
          const replacedSentence = rawSentence.replace(target.kanji, '【 ___ 】');
          sentence = `${replacedSentence} (${noteHint || chineseHint})`;
        }
      }

      if (!sentence) {
        sentence = `【 ___ 】 (${chineseHint})`;
      }

      const correctAnswer = target.kana;
      const distractors = getDistractors(N5_VOCABULARY_DATA, correctAnswer, item => item.kana, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      questions.push({
        id: `q-${index}-${Date.now()}`,
        type: 'type2',
        typeLabel: '2. 填空選音 (Sentence → Kana)',
        questionText: sentence,
        promptTitle: '請根據句意與中文提示，選擇【 ___ 】填空處的正確讀音：',
        audioText: target.kanji || target.kana,
        correctAnswer: correctAnswer,
        options: options,
        targetItem: target,
        explanation: `${target.kanji}【${target.kana}】: ${target.meaning} — ${target.note}`
      });

    } else {
      // Type 3: Audio Listening -> Kanji
      const correctAnswer = target.kanji;
      const distractors = getDistractors(N5_VOCABULARY_DATA, correctAnswer, item => item.kanji, 3);
      const options = shuffleArray([correctAnswer, ...distractors]);

      questions.push({
        id: `q-${index}-${Date.now()}`,
        type: 'type3',
        typeLabel: '3. 聽音選字 (Audio → Kanji)',
        questionText: '🔊 請點擊播放按鈕聽日語發音，選擇正確的漢字：',
        audioText: target.kanji || target.kana,
        correctAnswer: correctAnswer,
        options: options,
        targetItem: target,
        explanation: `${target.kanji}【${target.kana}】: ${target.meaning}`
      });
    }
  });

  return questions;
}
