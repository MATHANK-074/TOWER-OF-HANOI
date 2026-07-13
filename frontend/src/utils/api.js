const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:8080/api'
  : '/api';


// --- Local Implementations (Fallbacks) ---

export const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesCompleted: 0,
  totalMoves: 0,
  totalTimePlayed: 0, // in seconds
  highestLevelReached: 1,
  levels: [
    { levelIndex: 1, disks: 3, minMoves: 7, bestTime: 0, bestMoves: 0, stars: 0, unlocked: true },
    { levelIndex: 2, disks: 4, minMoves: 15, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 3, disks: 5, minMoves: 31, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 4, disks: 6, minMoves: 63, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 5, disks: 7, minMoves: 127, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 6, disks: 8, minMoves: 255, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 7, disks: 9, minMoves: 511, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false },
    { levelIndex: 8, disks: 10, minMoves: 1023, bestTime: 0, bestMoves: 0, stars: 0, unlocked: false }
  ]
};

function getLocalStats() {
  const saved = localStorage.getItem('toh_game_stats');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_STATS;
    }
  }
  return DEFAULT_STATS;
}

function saveLocalStats(stats) {
  localStorage.setItem('toh_game_stats', JSON.stringify(stats));
}

function getUserHeader() {
  try {
    const saved = localStorage.getItem('toh_user');
    if (!saved) return {};
    const user = JSON.parse(saved);
    return user?.username ? { 'X-User': user.username } : {};
  } catch {
    return {};
  }
}

function localSolve(n) {
  const moves = [];
  function solveRecursive(disks, from, to, aux) {
    if (disks === 1) {
      moves.push({ disk: 0, fromTower: from, toTower: to });
      return;
    }
    solveRecursive(disks - 1, from, aux, to);
    moves.push({ disk: disks - 1, fromTower: from, toTower: to });
    solveRecursive(disks - 1, aux, to, from);
  }
  solveRecursive(n, 0, 2, 1);
  return moves;
}

function localHint(positions, target) {
  const n = positions.length;
  let currentTarget = target;
  let diskToMove = -1;
  let diskTarget = -1;

  for (let i = n - 1; i >= 0; i--) {
    if (positions[i] !== currentTarget) {
      diskToMove = i;
      diskTarget = currentTarget;
      break;
    }
  }

  if (diskToMove === -1) {
    return null;
  }

  return getLocalSubTarget(positions, diskToMove, diskTarget);
}

function getLocalSubTarget(positions, i, tgt) {
  if (i < 0) return null;
  const currentPos = positions[i];
  if (currentPos !== tgt) {
    const helper = 3 - currentPos - tgt;
    const sub = getLocalSubTarget(positions, i - 1, helper);
    if (sub !== null) return sub;
    return { disk: i, fromTower: currentPos, toTower: tgt };
  } else {
    return getLocalSubTarget(positions, i - 1, tgt);
  }
}

// --- API Router Interface ---

export const api = {
  async solve(disks) {
    try {
      const response = await fetch(`${API_BASE_URL}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disks })
      });
      if (!response.ok) throw new Error('Backend response error');
      return await response.json();
    } catch (error) {
      console.warn('Backend solver unavailable, using client-side solver.', error.message);
      return localSolve(disks);
    }
  },

  async hint(disks, target) {
    try {
      const response = await fetch(`${API_BASE_URL}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disks, target })
      });
      if (!response.ok) throw new Error('Backend response error');
      return await response.json();
    } catch (error) {
      console.warn('Backend hint generator unavailable, using client-side helper.', error.message);
      return localHint(disks, target);
    }
  },

  async getStats() {
    try {
      // Add cache-buster to ensure we always get fresh user progress from server
      const url = `${API_BASE_URL}/stats?cb=${Date.now()}`;
      const headers = getUserHeader();
      console.debug('[api.getStats] fetching', url, 'headers=', headers);
      const response = await fetch(url, {
        headers,
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Backend stats query failed');
      const backendStats = await response.json();
      console.debug('[api.getStats] backendStats for', headers, backendStats);
      
      // Save fresh backend stats locally and return
      saveLocalStats(backendStats);
      return backendStats;
    } catch (error) {
      console.warn('Backend stats service offline. Fetching from Local Storage.', error.message);
      return getLocalStats();
    }
  },

  async saveStats(stats) {
    // Always save locally first to guarantee no progress is lost
    saveLocalStats(stats);

    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeader()
        },
        body: JSON.stringify(stats)
      });
      if (!response.ok) throw new Error('Backend save stats failed');
      return await response.json();
    } catch (error) {
      console.warn('Backend statistics storage offline. Saved locally.', error.message);
      return stats;
    }
  }
};
