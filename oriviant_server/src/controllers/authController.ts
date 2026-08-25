import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { adminService } from '../services/adminService.js';
import { sendPasswordResetCode, sendVerificationCode } from '../services/emailService.js';
import { uploadAvatarImage, UploadError } from '../services/uploadService.js';
import { recordLoginAttempt } from '../services/loginHistoryService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

const RESET_CODE_TTL_MINUTES = 15;
/** Wrong guesses allowed before a code is burned. */
const RESET_MAX_ATTEMPTS = 5;

// --- MASTER ADMIN CREDENTIALS ---
const MASTER_ADMIN_EMAIL = 'admin@oriviant.com';
const MASTER_ADMIN_PASS = 'OriviantAdmin2026';

// 🔥 DATABASE AUTO-HEALER FOR AUTH
const autoHealAuthTable = async () => {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_code_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;
    `);
  } catch (err) {
    console.error('Auth auto-heal skipped:', err);
  }
};

const generateCode = (): string =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    await autoHealAuthTable();

    const { email, password, nickname } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    if (!(await adminService.areRegistrationsOpen())) {
      res.status(403).json({ success: false, error: 'New registrations are temporarily closed. Please check back later.' });
      return;
    }

    // Check if user already exists
    const userCheck = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].is_verified) {
        res.status(400).json({ success: false, error: 'Email already in use' });
        return;
      }
      // If unverified, allow updating credentials and resending code
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const code = generateCode();
      const codeHash = await bcrypt.hash(code, 10);

      await pool.query(
        `UPDATE users SET password_hash = $1, nickname = $2, verification_code_hash = $3, verification_expires_at = NOW() + interval '15 minutes' WHERE email = $4`,
        [passwordHash, nickname || email.split('@')[0], codeHash, email]
      );

      await sendVerificationCode(email, code, 15);
      
      // 🔑 ALWAYS LOG CODE TO TERMINAL FOR INSTANT TESTING
      console.log('\n========================================');
      console.log(`🔑 [AUTH OTP] Verification Code for ${email}: ${code}`);
      console.log('========================================\n');

      res.status(200).json({ success: true, message: 'Verification code sent to your email', requiresVerification: true, email });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    // Insert user - STRICTLY ENFORCING 'user' ROLE TO PREVENT ADMIN INJECTION
    const newUserQuery = `
      INSERT INTO users (email, password_hash, nickname, role, is_verified, verification_code_hash, verification_expires_at)
      VALUES ($1, $2, $3, 'user', false, $4, NOW() + interval '15 minutes')
      RETURNING id, email, nickname, role, avatar_url;
    `;
    await pool.query(newUserQuery, [email, passwordHash, nickname || email.split('@')[0], codeHash]);

    await sendVerificationCode(email, code, 15);

    // 🔑 ALWAYS LOG CODE TO TERMINAL FOR INSTANT TESTING
    console.log('\n========================================');
    console.log(`🔑 [AUTH OTP] Verification Code for ${email}: ${code}`);
    console.log('========================================\n');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please enter the verification code sent to your email.',
      requiresVerification: true,
      email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

export const verifyRegistrationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    await autoHealAuthTable();

    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Email and code are required' });
      return;
    }

    // FIX: Let PostgreSQL handle the timezone and expiration math!
    const userRes = await pool.query(`
      SELECT 
        id, email, nickname, role, avatar_url, verification_code_hash, 
        (verification_expires_at > NOW()) as is_not_expired 
      FROM users WHERE email = $1
    `, [email]);

    if (userRes.rows.length === 0) {
      res.status(400).json({ success: false, error: 'User not found' });
      return;
    }

    const user = userRes.rows[0];
    
    // Safety checks
    if (!user.verification_code_hash) {
      res.status(400).json({ success: false, error: 'No verification pending for this account.' });
      return;
    }

    if (!user.is_not_expired) {
      res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    const isMatch = await bcrypt.compare(code, user.verification_code_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Invalid verification code' });
      return;
    }

    // Code matches! Verify the user
    await pool.query('UPDATE users SET is_verified = true, verification_code_hash = null, verification_expires_at = null WHERE id = $1', [user.id]);

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    await autoHealAuthTable();

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    // --- 1. MASTER ADMIN INTERCEPT & GENERATION ---
    if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && password === MASTER_ADMIN_PASS) {
      let adminResult = await pool.query('SELECT * FROM users WHERE email = $1', [MASTER_ADMIN_EMAIL]);
      
      // Auto-create the master admin if it doesn't exist yet
      if (adminResult.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(MASTER_ADMIN_PASS, salt);
        adminResult = await pool.query(
          `INSERT INTO users (email, password_hash, nickname, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING *`,
          [MASTER_ADMIN_EMAIL, hash, 'Super Admin', 'admin']
        );
      } else {
        // Ensure the master admin ALWAYS has the admin role
        await pool.query("UPDATE users SET role = 'admin', is_verified = true WHERE email = $1", [MASTER_ADMIN_EMAIL]);
        adminResult.rows[0].role = 'admin';
      }

      const user = adminResult.rows[0];
      await recordLoginAttempt(user.id, req, 'Success');

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role, avatar_url: user.avatar_url }
      });
      return;
    }

    // --- 2. GLOBAL SECURITY SWEEP ---
    // Instantly demote any other account in the database that somehow has admin privileges
    await pool.query("UPDATE users SET role = 'user' WHERE email != $1 AND role IN ('admin', 'superadmin')", [MASTER_ADMIN_EMAIL]);

    // --- 3. STANDARD USER LOGIN ---
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const user = userResult.rows[0];

    if (user.is_verified === false) {
      res.status(403).json({ success: false, error: 'Please verify your email address before logging in.', requiresVerification: true, email: user.email });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await recordLoginAttempt(user.id, req, 'Failed');
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    await recordLoginAttempt(user.id, req, 'Success');

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role, // This will now safely strictly be 'user'
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

/**
 * Returns the caller's current profile. Runs behind verifyToken, so reaching
 * this handler already proves the token is valid — the frontend uses it on boot
 * to confirm a stored session is still good instead of trusting localStorage.
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, user: req.user });
};

/** Nickname is the only editable identity field — email doubles as the login credential. */
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 40;

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const nickname = typeof req.body?.nickname === 'string' ? req.body.nickname.trim() : '';

    if (nickname.length < NICKNAME_MIN_LENGTH || nickname.length > NICKNAME_MAX_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Display name must be between ${NICKNAME_MIN_LENGTH} and ${NICKNAME_MAX_LENGTH} characters.`,
      });
      return;
    }

    const updated = await pool.query(
      `UPDATE users SET nickname = $1 WHERE id = $2
       RETURNING id, email, nickname, role, avatar_url;`,
      [nickname, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating profile' });
  }
};

