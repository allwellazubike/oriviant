import { Request, Response } from 'express';
import { getQuotes } from '../services/marketDataService.js';

/**
 * Public market data. No auth: these are the same prices shown on the marketing
 * site to logged-out visitors, and gating them would break the landing page.
 */
export const getMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quotes, fetchedAt, stale } = await getQuotes();

    // Optional ?symbols=AAPL,SPY filter for callers that only need a few.
    const requested = typeof req.query.symbols === 'string' ? req.query.symbols : null;

    const data = requested
      ? requested
          .split(',')
          .map((s) => s.trim())
          .filter((s) => quotes[s])
          .reduce<Record<string, unknown>>((acc, s) => {
            acc[s] = quotes[s];
            return acc;
          }, {})
      : quotes;

    res.status(200).json({
      success: true,
      stale,
      fetchedAt: new Date(fetchedAt).toISOString(),
      count: Object.keys(data).length,
      data,
    });
  } catch (error) {
    console.error('Error serving market prices:', error);
    res.status(503).json({
      success: false,
      error: 'Market data temporarily unavailable',
    });
  }
};
