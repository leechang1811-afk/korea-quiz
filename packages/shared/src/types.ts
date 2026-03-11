export const GAME_TYPES = ['REACTION', 'TAP10', 'MEMORY', 'CALCULATION', 'PAINT'] as const;
export type GameType = (typeof GAME_TYPES)[number];

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  REACTION: '민첩성',
  TAP10: '순발력',
  MEMORY: '집중력',
  CALCULATION: '논리력',
  PAINT: '시각 추론',
};

// Reaction game colors
export const REACTION_COLORS = ['Red', 'Blue', 'Green', 'Purple', 'Yellow'] as const;
export type ReactionColor = (typeof REACTION_COLORS)[number];

export interface PerStageResult {
  game_type: GameType;
  level: number;
  success: boolean;
  score: number;
  client_time?: number;
}

export interface GameBreakdown {
  REACTION?: number;
  TAP10?: number;
  MEMORY?: number;
  CALCULATION?: number;
  PAINT?: number;
}

export interface RunSubmitPayload {
  user_hash: string;
  run_score: number;
  max_level: number;
  game_breakdown: GameBreakdown;
  per_stage: PerStageResult[];
  client_time: string;
}

export interface RunSubmitResponse {
  percentileTop: number;
  successRatePct: number | null;
  successBaseN: number;
  nextGoalHint: string;
  monthlyTop?: number | null;
  me?: { user_hash: string; best_score: number; best_level: number } | null;
  koreanAvgScore?: number | null;
  perTypeKoreanSuccess?: Partial<Record<GameType, number>> | null;
}
