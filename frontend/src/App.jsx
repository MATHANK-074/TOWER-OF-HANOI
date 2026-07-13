import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, BookOpen, Calculator, BarChart2, Home as HomeIcon,
  Volume2, VolumeX, Sun, Moon, Layers, Sparkles
} from 'lucide-react';
import { audioManager } from './utils/audio';
import { api, DEFAULT_STATS } from './utils/api';
import Home from './components/Home';
import LevelSelect from './components/LevelSelect';
import GameScreen from './components/GameScreen';
import Stats from './components/Stats';
import HowToPlay from './components/HowToPlay';
import AlgorithmPanel from './components/AlgorithmPanel';
import ParticleCanvas from './components/ParticleCanvas';
import AuthPage from './components/AuthPage';

export default function App() {
  const [view, setView] = useState('home'); // home, level-select, game, stats, how-to, algorithm
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [stats, setStats] = useState(null);
  
  // Settings state
  const [theme, setTheme] = useState('aurora'); // aurora, rosegold, emerald, frost, sunset, amethyst
  const [darkMode, setDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('toh_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authView, setAuthView] = useState(authUser ? 'home' : 'auth');

  // Load stats and settings on startup
  useEffect(() => {
    // 1. Fetch stats
    const fetchStats = async () => {
      const gameStats = await api.getStats();
      setStats(gameStats);
    };
    fetchStats();

    // 2. Load theme
    const savedTheme = localStorage.getItem('toh_theme') || 'aurora';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 3. Load dark mode settings
    const savedMode = localStorage.getItem('toh_dark_mode');
    const isDark = savedMode !== null ? JSON.parse(savedMode) : true;
    setDarkMode(isDark);
    document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light');

    // 4. Load audio settings
    setIsMuted(audioManager.getMuted());
  }, []);

  // Update theme settings
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('toh_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('toh_dark_mode', JSON.stringify(nextDark));
    document.documentElement.setAttribute('data-mode', nextDark ? 'dark' : 'light');
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMuted(nextMute);
  };

  const handleSaveStats = async (newStats) => {
    setStats(newStats);
    await api.saveStats(newStats);
  };

  const handleSelectLevel = (levelIndex) => {
    setSelectedLevel(levelIndex);
    setView('game');
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleAuthSuccess = async (user, isNew = false) => {
    setAuthUser(user);
    setAuthView('home');
    setView('home');
    setSelectedLevel(1);
    // Clear any cached local stats before fetching the user's fresh progress
    localStorage.removeItem('toh_game_stats');
    console.debug('[App] onAuthSuccess user=', user);
    const freshStats = await api.getStats();
    console.debug('[App] freshStats=', freshStats);
    // If this is a brand new signup, force-reset server-side progress to defaults
    if (isNew) {
      console.debug('[App] New user signup detected - resetting progress to DEFAULT_STATS');
      await api.saveStats(DEFAULT_STATS);
      setStats(DEFAULT_STATS);
      localStorage.setItem('toh_game_stats', JSON.stringify(DEFAULT_STATS));
    } else {
      setStats(freshStats);
      localStorage.setItem('toh_game_stats', JSON.stringify(freshStats));
    }
  };

  if (!stats) {
    // Loader overlay
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090a10]">
        <Sparkles className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white font-display">LOADING TOWER OF HANOI...</h2>
      </div>
    );
  }

  if (authView === 'auth') {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onSwitchView={(nextView) => {
          if (nextView === 'home') {
            setAuthView('home');
            setView('home');
          }
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Interactive Particles */}
      <ParticleCanvas theme={theme} />

      {/* Global Header — Hidden during gameplay */}
      {view !== 'game' && (
        <header className="relative flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto z-20 border-b border-white/5">
          {/* Logo */}
          <div
            onClick={() => { audioManager.playClick(); setView('home'); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white group-hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-all duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg font-display tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)] group-hover:from-white group-hover:to-white transition-all duration-300">
              HANOI
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 glassmorphism-light rounded-2xl p-1 text-xs font-semibold text-[var(--text-muted)]">
            {[
              { key: 'home', label: 'Home', icon: HomeIcon },
              { key: 'level-select', label: 'Levels', icon: Trophy },
              { key: 'stats', label: 'Stats', icon: BarChart2 },
              { key: 'how-to', label: 'Tutorial', icon: BookOpen },
              { key: 'algorithm', label: 'Math', icon: Calculator }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { audioManager.playClick(); setView(key); }}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200 ${
                  view === key
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/8'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Toolbar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                audioManager.playClick();
                setAuthView('auth');
                setView('home');
              }}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-200"
            >
              {authUser ? '👤' : '🔐'}
            </button>
            <button
              onClick={handleMuteToggle}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-200"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}

      {/* Main Pages Switcher with Framer Motion AnimatePresence transitions */}
      <main className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <Home stats={stats} onViewChange={handleViewChange} />
            </motion.div>
          )}

          {view === 'level-select' && (
            <motion.div
              key="levels"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <LevelSelect
                stats={stats}
                onSelectLevel={handleSelectLevel}
                onViewChange={handleViewChange}
              />
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <GameScreen
                levelIndex={selectedLevel}
                onBackToLevels={() => setView('level-select')}
                stats={stats}
                onSaveStats={handleSaveStats}
                theme={theme}
                onThemeChange={handleThemeChange}
                darkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
              />
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Stats stats={stats} onViewChange={handleViewChange} />
            </motion.div>
          )}

          {view === 'how-to' && (
            <motion.div
              key="howto"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <HowToPlay onViewChange={handleViewChange} />
            </motion.div>
          )}

          {view === 'algorithm' && (
            <motion.div
              key="algorithm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AlgorithmPanel onViewChange={handleViewChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav for Mobile viewports */}
      {view !== 'game' && (
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] glassmorphism rounded-2xl p-2 z-50 flex justify-around border border-white/10 shadow-lg text-[10px] font-bold text-white/50">
          <button
            onClick={() => { audioManager.playClick(); setView('home'); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${view === 'home' ? 'text-[var(--color-primary)]' : ''}`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setView('level-select'); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${view === 'level-select' ? 'text-[var(--color-primary)]' : ''}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Levels</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setView('stats'); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${view === 'stats' ? 'text-[var(--color-primary)]' : ''}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setView('how-to'); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${view === 'how-to' ? 'text-[var(--color-primary)]' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tutorial</span>
          </button>
        </div>
      )}
    </div>
  );
}
