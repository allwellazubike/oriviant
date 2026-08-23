import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export interface AuthUser {
  id: number;
  email: string;
  nickname: string | null;
  role: string;
  avatar_url: string | null;
}

// Payload we sign in authController. Anything else in the token is ignored.
interface TokenPayload {
  id: number;
  email: string;
}

/**
 * Verifies the Bearer token and loads the user from the database.
 *
 * The DB lookup is deliberate: tokens live for 7 days, so a role change or a
 * deleted account has to take effect before the token expires. It also means
 * downstream handlers get a role they can trust rather than a stale claim.
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization token required' });
      return;
    }

    const token = header.slice('Bearer '.length).trim();

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      const expired = err instanceof jwt.TokenExpiredError;
      res.status(401).json({
        success: false,
        error: expired ? 'Session expired. Please sign in again.' : 'Invalid token',
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      });
      return;
    }

    const result = await pool.query(
      'SELECT id, email, nickname, role, avatar_url, last_active_at FROM users WHERE id = $1',
      [payload.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, error: 'User no longer exists' });
      return;
    }

    const row = result.rows[0];
    req.user = row as AuthUser;

    // Throttled so an active user doesn't write on every single request —
    // this is the only signal admin analytics has for "session length", so
    // it needs to be cheap enough to run on the hot path.
    const lastActive = row.last_active_at ? new Date(row.last_active_at).getTime() : 0;
    if (Date.now() - lastActive > 60_000) {
      pool
        .query('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1', [row.id])
        .catch((err) => console.error('[auth] Failed to update last_active_at:', (err as Error).message));
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Server error during authentication' });
  }
};

/**
 * Must run after verifyToken. Returns 403 rather than 401 so the frontend can
 * tell "you are not signed in" apart from "you are signed in but not an admin".
 */
export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authorization token required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Administrator access required' });
    return;
  }

  next();
};
