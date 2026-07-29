import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Volume2, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Sparkles, ArrowRight, BookOpen, Layers, Award, Play, Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuiz } from '../utils/quizGenerator';
import { CATEGORY_LIST } from '../data/n5VocabularyData';
import { tts } from '../utils/ttsEngine';

export default function Part4_VocabularyQuiz({ onOpenReaderWithText }) {
  // Quiz State: 'setup' | 'quiz' | 'result'
  const [gameState, setGameState] = useState('setup');
  const [quizConfig, setQuizConfig] = useState({
    typeFilter: 'all',
    questionCount: 10,
    categoryId: 0
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Auto-play audio when starting Type 3 question
  useEffect(() => {
    if (gameState === 'quiz' && questions[currentIndex]) {
      const q = questions[currentIndex];
      if (q.type === 'type3' && q.audioText) {
        setTimeout(() => {
          tts.speak(q.audioText, 0.95);
        }, 300);
      }
    }
  }, [gameState, currentIndex, questions]);

  // Start new quiz
  const handleStartQuiz = () => {
    const generated = generateQuiz(quizConfig);
    if (generated.length === 0) {
      alert('所選分類單字數量不足，請選擇其他分類或題型！');
      return;
    }
    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameState('quiz');
  };

  // Play audio for current question
  const handlePlayAudio = (text) => {
    tts.speak(text, 0.95);
  };

  // Handle option selection
  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      // Trigger confetti celebration
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setStreak(0);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQ,
        selectedOption: option,
        isCorrect: isCorrect
      }
    ]);
  };

  // Move to next question or show result
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('result');
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ---------------------------------------------------- */}
      {/* 1. QUIZ SETUP SCREEN */}
      {/* ---------------------------------------------------- */}
      {gameState === 'setup' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-blue))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Trophy size={32} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              JLPT N5 選擇題單字測驗 (MC Quiz)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              測驗你的日語漢字讀音、句子填空與聽力辨識能力！
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Question Type Filter */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                1. 選擇測驗題型 (Question Type):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {[
                  { id: 'all', label: '🎯 3種題型混合', desc: '漢字看音 + 句子填空 + 聽力選字' },
                  { id: 'type1', label: '📖 1. 漢字看音', desc: '看漢字選擇正確平假名讀音' },
                  { id: 'type2', label: '✍️ 2. 句子填空', desc: '閱讀句子選擇缺字讀音' },
                  { id: 'type3', label: '🎧 3. 聽力選字', desc: '聽語音發音選擇正確漢字' }
                ].map(item => (
                  <button
                    key={item.id}
                    className={`btn ${quizConfig.typeFilter === item.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      height: '100%'
                    }}
                    onClick={() => setQuizConfig(prev => ({ ...prev, typeFilter: item.id }))}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.2rem' }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                2. 題目數量 (Number of Questions):
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[5, 10, 15, 20].map(count => (
                  <button
                    key={count}
                    className={`btn ${quizConfig.questionCount === count ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.95rem' }}
                    onClick={() => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                  >
                    {count} 題
                  </button>
                ))}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                3. 單字範圍主題 (Vocabulary Category):
              </label>
              <select
                className="form-control"
                style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                value={quizConfig.categoryId}
                onChange={e => setQuizConfig(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
              >
                {CATEGORY_LIST.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Quiz Action */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.1rem' }}
            onClick={handleStartQuiz}
          >
            <Play size={20} />
            <span>開始單字測驗 (Start Quiz)</span>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. ACTIVE QUIZ INTERFACE */}
      {/* ---------------------------------------------------- */}
      {gameState === 'quiz' && currentQ && (
        <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          {/* Quiz Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-pink)', fontWeight: 700, background: 'rgba(236, 72, 153, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '12px' }}>
              {currentQ.typeLabel}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
              {streak > 1 && (
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  🔥 連勝 x{streak}!
                </span>
              )}
              <span style={{ color: 'var(--text-muted)' }}>
                第 <strong>{currentIndex + 1}</strong> / {questions.length} 題
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '1.75rem', overflow: 'hidden' }}>
            <div style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-blue))',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Question Display Surface */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            padding: '2rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: '1.75rem',
            position: 'relative'
          }}>
            {/* TYPE 1: Kanji -> Kana */}
            {currentQ.type === 'type1' && (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  請選擇下面漢字的正確平假名讀音：
                </p>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                  {currentQ.questionText}
                </div>
              </div>
            )}

            {/* TYPE 2: Sentence with missing Kanji -> Kana */}
            {currentQ.type === 'type2' && (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {currentQ.promptTitle}
                </p>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {currentQ.questionText}
                </div>
              </div>
            )}

            {/* TYPE 3: Audio Listening -> Kanji */}
            {currentQ.type === 'type3' && (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {currentQ.questionText}
                </p>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 1.5rem', fontSize: '1.05rem', borderRadius: '30px' }}
                  onClick={() => handlePlayAudio(currentQ.audioText)}
                >
                  <Volume2 size={22} />
                  <span>🔊 再次播放語音 (Replay Audio)</span>
                </button>
              </div>
            )}
          </div>

          {/* 4 Multiple Choice Option Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {currentQ.options.map((option, idx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              let btnClass = 'btn-secondary';
              let customStyle = {};

              if (isAnswered) {
                if (option === currentQ.correctAnswer) {
                  customStyle = {
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'var(--accent-emerald)',
                    color: 'var(--accent-emerald)',
                    fontWeight: 700
                  };
                } else if (option === selectedOption) {
                  customStyle = {
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'var(--accent-pink)',
                    color: 'var(--accent-pink)'
                  };
                } else {
                  customStyle = { opacity: 0.5 };
                }
              }

              return (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  style={{
                    padding: '1.1rem 1.25rem',
                    fontSize: '1.15rem',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    borderWidth: '2px',
                    transition: 'all 0.2s ease',
                    ...customStyle
                  }}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginRight: '0.75rem'
                  }}>
                    {optionLetters[idx]}
                  </span>
                  <span style={{ flex: 1 }}>{option}</span>

                  {isAnswered && option === currentQ.correctAnswer && (
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                  )}
                  {isAnswered && option === selectedOption && option !== currentQ.correctAnswer && (
                    <XCircle size={20} color="var(--accent-pink)" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation Card */}
          {isAnswered && (
            <div style={{
              background: selectedOption === currentQ.correctAnswer ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${selectedOption === currentQ.correctAnswer ? 'var(--accent-emerald)' : 'rgba(239, 68, 68, 0.4)'}`,
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: selectedOption === currentQ.correctAnswer ? 'var(--accent-emerald)' : 'var(--accent-pink)' }}>
                  {selectedOption === currentQ.correctAnswer ? (
                    <>
                      <CheckCircle2 size={20} />
                      <span>回答正確！ (Correct!)</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span>回答錯誤！ (Incorrect)</span>
                    </>
                  )}
                </div>

                {/* Listen to word */}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                  onClick={() => handlePlayAudio(currentQ.targetItem.kanji || currentQ.targetItem.kana)}
                >
                  <Volume2 size={14} color="var(--accent-pink)" />
                  <span>聽發音</span>
                </button>
              </div>

              {/* Explanation Note */}
              <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                <strong>解說：</strong> {currentQ.explanation}
              </div>

              {/* Next Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.7rem 1.5rem', fontSize: '1rem' }}
                  onClick={handleNextQuestion}
                >
                  <span>{currentIndex + 1 === questions.length ? '查看測驗結果 (View Results)' : '下一題 (Next Question)'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. QUIZ RESULT SCREEN */}
      {/* ---------------------------------------------------- */}
      {gameState === 'result' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-blue))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Award size={40} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              測驗完成！ (Quiz Completed)
            </h2>

            {/* Score Percentage */}
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-pink)', margin: '0.5rem 0' }}>
              {Math.round((score / questions.length) * 100)}%
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              得分：<strong>{score}</strong> / {questions.length} 題正確
            </p>
          </div>

          {/* Review List of Mistakes */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent-blue)" />
              <span>測驗題目檢討 (Question Review):</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userAnswers.map((ans, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ans.isCorrect ? (
                      <CheckCircle2 size={22} color="var(--accent-emerald)" />
                    ) : (
                      <XCircle size={22} color="var(--accent-pink)" />
                    )}

                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                        第 {idx + 1} 題: {ans.question.targetItem.kanji}【{ans.question.targetItem.kana}】 — {ans.question.targetItem.meaning}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        你的回答: <span style={{ color: ans.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-pink)', fontWeight: 600 }}>{ans.selectedOption}</span>
                        {!ans.isCorrect && ` (正確答案: ${ans.question.correctAnswer})`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {/* Audio */}
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => handlePlayAudio(ans.question.targetItem.kanji || ans.question.targetItem.kana)}
                    >
                      <Volume2 size={14} color="var(--accent-pink)" />
                    </button>

                    {/* Reader */}
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (onOpenReaderWithText) {
                          onOpenReaderWithText(ans.question.targetItem.kanji, ans.question.targetItem.meaning);
                        }
                      }}
                    >
                      <span>在 Reader 開啟</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
              onClick={handleStartQuiz}
            >
              <RotateCcw size={18} />
              <span>再測驗一次 (Try Again)</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}
              onClick={() => setGameState('setup')}
            >
              <Filter size={18} />
              <span>修改測驗設定 (Change Settings)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
