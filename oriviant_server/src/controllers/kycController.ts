import { Request, Response } from 'express';
import pool from '../config/db.js';

export const submitLevel1 = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Please log in again.' });
    }

    const { 
      full_legal_name, 
      date_of_birth, 
      phone_number, 
      residential_address, 
      nationality 
    } = req.body;

    // 1. Basic validation
    if (!full_legal_name || !date_of_birth || !phone_number || !residential_address || !nationality) {
      return res.status(400).json({ success: false, error: 'All Level 1 fields are required.' });
    }

    // 2. Check if an application already exists for this user
    const existingApp = await pool.query('SELECT id, current_level, status FROM kyc_applications WHERE user_id = $1', [userId]);
    
    if (existingApp.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'A KYC application already exists for this account.' 
      });
    }

    // 3. Insert the new Level 1 application with safe parameter handling
    const result = await pool.query(
      `INSERT INTO kyc_applications 
        (user_id, full_legal_name, date_of_birth, phone_number, residential_address, nationality, current_level, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'LEVEL_1', 'PENDING') 
       RETURNING id, current_level, status`,
      [userId, full_legal_name, date_of_birth, phone_number, residential_address, nationality]
    );

    return res.status(201).json({ 
      success: true, 
      message: 'KYC Level 1 submitted successfully.', 
      application: result.rows[0] 
    });

  } catch (error: any) {
    console.error('❌ KYC Level 1 Submission Error Details:', error);
    // Send the actual database error back to the client for immediate debugging
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to submit KYC application.' 
    });
  }
};