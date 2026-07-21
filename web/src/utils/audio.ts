"use client";

// Programmatic Web Audio API + Web Speech API Synthesizer for football sounds & multilingual voices
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// ----------------------------------------------------
// 1. BALL & UI BASIC SYNTHESIZERS
// ----------------------------------------------------

export function playKickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.type = "sine";
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.16);
}

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

export function playTrophyFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [261.63, 329.63, 392.00, 523.25];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const startTime = now + idx * 0.08;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.start(startTime);
    osc.stop(startTime + 0.65);
  });
}

// ----------------------------------------------------
// 2. REFEREE WHISTLE VARIATIONS ENGINE
// ----------------------------------------------------

export type RefereeWhistleType = 'short' | 'double' | 'long' | 'foul' | 'yellow' | 'red';

export function playRefereeWhistle(type: RefereeWhistleType = 'short') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const createSingleWhistle = (startTime: number, duration: number, startFreq = 2100, endFreq = 2050) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    filter.type = "bandpass";
    filter.frequency.value = 2400;

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(startFreq, startTime);
    osc2.frequency.setValueAtTime(startFreq + 18, startTime);

    osc1.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
    osc2.frequency.linearRampToValueAtTime(endFreq + 18, startTime + duration);

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
    gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  };

  const now = ctx.currentTime;

  switch (type) {
    case 'short':
      createSingleWhistle(now, 0.25);
      break;
    case 'double':
      createSingleWhistle(now, 0.2);
      createSingleWhistle(now + 0.28, 0.35);
      break;
    case 'long':
      createSingleWhistle(now, 0.7, 2200, 1950);
      break;
    case 'foul':
      createSingleWhistle(now, 0.15, 2300, 2100);
      createSingleWhistle(now + 0.2, 0.4, 2100, 1900);
      break;
    case 'yellow':
      createSingleWhistle(now, 0.35, 2400, 2200);
      speakText("Yellow Card!", "en-US", 1.1);
      break;
    case 'red':
      createSingleWhistle(now, 0.2);
      createSingleWhistle(now + 0.25, 0.2);
      createSingleWhistle(now + 0.5, 0.6, 2500, 2000);
      speakText("Red Card! Player sent off!", "en-US", 1.2);
      break;
  }
}

export function playWhistleSound() {
  playRefereeWhistle('short');
}

// ----------------------------------------------------
// 3. MULTILINGUAL PLAYER & REFEREE VOICES ENGINE
// ----------------------------------------------------

export type VoiceLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ar' | 'pt' | 'ja';

export const MULTILINGUAL_SHOUTS: Record<VoiceLanguage, Record<string, string>> = {
  en: {
    pass: "Pass the ball!",
    shoot: "Shoot! Take the shot!",
    goal: "Goal! What a magnificent strike!",
    foul: "Ref, that's a foul!",
    corner: "Corner kick! Heads up!",
    offside: "Offside, ref!",
    ref_yellow: "Yellow card warning!",
    ref_red: "Red card! Off the field!"
  },
  es: {
    pass: "¡Pásala! ¡Pásala aquí!",
    shoot: "¡Tira! ¡Pégale al arco!",
    goal: "¡Golazo! ¡Qué gol increíble!",
    foul: "¡Árbitro, es falta!",
    corner: "¡Tiro de esquina! ¡Atentos!",
    offside: "¡Fuera de juego, árbitro!",
    ref_yellow: "¡Tarjeta amarilla!",
    ref_red: "¡Tarjeta roja! ¡A los vestuarios!"
  },
  fr: {
    pass: "Passe le ballon !",
    shoot: "Tire ! Frappe au but !",
    goal: "But ! Magnifique frappe !",
    foul: "Arbitre, faute !",
    corner: "Corner ! Attention à la tête !",
    offside: "Hors-jeu, arbitre !",
    ref_yellow: "Carton jaune !",
    ref_red: "Carton rouge ! Expulsion !"
  },
  de: {
    pass: "Spiel den Ball!",
    shoot: "Schiess! Zieh ab!",
    goal: "Tor! Was für ein Treffer!",
    foul: "Schiedsrichter, Foul!",
    corner: "Eckball! Aufpassen!",
    offside: "Abseits, Schiri!",
    ref_yellow: "Gelbe Karte!",
    ref_red: "Rote Karte! Vom Platz!"
  },
  it: {
    pass: "Passa la palla!",
    shoot: "Tira in porta!",
    goal: "Gol! Che tiro fantastico!",
    foul: "Arbitro, è fallo!",
    corner: "Calcio d'angolo!",
    offside: "Fuorigioco, arbitro!",
    ref_yellow: "Cartellino giallo!",
    ref_red: "Cartellino rosso! Fuori!"
  },
  ar: {
    pass: "مرر الكرة! مرر هنا!",
    shoot: "سدد! أطلق القذيفة!",
    goal: "هدف! يا لها من تسديدة خيالية!",
    foul: "يا حكم، هذا خطأ!",
    corner: "ركلة ركنية! انتبهوا!",
    offside: "تسلل يا حكم!",
    ref_yellow: "بطاقة صفراء!",
    ref_red: "بطاقة حمراء! طرد من الملعب!"
  },
  pt: {
    pass: "Toca a bola!",
    shoot: "Chuta! Chuta pro gol!",
    goal: "Golaço! Que chute incrível!",
    foul: "Juiz, foi falta!",
    corner: "Escanteio! Atenção!",
    offside: "Impedimento, juiz!",
    ref_yellow: "Cartão amarelo!",
    ref_red: "Cartão vermelho! Fora de campo!"
  },
  ja: {
    pass: "パスを出せ！こっちだ！",
    shoot: "打て！シュートだ！",
    goal: "ゴール！素晴らしいシュートだ！",
    foul: "審判、ファールだろ！",
    corner: "コーナーキック！頭に合わせろ！",
    offside: "オフサイドだ、審判！",
    ref_yellow: "イエローカード！",
    ref_red: "レッドカード！退場！"
  }
};

const LANG_BCP47: Record<VoiceLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ar: 'ar-SA',
  pt: 'pt-BR',
  ja: 'ja-JP'
};

function speakText(text: string, bcp47Lang = 'en-US', pitch = 1.0, rate = 1.0) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel(); // Stop active speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47Lang;
  utterance.pitch = pitch;
  utterance.rate = rate;
  utterance.volume = 0.9;

  window.speechSynthesis.speak(utterance);
}

export function playPlayerShout(shoutType: 'pass' | 'shoot' | 'goal' | 'foul' | 'corner' | 'offside', lang: VoiceLanguage = 'en') {
  const shouts = MULTILINGUAL_SHOUTS[lang] || MULTILINGUAL_SHOUTS.en;
  const text = shouts[shoutType] || shouts.pass;
  const bcp47 = LANG_BCP47[lang] || 'en-US';

  // Pitch shift variations to simulate different players
  const pitch = 0.95 + (Math.random() * 0.2);
  const rate = 1.05 + (Math.random() * 0.15);

  if (shoutType === 'shoot' || shoutType === 'goal') {
    playKickSound();
  }

  speakText(text, bcp47, pitch, rate);
}

export function speakCommentary(text: string, lang: VoiceLanguage = 'en') {
  const bcp47 = LANG_BCP47[lang] || 'en-US';
  speakText(text, bcp47, 1.0, 1.05);
}

// ----------------------------------------------------
// 4. STADIUM AMBIENT CROWD NOISE
// ----------------------------------------------------

let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

export function startStadiumAmbient() {
  const ctx = getAudioContext();
  if (!ctx || ambientSource) return;

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);

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
