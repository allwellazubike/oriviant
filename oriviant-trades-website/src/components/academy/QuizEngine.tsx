import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Award, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { QuizQuestion } from '../../types/academy';

interface QuizEngineProps {
  lessonTitle: string;
  questions: QuizQuestion[];
  onQuizCompleted: (scorePercentage: number) => void;
  onClose: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  lessonTitle,
  questions,
  onQuizCompleted,
  onClose,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleMatchSelect = (term: string, definition: string) => {
    if (isSubmitted) return;
    setMatchPairs({
      ...matchPairs,
      [term]: definition,
    });
  };

  // Calculate Score
  const calculateScore = () => {
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (q.type === 'match-answer') {
        if (q.correctAnswersMap) {
          let allMatch = true;
          Object.entries(q.correctAnswersMap).forEach(([term, def]) => {
            if (matchPairs[term] !== def) allMatch = false;
          });
          if (allMatch && Object.keys(q.correctAnswersMap).length > 0) correctCount++;
        }
      } else {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      }
    });

    return Math.round((correctCount / questions.length) * 100);
  };

  const scorePercentage = calculateScore();
  const isPassed = scorePercentage >= 70;

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    onQuizCompleted(scorePercentage);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setMatchPairs({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-app-card border border-app rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-app pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-extrabold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Lesson Knowledge Quiz
            </div>
            <h2 className="text-lg sm:text-xl font-black text-app mt-1">{lessonTitle}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors text-xs font-bold"
          >
            Exit Quiz
          </button>
        </div>

        {!isSubmitted ? (
          /* QUESTION IN PROGRESS */
          <div className="space-y-6">
            
            {/* Progress Bar & Counter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-app-sec">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="capitalize">{currentQuestion.type.replace('-', ' ')}</span>
              </div>
              <div className="h-2 rounded-full bg-app-sec overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Scenario Text if Scenario Type */}
            {currentQuestion.type === 'scenario' && currentQuestion.scenarioText && (
              <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-xs sm:text-sm text-app leading-relaxed space-y-1">
                <strong className="text-accent uppercase font-black tracking-wider block text-[10px]">
                  📊 Market Scenario
                </strong>
                <p>{currentQuestion.scenarioText}</p>
              </div>
            )}

            {/* Question Heading */}
            <h3 className="text-sm sm:text-base font-bold text-app leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Answers Form based on Question Type */}
            {currentQuestion.type === 'match-answer' && currentQuestion.pairs ? (
              <div className="space-y-3">
                <p className="text-xs text-app-sec">Match each term on the left with its correct definition:</p>
                {currentQuestion.pairs.map((pair, pIdx) => (
                  <div key={pIdx} className="p-3 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                    <span className="text-xs font-extrabold text-app block">{pair.term}</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {currentQuestion.pairs?.map((defPair, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => handleMatchSelect(pair.term, defPair.definition)}
                          className={`p-2 rounded-xl text-xs text-left font-medium border transition-all ${
                            matchPairs[pair.term] === defPair.definition
                              ? 'bg-accent text-white border-accent'
                              : 'bg-app-card text-app-sec border-app hover:border-accent/40'
                          }`}
                        >
                          {defPair.definition}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Multiple Choice / True-False / Fill in blank / Scenario */
              <div className="space-y-2.5">
                {currentQuestion.options?.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`w-full p-4 rounded-2xl text-xs sm:text-sm text-left font-semibold border transition-all flex items-center justify-between ${
                      selectedAnswers[currentQuestionIndex] === optIdx
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                        : 'bg-app-card text-app border-app hover:border-accent/40 hover:bg-app-sec/40'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedAnswers[currentQuestionIndex] === optIdx
                        ? 'border-white bg-white text-accent'
                        : 'border-app-sec'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === optIdx && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-app">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-app-sec text-app-sec hover:text-app disabled:opacity-40"
              >
                Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  disabled={selectedAnswers[currentQuestionIndex] === undefined && currentQuestion.type !== 'match-answer'}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-accent text-white shadow-md shadow-accent/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={Object.keys(selectedAnswers).length < questions.length && currentQuestion.type !== 'match-answer'}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                >
                  Submit Final Answers
                </button>
              )}
            </div>

          </div>
        ) : (
          /* QUIZ SUBMITTED RESULTS REVIEW */
          <div className="space-y-6">
            
            {/* Score Banner */}
            <div className={`p-6 rounded-3xl text-center space-y-2 border ${
              isPassed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              <div className="w-12 h-12 rounded-full bg-app-card mx-auto flex items-center justify-center font-bold text-2xl shadow-inner">
                {isPassed ? '🎉' : '📚'}
              </div>
              <h3 className="text-2xl font-black">{scorePercentage}% Score</h3>
              <p className="text-xs font-bold uppercase tracking-wider">
                {isPassed ? '✓ Lesson Quiz Passed! Next Lesson Unlocked.' : '✗ Score below 70% passing threshold. Please review explanations below.'}
              </p>
            </div>

            {/* Detailed Question Explanations */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-app uppercase tracking-wider">Detailed Answer Explanations</h4>
              
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div key={idx} className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    isCorrect 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-app">Q{idx + 1}: {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1 shrink-0">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    {q.options && (
                      <div className="space-y-1 text-[11px]">
                        <p className="text-app-sec">
                          Your Answer: <strong className={isCorrect ? 'text-emerald-500' : 'text-red-500'}>
                            {q.options[userAns] || 'Not answered'}
                          </strong>
                        </p>
                        {!isCorrect && q.correctIndex !== undefined && (
                          <p className="text-app-sec">
                            Correct Answer: <strong className="text-emerald-500">{q.options[q.correctIndex]}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Educational Explanations */}
                    <div className="p-2.5 rounded-xl bg-app-card border border-app space-y-1 text-[11px] leading-relaxed">
                      <p className="font-bold text-emerald-500">
                        Why this answer is correct:
                      </p>
                      <p className="text-app-sec">{q.explanationCorrect}</p>

                      {!isCorrect && (
                        <>
                          <p className="font-bold text-red-500 pt-1">
                            Why selected answer was wrong:
                          </p>
                          <p className="text-app-sec">{q.explanationWrong}</p>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-app">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-2xl bg-app-sec text-app font-bold text-xs hover:bg-app-sec/80 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Retry Quiz
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-accent text-white font-extrabold text-xs shadow-lg shadow-accent/20"
              >
                Return to Academy
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
