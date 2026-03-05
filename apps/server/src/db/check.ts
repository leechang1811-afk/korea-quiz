/**
 * DB 연결 및 스키마 검증 스크립트
 * 실행: npx tsx src/db/check.ts
 */
import 'dotenv/config';
import pg from 'pg';

async function check() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다.');
    console.log('   .env 파일에 DATABASE_URL=postgresql://... 를 추가하세요.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString });

  try {
    const client = await pool.connect();

    // 1. 연결 테스트
    await client.query('SELECT 1');
    console.log('✅ DB 연결 성공\n');

    // 2. 테이블 존재 확인
    const tables = ['score_histogram_daily', 'challenge_stats_daily', 'leaderboard'];
    for (const table of tables) {
      const res = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      const exists = res.rows[0]?.exists;
      console.log(exists ? `✅ ${table}` : `❌ ${table} (테이블 없음 - 마이그레이션 필요)`);
    }

    // 3. 레코드 수 확인
    console.log('\n--- 데이터 현황 ---');
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) as cnt FROM ${table}`);
        console.log(`   ${table}: ${res.rows[0]?.cnt ?? 0}건`);
      } catch {
        console.log(`   ${table}: 조회 실패`);
      }
    }

    client.release();
  } catch (e) {
    console.error('❌ DB 오류:', e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

check();
