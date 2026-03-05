import { motion } from 'framer-motion';

interface FailOverlayProps {
  canRevive: boolean;
  onRevive: () => void;
  onExit: () => void;
}

export default function FailOverlay({ canRevive, onRevive, onExit }: FailOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full"
      >
        <p className="text-center text-toss-text font-medium mb-6">
          실패했습니다
        </p>
        <div className="flex flex-col gap-3">
          {canRevive && (
            <button
              onClick={onRevive}
              className="w-full py-3 rounded-2xl bg-toss-blue text-white font-semibold"
            >
              보상형 광고 보고 부활하기
            </button>
          )}
          <button
            onClick={onExit}
            className="w-full py-3 rounded-2xl border border-toss-border text-toss-sub hover:bg-toss-bg transition"
          >
            {canRevive ? '포기하고 결과 보기' : '결과 보기'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
