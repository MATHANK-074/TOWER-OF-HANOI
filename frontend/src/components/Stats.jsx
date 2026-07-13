import { motion } from 'framer-motion';
import { ArrowLeft, Play, BarChart2, Star, Trophy, Clock, HelpCircle, Activity } from 'lucide-react';
import { audioManager } from '../utils/audio';

export default function Stats({ stats, onViewChange }) {
  const gamesPlayed = stats.gamesPlayed;
  const gamesCompleted = stats.gamesCompleted;
  const totalMoves = stats.totalMoves;
  const totalTimePlayed = stats.totalTimePlayed;
  const highestLevelReached = stats.highestLevelReached;
  
  // Advanced calculations
  const winRate = gamesPlayed > 0 ? Math.round((gamesCompleted / gamesPlayed) * 100) : 0;
  const totalStars = stats.levels.reduce((sum, lvl) => sum + lvl.stars, 0);
  const levelsCompletedCount = stats.levels.filter(l => l.bestTime > 0).length;
  const overallCompletionPercentage = Math.round((levelsCompletedCount / 8) * 100);

  const completedLevels = stats.levels.filter(lvl => lvl.bestTime > 0);
  const bestTime = completedLevels.length > 0
    ? Math.min(...completedLevels.map(lvl => lvl.bestTime))
    : 0;
  const bestMoves = completedLevels.length > 0
    ? Math.min(...completedLevels.map(lvl => lvl.bestMoves))
    : 0;

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    audioManager.playClick();
    onViewChange('home');
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glassmorphism hover:bg-white/10 transition duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <h2 className="text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] neon-text-glow flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
          STATISTICS
        </h2>
        <div className="w-28" />
      </div>

      {/* Grid of General Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Games Overview */}
        <div className="glassmorphism rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Games Played / Won</span>
          <span className="text-2xl font-black font-display text-white mt-2">{gamesPlayed} / {gamesCompleted}</span>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-[var(--color-primary)] h-full rounded-full" style={{ width: `${winRate}%` }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block text-right">{winRate}% Win Rate</span>
        </div>

        {/* Level Progression */}
        <div className="glassmorphism rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Campaign Progress</span>
          <span className="text-2xl font-black font-display text-[var(--color-secondary)] mt-2">{overallCompletionPercentage}%</span>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-[var(--color-secondary)] h-full rounded-full" style={{ width: `${overallCompletionPercentage}%` }} />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block text-right">{levelsCompletedCount} / 8 Completed</span>
        </div>

        {/* Total Stats */}
        <div className="glassmorphism rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Total Moves</span>
          <span className="text-2xl font-black font-display text-[var(--color-accent)] mt-2">{totalMoves}</span>
          <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-2 text-[10px] text-[var(--text-muted)]">
            <span>Avg Moves / Game:</span>
            <span className="font-bold text-white">{gamesCompleted > 0 ? Math.round(totalMoves / gamesCompleted) : 0}</span>
          </div>
        </div>

        {/* Play Time */}
        <div className="glassmorphism rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Time Played</span>
          <span className="text-2xl font-black font-display text-indigo-400 mt-2">{formatTime(totalTimePlayed)}</span>
          <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-2 text-[10px] text-[var(--text-muted)]">
            <span>Highest Level:</span>
            <span className="font-bold text-white">Level {highestLevelReached}</span>
          </div>
        </div>
      </div>

      {/* Best Stats Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="glassmorphism rounded-2xl p-6 border border-white/5 flex items-center gap-4 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <Star className="w-7 h-7 fill-yellow-400/20" />
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Total Stars</span>
            <span className="text-3xl font-extrabold font-display text-yellow-400 mt-1">{totalStars} <span className="text-sm font-normal text-white/55">/ 24</span></span>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-6 border border-white/5 flex items-center gap-4 bg-gradient-to-br from-teal-500/5 to-transparent">
          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Overall Best Time</span>
            <span className="text-3xl font-extrabold font-display text-teal-400 mt-1">{formatTime(bestTime)}</span>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl p-6 border border-white/5 flex items-center gap-4 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block">Overall Best Moves</span>
            <span className="text-3xl font-extrabold font-display text-purple-400 mt-1">{bestMoves > 0 ? bestMoves : '-'}</span>
          </div>
        </div>
      </div>

      {/* Level Breakdown Grid */}
      <h3 className="text-xl font-bold font-display mb-5 flex items-center gap-2 border-b border-white/5 pb-2">
        <Activity className="w-5 h-5 text-[var(--color-primary)]" />
        LEVEL BREAKDOWN
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.levels.map((lvl) => {
          const efficiency = lvl.bestMoves > 0 ? Math.round((lvl.minMoves / lvl.bestMoves) * 100) : 0;
          return (
            <div
              key={lvl.levelIndex}
              className={`rounded-2xl p-5 border flex justify-between items-center transition duration-300 ${
                lvl.unlocked
                  ? 'glassmorphism border-white/5 hover:border-[var(--color-primary)]/20'
                  : 'bg-black/25 border-white/5 opacity-40 select-none'
              }`}
            >
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold font-display text-white">Level {lvl.levelIndex} ({lvl.disks} Disks)</span>
                  {!lvl.unlocked && <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[var(--text-muted)]">Locked</span>}
                </div>
                
                {lvl.unlocked && lvl.bestMoves > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Efficiency (Min / Best moves):</span>
                      <span className="font-semibold text-white">{lvl.minMoves} / {lvl.bestMoves} ({efficiency}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-full rounded-full"
                        style={{ width: `${Math.min(100, efficiency)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-1">
                      <span>Best Time: <strong className="text-white">{formatTime(lvl.bestTime)}</strong></span>
                      <span>Target: <strong className="text-[var(--color-accent)]">{lvl.minMoves} moves</strong></span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text-muted)] italic block mt-1">
                    {lvl.unlocked ? 'Not completed yet' : 'Unlock to see metrics'}
                  </span>
                )}
              </div>

              {/* Stars display on the right */}
              {lvl.unlocked && (
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 min-w-[70px]">
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= lvl.stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-white/10 fill-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Rating</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
