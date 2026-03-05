import { Router } from 'express';
import { sql, eq, and, gte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { challengeStatsDaily, scoreHistogramDaily } from '../db/schema.js';

const router = Router();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

router.get('/api/stats/success', async (req, res) => {
  try {
    const game_type = req.query.game_type as string;
    const level = parseInt(req.query.level as string, 10);

    if (!game_type || !level) {
      return res.status(400).json({ error: 'game_type and level required' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().slice(0, 10);

    const rows = await db
      .select()
      .from(challengeStatsDaily)
      .where(
        and(
          gte(challengeStatsDaily.date, startDate),
          eq(challengeStatsDaily.game_type, game_type),
          eq(challengeStatsDaily.level, level)
        )
      );

    let attempts = 0;
    let successes = 0;
    for (const r of rows) {
      attempts += Number(r.attempts);
      successes += Number(r.successes);
    }

    return res.json({
      attempts,
      successes,
      successRatePct: attempts > 0 ? Math.round((successes / attempts) * 100) : null,
    });
  } catch (e) {
    console.error('GET /api/stats/success', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/stats/percentile', async (req, res) => {
  try {
    const score = parseInt(req.query.score as string, 10);
    if (isNaN(score)) {
      return res.status(400).json({ error: 'score required' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().slice(0, 10);

    const rows = await db
      .select()
      .from(scoreHistogramDaily)
      .where(gte(scoreHistogramDaily.date, startDate));

    let totalCount = 0;
    const buckets: { bucket: number; count: number }[] = [];
    for (const r of rows) {
      totalCount += Number(r.count);
      const existing = buckets.find((b) => b.bucket === r.bucket);
      if (existing) existing.count += Number(r.count);
      else buckets.push({ bucket: r.bucket, count: Number(r.count) });
    }
    buckets.sort((a, b) => a.bucket - b.bucket);

    const b = Math.floor(score / 200);
    let belowCount = 0;
    for (const { bucket: bk, count } of buckets) {
      if (bk < b) belowCount += count;
    }
    const percentileTop =
      totalCount > 0 ? Math.round((belowCount / totalCount) * 100) : 100;

    return res.json({ percentileTop: Math.min(100, Math.max(1, percentileTop)) });
  } catch (e) {
    console.error('GET /api/stats/percentile', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
