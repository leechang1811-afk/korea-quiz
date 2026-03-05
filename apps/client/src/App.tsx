import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Run from './pages/Run';
import Result from './pages/Result';
import ResultGate from './pages/ResultGate';
import Leaderboard from './pages/Leaderboard';
import MyStats from './pages/MyStats';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/run" element={<Run />} />
        <Route path="/result-gate" element={<ResultGate />} />
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/my-stats" element={<MyStats />} />
      </Routes>
    </AnimatePresence>
  );
}
