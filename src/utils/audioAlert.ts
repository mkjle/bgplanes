let audioCtx: AudioContext | null = null;

export function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

/**
 * Plays a soft, pleasant 2-tone dimmel chime when an aircraft enters the radar screen.
 */
export function playAlertChime() {
  try {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // Gain node for main smooth volume envelope
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.14, now + 0.04); // Soft attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); // Gentle decay

    // Oscillator 1: Fundamental tone (D5 587Hz -> A5 880Hz)
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.22);

    // Oscillator 2: Warm harmonic tone (F#5 740Hz -> C#6 1108Hz)
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(739.99, now);
    osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.22);

    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc1.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.error('Audio alert playback error:', e);
  }
}
