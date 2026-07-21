/**
 * Sound effects system using the Web Audio API.
 * No external audio files needed — everything is synthesized.
 * Toggle with setSoundEnabled(bool).
 */

let audioCtx = null;
let soundEnabled = true;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browsers require user gesture first)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Enable or disable all sounds */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function getSoundEnabled() {
  return soundEnabled;
}

/**
 * Plays a beep at a given frequency for a given duration.
 * @param {number} freq - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {string} type - Oscillator type
 * @param {number} volume - 0 to 1
 */
function beep(freq = 440, duration = 0.1, type = 'sine', volume = 0.3) {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if AudioContext isn't available
  }
}

/** Tick sound — short blip for each second on the timer */
export function playTick() {
  beep(880, 0.05, 'square', 0.1);
}

/** Urgent tick — plays when timer < 5 seconds */
export function playUrgentTick() {
  beep(1100, 0.07, 'square', 0.2);
}

/** Player joined the lobby */
export function playJoin() {
  beep(600, 0.08, 'sine', 0.2);
  setTimeout(() => beep(800, 0.1, 'sine', 0.2), 80);
}

/** Answer submitted */
export function playSubmit() {
  beep(520, 0.06, 'sine', 0.15);
  setTimeout(() => beep(700, 0.08, 'sine', 0.15), 60);
}

/** Round starts */
export function playRoundStart() {
  const notes = [330, 440, 550, 660];
  notes.forEach((note, i) => {
    setTimeout(() => beep(note, 0.12, 'sine', 0.25), i * 80);
  });
}

/** Reveal answers in results */
export function playReveal() {
  beep(440, 0.05, 'triangle', 0.2);
  setTimeout(() => beep(554, 0.05, 'triangle', 0.2), 60);
  setTimeout(() => beep(659, 0.1, 'triangle', 0.2), 120);
}

/** Vote submitted */
export function playVote() {
  beep(660, 0.08, 'sine', 0.18);
}

/** Game over / victory fanfare */
export function playVictory() {
  const melody = [523, 659, 784, 1047];
  melody.forEach((note, i) => {
    setTimeout(() => beep(note, 0.2, 'sine', 0.3), i * 120);
  });
  setTimeout(() => {
    beep(1047, 0.4, 'sine', 0.3);
  }, melody.length * 120);
}

/** Error sound */
export function playError() {
  beep(200, 0.15, 'sawtooth', 0.2);
  setTimeout(() => beep(150, 0.2, 'sawtooth', 0.2), 150);
}
