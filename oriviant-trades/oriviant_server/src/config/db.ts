import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('Successfully connected to Neon PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Prevent process.exit(-1) so transient drops don't crash your entire server process
});

export default pool;