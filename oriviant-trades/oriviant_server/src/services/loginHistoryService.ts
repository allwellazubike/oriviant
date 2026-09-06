import { Request } from 'express';
import pool from '../config/db.js';

/**
 * Lightweight User-Agent parsing.
 *
 * A dedicated dependency (ua-parser-js et al.) is overkill for what this
 * screen needs: a rough "Chrome on Windows" label a user can eyeball to spot
 * a login they do not recognize. This does not need to be exact.
 */
const detectBrowser = (ua: string): string => {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/crios\//i.test(ua)) return 'Chrome';
  if (/fxios\//i.test(ua) || /firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua) && /version\//i.test(ua)) return 'Safari';
  return 'Unknown Browser';
};

const detectOS = (ua: string): string => {
  if (/windows/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
};

const detectDevice = (ua: string): string => {
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

/** First hop of a comma-separated X-Forwarded-For list is the original client. */
const clientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'Unknown';
};

export const recordLoginAttempt = async (
  userId: number,
  req: Request,
  status: 'Success' | 'Failed'
): Promise<void> => {
  const ua = req.headers['user-agent'] || '';

  try {
    await pool.query(
      `INSERT INTO login_history (user_id, ip_address, device, browser, os, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, clientIp(req), detectDevice(ua), detectBrowser(ua), detectOS(ua), status]
    );
  } catch (error) {
    // A logging failure must never block the actual sign-in it is describing.
    console.error('[login-history] Failed to record login attempt:', (error as Error).message);
  }
};
