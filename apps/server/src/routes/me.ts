import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { leaderboard } from '../db/schema.js';

const router = Router();

router.get('/api/me/summary', async (req, res) => {
  try {
    const user_hash = req.query.user_hash as string;
    if (!user_hash) {
      return res.status(400).json({ error: 'user_hash required' });
    }

    const ym = new Date().toISOString().slice(0, 7);

    const rows = await db
      .select()
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.scope, 'monthly'),
          eq(leaderboard.year_month, ym),
          eq(leaderboard.user_hash, user_hash)
        )
      )
      .limit(1);

    const entry = rows[0];
    if (!entry) {
      return res.json({
        user_hash,
        best_score: 0,
        best_level: 0,
        monthly_rank: null,
      });
    }

    const rankRows = await db
      .select()
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.scope, 'monthly'),
          eq(leaderboard.year_month, ym)
        )
      )
      .orderBy(sql`${leaderboard.score} DESC`);

    const monthly_rank =
      rankRows.findIndex((r) => r.user_hash === user_hash) + 1 || null;

    return res.json({
      user_hash,
      best_score: entry.score,
      best_level: entry.max_level,
      monthly_rank,
    });
  } catch (e) {
    console.error('GET /api/me/summary', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