export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const avatar = req.body?.avatar;
    if (typeof avatar !== 'string' || !avatar) {
      res.status(400).json({ success: false, error: 'An image is required.' });
      return;
    }

    let avatarUrl: string;
    try {
      avatarUrl = await uploadAvatarImage(avatar, userId);
    } catch (error) {
      if (error instanceof UploadError) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      throw error;
    }

    const updated = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, email, nickname, role, avatar_url;`,
      [avatarUrl, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user: updated.rows[0],
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating avatar' });
  }
};

export const getLoginHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT id, ip_address, device, browser, os, status, created_at
       FROM login_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20;`,
      [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching login history' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/* ------------------------------------------------------------------ *
 * Password reset
 *
 * Three steps, because the user has to prove they own the mailbox before
 * they are allowed to set a password:
 *
 *   1. forgotPassword    email        -> emails a 6-digit code
 *   2. verifyResetCode   email + code -> exchanges the code for a reset token
 *   3. resetPassword     token + pass -> sets the new password
 *
 * Step 2 hands back a short-lived JWT rather than making step 3 re-check the
 * code. That keeps the code single-use and means the new password is never
 * sent alongside the thing that authorises it.
 * ------------------------------------------------------------------ */

/**
 * The universal code, if one is configured.
 *
 * Anyone who knows an email address can reset that account while this is set,
 * so it is read from the environment rather than compiled in — production
 * leaves OTP_BYPASS_CODE empty and the bypass ceases to exist.
 */
const bypassCode = (): string | null => {
  const configured = process.env.OTP_BYPASS_CODE?.trim();
  return configured ? configured : null;
};

const isBypassCode = (code: string): boolean => {
  const configured = bypassCode();
  return configured !== null && code === configured;
};

const generateResetCode = (): string =>
  // crypto rather than Math.random: this code is a credential.
  String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  // Deliberately identical whether or not the address exists. Diverging here
  // turns this endpoint into a way to test which emails have accounts.
  const genericResponse = {
    success: true,
    message: 'If that email is registered, a reset code is on its way.',
  };

  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const userResult = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(200).json(genericResponse);
      return;
    }

    const user = userResult.rows[0];
    const code = generateResetCode();
    const codeHash = await bcrypt.hash(code, 10);

    // Requesting a new code invalidates the previous one, so a forwarded or
    // shoulder-surfed older email cannot still be used.
    await pool.query(
      `UPDATE password_resets SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_resets (user_id, code_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 || ' minutes')::interval)`,
      [user.id, codeHash, RESET_CODE_TTL_MINUTES]
    );

    await sendPasswordResetCode(user.email, code, RESET_CODE_TTL_MINUTES);

    // 🔑 ALWAYS LOG PASSWORD RESET CODE TO TERMINAL FOR INSTANT TESTING
    console.log('\n========================================');
    console.log(`🔑 [PASSWORD RESET OTP] Code for ${user.email}: ${code}`);
    console.log('========================================\n');

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error while starting password reset' });
  }
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Email and code are required' });
      return;
    }

    const userResult = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid or expired code' });
      return;
    }

    const user = userResult.rows[0];

    const issueToken = () =>
      jwt.sign({ id: user.id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });

    // The bypass short-circuits everything below it, including whether a code
    // was ever requested for this account.
    if (isBypassCode(code)) {
      console.warn(`[auth] Password reset bypass code used for ${user.email}`);
      res.status(200).json({ success: true, resetToken: issueToken() });
      return;
    }

    const resetResult = await pool.query(
      `SELECT id, code_hash, attempts FROM password_resets
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (resetResult.rows.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid or expired code' });
      return;
    }

    const reset = resetResult.rows[0];

    // Without a cap, six digits is a few hundred thousand guesses away from
    // free account access.
    if (reset.attempts >= RESET_MAX_ATTEMPTS) {
      await pool.query('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [reset.id]);
      res.status(429).json({
        success: false,
        error: 'Too many incorrect attempts. Request a new code.',
      });
      return;
    }

    const matches = await bcrypt.compare(code, reset.code_hash);

    if (!matches) {
      await pool.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1', [reset.id]);
      res.status(400).json({ success: false, error: 'Invalid or expired code' });
      return;
    }

    // Burn the code now that it has been exchanged — the token is what carries
    // the authority from here on.
    await pool.query('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [reset.id]);

    res.status(200).json({ success: true, resetToken: issueToken() });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ success: false, error: 'Server error while verifying code' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, password } = req.body ?? {};

    if (typeof resetToken !== 'string' || typeof password !== 'string') {
      res.status(400).json({ success: false, error: 'Reset token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
      return;
    }

    let payload: { id: number; purpose?: string };
    try {
      payload = jwt.verify(resetToken, JWT_SECRET) as { id: number; purpose?: string };
    } catch {
      res.status(400).json({ success: false, error: 'This reset link has expired. Start again.' });
      return;
    }

    // A normal login token must not be usable to change a password without
    // knowing the current one, so the purpose claim is checked explicitly.
    if (payload.purpose !== 'password_reset') {
      res.status(400).json({ success: false, error: 'Invalid reset token' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const updated = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2
       RETURNING id, email, nickname, role, avatar_url`,
      [passwordHash, payload.id]
    );

    if (updated.rows.length === 0) {
      res.status(400).json({ success: false, error: 'Account no longer exists' });
      return;
    }

    const user = updated.rows[0];

    // Sign them straight in: they have just proven mailbox ownership and set a
    // password, and bouncing them to a login screen to retype it is friction
    // with no security value.
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error while resetting password' });
  }
};