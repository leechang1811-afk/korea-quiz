# DB 점검 리포트

## 스키마 요약

| 테이블 | 용도 | PK |
|--------|------|-----|
| **score_histogram_daily** | 점수 분포 (버킷별, 최근 30일 퍼센타일 계산용) | date, bucket |
| **challenge_stats_daily** | 유형·단계별 시도/성공 통계 | date, game_type, level |
| **leaderboard** | 월간 리더보드 (유저별 최고 기록) | id (unique: user_hash, scope, year_month) |

## 설정 확인

1. **`.env` 파일**에 `DATABASE_URL` 설정 필요
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. **마이그레이션 적용**
   ```bash
   cd apps/server && npm run db:migrate
   ```

3. **연결 테스트**
   ```bash
   cd apps/server && npm run db:check
   ```

## API 엔드포인트

| 경로 | 메서드 | DB 사용 |
|------|--------|---------|
| `/api/health/db` | GET | 연결 테스트 (추가됨) |
| `/api/runs/submit` | POST | score_histogram, challenge_stats, leaderboard |
| `/api/leaderboard` | GET | leaderboard |
| `/api/me/summary` | GET | leaderboard |
| `/api/stats/success` | GET | challenge_stats_daily |
| `/api/stats/percentile` | GET | score_histogram_daily |

## 확인 사항

- ✅ 스키마 정의(`schema.ts`)와 마이그레이션(`0000_init.sql`) 일치
- ✅ `onConflictDoUpdate` 사용으로 leaderboard upsert 정상
- ✅ 20단계 지원 (max_level 컬럼은 integer, 20 저장 가능)
