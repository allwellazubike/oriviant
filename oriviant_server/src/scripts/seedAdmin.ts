import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

/**
 * Creates (or repairs) an admin account.
 *   npm run seed-admin -- someone@oriviant.io theirPassword
 *
 * Unlike make-admin, this also sets the password, so it works whether or not
 * the account already exists. Same reason it isn't an endpoint: the first
 * admin has to be created out of band, or anyone who can register can
 * promote themselves.
 */
const run = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: npm run seed-admin -- <email> <password>');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // ON CONFLICT so re-running is safe: it resets the password and re-asserts
    // the role rather than failing on the unique email.
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, nickname, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = 'admin'
       RETURNING id, email, nickname, role;`,
      [email, passwordHash, email.split('@')[0]]
    );

    console.log('Admin ready:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

run();
