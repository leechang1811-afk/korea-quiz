import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';

interface LeaderboardEntry {
  rank: number;
  score: number;
  max_level: number;
  user_hash: string;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/leaderboard?scope=monthly`)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-toss-text mb-6">리더보드</h1>
        {loading ? (
          <p className="text-toss-sub">불러오는 중...</p>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <div
                key={e.rank}
                className="flex items-center justify-between p-4 rounded-2xl bg-toss-bg border border-toss-border"
              >
                <span className="font-medium text-toss-text">#{e.rank}</span>
                <span className="text-toss-sub">{e.score}점</span>
                <span className="text-toss-sub text-sm">Lv.{e.max_level}</span>
              </div>
            ))}
          </div>
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
