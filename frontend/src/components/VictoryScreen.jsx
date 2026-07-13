import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, ArrowRight, List, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function VictoryScreen({
  levelIndex,
  disks,
  moves,
  minMoves,
  timeTaken,
  onReplay,
  onNextLevel,
  onLevelSelect,
  hasUsedSolver
}) {
  const stars = moves === minMoves ? 3 : moves <= Math.floor(minMoves * 1.2) ? 2 : 1;
  const efficiency = Math.round((minMoves / moves) * 100);

  useEffect(() => {
    audioManager.playVictory();

    // Burst confetti in theme-appropriate colors
    const colors = ['#38bdf8', '#a78bfa', '#34d399', '#facc15', '#f472b6'];
    const end = Date.now() + 2500;

    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const act = (cb) => { audioManager.playClick(); cb(); };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6, damping: 22 }}
        className="w-full max-w-md glassmorphism rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden"
      >
        {/* Decorative gradient blurs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[var(--color-primary)]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[var(--color-secondary)]/12 blur-3xl pointer-events-none" />

        {/* Trophy */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          className="inline-flex p-4 rounded-2xl bg-yellow-500/8 border border-yellow-500/20 text-yellow-400 mb-5"
        >
          <Trophy className="w-14 h-14" />
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-1">
          Level Complete!
        </h2>
        <p className="text-[var(--text-muted)] text-xs mb-6 uppercase tracking-[0.2em] font-semibold">
          Level {levelIndex} • {disks} Disks
        </p>

        {/* Star Rating or Solver Badge */}
        {hasUsedSolver ? (
          <div className="bg-violet-500/8 border border-violet-500/15 rounded-2xl p-4 mb-7 mx-auto max-w-xs">
            <div className="flex items-center justify-center gap-2 text-violet-400 font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              Auto-Assisted
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Solver was used during this run. Solve manually to earn star ratings.
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-3 mb-7">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + star * 0.15, type: 'spring', stiffness: 200 }}
              >
                <Star
                  className={`w-11 h-11 ${
                    star <= stars
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                      : 'text-white/8 fill-transparent'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 bg-white/4 rounded-2xl p-4 border border-white/5 mb-7">
          <div className="text-center">
            <span className="text-[var(--text-muted)] text-[10px] block mb-1 uppercase tracking-wider">Time</span>
            <span className="text-lg font-bold font-display">{formatTime(timeTaken)}</span>
          </div>
          <div className="text-center border-x border-white/5">
            <span className="text-[var(--text-muted)] text-[10px] block mb-1 uppercase tracking-wider">Moves</span>
            <span className="text-lg font-bold font-display text-[var(--color-primary)]">{moves}</span>
          </div>
          <div className="text-center">
            <span className="text-[var(--text-muted)] text-[10px] block mb-1 uppercase tracking-wider">Efficiency</span>
            <span className={`text-lg font-bold font-display ${efficiency >= 100 ? 'text-emerald-400' : efficiency >= 80 ? 'text-yellow-400' : 'text-[var(--text-muted)]'}`}>
              {efficiency}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {levelIndex < 8 && (
            <button
              onClick={() => act(onNextLevel)}
              className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:shadow-lg shadow-md border border-white/10 transition-all duration-300 neon-btn"
            >
              Next Level
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => act(onReplay)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[var(--text-main)] glassmorphism hover:bg-white/8 border border-white/5 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>
            <button
              onClick={() => act(onLevelSelect)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[var(--text-main)] glassmorphism hover:bg-white/8 border border-white/5 transition-all duration-300"
            >
              <List className="w-4 h-4" />
              Levels
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
