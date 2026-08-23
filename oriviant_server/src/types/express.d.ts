import { AuthUser } from '../middleware/auth.js';

// Lets handlers read req.user without casting to `any` after verifyToken runs.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
