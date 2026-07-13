import { motion } from 'framer-motion';
import { Lock, Unlock, Star, ArrowLeft, Play } from 'lucide-react';
import { audioManager } from '../utils/audio';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const card = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }
};

export default function LevelSelect({ stats, onSelectLevel, onViewChange }) {
  const getDifficulty = (disks) => {
    if (disks <= 3) return { label: 'Beginner', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (disks <= 5) return { label: 'Intermediate', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
    if (disks <= 7) return { label: 'Advanced', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' };
    if (disks <= 9) return { label: 'Expert', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Master', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCardClick = (level) => {
    if (!level.unlocked) return;
    audioManager.playClick();
    onSelectLevel(level.levelIndex);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-5 py-8 z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { audioManager.playClick(); onViewChange('home'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold glassmorphism hover:bg-white/8 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            Choose Your Level
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
            {stats.levels.filter(l => l.unlocked).length} of {stats.levels.length} levels unlocked
          </p>
        </div>
        <div className="w-20" />
      </div>

      {/* Level Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr"
      >
        {stats.levels.map((lvl) => {
          const diff = getDifficulty(lvl.disks);
          const isCompleted = lvl.bestMoves > 0;
          
          return (
            <motion.div
              key={lvl.levelIndex}
              variants={card}
              whileHover={lvl.unlocked ? { y: -5, transition: { duration: 0.2 } } : {}}
              whileTap={lvl.unlocked ? { scale: 0.98 } : {}}
              onClick={() => handleCardClick(lvl)}
              className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                lvl.unlocked
                  ? 'glassmorphism cursor-pointer hover:border-[var(--color-primary)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]'
                  : 'glassmorphism opacity-50 select-none grayscale-[30%]'
              }`}
              style={{ minHeight: '220px' }}
            >
              {/* Top accent bar */}
              {lvl.unlocked && (
                <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
              )}
              {!lvl.unlocked && (
                <div className="h-1 w-full bg-[var(--text-muted)]/20" />
              )}

              <div className="p-5 flex flex-col h-full">
                {/* Difficulty badge + lock icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${diff.color} ${diff.bg} ${diff.border}`}>
                    {diff.label}
                  </span>
                  {lvl.unlocked
                    ? <Unlock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    : <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  }
                </div>

                {/* Level number + disk count */}
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-medium mb-0.5">Level {lvl.levelIndex}</p>
                  <h3 className="text-xl font-extrabold font-display leading-tight">
                    {lvl.disks} <span className="text-sm font-semibold text-[var(--text-muted)]">Disks</span>
                  </h3>
                </div>

                <div className="mt-4 flex-1">
                  {/* Divider */}
                  <div className="h-px w-full bg-[var(--card-border)] my-3" />

                  {/* Stats rows */}
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Min Moves</span>
                      <span className="font-bold text-[var(--color-accent)]">{lvl.minMoves}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Best Moves</span>
                      <span className="font-bold">{isCompleted ? lvl.bestMoves : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Best Time</span>
                      <span className="font-bold">{formatTime(lvl.bestTime)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-[var(--card-border)] my-3" />

                  {/* Stars + Play aligned to bottom */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= lvl.stars
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-[var(--text-muted)]/20 fill-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    {lvl.unlocked && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wide">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Play
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lock overlay for locked levels */}
              {!lvl.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none">
                  <div className="p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg">
                    <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
