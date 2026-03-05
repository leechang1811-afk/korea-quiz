import { GAME_TYPE_LABELS, timeLimitForLevel } from 'shared';
import type { GameType } from 'shared';

interface StageHeaderProps {
  gameType: GameType;
  level: number;
  cumulativeScore: number;
}

export default function StageHeader({
  gameType,
  level,
  cumulativeScore,
}: StageHeaderProps) {
  const timeLimit = timeLimitForLevel(level);
  const gameIndex = ['REACTION', 'TAP10', 'MEMORY', 'CALCULATION'].indexOf(gameType) + 1;

  return (
    <header className="bg-white border-b border-toss-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-toss-sub">문제유형 {gameIndex}/4</div>
          <div className="text-sm font-medium text-toss-text text-center flex-1">
            {GAME_TYPE_LABELS[gameType]}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-toss-sub">
            {level}/20단계 · 제한시간 {timeLimit}초
          </div>
          <div className="px-2 py-0.5 rounded-lg bg-toss-bg text-toss-blue text-xs font-medium">
            누적 점수 {cumulativeScore}
          </div>
        </div>
      </div>
    </header>
  );
}
