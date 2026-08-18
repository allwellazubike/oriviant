import pool from '../config/db.js';

/**
 * Promotes an existing user to admin.
 *   npm run make-admin -- someone@oriviant.io
 *
 * Deliberately not an API endpoint: the first admin has to be created out of
 * band, otherwise anyone who can register can promote themselves.
 */
const run = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, nickname, role;`,
      [email]
    );

    if (result.rows.length === 0) {
      console.error(`No user found with email "${email}". Register the account first.`);
      process.exit(1);
    }

    console.log('Promoted to admin:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error promoting user:', err);
    process.exit(1);
  }
};

run();
