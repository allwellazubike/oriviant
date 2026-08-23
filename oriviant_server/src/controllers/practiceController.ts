import { Request, Response } from 'express';
import * as practiceService from '../services/practiceService.js';
import { logAudit } from '../services/adminService.js';

export const getMyAccount = async (req: Request, res: Response) => {
  try {
    const account = await practiceService.getAccount(req.user!.id);
    res.json({ success: true, data: account });
  } catch (err: any) {
    console.error('Error fetching practice account:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const postTrade = async (req: Request, res: Response) => {
  try {
    const { pair, side, description, pnl } = req.body ?? {};
    const pnlNumber = Number(pnl);

    if (!Number.isFinite(pnlNumber)) {
      return res.status(400).json({ success: false, error: 'A numeric pnl is required.' });
    }

    const account = await practiceService.recordTrade(req.user!.id, { pair, side, description, pnl: pnlNumber });
    res.json({ success: true, data: account });
  } catch (err: any) {
    console.error('Error recording practice trade:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const postResetMine = async (req: Request, res: Response) => {
  try {
    const account = await practiceService.resetAccount(req.user!.id);
    res.json({ success: true, data: account });
  } catch (err: any) {
    console.error('Error resetting practice account:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// --- Admin ---

export const getAdminAccounts = async (_req: Request, res: Response) => {
  try {
    const data = await practiceService.listAccountsForAdmin();
    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error listing practice accounts:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getAdminLeaderboard = async (_req: Request, res: Response) => {
  try {
    const data = await practiceService.getLeaderboard();
    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error fetching practice leaderboard:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const postAdminResetOne = async (req: Request, res: Response) => {
  try {
    const targetUserId = Number(req.params.userId);
    if (!Number.isInteger(targetUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user id.' });
    }
    const account = await practiceService.resetAccount(targetUserId);
    void logAudit(req.user!.id, 'RESET_PRACTICE_ACCOUNT', 'practice_account', targetUserId.toString(), {}, req.ip);
    res.json({ success: true, data: account });
  } catch (err: any) {
    console.error('Error resetting practice account:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const postAdminResetAll = async (req: Request, res: Response) => {
  try {
    const count = await practiceService.resetAllAccounts();
    void logAudit(req.user!.id, 'RESET_ALL_PRACTICE_ACCOUNTS', 'practice_account', 'all', { accountsReset: count }, req.ip);
    res.json({ success: true, message: `Reset ${count} practice account(s) to their starting balance.`, data: { count } });
  } catch (err: any) {
    console.error('Error resetting all practice accounts:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
