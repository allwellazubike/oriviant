import { 
  AcademyLesson, 
  DailyLearningState, 
  UserAcademyProgress 
} from '../types/academy';

export const INITIAL_USER_ACADEMY_PROGRESS: UserAcademyProgress = {
  completedLessonIds: ['beg-01'], // First lesson unlocked by default
  quizScores: {
    'beg-01': 100,
  },
  totalLearningMinutes: 45,
  dailyStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  practiceScenariosCompleted: [],
  xpPoints: 250,
};

export const MOCK_DAILY_LEARNING: DailyLearningState = {
  dailyTip: {
    title: 'Never Risk More Than 1-2% Per Trade',
    tip: 'Position sizing is the foundation of long-term profitability. By risking no more than 1.5% of total capital per trade, you can endure a string of 10 consecutive losses without wrecking your portfolio.',
    category: 'Risk Management',
  },
  wordOfDay: {
    term: 'Funding Rate',
    phonetic: '/ˈfʌndɪŋ reɪt/',
    definition: 'Periodic payments exchanged between long and short traders in perpetual futures to keep perpetual contract prices aligned with spot index prices.',
    example: 'When the funding rate is positive (+0.01%), long traders pay short traders every 8 hours.',
  },
  tradingQuote: {
    quote: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.",
    author: 'George Soros',
    role: 'Legendary Macro Investor',
  },
  weeklyChallenge: {
    id: 'wc-01',
    title: 'Technical Mastermind Challenge',
    description: 'Complete 3 Intermediate TA lessons (RSI, MACD, Support/Resistance) & score at least 90% on their quizzes.',
    targetCount: 3,
    currentProgress: 1,
    rewardXp: 500,
  },
  dailyQuiz: [
    {
      id: 'dq-1',
      type: 'multiple-choice',
      question: 'What happens when a trader opens a 10x Long position on BTC/USDT with $1,000 margin?',
      options: [
        'They control $10,000 worth of BTC and profit if BTC price rises',
        'They control $1,000 worth of BTC and pay 10% daily interest',
        'They cannot be liquidated if price drops below 10%',
        'They earn 10x funding fees automatically'
      ],
      correctIndex: 0,
      explanationCorrect: 'Correct! Leverage multiplies buying power. With $1,000 margin at 10x leverage, you control a $10,000 position.',
      explanationWrong: 'Incorrect. 10x leverage increases total position exposure to $10,000 ($1,000 x 10).',
    },
    {
      id: 'dq-2',
      type: 'true-false',
      question: 'True or False: A Market Order guarantees the exact execution price regardless of market slippage.',
      options: ['True', 'False'],
      correctIndex: 1,
      explanationCorrect: 'Correct! Market orders guarantee immediate speed of execution, but NOT the exact price, especially during low liquidity.',
      explanationWrong: 'Incorrect. Limit orders guarantee price (or better), whereas Market orders prioritize speed over price precision.',
    },
    {
      id: 'dq-3',
      type: 'fill-in-blank',
      question: 'When the RSI indicator rises above ____, a cryptocurrency asset is traditionally considered overbought.',
      options: ['50', '70', '30', '90'],
      correctIndex: 1,
      explanationCorrect: 'Correct! RSI readings above 70 indicate overbought conditions, while readings below 30 indicate oversold conditions.',
      explanationWrong: 'Incorrect. Standard RSI boundaries are 70 for overbought and 30 for oversold.',
    }
  ],
};

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // ==========================================
  // BEGINNER COURSE (13 LESSONS)
  // ==========================================
  {
    id: 'beg-01',
    path: 'Beginner',
    lessonNumber: 1,
    title: 'What is Cryptocurrency?',
    topic: 'Crypto Fundamentals',
    summary: 'Discover digital currencies, decentralization, cryptographic security, and how digital assets differ from fiat money.',
    estimatedDuration: '8 mins',
    mediaType: 'article',
    pdfResource: { title: 'Crypto Fundamentals Cheatsheet.pdf', size: '1.2 MB' },
    sections: [
      {
        heading: 'Introduction to Digital Value',
        body: 'Cryptocurrency is a peer-to-peer digital currency secured by cryptography rather than centralized banking institutions. Unlike traditional fiat currencies (like USD or EUR) issued by governments, cryptocurrencies run on distributed networks.',
        keyPoints: [
          'Decentralized: No single entity or central bank controls the network',
          'Borderlessly Accessible: Anyone with internet access can transfer funds globally',
          'Immutable Ledger: Transactions cannot be altered or reversed once recorded'
        ]
      },
      {
        heading: 'The Invention of Bitcoin',
        body: 'In 2008, an anonymous developer or group named Satoshi Nakamoto published the Bitcoin whitepaper, solving the "double-spending problem" without needing a trusted third party.'
      }
    ],
    keyTakeaways: [
      'Cryptocurrencies offer borderless, 24/7 peer-to-peer transactions.',
      'Cryptography prevents double-spending and unauthorized modifications.',
      'Bitcoin was the first decentralized cryptocurrency created in 2008.'
    ],
    quiz: [
      {
        id: 'q-beg-01-1',
        type: 'multiple-choice',
        question: 'Who created Bitcoin in 2008?',
        options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Gavin Wood'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Satoshi Nakamoto authored the Bitcoin whitepaper in 2008 and launched the network in 2009.',
        explanationWrong: 'Incorrect. Satoshi Nakamoto is the pseudonymous creator of Bitcoin. Vitalik Buterin created Ethereum.'
      },
      {
        id: 'q-beg-01-2',
        type: 'true-false',
        question: 'True or False: Traditional central banks control the supply of Bitcoin.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Bitcoin is decentralized. Its total supply is algorithmically capped at 21 million BTC.',
        explanationWrong: 'Incorrect. No central bank controls Bitcoin; supply is enforced by distributed node consensus.'
      }
    ]
  },
  {
    id: 'beg-02',
    path: 'Beginner',
    lessonNumber: 2,
    title: 'Blockchain Basics',
    topic: 'Distributed Ledger Technology',
    summary: 'Understand nodes, blocks, cryptographic hashing, and consensus mechanisms like Proof of Work and Proof of Stake.',
    estimatedDuration: '10 mins',
    mediaType: 'infographic',
    pdfResource: { title: 'Blockchain Architecture Blueprint.pdf', size: '2.1 MB' },
    sections: [
      {
        heading: 'How a Block Works',
        body: 'A blockchain is a chain of transaction blocks. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. This forms an unbreakable chain.',
        diagramType: 'candlestick'
      },
      {
        heading: 'Proof of Work vs Proof of Stake',
        body: 'Proof of Work (PoW) uses computational energy (miners) to secure transactions. Proof of Stake (PoS) uses economic validators staking coins to validate transactions efficiently.'
      }
    ],
    keyTakeaways: [
      'Blocks link together cryptographically via cryptographic hashes.',
      'Proof of Stake consumes over 99% less energy than Proof of Work.',
      'Nodes validate blocks to ensure network agreement.'
    ],
    quiz: [
      {
        id: 'q-beg-02-1',
        type: 'multiple-choice',
        question: 'What links individual blocks together in a blockchain?',
        options: ['Central database tokens', 'Cryptographic hashes', 'Manual admin approval', 'Bank wire receipts'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Each block stores the unique cryptographic hash of the previous block.',
        explanationWrong: 'Incorrect. Cryptographic hashes create a tamper-evident chain of blocks.'
      }
    ]
  },
  {
    id: 'beg-03',
    path: 'Beginner',
    lessonNumber: 3,
    title: 'Spot Trading',
    topic: 'Spot Trading Fundamentals',
    summary: 'Learn direct buying and selling of actual crypto assets with instant ownership delivery.',
    estimatedDuration: '12 mins',
    mediaType: 'article',
    pdfResource: { title: 'Spot Orderbook Guide.pdf', size: '1.5 MB' },
    sections: [
      {
        heading: 'What is Spot Trading?',
        body: 'Spot trading involves buying or selling cryptocurrencies for immediate delivery. When you buy BTC on the Oriviant Spot market, you own the actual BTC in your spot wallet.'
      }
    ],
    keyTakeaways: [
      'Spot purchases grant direct ownership of the cryptocurrency.',
      'No leverage is involved in standard spot trades.',
      'You only lose money if the asset value drops and you sell at a loss.'
    ],
    quiz: [
      {
        id: 'q-beg-03-1',
        type: 'multiple-choice',
        question: 'When you execute a Spot buy order on BTC/USDT, what happens?',
        options: [
          'You buy actual BTC and own it in your wallet',
          'You open a 100x derivative position',
          'You borrow USDT from the exchange',
          'You lease BTC for 30 days'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! Spot trading results in direct ownership of the underlying asset.',
        explanationWrong: 'Incorrect. Spot trading involves real asset ownership without leverage.'
      }
    ],
    practiceMode: {
      id: 'prac-beg-3',
      title: 'Practice Order Execution: Spot BTC Buy',
      description: 'Simulate placing a Spot Buy Order for 0.1 BTC at $65,000 market price.',
      coinSymbol: 'BTC/USDT',
      currentPrice: 65000,
      taskType: 'buy',
      initialBalanceUsdt: 10000,
      options: ['Buy 0.1 BTC at Market ($6,500)', 'Buy 1.0 BTC with $65,000 leverage', 'Sell 0.5 BTC Short'],
      correctOptionIndex: 0,
      feedbackTips: {
        optimal: 'Excellent! Spot buying within available USDT balance grants instant asset delivery without liquidation risk.',
        flawed: 'Avoid using excess leverage when practicing spot trading. Spot trading uses available cash reserves.'
      }
    }
  },
  {
    id: 'beg-04',
    path: 'Beginner',
    lessonNumber: 4,
    title: 'Futures Trading',
    topic: 'Derivatives & Contracts',
    summary: 'Explore perpetual futures contracts, contract specifications, and directional speculation.',
    estimatedDuration: '14 mins',
    mediaType: 'video',
    sections: [
      {
        heading: 'Perpetual Futures Contracts',
        body: 'Futures allow traders to speculate on the future price of an asset without owning the physical underlying coin. Perpetual contracts have no expiration date.'
      }
    ],
    keyTakeaways: [
      'Futures allow speculation on price rising (Long) or falling (Short).',
      'Perpetual contracts use Funding Rates to anchor contract prices to spot index prices.'
    ],
    quiz: [
      {
        id: 'q-beg-04-1',
        type: 'true-false',
        question: 'True or False: Perpetual futures contracts have a mandatory expiration date every month.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Perpetual futures contracts do NOT expire; positions can be held indefinitely.',
        explanationWrong: 'Incorrect. Perpetual contracts differ from traditional futures because they never expire.'
      }
    ]
  },
  {
    id: 'beg-05',
    path: 'Beginner',
    lessonNumber: 5,
    title: 'What is Leverage?',
    topic: 'Leverage & Margin Mechanics',
    summary: 'Understand margin multipliers, collateral, leverage scaling, and risk exposure.',
    estimatedDuration: '12 mins',
    mediaType: 'article',
    sections: [
      {
        heading: 'Leverage Explained',
        body: 'Leverage allows you to open a trade position larger than your initial margin balance. For instance, using 10x leverage on $500 collateral opens a $5,000 trade position.'
      }
    ],
    keyTakeaways: [
      'Leverage amplifies both profits and potential losses equally.',
      'Higher leverage brings liquidation price closer to entry price.'
    ],
    quiz: [
      {
        id: 'q-beg-05-1',
        type: 'multiple-choice',
        question: 'If you place $100 margin at 20x leverage, what is your total position size?',
        options: ['$100', '$500', '$2,000', '$20,000'],
        correctIndex: 2,
        explanationCorrect: 'Correct! $100 x 20 = $2,000 position exposure.',
        explanationWrong: 'Incorrect. Position size = Margin x Leverage ($100 x 20 = $2,000).'
      }
    ]
  },
  {
    id: 'beg-06',
    path: 'Beginner',
    lessonNumber: 6,
    title: 'Long vs Short',
    topic: 'Directional Positions',
    summary: 'Master profiting in bull markets with Longs and bear markets with Shorts.',
    estimatedDuration: '10 mins',
    mediaType: 'article',
    sections: [
      { heading: 'Going Long', body: 'Going Long means buying expecting asset prices to increase.' },
      { heading: 'Going Short', body: 'Going Short means selling borrowed contracts expecting asset prices to decrease.' }
    ],
    keyTakeaways: ['Long = Profit when price rises.', 'Short = Profit when price drops.'],
    quiz: [
      {
        id: 'q-beg-06-1',
        type: 'multiple-choice',
        question: 'In which market condition do you profit from a Short position?',
        options: ['When market price goes UP', 'When market price goes DOWN', 'When price stays exactly flat', 'During funding payout only'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Short positions profit as asset prices decline.',
        explanationWrong: 'Incorrect. Short positions earn profit when market prices drop.'
      }
    ]
  },
  {
    id: 'beg-07',
    path: 'Beginner',
    lessonNumber: 7,
    title: 'Market Orders',
    topic: 'Order Execution Types',
    summary: 'Understand instant market execution, taker fees, and liquidity consumption.',
    estimatedDuration: '9 mins',
    mediaType: 'article',
    sections: [{ heading: 'Market Order Mechanics', body: 'Market orders fill immediately at the best available orderbook prices.' }],
    keyTakeaways: ['Fastest execution method.', 'Subject to market taker fees and potential slippage.'],
    quiz: [
      {
        id: 'q-beg-07-1',
        type: 'true-false',
        question: 'True or False: Market orders wait in the orderbook until a specific target price is reached.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Market orders execute immediately. Limit orders wait in the orderbook.',
        explanationWrong: 'Incorrect. Market orders execute instantly against existing resting orders.'
      }
    ]
  },
  {
    id: 'beg-08',
    path: 'Beginner',
    lessonNumber: 8,
    title: 'Limit Orders',
    topic: 'Order Execution Types',
    summary: 'Master setting exact buy/sell price targets, orderbook placement, and maker fee discounts.',
    estimatedDuration: '11 mins',
    mediaType: 'article',
    sections: [{ heading: 'Limit Order Advantages', body: 'Limit orders allow traders to set maximum purchase or minimum sell prices.' }],
    keyTakeaways: ['Guarantees price or better.', 'May not fill if market price does not reach your target.'],
    quiz: [
      {
        id: 'q-beg-08-1',
        type: 'multiple-choice',
        question: 'What is the main benefit of a Limit order over a Market order?',
        options: ['Guaranteed instant execution', 'Price precision and lower maker fees', 'Automatic 100x leverage', 'Bypasses KYC checks'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Limit orders guarantee execution price control and earn lower maker fees.',
        explanationWrong: 'Incorrect. Limit orders grant price precision and maker fee savings.'
      }
    ]
  },
  {
    id: 'beg-09',
    path: 'Beginner',
    lessonNumber: 9,
    title: 'Stop Loss',
    topic: 'Capital Protection',
    summary: 'Implement mandatory stop loss triggers to cap losses automatically.',
    estimatedDuration: '12 mins',
    mediaType: 'article',
    sections: [{ heading: 'Automated Loss Containment', body: 'A Stop Loss order automatically closes a losing trade when price hits your pre-determined threshold.' }],
    keyTakeaways: ['Essential risk rule.', 'Prevents emotional trade management and catastrophic account loss.'],
    quiz: [
      {
        id: 'q-beg-09-1',
        type: 'multiple-choice',
        question: 'Where should a Stop Loss be placed for a Long trade on BTC entered at $60,000?',
        options: ['Above entry at $65,000', 'Below entry at $58,500', 'At liquidation price exactly', 'No stop loss is needed'],
        correctIndex: 1,
        explanationCorrect: 'Correct! For a Long trade, Stop Loss is placed below the entry price to limit drawdown.',
        explanationWrong: 'Incorrect. Long stop losses are placed below entry to exit if price drops.'
      }
    ]
  },
  {
    id: 'beg-10',
    path: 'Beginner',
    lessonNumber: 10,
    title: 'Take Profit',
    topic: 'Capital Harvesting',
    summary: 'Lock in profits systematically with Take Profit limit targets.',
    estimatedDuration: '10 mins',
    mediaType: 'article',
    sections: [{ heading: 'Locking In Gains', body: 'Take Profit orders automatically close winning trades at your target profit price.' }],
    keyTakeaways: ['Removes greed from trade exits.', 'Ensures planned risk-reward ratios are realized.'],
    quiz: [
      {
        id: 'q-beg-10-1',
        type: 'true-false',
        question: 'True or False: Take Profit orders should be set based on technical resistance levels rather than random emotion.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Objective technical targets ensure consistent probability.',
        explanationWrong: 'Incorrect. Take profit targets should always align with technical structure.'
      }
    ]
  },
  {
    id: 'beg-11',
    path: 'Beginner',
    lessonNumber: 11,
    title: 'Candlestick Basics',
    topic: 'Chart Reading',
    summary: 'Read open, high, low, and close (OHLC) price action candles.',
    estimatedDuration: '15 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Anatomy of a Candlestick', body: 'Candlesticks visually display price movement over a timeframe with wicks (shadows) and real bodies.' }],
    keyTakeaways: ['Green/Bullish = Close above Open.', 'Red/Bearish = Close below Open.'],
    quiz: [
      {
        id: 'q-beg-11-1',
        type: 'multiple-choice',
        question: 'What do the wicks (shadows) of a candlestick represent?',
        options: ['The total trading volume', 'The highest and lowest prices reached during that timeframe', 'The leverage multiplier used', 'The exchange fee percentage'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Candle wicks show the extreme high and low price range during the timeframe.',
        explanationWrong: 'Incorrect. Wicks represent the highest and lowest price points.'
      }
    ]
  },
  {
    id: 'beg-12',
    path: 'Beginner',
    lessonNumber: 12,
    title: 'Risk Management',
    topic: 'Capital Preservation',
    summary: 'Calculate position sizing, risk-to-reward ratios, and drawdown limits.',
    estimatedDuration: '14 mins',
    mediaType: 'article',
    sections: [{ heading: 'The 1% Rule', body: 'Never risk more than 1% to 2% of total account balance on any single trade.' }],
    keyTakeaways: ['Risk management determines trading longevity.', 'Always calculate risk before calculating profit.'],
    quiz: [
      {
        id: 'q-beg-12-1',
        type: 'multiple-choice',
        question: 'If your account balance is $10,000, how much money are you risking using a 1% risk rule?',
        options: ['$10', '$100', '$1,000', '$500'],
        correctIndex: 1,
        explanationCorrect: 'Correct! 1% of $10,000 is $100 max risk per trade.',
        explanationWrong: 'Incorrect. $10,000 x 0.01 = $100.'
      }
    ]
  },
  {
    id: 'beg-13',
    path: 'Beginner',
    lessonNumber: 13,
    title: 'Portfolio Management',
    topic: 'Asset Allocation',
    summary: 'Diversify across Layer-1s, Stablecoins, Bluechips, and High-Beta altcoins.',
    estimatedDuration: '12 mins',
    mediaType: 'article',
    sections: [{ heading: 'Balanced Portfolio Pillars', body: 'Combine core stable assets (BTC, ETH, Stablecoins) with tactical high-growth allocations.' }],
    keyTakeaways: ['Diversification reduces portfolio volatility.', 'Rebalance periodically to capture gains.'],
    quiz: [
      {
        id: 'q-beg-13-1',
        type: 'multiple-choice',
        question: 'What is the primary objective of portfolio diversification in crypto?',
        options: ['To guarantee 1000x returns overnight', 'To reduce overall risk exposure and smooth out drawdowns', 'To avoid paying trading fees', 'To trade without internet access'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Diversification spreads capital to mitigate single-asset collapse risk.',
        explanationWrong: 'Incorrect. Diversification aims to manage volatility and minimize overall risk.'
      }
    ]
  },

  // ==========================================
  // INTERMEDIATE COURSE (13 LESSONS)
  // ==========================================
  {
    id: 'int-01',
    path: 'Intermediate',
    lessonNumber: 1,
    title: 'Technical Analysis',
    topic: 'Price Action & Charts',
    summary: 'Analyze price history, trend structures, market cycles, and trader psychology on charts.',
    estimatedDuration: '15 mins',
    mediaType: 'article',
    pdfResource: { title: 'Technical Analysis Playbook.pdf', size: '3.4 MB' },
    sections: [
      { heading: 'Core Tenets of TA', body: 'Price action discounts everything. Prices move in trends, and historical patterns repeat due to human emotion.' }
    ],
    keyTakeaways: ['Technical analysis studies price action and volume.', 'Identify high probability setups.'],
    quiz: [
      {
        id: 'q-int-01-1',
        type: 'multiple-choice',
        question: 'What is the fundamental assumption of Technical Analysis?',
        options: ['Market price discounts all available public information and history repeats', 'Governments control chart candles', 'Volume is completely irrelevant', 'News is the only factor influencing prices'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Technical analysis relies on market price action reflecting all collective market psychology.',
        explanationWrong: 'Incorrect. TA assumes price action reflects all sentiment and history tends to repeat.'
      }
    ]
  },
  {
    id: 'int-02',
    path: 'Intermediate',
    lessonNumber: 2,
    title: 'Support & Resistance',
    topic: 'Key Price Levels',
    summary: 'Identify horizontal price floors, supply ceilings, flip zones, and breakout retests.',
    estimatedDuration: '16 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Floor vs Ceiling Mechanics', body: 'Support is a price level where buying interest halts declines. Resistance is where selling interest caps rallies.' }],
    keyTakeaways: ['When Resistance breaks, it often flips into Support.', 'Touch counts validate level strength.'],
    quiz: [
      {
        id: 'q-int-02-1',
        type: 'multiple-choice',
        question: 'What happens when a strong Resistance level is broken decisively with high volume?',
        options: ['The asset is deleted from exchange', 'The broken Resistance level frequently acts as new Support', 'Price immediately crashes to zero', 'Short sellers earn 100% bonus'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Role reversal occurs: former resistance becomes new support on retests.',
        explanationWrong: 'Incorrect. Broken resistance frequently flips into support.'
      }
    ]
  },
  {
    id: 'int-03',
    path: 'Intermediate',
    lessonNumber: 3,
    title: 'Trendlines',
    topic: 'Dynamic Structure',
    summary: 'Draw accurate trendlines, dynamic support/resistance, and channel bounds.',
    estimatedDuration: '12 mins',
    mediaType: 'article',
    sections: [{ heading: 'Drawing Valid Trendlines', body: 'A valid trendline requires at least 3 distinct touchpoints connecting swing highs or lows.' }],
    keyTakeaways: ['Never force trendlines through candle bodies.', 'Steep trendlines break faster than shallow ones.'],
    quiz: [
      {
        id: 'q-int-03-1',
        type: 'multiple-choice',
        question: 'How many distinct candle swing touchpoints are needed to validate a trendline?',
        options: ['1', '2', 'At least 3', '10'],
        correctIndex: 2,
        explanationCorrect: 'Correct! Two points make a line; a third touch validates it as a active trendline.',
        explanationWrong: 'Incorrect. At least 3 touchpoints confirm a valid trendline.'
      }
    ]
  },
  {
    id: 'int-04',
    path: 'Intermediate',
    lessonNumber: 4,
    title: 'Chart Patterns',
    topic: 'Pattern Recognition',
    summary: 'Trade Head & Shoulders, Double Bottoms, Bull Flags, and Triangles.',
    estimatedDuration: '18 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Reversal vs Continuation Patterns', body: 'Head & Shoulders signal trend reversals. Bull Flags and Pennants signal trend continuations.' }],
    keyTakeaways: ['Wait for candle close confirmation outside pattern boundaries.', 'Measure target projections based on pattern height.'],
    quiz: [
      {
        id: 'q-int-04-1',
        type: 'multiple-choice',
        question: 'What market directional move does a Double Bottom pattern indicate?',
        options: ['Bearish continuation', 'Bullish reversal from a downtrend', 'Immediate exchange maintenance', 'Sideways chop forever'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Double Bottom (W pattern) is a classic bullish reversal structure.',
        explanationWrong: 'Incorrect. Double Bottom indicates buyers absorbing supply at a key floor, reversing upward.'
      }
    ]
  },
  {
    id: 'int-05',
    path: 'Intermediate',
    lessonNumber: 5,
    title: 'Indicators',
    topic: 'Technical Tooling',
    summary: 'Understand lagging vs leading indicators, momentum oscillators, and overlay tools.',
    estimatedDuration: '14 mins',
    mediaType: 'article',
    sections: [{ heading: 'Selecting Indicator Suites', body: 'Avoid indicator clutter. Combine a trend indicator (Moving Average) with a momentum oscillator (RSI).' }],
    keyTakeaways: ['Indicators confirm price action; they do not replace it.', 'Avoid redundant indicators showing identical metrics.'],
    quiz: [
      {
        id: 'q-int-05-1',
        type: 'true-false',
        question: 'True or False: Stacking 6 different momentum indicators on one chart guarantees 100% win rate.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanationCorrect: 'Correct! Over-complicating charts causes analysis paralysis and lag.',
        explanationWrong: 'Incorrect. Fewer, well-chosen indicators alongside raw price action are superior.'
      }
    ]
  },
  {
    id: 'int-06',
    path: 'Intermediate',
    lessonNumber: 6,
    title: 'RSI (Relative Strength Index)',
    topic: 'Momentum Oscillator',
    summary: 'Master overbought/oversold levels, centerline 50 crosses, and bullish/bearish divergences.',
    estimatedDuration: '15 mins',
    mediaType: 'video',
    sections: [{ heading: 'Trading RSI Divergences', body: 'A Bullish Divergence occurs when price makes a lower low, but RSI makes a higher low, signaling weakening sell momentum.' }],
    keyTakeaways: ['RSI > 70 = Overbought.', 'RSI < 30 = Oversold.', 'Divergences spot early trend reversals.'],
    quiz: [
      {
        id: 'q-int-06-1',
        type: 'multiple-choice',
        question: 'What is a Bullish RSI Divergence?',
        options: [
          'Price makes lower low while RSI makes higher low',
          'Price makes higher high while RSI makes lower low',
          'Price and RSI both drop to zero',
          'RSI stays flat at 50'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! Bullish divergence reveals selling pressure fading despite lower prices.',
        explanationWrong: 'Incorrect. Lower price low with higher RSI low signals bullish momentum divergence.'
      }
    ]
  },
  {
    id: 'int-07',
    path: 'Intermediate',
    lessonNumber: 7,
    title: 'MACD (Moving Average Convergence Divergence)',
    topic: 'Trend & Momentum',
    summary: 'Trade MACD crossovers, signal line crosses, and histogram expansion.',
    estimatedDuration: '14 mins',
    mediaType: 'article',
    sections: [{ heading: 'MACD Signal Line Crosses', body: 'When the MACD line crosses above the signal line below zero, a bullish entry trigger is confirmed.' }],
    keyTakeaways: ['Histogram expansion shows trend acceleration.', 'Zero-line crosses confirm macro trend direction.'],
    quiz: [
      {
        id: 'q-int-07-1',
        type: 'multiple-choice',
        question: 'What signal occurs when the fast MACD line crosses ABOVE the slow Signal line?',
        options: ['Bullish Crossover', 'Bearish Breakdown', 'Liquidation Trigger', 'Flat market state'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Fast line crossing above signal line signals bullish momentum acceleration.',
        explanationWrong: 'Incorrect. MACD crossing above signal line is a classic bullish momentum trigger.'
      }
    ]
  },
  {
    id: 'int-08',
    path: 'Intermediate',
    lessonNumber: 8,
    title: 'Bollinger Bands',
    topic: 'Volatility Bands',
    summary: 'Trade volatility squeezes, band walks, and mean reversion to the 20 SMA.',
    estimatedDuration: '13 mins',
    mediaType: 'article',
    sections: [{ heading: 'The Bollinger Squeeze', body: 'When bands contract tightly, volatility drops to minimums—signaling an explosive breakout is imminent.' }],
    keyTakeaways: ['Bands expand during high volatility.', 'Price touches outer bands during strong trends.'],
    quiz: [
      {
        id: 'q-int-08-1',
        type: 'multiple-choice',
        question: 'What usually follows a tight Bollinger Band Squeeze?',
        options: ['An explosive volatility breakout in price', 'Exchange closure', 'Zero trading volume', 'Stablecoin peg loss'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Periods of low volatility (squeeze) lead directly to high volatility breakouts.',
        explanationWrong: 'Incorrect. Band squeezes precede major directional volatility expansions.'
      }
    ]
  },
  {
    id: 'int-09',
    path: 'Intermediate',
    lessonNumber: 9,
    title: 'Moving Averages',
    topic: 'Trend Smoothing',
    summary: 'Utilize 20, 50, and 200 SMA/EMA dynamic support and Golden/Death Crosses.',
    estimatedDuration: '14 mins',
    mediaType: 'article',
    sections: [{ heading: 'Golden Cross vs Death Cross', body: 'A Golden Cross occurs when the 50-day MA crosses above the 200-day MA, signaling a macro bull market.' }],
    keyTakeaways: ['EMA places greater weight on recent price data.', 'Moving averages act as dynamic support/resistance.'],
    quiz: [
      {
        id: 'q-int-09-1',
        type: 'multiple-choice',
        question: 'What is a "Golden Cross"?',
        options: [
          '50 MA crosses above 200 MA',
          '50 MA crosses below 200 MA',
          'Price drops 50% in one candle',
          'RSI reaches 100'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! 50 MA crossing above 200 MA is a macro bullish signal.',
        explanationWrong: 'Incorrect. Golden cross is the 50 MA moving above the 200 MA.'
      }
    ]
  },
  {
    id: 'int-10',
    path: 'Intermediate',
    lessonNumber: 10,
    title: 'Fibonacci',
    topic: 'Retracement Ratios',
    summary: 'Plot golden ratio levels (0.382, 0.5, 0.618) to pinpoint high-probability pullback entries.',
    estimatedDuration: '15 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'The Golden Pocket (0.618 - 0.65)', body: 'The area between the 61.8% and 65% retracement level is statistically the highest probability re-entry zone.' }],
    keyTakeaways: ['Draw Fibs from swing low to swing high in uptrends.', 'Confluence with support increases accuracy.'],
    quiz: [
      {
        id: 'q-int-10-1',
        type: 'multiple-choice',
        question: 'Which Fibonacci level is widely known as the "Golden Ratio"?',
        options: ['0.236', '0.618', '0.999', '0.100'],
        correctIndex: 1,
        explanationCorrect: 'Correct! 0.618 (61.8%) is the mathematical Golden Ratio.',
        explanationWrong: 'Incorrect. 0.618 is the primary Golden Ratio level in financial technical analysis.'
      }
    ]
  },
  {
    id: 'int-11',
    path: 'Intermediate',
    lessonNumber: 11,
    title: 'Volume Analysis',
    topic: 'Market Participation',
    summary: 'Confirm breakouts with high volume and spot weak rallies on declining volume.',
    estimatedDuration: '13 mins',
    mediaType: 'article',
    sections: [{ heading: 'Volume Validates Price', body: 'Price breakouts accompanied by expanding volume signal genuine institutional conviction.' }],
    keyTakeaways: ['Price up + Volume up = Strong Bull trend.', 'Price up + Volume down = Weak Exhaustion.'],
    quiz: [
      {
        id: 'q-int-11-1',
        type: 'true-false',
        question: 'True or False: A price breakout above resistance with low volume is highly prone to failing as a fakeout.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Low volume breakouts lack institutional backing and frequently reverse.',
        explanationWrong: 'Incorrect. Low volume breakouts indicate weak demand and high failure rate.'
      }
    ]
  },
  {
    id: 'int-12',
    path: 'Intermediate',
    lessonNumber: 12,
    title: 'Swing Trading',
    topic: 'Multi-Day Strategy',
    summary: 'Capture multi-day to multi-week trend waves with favorable risk-reward setups.',
    estimatedDuration: '15 mins',
    mediaType: 'article',
    sections: [{ heading: 'Patience over Frequency', body: 'Swing traders trade 4H and Daily charts, holding trades for days to weeks without over-trading.' }],
    keyTakeaways: ['Lower stress than scalping.', 'Fewer trades, larger percentage moves captured.'],
    quiz: [
      {
        id: 'q-int-12-1',
        type: 'multiple-choice',
        question: 'Which chart timeframes do Swing Traders primarily analyze?',
        options: ['1-second and 5-second', '1-minute only', '4-Hour and Daily charts', 'Yearly charts only'],
        correctIndex: 2,
        explanationCorrect: 'Correct! 4H and Daily timeframes filter out intraday noise and reveal high quality swing trends.',
        explanationWrong: 'Incorrect. Swing traders rely on 4H and Daily charts.'
      }
    ]
  },
  {
    id: 'int-13',
    path: 'Intermediate',
    lessonNumber: 13,
    title: 'Scalping',
    topic: 'High Frequency Intraday',
    summary: 'Execute fast 1-minute to 5-minute trades leveraging tight spreads and fast execution.',
    estimatedDuration: '16 mins',
    mediaType: 'article',
    sections: [{ heading: 'Speed & Discipline', body: 'Scalpers capture small 0.3% to 1% price moves repeatedly across 1m/5m timeframes.' }],
    keyTakeaways: ['Requires low engine latency.', 'Strict stop loss discipline is paramount.'],
    quiz: [
      {
        id: 'q-int-13-1',
        type: 'multiple-choice',
        question: 'What is the primary risk scalpers face if they lack discipline?',
        options: ['One un-stopped losing trade wiping out 10 small gains', 'Instant profit caps', 'Automatic tax audits', 'Chart freeze'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Scalping small wins requires strict stops, otherwise one bad loss destroys win streak gains.',
        explanationWrong: 'Incorrect. Without tight stop loss rules, one large drawdown erases dozens of small scalps.'
      }
    ]
  },

  // ==========================================
  // ADVANCED COURSE (13 LESSONS)
  // ==========================================
  {
    id: 'adv-01',
    path: 'Advanced',
    lessonNumber: 1,
    title: 'Institutional Trading',
    topic: 'Market Microstructure',
    summary: 'Understand institutional order accumulation, block trading, and liquidity provisioning.',
    estimatedDuration: '18 mins',
    mediaType: 'article',
    pdfResource: { title: 'Institutional Market Microstructure.pdf', size: '4.8 MB' },
    sections: [
      { heading: 'Market Maker Mechanics', body: 'Institutions cannot enter market orders with $100M without causing massive slippage. They construct liquidity traps to fill orders.' }
    ],
    keyTakeaways: ['Institutions accumulate in range zones.', 'Retail stops serve as institutional liquidity.'],
    quiz: [
      {
        id: 'q-adv-01-1',
        type: 'multiple-choice',
        question: 'Why do institutional funds accumulate positions in consolidated range bounds?',
        options: [
          'To build size discreetly without spiking market price before entry is filled',
          'Because they lack trading software',
          'To pay higher funding fees',
          'By mistake'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! Large capital requires range absorption to fill orders without self-inflicted slippage.',
        explanationWrong: 'Incorrect. Institutional size must absorb counterparty volume over time within ranges.'
      }
    ]
  },
  {
    id: 'adv-02',
    path: 'Advanced',
    lessonNumber: 2,
    title: 'Smart Money Concepts',
    topic: 'SMC Fundamentals',
    summary: 'Uncover Smart Money footprints, mitigation blocks, and imbalance zones.',
    estimatedDuration: '20 mins',
    mediaType: 'article',
    sections: [{ heading: 'Smart Money Footprints', body: 'SMC analyzes how institutional algorithms manipulate price to engineer liquidity before major expansions.' }],
    keyTakeaways: ['Identify institutional footprints.', 'Trade in harmony with smart money intent.'],
    quiz: [
      {
        id: 'q-adv-02-1',
        type: 'true-false',
        question: 'True or False: SMC views retail breakout trades above equal highs as liquidity engineering traps by algorithms.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Retail buy stops sitting above equal highs provide liquidity for institutional short entries.',
        explanationWrong: 'Incorrect. Equal highs represent prime liquidity targets for smart money sweeps.'
      }
    ]
  },
  {
    id: 'adv-03',
    path: 'Advanced',
    lessonNumber: 3,
    title: 'Liquidity',
    topic: 'Pools & Sweeps',
    summary: 'Identify buy-side and sell-side liquidity pools, stop runs, and sweep re-entries.',
    estimatedDuration: '18 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Liquidity Pool Maps', body: 'Liquidity sits above swing highs (buy stops) and below swing lows (sell stops).' }],
    keyTakeaways: ['Price is attracted to liquidity pools like a magnet.', 'Trade AFTER the liquidity sweep occurs.'],
    quiz: [
      {
        id: 'q-adv-03-1',
        type: 'multiple-choice',
        question: 'Where is Sell-Side Liquidity (SSL) concentrated on a chart?',
        options: ['Below major swing lows where Long stop losses cluster', 'Above the highest all-time high', 'Inside stablecoin smart contracts', 'At exact zero dollars'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Sell-side liquidity consists of sell stops placed beneath swing lows.',
        explanationWrong: 'Incorrect. Sell-side liquidity pools reside under key swing lows.'
      }
    ]
  },
  {
    id: 'adv-04',
    path: 'Advanced',
    lessonNumber: 4,
    title: 'Market Structure',
    topic: 'BOS & CHoCH',
    summary: 'Master Break of Structure (BOS) and Change of Character (CHoCH) structural shifts.',
    estimatedDuration: '16 mins',
    mediaType: 'article',
    sections: [{ heading: 'CHoCH vs BOS', body: 'A Break of Structure (BOS) continues an existing trend. A Change of Character (CHoCH) breaks the last key swing level, signaling trend reversal.' }],
    keyTakeaways: ['CHoCH provides early warning of trend change.', 'Validate structure on higher timeframes.'],
    quiz: [
      {
        id: 'q-adv-04-1',
        type: 'multiple-choice',
        question: 'What does a "Change of Character" (CHoCH) indicate in market structure?',
        options: ['The first structural shift breaking the opposite swing level, signaling potential reversal', 'A continuation of the current trend', 'An API disconnection error', 'A stable funding rate'],
        correctIndex: 0,
        explanationCorrect: 'Correct! CHoCH is the initial structural break heralding a trend shift.',
        explanationWrong: 'Incorrect. CHoCH indicates the market structure has broken against the previous trend.'
      }
    ]
  },
  {
    id: 'adv-05',
    path: 'Advanced',
    lessonNumber: 5,
    title: 'Order Blocks',
    topic: 'Institutional Entries',
    summary: 'Locate Order Blocks (OB) and Fair Value Gaps (FVG) for precise sniper entries.',
    estimatedDuration: '20 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Defining a Bullish Order Block', body: 'The last down candle before an aggressive upward displacement that breaks market structure.' }],
    keyTakeaways: ['Order blocks represent un-filled institutional orders.', 'Refine entries down to lower timeframe OBs.'],
    quiz: [
      {
        id: 'q-adv-05-1',
        type: 'multiple-choice',
        question: 'What defines a valid Bullish Order Block?',
        options: [
          'The last bearish candle prior to a strong bullish move breaking structure',
          'Any green candle on 1-minute chart',
          'A flat doji at midnight',
          'A candle with zero volume'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! The last down candle preceding violent upward displacement forms the order block.',
        explanationWrong: 'Incorrect. Order block is the last down candle prior to structure-breaking displacement.'
      }
    ]
  },
  {
    id: 'adv-06',
    path: 'Advanced',
    lessonNumber: 6,
    title: 'Supply & Demand',
    topic: 'Imbalance Zones',
    summary: 'Identify Rally-Base-Drop and Drop-Base-Rally supply and demand zones.',
    estimatedDuration: '15 mins',
    mediaType: 'article',
    sections: [{ heading: 'Imbalance & Fresh Zones', body: 'Fresh supply/demand zones that have never been retested carry the highest execution probability.' }],
    keyTakeaways: ['Fresh zones have higher win rates.', 'Displacement leaving behind FVGs confirms zone quality.'],
    quiz: [
      {
        id: 'q-adv-06-1',
        type: 'true-false',
        question: 'True or False: A fresh Supply Zone that has never been retested is generally stronger than a zone tested 5 times.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Untested zones retain un-filled institutional limit orders.',
        explanationWrong: 'Incorrect. Repeated tests exhaust remaining resting limit orders.'
      }
    ]
  },
  {
    id: 'adv-07',
    path: 'Advanced',
    lessonNumber: 7,
    title: 'Wyckoff',
    topic: 'Cycles & Phases',
    summary: 'Decode Wyckoff Accumulation and Distribution schematics (Springs, Upthrusts, SOS).',
    estimatedDuration: '22 mins',
    mediaType: 'infographic',
    sections: [{ heading: 'Wyckoff Spring Mechanics', body: 'A Wyckoff Spring is a final liquidity sweep below the trading range floor before markup begins.' }],
    keyTakeaways: ['Spring = Final bear trap sweep.', 'Upthrust = Final bull trap sweep.'],
    quiz: [
      {
        id: 'q-adv-07-1',
        type: 'multiple-choice',
        question: 'What is the role of a "Spring" in a Wyckoff Accumulation schematic?',
        options: [
          'A swift liquidity flush below support to clear weak longs before markup',
          'A price rally above 100x resistance',
          'An automatic system restart',
          'A fee discount event'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! The Spring sweeps support liquidity to transfer coins into composite operator hands.',
        explanationWrong: 'Incorrect. A Spring is the bear-trap flush under range support.'
      }
    ]
  },
  {
    id: 'adv-08',
    path: 'Advanced',
    lessonNumber: 8,
    title: 'ICT Concepts',
    topic: 'Inner Circle Trader Methodologies',
    summary: 'Master Killzones (London/NY Open), Daily Bias, and Judas Swings.',
    estimatedDuration: '20 mins',
    mediaType: 'article',
    sections: [{ heading: 'The Judas Swing', body: 'A false directional move during early London Open designed to engineer liquidity before the true session expansion.' }],
    keyTakeaways: ['Trade during London (02:00-05:00 EST) and NY (07:00-10:00 EST) Killzones.', 'Align intraday setups with Daily Bias.'],
    quiz: [
      {
        id: 'q-adv-08-1',
        type: 'multiple-choice',
        question: 'What is a "Judas Swing" in ICT methodology?',
        options: ['A false liquidity raid move at session open prior to the true directional trend', 'A 50% account loss', 'A perpetual funding fee reset', 'A weekend gap on CME'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Judas Swings fake out retail traders right at session opens.',
        explanationWrong: 'Incorrect. Judas Swing is the initial false expansion engineered to trick early breakout traders.'
      }
    ]
  },
  {
    id: 'adv-09',
    path: 'Advanced',
    lessonNumber: 9,
    title: 'Advanced Risk Management',
    topic: 'Position Sizing Formulas',
    summary: 'Apply Kelly Criterion, Expected Value (EV) models, and dynamic position sizing.',
    estimatedDuration: '18 mins',
    mediaType: 'article',
    sections: [{ heading: 'Positive EV (+EV) Framework', body: 'EV = (Win Probability x Avg Win) - (Loss Probability x Avg Loss). Only take trades with positive expected value.' }],
    keyTakeaways: ['Mathematically model every trade system.', 'Never scale risk after a losing streak.'],
    quiz: [
      {
        id: 'q-adv-09-1',
        type: 'multiple-choice',
        question: 'If a system wins 50% of trades with a 2:1 Reward-to-Risk ratio, is it +EV?',
        options: ['Yes, highly profitable (+EV)', 'No, negative EV', 'Breakeven', 'Cannot be determined'],
        correctIndex: 0,
        explanationCorrect: 'Correct! (0.5 x 2) - (0.5 x 1) = +0.5 R expected value per trade.',
        explanationWrong: 'Incorrect. A 50% win rate at 2:1 R:R generates strong positive expectancy.'
      }
    ]
  },
  {
    id: 'adv-10',
    path: 'Advanced',
    lessonNumber: 10,
    title: 'Trading Psychology',
    topic: 'Mental Discipline',
    summary: 'Eliminate revenge trading, FOMO, cognitive bias, and probability detachment.',
    estimatedDuration: '16 mins',
    mediaType: 'article',
    sections: [{ heading: 'Thinking in Probabilities', body: 'Accept that any single trade outcome is random; edge manifests over a sample size of 100+ trades.' }],
    keyTakeaways: ['Detach emotion from individual trade outcomes.', 'Strictly follow trade plan rules.'],
    quiz: [
      {
        id: 'q-adv-10-1',
        type: 'true-false',
        question: 'True or False: Increasing position size immediately after a loss to "get money back" is known as Revenge Trading and leads to account ruin.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanationCorrect: 'Correct! Revenge trading ignores risk rules and invites catastrophic drawdowns.',
        explanationWrong: 'Incorrect. Emotional revenge trading destroys risk discipline.'
      }
    ]
  },
  {
    id: 'adv-11',
    path: 'Advanced',
    lessonNumber: 11,
    title: 'Portfolio Hedging',
    topic: 'Risk Mitigation',
    summary: 'Hedge spot portfolios using short perpetual futures and delta-neutral strategies.',
    estimatedDuration: '18 mins',
    mediaType: 'article',
    sections: [{ heading: 'Delta Neutral Strategy', body: 'Holding 1 BTC spot and shorting 1 BTC perpetual futures creates a delta-neutral position that locks in dollar value while harvesting funding rates.' }],
    keyTakeaways: ['Protect spot holdings during macro bear trends without triggering taxable sales.', 'Earn yield on delta-neutral positions.'],
    quiz: [
      {
        id: 'q-adv-11-1',
        type: 'multiple-choice',
        question: 'What is a Delta-Neutral position in crypto?',
        options: [
          'A position with zero directional price exposure (e.g. 1 BTC Spot + Short 1 BTC Future)',
          'A position with 125x Long leverage',
          'A portfolio consisting of 100% meme coins',
          'A position held without internet connection'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! Matching spot long with perpetual short eliminates directional price risk.',
        explanationWrong: 'Incorrect. Delta-neutral balances long and short exposure to neutralize price movement.'
      }
    ]
  },
  {
    id: 'adv-12',
    path: 'Advanced',
    lessonNumber: 12,
    title: 'Algorithmic Trading Basics',
    topic: 'Automated Trading Systems',
    summary: 'Build REST & WebSocket API bots, backtest trading logic, and automate execution.',
    estimatedDuration: '20 mins',
    mediaType: 'article',
    sections: [{ heading: 'API Integration & Backtesting', body: 'Automated algorithms eliminate emotional fatigue by executing pre-programmed code signals directly via exchange APIs.' }],
    keyTakeaways: ['Backtest strategies over 3+ years of historical market data.', 'Account for exchange fees and API rate limits.'],
    quiz: [
      {
        id: 'q-adv-12-1',
        type: 'multiple-choice',
        question: 'What protocol provides sub-millisecond real-time market orderbook streaming for trading algorithms?',
        options: ['WebSocket protocol', 'HTTP REST Polling once an hour', 'Email notifications', 'Postal mail'],
        correctIndex: 0,
        explanationCorrect: 'Correct! WebSockets offer real-time full-duplex bi-directional data streaming.',
        explanationWrong: 'Incorrect. WebSockets provide persistent sub-millisecond data feeds for trading bots.'
      }
    ]
  },
  {
    id: 'adv-13',
    path: 'Advanced',
    lessonNumber: 13,
    title: 'Comprehensive Trading System Building',
    topic: 'System Synthesis',
    summary: 'Combine Edge, Risk Engine, Psychology, and Execution Rules into a Master Trading Plan.',
    estimatedDuration: '25 mins',
    mediaType: 'article',
    pdfResource: { title: 'Master Trading System Manual.pdf', size: '5.2 MB' },
    sections: [{ heading: 'The Complete Trader Roadmap', body: 'A successful professional trader operates like a business with written SOPs for entry, exit, risk, and review.' }],
    keyTakeaways: ['Document every trade in a trading journal.', 'Audit performance metrics monthly.'],
    quiz: [
      {
        id: 'q-adv-13-1',
        type: 'multiple-choice',
        question: 'What is the final requirement to graduate as an Advanced Oriviant Academy Trader?',
        options: [
          'Operating with a written trading plan, risk rules, and systematic trade journal review',
          'Predicting exact news headlines',
          'Using 125x leverage on every trade',
          'Relying purely on gut feel'
        ],
        correctIndex: 0,
        explanationCorrect: 'Correct! Systemization and discipline separate profitable traders from gamblers.',
        explanationWrong: 'Incorrect. A written trading plan and journal review form the bedrock of professional trading.'
      }
    ]
  }
];
