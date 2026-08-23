import { Request, Response } from 'express';
import pool from '../config/db.js';
import { logAudit } from '../services/adminService.js';

// Get a user's academy progress, or return defaults if they haven't started yet
export const getAcademyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Assuming you use an auth middleware
    
    const result = await pool.query(
      'SELECT * FROM academy_progress WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default starter data if no row exists yet
      return res.json({
        success: true,
        data: {
          completedLessonIds: [],
          quizScores: {},
          totalLearningMinutes: 0,
          dailyStreak: 0,
          lastActiveDate: null,
          practiceScenariosCompleted: [],
          xpPoints: 0
        }
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        completedLessonIds: row.completed_lesson_ids,
        quizScores: row.quiz_scores,
        totalLearningMinutes: row.total_learning_minutes,
        dailyStreak: row.daily_streak,
        lastActiveDate: row.last_active_date,
        practiceScenariosCompleted: row.practice_scenarios_completed,
        xpPoints: row.xp_points
      }
    });
  } catch (err: any) {
    console.error('Error fetching academy progress:', err);
    res.status(500).json({ success: false, message: 'Server error fetching progress' });
  }
};

// Update a user's academy progress (Upsert: Update if exists, Insert if it doesn't)
export const updateAcademyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      completedLessonIds, 
      quizScores, 
      totalLearningMinutes, 
      dailyStreak, 
      lastActiveDate, 
      practiceScenariosCompleted, 
      xpPoints 
    } = req.body;

    const query = `
      INSERT INTO academy_progress (
        user_id, completed_lesson_ids, quiz_scores, total_learning_minutes, 
        daily_streak, last_active_date, practice_scenarios_completed, xp_points, updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        completed_lesson_ids = EXCLUDED.completed_lesson_ids,
        quiz_scores = EXCLUDED.quiz_scores,
        total_learning_minutes = EXCLUDED.total_learning_minutes,
        daily_streak = EXCLUDED.daily_streak,
        last_active_date = EXCLUDED.last_active_date,
        practice_scenarios_completed = EXCLUDED.practice_scenarios_completed,
        xp_points = EXCLUDED.xp_points,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    await pool.query(query, [
      userId,
      JSON.stringify(completedLessonIds || []),
      JSON.stringify(quizScores || {}),
      totalLearningMinutes || 0,
      dailyStreak || 0,
      lastActiveDate || null,
      JSON.stringify(practiceScenariosCompleted || []),
      xpPoints || 0
    ]);

    res.json({ success: true, message: 'Progress saved successfully' });
  } catch (err: any) {
    console.error('Error updating academy progress:', err);
    res.status(500).json({ success: false, message: 'Server error updating progress' });
  }
};

/**
 * Backs the admin Academy & Content tab: real per-lesson engagement numbers
 * instead of hardcoded student counts. The lesson catalog itself (titles,
 * categories) lives in the frontend's academyData.ts — this only returns
 * what the backend actually has: how many distinct users have completed
 * each lesson id, and its publish status.
 */
export const getAcademyOverview = async (_req: Request, res: Response) => {
  try {
    const completions = await pool.query(`
      SELECT lesson_id, COUNT(DISTINCT user_id)::int AS completions
      FROM academy_progress, jsonb_array_elements_text(completed_lesson_ids) AS lesson_id
      GROUP BY lesson_id;
    `);

    const statuses = await pool.query(`SELECT lesson_id, status FROM academy_lesson_status;`);

    const enrolled = await pool.query(`SELECT COUNT(*)::int AS total FROM academy_progress;`);

    res.json({
      success: true,
      data: {
        totalEnrolled: enrolled.rows[0]?.total ?? 0,
        completions: completions.rows,
        statuses: statuses.rows
      }
    });
  } catch (err: any) {
    console.error('Error fetching academy overview:', err);
    res.status(500).json({ success: false, message: 'Server error fetching academy overview' });
  }
};

export const setLessonStatus = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const { lessonId } = req.params;
    const { status } = req.body ?? {};

    if (!['Published', 'Draft'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Published or Draft.' });
    }

    const result = await pool.query(
      `INSERT INTO academy_lesson_status (lesson_id, status, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (lesson_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [lessonId, status]
    );

    void logAudit(adminId, 'UPDATE_LESSON_STATUS', 'academy_lesson', lessonId, { status }, req.ip);

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('Error updating lesson status:', err);
    res.status(500).json({ success: false, message: 'Server error updating lesson status' });
  }
};