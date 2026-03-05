import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { computeRunScore, getStrengthWeakness } from 'shared';
import type { GameType } from 'shared';
import { submitRun } from '../services/api';
import { ensureUserHash } from '../store/gameStore';

export default function Result() {
  const navigate = useNavigate();
  const { lastCompletedRun, userHash, setUserHash, endRun } = useGameStore();
  const [percentileTop, setPercentileTop] = useState<number | null>(null);
  const [nextGoalHint, setNextGoalHint] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureUserHash().then(setUserHash);
  }, [setUserHash]);

  useEffect(() => {
    if (!lastCompletedRun) {
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      const hash = userHash || (await ensureUserHash());
      const runScore = computeRunScore(lastCompletedRun.perStageResults.map((r) => ({ score: r.score })));
      try {
        const res = await submitRun({
          user_hash: hash,
          run_score: runScore,
          max_level: lastCompletedRun.maxLevel,
          game_breakdown: lastCompletedRun.gameBreakdown,
          per_stage: lastCompletedRun.perStageResults.map((r) => ({
            game_type: r.game_type,
            level: r.level,
            success: r.success,
            score: r.score,
          })),
          client_time: new Date().toISOString(),
        });
        setPercentileTop(res.percentileTop);
        setNextGoalHint(res.nextGoalHint);
      } catch (e) {
        setError('결과 불러오기 실패');
        setPercentileTop(50);
        setNextGoalHint(
          `데이터베이스 기반으로 1단계만 더 오르면 상위 5%가 될 수 있어요`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [lastCompletedRun, userHash, navigate]);

  const handleRetry = () => {
    endRun();
    useGameStore.getState().startRun();
    navigate('/run');
  };

  const handleHome = () => {
    endRun();
    navigate('/');
  };

  if (!lastCompletedRun) return null;

  const runScore = computeRunScore(lastCompletedRun.perStageResults.map((r) => ({ score: r.score })));
  const breakdown = lastCompletedRun.gameBreakdown as Record<GameType, number>;
  const { strength, weakness, weaknessTip } = getStrengthWeakness({
    REACTION: breakdown.REACTION ?? 0,
    TAP10: breakdown.TAP10 ?? 0,
    MEMORY: breakdown.MEMORY ?? 0,
    CALCULATION: breakdown.CALCULATION ?? 0,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white p-6"
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-toss-text text-center mb-6">
          결과
        </h1>

        {loading ? (
          <p className="text-center text-toss-sub">불러오는 중...</p>
        ) : (
          <>
            {lastCompletedRun.maxLevel === 20 && (
              <div className="bg-toss-bg rounded-2xl p-6 mb-6 border-2 border-toss-blue">
                <p className="text-center text-xl font-bold text-toss-blue mb-2">
                  🎉 축하합니다!
                </p>
                <p className="text-center text-toss-text">
                  모든 문제를 풀어 상위 0.1%가 되었습니다.
                </p>
              </div>
            )}
            <div className="bg-toss-bg rounded-2xl p-6 mb-4 border border-toss-border">
              <p className="text-center text-3xl font-bold text-toss-blue mb-2">
                한국인 상위 {lastCompletedRun.maxLevel === 20 ? '0.1' : percentileTop ?? '-'}%
              </p>
              <p className="text-center text-toss-sub text-sm">
                데이터베이스 기반 · 총점 {runScore} · 최고 단계 {lastCompletedRun.maxLevel}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4 border border-toss-border shadow-sm">
              <p className="text-toss-sub text-sm">
                <span className="text-toss-blue">강점</span> {strength}
              </p>
              <p className="text-toss-sub text-sm mt-1">
                <span className="text-red-500">약점</span> {weakness}
              </p>
              {weaknessTip && (
                <p className="text-toss-sub text-sm mt-2 pt-2 border-t border-toss-border">
                  💡 <span className="text-toss-blue">개선 팁</span> {weaknessTip}
                </p>
              )}
            </div>

            <div className="bg-toss-bg rounded-2xl p-4 mb-6">
              <p className="text-toss-text text-sm">{nextGoalHint}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-2xl bg-toss-blue text-white font-semibold"
              >
                다시 도전
              </button>
              <button
                onClick={handleHome}
                className="w-full py-3 rounded-2xl border border-toss-border text-toss-sub"
              >
                홈으로
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm mt-4">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
