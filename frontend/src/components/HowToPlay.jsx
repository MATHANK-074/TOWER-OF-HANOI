import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, AlertCircle, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { audioManager } from '../utils/audio';

// Steps to solve a 3-disk Hanoi (from 0 to 2 using 1)
const HANOI_3_STEPS = [
  { disk: 0, from: 0, to: 2, desc: "Move the smallest disk (1) to Tower C." },
  { disk: 1, from: 0, to: 1, desc: "Move the medium disk (2) to Tower B." },
  { disk: 0, from: 2, to: 1, desc: "Place the smallest disk (1) on top of the medium disk (2)." },
  { disk: 2, from: 0, to: 2, desc: "Move the largest disk (3) to the destination Tower C." },
  { disk: 0, from: 1, to: 0, desc: "Move the smallest disk (1) back to Tower A to free the medium disk." },
  { disk: 1, from: 1, to: 2, desc: "Move the medium disk (2) on top of the largest disk (3)." },
  { disk: 0, from: 0, to: 2, desc: "Finally, place the smallest disk (1) on top to complete the tower!" }
];

export default function HowToPlay({ onViewChange }) {
  const [demoState, setDemoState] = useState([[0, 1, 2], [], []]); // disks on each rod: 0 is smallest, 2 is largest
  const [stepIndex, setStepIndex] = useState(-1);
  const [activeStepText, setActiveStepText] = useState("Click 'Start Demo' to see how to solve 3 disks.");

  const resetDemo = () => {
    setDemoState([[0, 1, 2], [], []]);
    setStepIndex(-1);
    setActiveStepText("Click 'Start Demo' to see how to solve 3 disks.");
  };

  const handleStartDemo = () => {
    audioManager.playClick();
    resetDemo();
    setStepIndex(0);
  };

  useEffect(() => {
    if (stepIndex < 0 || stepIndex >= HANOI_3_STEPS.length) return;

    const timer = setTimeout(() => {
      const step = HANOI_3_STEPS[stepIndex];
      
      // Perform move in state
      setDemoState((prev) => {
        const next = prev.map(rod => [...rod]);
        // Remove disk
        const idx = next[step.from].indexOf(step.disk);
        if (idx > -1) next[step.from].splice(idx, 1);
        // Add to front (since array is top-to-bottom: [0, 1, 2] means 0 is top/smallest)
        next[step.to].unshift(step.disk);
        return next;
      });

      // Play soft drop audio
      audioManager.playDrop();
      
      // Set description
      setActiveStepText(`Step ${stepIndex + 1}: ${step.desc}`);

      // Advance
      if (stepIndex < HANOI_3_STEPS.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        // Delay resetting
        setTimeout(() => {
          setActiveStepText("Success! The puzzle is solved! Resetting...");
          setTimeout(resetDemo, 2000);
        }, 1500);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [stepIndex]);

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
          <BookOpen className="w-8 h-8 text-[var(--color-primary)]" />
          HOW TO PLAY
        </h2>
        <div className="w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Rules explanation (Left) */}
        <div className="md:col-span-6 space-y-5">
          <div className="glassmorphism rounded-2xl p-6 border border-white/5">
            <h3 className="text-xl font-bold font-display text-white mb-4 border-b border-white/5 pb-2">
              Rules of the Game
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-primary)]/20 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white">One Disk At a Time</h4>
                  <p className="text-sm text-[var(--text-muted)]">You can only move one disk at a time from one tower to another.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-secondary)]/20 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white">Top Disk Moves Only</h4>
                  <p className="text-sm text-[var(--text-muted)]">Only the uppermost disk on a tower can be lifted or moved.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 font-bold flex items-center justify-center shrink-0 mt-0.5 border border-red-500/20 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white">No Larger on Smaller</h4>
                  <p className="text-sm text-[var(--text-muted)]">A larger disk cannot be placed on top of a smaller disk. Doing so will result in an illegal move warning.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-accent)]/20 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-white">Shift Entire Stack</h4>
                  <p className="text-sm text-[var(--text-muted)]">Your ultimate goal is to move all disks from the starting Tower A to the destination Tower C, utilizing Tower B as a helper.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 flex gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              <strong>Pro-tip:</strong> The minimum number of moves required to solve the puzzle is <strong>2ⁿ − 1</strong>, where <i>n</i> is the number of disks. For 3 disks, the minimum is 7 moves!
            </p>
          </div>
        </div>

        {/* Animated Example (Right) */}
        <div className="md:col-span-6 glassmorphism rounded-2xl p-6 border border-white/5 flex flex-col items-center">
          <h3 className="text-xl font-bold font-display text-white mb-2 self-start">
            Animated Example (3 Disks)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-6 self-start">
            Watch the step-by-step solver sequence. Note how larger disks are never placed on smaller ones.
          </p>

          {/* Mini Hanoi Board */}
          <div className="relative w-full h-48 bg-black/20 rounded-xl flex items-end justify-around p-4 border border-white/5 mb-6 overflow-hidden">
            {/* 3 Rods */}
            {['A', 'B', 'C'].map((name, rodIdx) => (
              <div key={rodIdx} className="relative h-full flex flex-col items-center justify-end w-1/3">
                {/* Rod shaft */}
                <div className="w-1.5 h-28 bg-[var(--rod-color)] rounded-t-full relative">
                  {/* Disk stack rendering */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center w-24">
                    {demoState[rodIdx].map((diskSize, dIndex) => {
                      const colors = [
                        'from-cyan-500 to-blue-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
                        'from-pink-500 to-rose-500 border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.4)]',
                        'from-emerald-500 to-teal-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      ];
                      const widths = ['w-12', 'w-16', 'w-20'];
                      return (
                        <motion.div
                          key={diskSize}
                          layoutId={`demo-disk-${diskSize}`}
                          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                          className={`h-4.5 rounded-full border bg-gradient-to-r ${colors[diskSize]} ${widths[diskSize]} flex items-center justify-center text-[10px] font-bold text-white mb-0.5`}
                        >
                          {diskSize + 1}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                {/* Rod label */}
                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-2">{name}</span>
              </div>
            ))}
          </div>

          {/* Caption Box */}
          <div className="w-full bg-white/5 border border-white/5 rounded-xl p-4 min-h-[70px] flex items-center justify-center text-center text-sm font-semibold mb-6">
            <p className="text-[var(--color-primary)]">{activeStepText}</p>
          </div>

          {/* Controller buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 transition duration-300 shadow-md neon-btn"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {stepIndex >= 0 ? 'Restart Demo' : 'Start Demo'}
            </button>
            {stepIndex >= 0 && (
              <button
                onClick={resetDemo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-[var(--text-main)] glassmorphism hover:bg-white/10 transition duration-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
