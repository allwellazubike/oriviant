export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'match-answer'
  | 'fill-in-blank'
  | 'scenario';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  scenarioText?: string;
  options?: string[];
  pairs?: { term: string; definition: string }[];
  correctIndex?: number;
  correctAnswersMap?: Record<string, string>;
  explanationCorrect: string;
  explanationWrong: string;
}

export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  coinSymbol: string;
  currentPrice: number;
  taskType: 'buy' | 'sell' | 'stop-loss' | 'pattern-identify' | 'risk-calculate';
  chartData?: number[];
  options?: string[];
  correctOptionIndex?: number;
  initialBalanceUsdt?: number;
  recommendedStopLoss?: number;
  recommendedTakeProfit?: number;
  feedbackTips: {
    optimal: string;
    flawed: string;
  };
}

export interface LessonContentSection {
  heading: string;
  body: string;
  diagramType?: 'candlestick' | 'support-resistance' | 'rsi-divergence' | 'order-block' | 'wyckoff' | 'leverage-matrix';
  keyPoints?: string[];
}

export interface AcademyLesson {
  id: string;
  path: CourseLevel;
  lessonNumber: number;
  title: string;
  topic: string;
  summary: string;
  estimatedDuration: string;
  mediaType: 'video' | 'article' | 'infographic' | 'interactive';
  videoUrl?: string;
  infographicUrl?: string;
  sections: LessonContentSection[];
  keyTakeaways: string[];
  pdfResource?: {
    title: string;
    size: string;
  };
  quiz: QuizQuestion[];
  practiceMode?: PracticeScenario;
}

export interface DailyLearningState {
  dailyTip: {
    title: string;
    tip: string;
    category: string;
  };
  wordOfDay: {
    term: string;
    phonetic: string;
    definition: string;
    example: string;
  };
  tradingQuote: {
    quote: string;
    author: string;
    role: string;
  };
  weeklyChallenge: {
    id: string;
    title: string;
    description: string;
    targetCount: number;
    currentProgress: number;
    rewardXp: number;
  };
  dailyQuiz: QuizQuestion[];
}

export interface UserAcademyProgress {
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  totalLearningMinutes: number;
  dailyStreak: number;
  lastActiveDate: string;
  practiceScenariosCompleted: string[];
  xpPoints: number;
}
