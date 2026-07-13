import { motion } from 'framer-motion';
import { Play, BookOpen, Star, Trophy, Clock, CheckCircle, Zap } from 'lucide-react';
import { audioManager } from '../utils/audio';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

export default function Home({ stats, onViewChange }) {
  const unlockedLevel = stats.levels.reduce((max, lvl) => (lvl.unlocked ? Math.max(max, lvl.levelIndex) : max), 1);
  const totalStars = stats.levels.reduce((sum, lvl) => sum + lvl.stars, 0);
  
  const completedLevels = stats.levels.filter(lvl => lvl.bestTime > 0);
  const bestTime = completedLevels.length > 0
    ? Math.min(...completedLevels.map(lvl => lvl.bestTime))
    : 0;

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navigate = (view) => {
    audioManager.playClick();
    onViewChange(view);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-5 py-10 flex flex-col items-center justify-center min-h-[85vh] z-10">
      {/* Hero */}
      <motion.div {...fadeUp(0)} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/15 text-[var(--color-primary)] text-xs font-semibold tracking-wide mb-6">
          <Zap className="w-3.5 h-3.5" />
          THE CLASSIC MATHEMATICAL PUZZLE
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-primary)] via-white to-[var(--color-secondary)] mb-5 leading-tight">
          Tower of Hanoi
        </h1>
        <p className="text-base md:text-lg text-[var(--text-muted)] max-w-lg mx-auto font-light leading-relaxed">
          Move the entire stack of disks from one tower to another, following the ancient rules. Can you solve it in the minimum number of moves?
        </p>
      </motion.div>

      {/* Animated Tower Illustration */}
      <motion.div {...fadeUp(0.15)} className="relative h-40 w-full max-w-sm flex items-end justify-around mb-12 px-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute bottom-0 w-1.5 h-28 rounded-t-lg bg-[var(--rod-color)]/60"
            style={{ left: `${25 + i * 25}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[var(--rod-color)]/60 rounded-full" />
          </div>
        ))}

        {/* Disk 3 — bottom */}
        <motion.div
          animate={{ x: [0, 90, 90, -90, -90, 0], y: [0, 0, -20, -20, 0, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-2 h-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
          style={{ width: '72px', left: '25%', transform: 'translateX(-50%)', boxShadow: '0 0 12px rgba(16,185,129,0.35)' }}
        />
        {/* Disk 2 — middle */}
        <motion.div
          animate={{ x: [0, 0, 90, 90, -90, -90, 0], y: [0, -30, -30, 0, 0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-5.5 h-3.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
          style={{ width: '52px', left: '25%', transform: 'translateX(-50%)', boxShadow: '0 0 12px rgba(236,72,153,0.35)' }}
        />
        {/* Disk 1 — top */}
        <motion.div
          animate={{ x: [0, 90, 90, 90, -90, 0, 0], y: [0, -60, -60, 0, 0, -60, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
          className="absolute bottom-9 h-3.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
          style={{ width: '34px', left: '25%', transform: 'translateX(-50%)', boxShadow: '0 0 12px rgba(56,189,248,0.35)' }}
        />
      </motion.div>

      {/* CTA Buttons */}
      <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md justify-center mb-12">
        <button
          onClick={() => navigate('level-select')}
          className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:shadow-[0_8px_30px_rgba(var(--color-primary),0.3)] shadow-lg border border-white/15 transition-all duration-300 neon-btn"
        >
          <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          Play Game
        </button>
        <button
          onClick={() => navigate('how-to')}
          className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-[var(--text-main)] glassmorphism hover:bg-white/8 transition-all duration-300 shadow"
        >
          <BookOpen className="w-5 h-5" />
          How to Play
        </button>
      </motion.div>

      {/* Progress Dashboard */}
      <motion.div {...fadeUp(0.45)} className="w-full max-w-3xl glassmorphism rounded-2xl p-7 border border-white/8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold font-display uppercase tracking-widest text-[var(--text-muted)]">
            Your Progress
          </h3>
          <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent" />
          <span className="text-xs text-[var(--text-muted)] font-medium">{stats.gamesCompleted} games won</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Trophy, label: 'Max Level', value: `${unlockedLevel} / 8`, color: 'var(--color-primary)' },
            { icon: Star, label: 'Stars Earned', value: `${totalStars} / 24`, color: '#facc15' },
            { icon: Clock, label: 'Best Time', value: formatTime(bestTime), color: 'var(--color-accent)' },
            { icon: CheckCircle, label: 'Games Won', value: stats.gamesCompleted, color: 'var(--color-secondary)' }
          ].map(({ icon: Icon, label, value, color }, i) => (
            <div key={i} className="relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/4 border border-white/5 hover:border-white/10 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
              <Icon className="w-7 h-7 mb-2.5 group-hover:scale-105 transition-transform duration-300" style={{ color }} />
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-medium">{label}</span>
              <span className="text-xl font-extrabold font-display">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer credit */}
      <motion.p {...fadeUp(0.6)} className="mt-10 text-[11px] text-[var(--text-muted)]/50 tracking-wide">
        Built with React • Spring Boot • Framer Motion
      </motion.p>
    </div>
  );
}
