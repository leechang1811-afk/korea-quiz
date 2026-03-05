import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adsService } from '../services/ads';

const RESULT_AD_COOLDOWN_MS = 25_000;
const NAVIGATE_TIMEOUT_MS = 3_000;

export default function ResultGate() {
  const navigate = useNavigate();
  const navigatedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted && !navigatedRef.current) {
        navigatedRef.current = true;
        navigate('/result', { replace: true });
      }
    }, NAVIGATE_TIMEOUT_MS);

    (async () => {
      try {
        const shown = await adsService.showInterstitial();
        if (shown) {
          localStorage.setItem('last_interstitial_at', String(Date.now()));
        }
      } catch {
        // 광고 실패 시 UX 막지 않음
      }
      if (mounted && !navigatedRef.current) {
        navigatedRef.current = true;
        clearTimeout(timeout);
        navigate('/result', { replace: true });
      }
    })();
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-toss-sub">결과 불러오는 중...</p>
    </div>
  );
}
