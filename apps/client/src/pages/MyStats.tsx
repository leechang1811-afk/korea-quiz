import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureUserHash } from '../store/gameStore';
import { API_BASE } from '../services/api';

export default function MyStats() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    best_score: number;
    best_level: number;
    monthly_rank: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureUserHash()
      .then((hash) =>
        fetch(`${API_BASE}/me/summary?user_hash=${encodeURIComponent(hash)}`)
      )
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-toss-text mb-6">내 기록</h1>
        {loading ? (
          <p className="text-toss-sub">불러오는 중...</p>
        ) : data ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-toss-bg border border-toss-border">
              <p className="text-toss-sub text-sm">최고 점수</p>
              <p className="text-xl font-bold text-toss-blue">{data.best_score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-toss-bg border border-toss-border">
              <p className="text-toss-sub text-sm">최고 단계</p>
              <p className="text-xl font-bold text-toss-text">{data.best_level}</p>
            </div>
            {data.monthly_rank && (
              <div className="p-4 rounded-2xl bg-toss-bg border border-toss-border">
                <p className="text-toss-sub text-sm">이번 달 순위</p>
                <p className="text-xl font-bold text-toss-text">#{data.monthly_rank}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-toss-sub">기록이 없습니다. 게임을 플레이해 보세요!</p>
        )}
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full py-3 rounded-2xl border border-toss-border text-toss-sub"
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
