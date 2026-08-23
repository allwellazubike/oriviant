import { seedDemoTraders, clearDemoTraders } from '../services/demoTraderEngine.js';
import pool from '../config/db.js';

/**
 * Manages the seeded showcase traders.
 *
 *   npm run demo-traders -- seed [days]   build profiles + back-filled history
 *   npm run demo-traders -- clear         remove every demo trader and its data
 *
 * `clear` is the switch that must be thrown before real customers can allocate
 * funds: it deletes the profiles outright, so there is no way to leave a
 * generated track record on display by accident.
 */
const run = async () => {
  const command = process.argv[2];

  try {
    if (command === 'seed') {
      const days = Number(process.argv[3] ?? 90);
      console.log(`Seeding demo traders with ${days} days of real market history…\n`);
      const summary = await seedDemoTraders(days);
      for (const s of summary) {
        console.log(`  ${s.handle.padEnd(16)} ${String(s.trades).padStart(4)} trades`);
      }
      console.log('\nDone. These profiles are flagged is_demo and must be removed before launch.');
    } else if (command === 'clear') {
      const n = await clearDemoTraders();
      console.log(`Removed ${n} demo trader(s) and all of their trades, copies and subscriptions.`);
    } else {
      console.error('Usage: npm run demo-traders -- <seed|clear> [days]');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('demo-traders failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
