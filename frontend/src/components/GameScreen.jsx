import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Undo2, Lightbulb, Play, Pause, ChevronLeft,
  Volume2, VolumeX, Sun, Moon, Settings, FastForward
} from 'lucide-react';
import { audioManager } from '../utils/audio';
import { api } from '../utils/api';
import VictoryScreen from './VictoryScreen';

export default function GameScreen({
  levelIndex,
  onBackToLevels,
  stats,
  onSaveStats,
  theme,
  onThemeChange,
  darkMode,
  onToggleDarkMode
}) {
  // Dynamic header classes to support light/dark themes
  const headerBtnClass = darkMode
    ? 'p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 text-white transition duration-300 shadow'
    : 'p-2.5 rounded-xl bg-white/80 border border-gray-200 hover:bg-white text-slate-800 transition duration-300 shadow';

  const titleClass = darkMode ? 'font-extrabold font-display text-white text-lg' : 'font-extrabold font-display text-slate-900 text-lg';
  const subtitleClass = darkMode ? 'text-[10px] text-[var(--text-muted)] uppercase tracking-wider block' : 'text-[10px] text-slate-600 uppercase tracking-wider block';

  const diskCount = levelIndex + 2; // Level 1 = 3 disks, Level 8 = 10 disks
  const minMoves = Math.pow(2, diskCount) - 1;

  // Game state
  const [towers, setTowers] = useState([[], [], []]);
  const [history, setHistory] = useState([]);
  const [movesCount, setMovesCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hasUsedSolver, setHasUsedSolver] = useState(false);
  
  // Interactive state
  const [selectedTower, setSelectedTower] = useState(null);
  const [errorHighlight, setErrorHighlight] = useState(null); // rod index of illegal move error
  const [hint, setHint] = useState(null); // { from, to, disk }
  const [hintExplanation, setHintExplanation] = useState('');

  // Auto solver state
  const [isSolving, setIsSolving] = useState(false);
  const [solveMoves, setSolveMoves] = useState([]);
  const [solveStep, setSolveStep] = useState(0);
  const [solveSpeed, setSolveSpeed] = useState(600); // ms per move: Slow (1200), Normal (600), Fast (150)

  // Refs for tracking DOM elements (for drag position calculation)
  const boardRef = useRef(null);
  const rodRefs = [useRef(null), useRef(null), useRef(null)];
  const isMuted = audioManager.getMuted();

  // Initialize game
  useEffect(() => {
    resetGame();
    audioManager.startBgm();
    return () => {
      audioManager.stopBgm();
    };
  }, [levelIndex]);

  // Timer Tick
  useEffect(() => {
    if (isPaused || gameWon || isSolving || movesCount === 0) return;
    const timer = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, gameWon, isSolving, movesCount]);

  // Auto-Solve Tick Loop
  useEffect(() => {
    if (!isSolving || solveStep >= solveMoves.length || isPaused) return;

    const timer = setTimeout(() => {
      const nextMove = solveMoves[solveStep];
      executeMove(nextMove.fromTower, nextMove.toTower, true);
      setSolveStep(s => s + 1);
    }, solveSpeed);

    return () => clearTimeout(timer);
  }, [isSolving, solveStep, solveMoves, solveSpeed, isPaused]);

  // Trigger Victory Check
  useEffect(() => {
    // Game is won when all disks are placed on Tower 2
    if (towers[2].length === diskCount && !isSolving) {
      handleVictory();
    }
  }, [towers]);

  const resetGame = () => {
    const initialDisks = Array.from({ length: diskCount }, (_, i) => i);
    setTowers([initialDisks, [], []]);
    setHistory([]);
    setMovesCount(0);
    setTime(0);
    setIsPaused(false);
    setGameWon(false);
    setSelectedTower(null);
    setErrorHighlight(null);
    setHint(null);
    setHintExplanation('');
    setHasUsedSolver(false);
    stopSolver();
  };

  const handleVictory = () => {
    setGameWon(true);
    
    // Save/Update stats
    const updatedStats = { ...stats };
    updatedStats.gamesCompleted += 1;
    updatedStats.totalMoves += movesCount;
    updatedStats.totalTimePlayed += time;
    
    // Update level specific stats (only if solver was NOT used)
    const lvl = updatedStats.levels.find(l => l.levelIndex === levelIndex);
    if (lvl) {
      if (!hasUsedSolver) {
        const runStars = movesCount === minMoves ? 3 : movesCount <= Math.floor(minMoves * 1.2) ? 2 : 1;
        lvl.stars = Math.max(lvl.stars, runStars);
        lvl.bestMoves = lvl.bestMoves === 0 ? movesCount : Math.min(lvl.bestMoves, movesCount);
        lvl.bestTime = lvl.bestTime === 0 ? time : Math.min(lvl.bestTime, time);
      }
    }

    // Unlock next level (even if solver was used, to allow progression)
    if (levelIndex < 8) {
      const nextLvl = updatedStats.levels.find(l => l.levelIndex === levelIndex + 1);
      if (nextLvl) nextLvl.unlocked = true;
      updatedStats.highestLevelReached = Math.max(updatedStats.highestLevelReached, levelIndex + 1);
    }

    onSaveStats(updatedStats);
  };

  // Perform disk moving
  const executeMove = (from, to, silent = false) => {
    if (from === to) return false;
    
    const srcStack = towers[from];
    const destStack = towers[to];

    if (srcStack.length === 0) return false;
    const disk = srcStack[0];

    // Rules Check
    if (destStack.length > 0 && destStack[0] < disk) {
      // Illegal Move: larger disk on smaller disk
      if (!silent) {
        audioManager.playClick(); // Buzz sound
        setErrorHighlight(to);
        setTimeout(() => setErrorHighlight(null), 500);
      }
      return false;
    }

    // Execute Move
    if (!silent) {
      audioManager.playDrop();
      // Record History for Undo (only during manual play)
      if (!isSolving) {
        setHistory(prev => [...prev, towers.map(t => [...t])]);
      }
    }

    setTowers(prev => {
      const next = prev.map(t => [...t]);
      next[from].shift();
      next[to].unshift(disk);
      return next;
    });

    if (!isSolving) {
      setMovesCount(c => c + 1);
      
      // Clear hint highlights on valid move
      setHint(null);
      setHintExplanation('');

      // Track gamesPlayed on first move
      if (movesCount === 0) {
        const updatedStats = { ...stats };
        updatedStats.gamesPlayed += 1;
        onSaveStats(updatedStats);
      }
    }
    return true;
  };

  // Click-to-Move Handler
  const handleTowerClick = (towerIdx) => {
    if (gameWon || isSolving || isPaused) return;

    audioManager.playClick();

    if (selectedTower === null) {
      // Try to select
      if (towers[towerIdx].length > 0) {
        setSelectedTower(towerIdx);
        audioManager.playPickup();
      }
    } else {
      // Move to selected target
      if (selectedTower === towerIdx) {
        // Cancel selection
        setSelectedTower(null);
        audioManager.playDrop();
      } else {
        const success = executeMove(selectedTower, towerIdx);
        if (success) {
          setSelectedTower(null);
        } else {
          // If invalid target, keep selected so they can redirect
          setSelectedTower(towerIdx);
          audioManager.playPickup();
        }
      }
    }
  };

  // Drag End Handler for Framer Motion Drag
  const handleDragEnd = (event, info, fromTowerIdx, diskSize) => {
    if (gameWon || isSolving || isPaused) return;

    // Use viewport-relative pointer coordinates if available to match getBoundingClientRect()
    const releaseX = event.clientX || 
      (event.changedTouches && event.changedTouches[0] && event.changedTouches[0].clientX) || 
      info.point.x;
      
    let closestRod = -1;
    let minDistance = Infinity;

    // Detect closest rod
    for (let i = 0; i < 3; i++) {
      if (rodRefs[i].current) {
        const rect = rodRefs[i].current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(releaseX - centerX);
        if (dist < minDistance && dist < 120) {
          minDistance = dist;
          closestRod = i;
        }
      }
    }

    // Try to move
    if (closestRod !== -1 && closestRod !== fromTowerIdx) {
      const success = executeMove(fromTowerIdx, closestRod);
      if (!success) {
        // Play bounce warning back
        audioManager.playClick();
        setErrorHighlight(closestRod);
        setTimeout(() => setErrorHighlight(null), 500);
      }
    } else {
      // Snap back sound
      audioManager.playDrop();
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (history.length === 0 || isSolving || gameWon) return;
    audioManager.playClick();
    const prevTowers = history[history.length - 1];
    setTowers(prevTowers);
    setHistory(prev => prev.slice(0, -1));
    setMovesCount(c => c - 1);
  };

  // Hint Logic
  const handleHint = async () => {
    if (isSolving || gameWon) return;
    audioManager.playClick();

    // Map towers state to array of disk positions (0-indexed, where pos[i] is tower index of disk i)
    const diskPositions = Array(diskCount).fill(0);
    towers.forEach((tower, towerIdx) => {
      tower.forEach((disk) => {
        diskPositions[disk] = towerIdx;
      });
    });

    const nextMove = await api.hint(diskPositions, 2);
    if (nextMove) {
      setHint({
        from: nextMove.fromTower,
        to: nextMove.toTower,
        disk: nextMove.disk
      });
      const names = ['Tower A', 'Tower B', 'Tower C'];
      setHintExplanation(
        `Hint: Move Disk ${nextMove.disk + 1} from ${names[nextMove.fromTower]} to ${names[nextMove.toTower]}`
      );
    }
  };

  // Solver Trigger
  const handleAutoSolve = async () => {
    audioManager.playClick();
    if (isSolving) {
      stopSolver();
      return;
    }

    // Initialize board state to starting level layout to solve completely
    const initialDisks = Array.from({ length: diskCount }, (_, i) => i);
    setTowers([initialDisks, [], []]);
    setHistory([]);
    setMovesCount(0);
    setTime(0);
    setGameWon(false);

    setIsSolving(true);
    setSolveStep(0);
    setHasUsedSolver(true); // Flag that solver was activated in this game
    
    // Call server solver
    const solverMoves = await api.solve(diskCount);
    setSolveMoves(solverMoves);
  };

  const stopSolver = () => {
    setIsSolving(false);
    setSolveMoves([]);
    setSolveStep(0);
  };

  // Format seconds
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    audioManager.setMuted(nextMute);
    onThemeChange(theme); // trigger rerender/reset on layouts
  };

  // Disk dimensions
  const diskHeight = 24;
  const baseSpacer = 12;

  // Calculate overall level completion percentage
  const progressPercent = Math.round((towers[2].length / diskCount) * 100);

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-6 z-10 flex flex-col justify-between min-h-[90vh]">
      {/* Top Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 glassmorphism rounded-2xl p-4 border border-white/5 mb-6">
        {/* Back and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onBackToLevels();
            }}
            className={headerBtnClass}
          >
            <ChevronLeft className={darkMode ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-800'} />
          </button>
          <div>
              <h3 className={titleClass}>Level {levelIndex}</h3>
              <span className={subtitleClass}>
                {diskCount} Disks ({minMoves} min moves)
              </span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher dropdown */}
          <div className="flex items-center gap-1.5 glassmorphism-light rounded-xl px-2 py-1.5 border border-white/5">
            <Settings className="w-3.5 h-3.5 text-white/40" />
            <select
              value={theme}
              onChange={(e) => {
                audioManager.playClick();
                onThemeChange(e.target.value);
              }}
              className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="aurora" className="bg-[#0a0e1a] text-sky-400">Midnight Aurora</option>
              <option value="rosegold" className="bg-[#1a1118] text-pink-400">Rose Gold</option>
              <option value="emerald" className="bg-[#071210] text-emerald-400">Emerald Noir</option>
              <option value="frost" className="bg-[#f0f9ff] text-sky-700">Arctic Frost</option>
              <option value="sunset" className="bg-[#1c0c08] text-orange-400">Sunset Blaze</option>
              <option value="amethyst" className="bg-[#0f0a1e] text-violet-400">Royal Amethyst</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-xl glassmorphism-light hover:bg-white/10 text-[var(--text-main)] border border-white/5 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={() => {
              audioManager.playClick();
              onToggleDarkMode();
            }}
            className="p-2 rounded-xl glassmorphism-light hover:bg-white/10 text-[var(--text-main)] border border-white/5 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Info Status Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glassmorphism rounded-xl p-3 border border-white/5 text-center">
          <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider block">Moves</span>
          <span className="text-xl font-bold font-display text-[var(--color-primary)]">{movesCount}</span>
        </div>
        <div className="glassmorphism rounded-xl p-3 border border-white/5 text-center">
          <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider block">Timer</span>
          <span className="text-xl font-bold font-display text-[var(--color-primary)]">{formatTime(time)}</span>
        </div>
        <div className="glassmorphism rounded-xl p-3 border border-white/5 text-center">
          <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider block">Min Moves</span>
          <span className="text-xl font-bold font-display text-[var(--color-accent)]">{minMoves}</span>
        </div>
        <div className="glassmorphism rounded-xl p-3 border border-white/5 text-center flex flex-col justify-center">
          <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider block">Progress</span>
          <span className="text-xl font-bold font-display text-[var(--color-secondary)]">{progressPercent}%</span>
        </div>
      </div>

      {/* Interactive Towers Play Area */}
      <div
        ref={boardRef}
        className="relative flex items-end justify-around w-full h-[45vh] bg-black/15 border border-white/5 rounded-3xl p-6 mb-6 overflow-hidden shadow-inner select-none"
      >
        {/* Progress bar background slider */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Rods base plate rendering */}
        {[0, 1, 2].map((towerIdx) => {
          const isSelected = selectedTower === towerIdx;
          const isTargetHint = hint && hint.to === towerIdx;
          const isSourceHint = hint && hint.from === towerIdx;
          const hasError = errorHighlight === towerIdx;
          const rodDisks = towers[towerIdx]; // Get disks for this rod

          return (
            <div
              key={towerIdx}
              ref={rodRefs[towerIdx]}
              onClick={() => handleTowerClick(towerIdx)}
              className={`relative h-full flex flex-col items-center justify-end w-1/3 cursor-pointer group`}
            >
              {/* Rod shaft */}
              <div
                className={`w-3.5 h-[80%] rounded-t-full relative transition-all duration-300 ${
                  isSelected ? 'bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]' :
                  isTargetHint ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' :
                  isSourceHint ? 'bg-yellow-500/50' : 'bg-[var(--rod-color)]'
                }`}
              >
                {/* Visual glow indicator */}
                <div
                  className={`absolute -inset-2 rounded-full blur transition duration-300 opacity-0 group-hover:opacity-100 bg-[var(--color-primary)]/10`}
                />
              </div>

              {/* Stacked Disks inside Rod container */}
              <div className="absolute bottom-3.5 left-0 right-0 flex flex-col-reverse items-center z-20 pointer-events-none">
                {[...rodDisks].reverse().map((diskSize, _diskIdx) => {
                  // After reversing, index 0 is the BOTTOM disk (largest). The top disk is the original index 0 from rodDisks.
                  const isTopDisk = rodDisks[0] === diskSize;
                  const isDiskSelected = selectedTower === towerIdx && isTopDisk;
                  // Calculate width percentage relative to the 1/3 column container (scale 30% to 90%)
                  const widthPercentage = 30 + ((diskSize + 1) / diskCount) * 60;

                  const getDiskGradient = (size) => {
                    const gradients = [
                      'from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
                      'from-pink-400 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]',
                      'from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
                      'from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
                      'from-purple-400 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]',
                      'from-orange-400 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]',
                      'from-sky-400 to-cyan-500 shadow-[0_0_10px_rgba(14,165,233,0.4)]',
                      'from-violet-400 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]',
                      'from-rose-400 to-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
                      'from-teal-400 to-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                    ];
                    return gradients[size % gradients.length];
                  };

                  const diskGradient = getDiskGradient(diskSize);

                  return (
                    <motion.div
                      key={diskSize}
                      layoutId={`disk-${diskSize}`}
                      drag={isTopDisk && !isSolving && !gameWon && !isPaused}
                      dragSnapToOrigin
                      dragConstraints={boardRef}
                      dragElastic={0.15}
                      whileDrag={{ scale: 1.08, zIndex: 100 }}
                      onDragEnd={(e, info) => handleDragEnd(e, info, towerIdx, diskSize)}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`disk rounded-full border border-white/20 select-none bg-gradient-to-r pointer-events-auto flex items-center justify-center ${diskGradient} ${isDiskSelected ? 'ring-2 ring-white/70 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''}`}
                      style={{
                        width: `${widthPercentage}%`,
                        height: '28px',
                        marginTop: '2px',
                        zIndex: isDiskSelected ? 50 : 20 + (diskCount - diskSize),
                        filter: isPaused ? 'blur(1px) brightness(0.6)' : undefined,
                        cursor: isTopDisk && !isSolving && !gameWon ? 'grab' : 'default',
                      }}
                    >
                      <span className="text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none">{diskSize + 1}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tower Base */}
              <div
                className={`w-[85%] h-3.5 rounded-full shadow-lg transition-all duration-300 border z-10 ${
                  isSelected ? 'bg-[var(--color-primary)] border-white/20 shadow-[0_0_10px_var(--color-primary)]' :
                  hasError ? 'bg-red-600 border-red-400 animate-bounce' :
                  isTargetHint ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                  'bg-[var(--rod-color)] border-white/5'
                }`}
              />

              {/* Tower Label badge */}
              <span className={`text-[10px] font-bold mt-2 px-2.5 py-0.5 rounded bg-white/5 border border-white/5 text-[var(--text-muted)] ${isSelected ? 'text-white border-[var(--color-primary)]' : ''}`}>
                Tower {['A', 'B', 'C'][towerIdx]}
              </span>

              {/* Tower highlight halo */}
              {isTargetHint && (
                <div className="absolute inset-0 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 animate-pulse pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Hint explanations */}
      {hintExplanation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl p-3 text-center text-xs font-semibold mb-6 animate-pulse"
        >
          {hintExplanation}
        </motion.div>
      )}

      {/* Main Operations Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Core play controls (Left 8 Cols) */}
        <div className="md:col-span-8 flex flex-wrap gap-3 justify-center md:justify-start">
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[var(--text-main)] glassmorphism hover:bg-white/10 transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isSolving}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[var(--text-main)] glassmorphism hover:bg-white/10 disabled:opacity-30 transition shadow-sm"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>

          <button
            onClick={() => {
              audioManager.playClick();
              setIsPaused(!isPaused);
            }}
            disabled={isSolving || movesCount === 0}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[var(--text-main)] glassmorphism hover:bg-white/10 disabled:opacity-30 transition shadow-sm"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={handleHint}
            disabled={isSolving || isPaused}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[var(--text-main)] glassmorphism hover:bg-white/10 disabled:opacity-30 border border-yellow-500/10 text-yellow-400 transition shadow-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </button>
        </div>

        {/* Auto solver triggers (Right 4 Cols) */}
        <div className="md:col-span-4 flex items-center justify-center md:justify-end gap-2.5">
          {/* Speed switcher (only when solving) */}
          {isSolving && (
            <div className="flex bg-black/35 rounded-xl border border-white/5 p-1 shrink-0">
              <button
                onClick={() => setSolveSpeed(1200)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${solveSpeed === 1200 ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                Slow
              </button>
              <button
                onClick={() => setSolveSpeed(600)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${solveSpeed === 600 ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                Norm
              </button>
              <button
                onClick={() => setSolveSpeed(150)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${solveSpeed === 150 ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                Fast
              </button>
            </div>
          )}

          <button
            onClick={handleAutoSolve}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold text-white transition shadow shadow-indigo-500/20 border border-white/10 ${
              isSolving
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700 neon-btn'
            }`}
          >
            <FastForward className="w-4 h-4" />
            {isSolving ? 'Stop Solve' : 'Auto Solve'}
          </button>
        </div>
      </div>

      {/* Game Victory Modal */}
      {gameWon && (
        <VictoryScreen
          levelIndex={levelIndex}
          disks={diskCount}
          moves={movesCount}
          minMoves={minMoves}
          timeTaken={time}
          onReplay={resetGame}
          hasUsedSolver={hasUsedSolver}
          onNextLevel={() => {
            if (levelIndex < 8) {
              onBackToLevels();
              setTimeout(() => resetGame(), 50); // Small transition buffer
            }
          }}
          onLevelSelect={onBackToLevels}
        />
      )}
    </div>
  );
}
