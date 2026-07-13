// Web Audio API Synthesizer for self-contained game audio

let audioCtx = null;
let bgmOscillators = [];
let bgmGainNode = null;
let isMuted = false;
let currentBgmChordIndex = 0;
let bgmIntervalId = null;

// Chords for background ambient pad: Cmaj9 -> Fmaj7 -> Am9 -> Gsus4
const CHORDS = [
  [130.81, 196.00, 261.63, 329.63, 392.00], // C3, G3, C4, E4, B4
  [174.61, 261.63, 349.23, 440.00, 523.25], // F3, C4, F4, A4, C5
  [110.00, 220.00, 293.66, 349.23, 440.00], // A2, A3, D4, F4, A4
  [196.00, 293.66, 392.00, 440.00, 587.33]  // G3, D4, G4, A4, D5
];

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export const audioManager = {
  setMuted(mute) {
    isMuted = mute;
    localStorage.setItem('toh_muted', JSON.stringify(mute));
    if (mute) {
      if (bgmGainNode) {
        bgmGainNode.gain.setValueAtTime(0, audioCtx ? audioCtx.currentTime : 0);
      }
    } else {
      initAudio();
      if (bgmGainNode) {
        bgmGainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // Low volume ambient pad
      }
    }
  },

  getMuted() {
    const saved = localStorage.getItem('toh_muted');
    if (saved !== null) {
      isMuted = JSON.parse(saved);
    }
    return isMuted;
  },

  playClick() {
    if (isMuted) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  },

  playPickup() {
    if (isMuted) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  },

  playDrop() {
    if (isMuted) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const oscBounce = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const gainBounce = audioCtx.createGain();
    
    // Main drop slide
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);

    // Subtle low bounce "thud"
    oscBounce.type = 'sine';
    oscBounce.frequency.setValueAtTime(100, audioCtx.currentTime + 0.1);
    oscBounce.frequency.setValueAtTime(80, audioCtx.currentTime + 0.2);
    
    gainBounce.gain.setValueAtTime(0, audioCtx.currentTime);
    gainBounce.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.1);
    gainBounce.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    
    oscBounce.connect(gainBounce);
    gainBounce.connect(audioCtx.destination);
    
    oscBounce.start();
    oscBounce.stop(audioCtx.currentTime + 0.22);
  },

  playVictory() {
    if (isMuted) return;
    initAudio();

    const now = audioCtx.currentTime;
    const notes = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      523.25, // C5
      659.25, // E5
      783.99, // G5
      1046.50 // C6
    ];

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });

    // Final Chord
    const chord = [261.63, 329.63, 392.00, 523.25];
    chord.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.6);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.15, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + 1.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now + 0.6);
      osc.stop(now + 0.6 + 1.2);
    });
  },

  startBgm() {
    // If mute is stored as active, do not play audible frequencies
    this.getMuted(); 
    initAudio();

    if (bgmIntervalId) return;

    if (!bgmGainNode) {
      bgmGainNode = audioCtx.createGain();
      bgmGainNode.gain.setValueAtTime(isMuted ? 0 : 0.04, audioCtx.currentTime);
      bgmGainNode.connect(audioCtx.destination);
    }

    const playChord = (frequencies) => {
      // Fade out previous oscillators
      const fadeTime = 1.5;
      const now = audioCtx.currentTime;
      bgmOscillators.forEach((osc) => {
        try {
          osc.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeTime);
          osc.osc.stop(now + fadeTime + 0.1);
        } catch (e) {}
      });
      bgmOscillators = [];

      // Start new oscillators
      frequencies.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + fadeTime);
        
        osc.connect(gain);
        gain.connect(bgmGainNode);
        
        osc.start(now);
        bgmOscillators.push({ osc, gainNode: gain });
      });
    };

    // Play initial chord
    playChord(CHORDS[currentBgmChordIndex]);

    // Loop changes every 6 seconds
    bgmIntervalId = setInterval(() => {
      if (isMuted) return;
      currentBgmChordIndex = (currentBgmChordIndex + 1) % CHORDS.length;
      playChord(CHORDS[currentBgmChordIndex]);
    }, 6000);
  },

  stopBgm() {
    if (bgmIntervalId) {
      clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
    const now = audioCtx ? audioCtx.currentTime : 0;
    bgmOscillators.forEach((osc) => {
      try {
        osc.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.osc.stop(now + 0.6);
      } catch (e) {}
    });
    bgmOscillators = [];
  }
};
