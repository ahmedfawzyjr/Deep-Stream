"use client";

// Programmatic Web Audio API Synthesizer for football dashboard sounds
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Synthesize a soccer ball kick (deep low-frequency thud)
export function playKickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Kick pitch envelope (starts at 150Hz and quickly drops to 40Hz)
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  // Volume decay
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.type = "sine";
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.16);
}

// 2. Synthesize a referee whistle (high pitched dual-frequency whistle with vibrato)
export function playWhistleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  filter.type = "bandpass";
  filter.frequency.value = 2500;

  osc1.type = "sine";
  osc2.type = "sine";

  // Dual tones close together create the "beating" whistle effect
  osc1.frequency.setValueAtTime(2000, ctx.currentTime);
  osc2.frequency.setValueAtTime(2015, ctx.currentTime);

  // Whistle volume envelope
  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.35);
  osc2.stop(ctx.currentTime + 0.35);
}

// 3. Synthesize a premium UI click (high-tech futuristic chime)
export function playClickChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

// 4. Synthesize a trophy success fanfare chord
export function playTrophyFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sawtooth";
    osc.frequency.value = freq;

    // Arpeggio note start times
    const startTime = now + idx * 0.08;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.start(startTime);
    osc.stop(startTime + 0.65);
  });
}

// 5. Synthesize stadium ambient crowd cheering using filtered white noise
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

export function startStadiumAmbient() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ambientSource) return; // Already running

  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // Set up noise source
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Filter to shape white noise into stadium wind/roar (lowpass & bandpass)
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 350;
  filter.Q.value = 1.0;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, ctx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(0);
  ambientSource = source;
  ambientGain = gain;
}

export function stopStadiumAmbient() {
  if (ambientSource) {
    try {
      ambientSource.stop();
    } catch (e) {}
    ambientSource = null;
    ambientGain = null;
  }
}
