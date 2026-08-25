import { Request, Response } from 'express';
import pool from '../config/db.js';
import { DEPOSIT_ASSETS, getDepositAsset, SUPPORTED_DEPOSIT_SYMBOLS } from '../config/depositAddresses.js';
import { uploadDepositProof, UploadError } from '../services/uploadService.js';
import { notifyDepositPending } from '../services/notificationService.js';
import { sendDepositPendingEmail } from '../services/emailService.js';

/**
 * The assets we accept and where to send them.
 *
 * Served rather than hardcoded in the frontends so the two of them cannot drift
 * from each other or from what the API will actually accept. Requires a token:
 * these addresses are only useful to someone with an account, and not
 * publishing them anonymously keeps them off scrapers.
 */
export const getDepositOptions = async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: DEPOSIT_ASSETS });
};

export const createDepositRequest = async (req: Request, res: Response) => {
  try {
    const { asset, amount_expected, tx_hash, proof } = req.body ?? {};
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Reject unsupported coins here, not in the UI. A deposit filed for an asset
    // we hold no address for is money the user sent into the void, and the
    // request would sit in the admin queue looking legitimate.
    const depositAsset = getDepositAsset(asset);
    if (!depositAsset) {
      return res.status(400).json({
        success: false,
        error: `We only accept ${SUPPORTED_DEPOSIT_SYMBOLS.join(' and ')} deposits right now.`,
      });
    }

    const amount = Number(amount_expected);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Enter the amount you sent.' });
    }

    if (amount < depositAsset.minDeposit) {
      return res.status(400).json({
        success: false,
        error: `Minimum ${depositAsset.symbol} deposit is ${depositAsset.minDeposit}.`,
      });
    }

    const txHash = typeof tx_hash === 'string' && tx_hash.trim() ? tx_hash.trim().slice(0, 120) : null;

    // A duplicate hash is almost always a double-submit or someone trying to get
    // the same transfer credited twice. Either way the admin should not see two.
    if (txHash) {
      const existing = await pool.query(
        `SELECT id FROM deposit_requests WHERE tx_hash = $1 AND status <> 'DENIED' LIMIT 1`,
        [txHash]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'That transaction hash has already been submitted.',
        });
      }
    }

    // The proof is attempted before the insert so the row can carry its URL,
    // but it is never allowed to block the filing. By the time someone reaches
    // this endpoint they have already sent crypto; refusing the request because
    // an image host was briefly unreachable would leave real money on-chain
    // with no record on our side asking anyone to look for it.
    let proofUrl: string | null = null;
    let proofWarning: string | null = null;

    if (typeof proof === 'string' && proof.trim()) {
      try {
        proofUrl = await uploadDepositProof(proof, userId);
        if (!proofUrl) {
          proofWarning =
            'We could not attach your screenshot, so your request was filed without it. Add the transaction hash if you have it, or contact support.';
        }
      } catch (error) {
        // Only validation errors land here — a wrong file type or an oversized
        // one, both of which the user fixes by choosing a different file.
        if (error instanceof UploadError) {
          return res.status(400).json({ success: false, error: error.message });
        }
        throw error;
      }
    }

    const result = await pool.query(
      `INSERT INTO deposit_requests
         (user_id, asset, amount_expected, network, tx_hash, proof_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *;`,
      [userId, depositAsset.symbol, amount, depositAsset.network, txHash, proofUrl]
    );

    void notifyDepositPending(userId, depositAsset.symbol, amount);

    // Send email notification for pending deposit
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0 && userRes.rows[0].email) {
      void sendDepositPendingEmail(userRes.rows[0].email, amount, depositAsset.symbol);
    }

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted. Your balance updates once we confirm it on-chain.',
      warning: proofWarning ?? undefined,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getUserDeposits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT id, asset, amount_expected, amount_credited, network, tx_hash, proof_url,
              status, created_at, updated_at
       FROM deposit_requests
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100;`,
      [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching deposit history:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
