import { Request, Response } from 'express';
import pool from '../config/db.js';
import { uploadDepositProof } from '../services/uploadService.js';

export const getMyKycStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    // Query Level 1 and Level 2 applications completely independently
    const l1 = await pool.query(
      'SELECT status FROM kyc_applications WHERE user_id = $1 AND current_level = $2 ORDER BY created_at DESC LIMIT 1', 
      [userId, 'LEVEL_1']
    );
    const l2 = await pool.query(
      'SELECT status FROM kyc_applications WHERE user_id = $1 AND current_level = $2 ORDER BY created_at DESC LIMIT 1', 
      [userId, 'LEVEL_2']
    );
    
    const parseStatus = (rows: any[]) => {
      if (rows.length === 0) return 'UNVERIFIED';
      const st = (rows[0].status || '').toUpperCase();
      if (st === 'APPROVED') return 'VERIFIED';
      if (st === 'PENDING') return 'PENDING';
      if (st === 'REJECTED') return 'REJECTED';
      return 'UNVERIFIED';
    };

    return res.status(200).json({
      success: true,
      level1: parseStatus(l1.rows),
      level2: parseStatus(l2.rows)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const submitLevel1 = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
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

    if (!full_legal_name || !date_of_birth || !phone_number || !residential_address || !nationality) {
      return res.status(400).json({ success: false, error: 'All Level 1 fields are required.' });
    }

    // Remove any existing LEVEL_1 application so a user can safely submit/re-submit without duplicate errors
    await pool.query('DELETE FROM kyc_applications WHERE user_id = $1 AND current_level = $2', [userId, 'LEVEL_1']);

    // Insert the fresh Level 1 application
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
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to submit KYC application.' 
    });
  }
};

export const submitLevel2 = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { occupation, id_document_type, id_document_number, source_of_funds, source_of_wealth, tax_id } = req.body;
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documentFront = files?.documentFront?.[0];
    const documentBack = files?.documentBack?.[0]; 
    const selfie = files?.selfie?.[0];

    if (!documentFront || !selfie || !occupation || !id_document_type || !id_document_number) {
      return res.status(400).json({ success: false, error: 'Missing required Level 2 fields or images.' });
    }

    const frontDataUri = `data:${documentFront.mimetype};base64,${documentFront.buffer.toString('base64')}`;
    const frontUrl = await uploadDepositProof(frontDataUri, userId);
    if (!frontUrl) {
      return res.status(500).json({ success: false, error: 'Failed to upload front ID document to cloud storage.' });
    }

    let backUrl = null;
    if (documentBack) {
      const backDataUri = `data:${documentBack.mimetype};base64,${documentBack.buffer.toString('base64')}`;
      backUrl = await uploadDepositProof(backDataUri, userId);
    }

    const selfieDataUri = `data:${selfie.mimetype};base64,${selfie.buffer.toString('base64')}`;
    const selfieUrl = await uploadDepositProof(selfieDataUri, userId);
    if (!selfieUrl) {
      return res.status(500).json({ success: false, error: 'Failed to upload selfie to cloud storage.' });
    }

    // Remove any existing LEVEL_2 application before inserting a fresh one
    await pool.query('DELETE FROM kyc_applications WHERE user_id = $1 AND current_level = $2', [userId, 'LEVEL_2']);

    const l1Data = await pool.query('SELECT full_legal_name, date_of_birth, phone_number, residential_address, nationality FROM kyc_applications WHERE user_id = $1 AND current_level = \'LEVEL_1\'', [userId]);
    const base = l1Data.rows[0] || {};

    const result = await pool.query(
      `INSERT INTO kyc_applications 
        (user_id, full_legal_name, date_of_birth, phone_number, residential_address, nationality, occupation, id_document_type, id_document_number, id_document_front_url, id_document_back_url, selfie_url, source_of_funds, source_of_wealth, tax_id, current_level, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'LEVEL_2', 'PENDING') 
       RETURNING id, current_level, status`,
      [
        userId, base.full_legal_name || 'N/A', base.date_of_birth || '2000-01-01', base.phone_number || 'N/A', 
        base.residential_address || 'N/A', base.nationality || 'N/A', occupation, id_document_type, id_document_number, 
        frontUrl, backUrl, selfieUrl, source_of_funds, source_of_wealth, tax_id
      ]
    );

    return res.status(200).json({ 
      success: true, 
      message: 'KYC Level 2 submitted successfully.',
      application: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ KYC Level 2 Submission Error Details:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to submit KYC Level 2.' });
  }
};