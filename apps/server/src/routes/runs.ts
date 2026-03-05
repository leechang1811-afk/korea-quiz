import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  scoreHistogramDaily,
  challengeStatsDaily,
  leaderboard,
} from '../db/schema.js';
import type {
  RunSubmitPayload,
  RunSubmitResponse,
  GameType,
  PerStageResult,
} from 'shared';
import { getStrengthWeakness } from 'shared';

const router = Router();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function bucket(score: number): number {
  return Math.floor(score / 200);
}

function yearMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

router.post('/api/runs/submit', async (req, res) => {
  try {
    const body = req.body as RunSubmitPayload;
    const {
      user_hash,
      run_score,
      max_level,
      game_breakdown,
      per_stage,
      client_time,
    } = body;

    if (!user_hash || typeof run_score !== 'number' || !Array.isArray(per_stage)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const dateStr = today();
    const b = bucket(run_score);

    // 1. Update histogram
    await db
      .insert(scoreHistogramDaily)
      .values({ date: dateStr, bucket: b, count: 1 })
      .onConflictDoUpdate({
        target: [scoreHistogramDaily.date, scoreHistogramDaily.bucket],
        set: {
          count: sql`${scoreHistogramDaily.count} + 1`,
        },
      });

    // 2. Update challenge stats
    for (const s of per_stage as PerStageResult[]) {
      const successDelta = s.success ? 1 : 0;
      await db
        .insert(challengeStatsDaily)
        .values({
          date: dateStr,
          game_type: s.game_type,
          level: s.level,
          attempts: 1,
          successes: successDelta,
        })
        .onConflictDoUpdate({
          target: [
            challengeStatsDaily.date,
            challengeStatsDaily.game_type,
            challengeStatsDaily.level,
          ],
          set: {
            attempts: sql`${challengeStatsDaily.attempts} + 1`,
            successes: sql`${challengeStatsDaily.successes} + ${successDelta}`,
          },
        });
    }

    // 3. Percentile from histogram (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().slice(0, 10);

    const rows = await db
      .select()
      .from(scoreHistogramDaily)
      .where(sql`${scoreHistogramDaily.date} >= ${startDate}`);

    const bucketMap = new Map<number, number>();
    for (const r of rows) {
      const c = Number(r.count);
      bucketMap.set(r.bucket, (bucketMap.get(r.bucket) ?? 0) + c);
    }
    const buckets = Array.from(bucketMap.entries())
      .map(([bucket, count]) => ({ bucket, count }))
      .sort((a, b) => a.bucket - b.bucket);
    const totalCount = buckets.reduce((s, x) => s + x.count, 0);

    // Higher score = lower percentile (top = better)
    // percentileTop = % of people who have LOWER score (we beat them)
    let belowCount = 0;
    for (const { bucket: bk, count } of buckets) {
      if (bk < b) belowCount += count;
      else if (bk === b) break; // same bucket: we're in the middle, simplify by excluding
    }
    const percentileTop =
      totalCount > 0 ? Math.round((belowCount / totalCount) * 100) : 100;

    // 4. Success rate for current game/level (simplified: last attempt's game/level)
    const lastStage = per_stage[per_stage.length - 1];
    let successRatePct: number | null = null;
    let successBaseN = 0;
    if (lastStage) {
      const stat = await db
        .select()
        .from(challengeStatsDaily)
        .where(
          sql`${challengeStatsDaily.date} = ${dateStr} AND ${challengeStatsDaily.game_type} = ${lastStage.game_type} AND ${challengeStatsDaily.level} = ${lastStage.level}`
        )
        .limit(1);
      if (stat[0]) {
        const attempts = Number(stat[0].attempts);
        const successes = Number(stat[0].successes);
        successBaseN = attempts;
        successRatePct = attempts > 0 ? Math.round((successes / attempts) * 100) : null;
      }
    }

    // 5. Next goal hint
    const breakdown = {
      REACTION: game_breakdown?.REACTION ?? 0,
      TAP10: game_breakdown?.TAP10 ?? 0,
      MEMORY: game_breakdown?.MEMORY ?? 0,
      CALCULATION: game_breakdown?.CALCULATION ?? 0,
    };
    const { strength, weakness } = getStrengthWeakness(breakdown);
    const nextGoalHint =
      max_level < 20
        ? `데이터베이스 기반으로 1단계만 더 오르면 상위 ${Math.max(1, percentileTop - 5)}%가 될 수 있어요`
        : '20단계 달성! 최고 실력이에요!';

    // 6. Monthly top (user's rank)
    const ym = yearMonth();
    const leaderRows = await db
      .select()
      .from(leaderboard)
      .where(
        sql`${leaderboard.scope} = 'monthly' AND ${leaderboard.year_month} = ${ym}`
      )
      .orderBy(sql`${leaderboard.score} DESC`)
      .limit(100);

    let monthlyTop: number | null = null;
    const idx = leaderRows.findIndex((r) => r.user_hash === user_hash);
    if (idx >= 0) monthlyTop = idx + 1;

    // Update leaderboard: insert or update user's best
    await db
      .insert(leaderboard)
      .values({
        user_hash,
        scope: 'monthly',
        year_month: ym,
        score: run_score,
        max_level,
        created_at: dateStr,
      })
      .onConflictDoUpdate({
        target: [leaderboard.user_hash, leaderboard.scope, leaderboard.year_month],
        set: {
          score: sql`GREATEST(${leaderboard.score}, ${run_score})`,
          max_level: sql`CASE WHEN ${leaderboard.score} < ${run_score} THEN ${max_level} ELSE ${leaderboard.max_level} END`,
        },
      });

    const response: RunSubmitResponse = {
      percentileTop: Math.min(100, Math.max(1, percentileTop)),
      successRatePct,
      successBaseN,
      nextGoalHint,
      monthlyTop,
      me: {
        user_hash,
        best_score: run_score,
        best_level: max_level,
      },
    };

    return res.json(response);
  } catch (e) {
    console.error('POST /api/runs/submit', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
