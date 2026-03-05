import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ensureUserHash } from '../store/gameStore';
import { useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    ensureUserHash();
  }, []);

  const startGame = () => {
    navigate('/run');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <h1 className="text-2xl font-bold text-toss-text mb-2">
          나는 한국 상위 몇%?
        </h1>
        <p className="text-toss-sub mb-4">
          4가지 문제 유형으로 실력 확인
        </p>
        <div className="text-toss-sub text-sm text-left mb-8 space-y-2">
          <p>문제유형1 : 반응속도</p>
          <p>문제유형2 : 시간 맞추기</p>
          <p>문제유형3 : 기억력</p>
          <p>문제유형4 : 계산 속도</p>
        </div>
        <button
          onClick={startGame}
          className="w-full py-4 rounded-2xl bg-toss-blue text-white font-semibold shadow-sm hover:opacity-90 transition"
        >
          시작하기
        </button>
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-sm text-toss-sub hover:text-toss-blue transition"
          >
            리더보드
          </button>
          <button
            onClick={() => navigate('/my-stats')}
            className="text-sm text-toss-sub hover:text-toss-blue transition"
          >
            내 기록
          </button>
        </div>
      </motion.div>
    </div>
  );
}
