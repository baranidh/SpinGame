// Self-contained synthwave beat generated with the Web Audio API.
// No external audio files, so it works as-is on GitHub Pages.
const Music = (() => {
  const BPM = 110;
  const sixteenth = 60 / BPM / 4;
  const LOOKAHEAD = 0.1; // seconds scheduled ahead
  const TICK = 25; // scheduler poll interval (ms)
  const VOLUME = 0.32;

  // MIDI note number -> frequency
  const f = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // 4-bar progression in A minor: Am - F - C - G
  const bars = [
    { bass: 45, triad: [57, 60, 64] },
    { bass: 41, triad: [53, 57, 60] },
    { bass: 36, triad: [55, 60, 64] },
    { bass: 43, triad: [55, 59, 62] },
  ];

  let ctx = null;
  let master = null;
  let noiseBuffer = null;
  let timer = null;
  let step = 0;
  let nextTime = 0;
  let playing = false;
  let muted = false;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
    noiseBuffer = makeNoise();
  }

  function makeNoise() {
    const len = Math.floor(ctx.sampleRate * 0.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  }

  function hat(t) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(hp).connect(g).connect(master);
    s.start(t);
    s.stop(t + 0.06);
  }

  function bass(t, midi, dur) {
    const o = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = f(midi);
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.02);
    g.gain.setValueAtTime(0.3, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function arp(t, midi) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f(midi + 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.14, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  }

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 16) % bars.length;
    const pos = s % 16; // sixteenth position within the bar
    const chord = bars[bar];

    if (pos % 4 === 0) kick(t);
    if (pos % 4 === 2) hat(t);
    if (pos === 0 || pos === 8) bass(t, chord.bass, sixteenth * 8 * 0.9);
    if (pos % 2 === 0) {
      const idx = (pos / 2) % chord.triad.length;
      arp(t, chord.triad[idx]);
    }
  }

  function loop() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, nextTime);
      nextTime += sixteenth;
      step = (step + 1) % (16 * bars.length);
    }
    timer = setTimeout(loop, TICK);
  }

  function start() {
    init();
    if (ctx.state === 'suspended') ctx.resume();
    if (playing) return;
    playing = true;
    nextTime = ctx.currentTime + 0.1;
    loop();
  }

  function setMuted(m) {
    muted = m;
    if (master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.02);
    }
  }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  return { start, toggleMute, setMuted, isMuted: () => muted };
})();

// Wire up the mute button and start the beat (with a gesture fallback for
// browsers that block autoplay until the user interacts with the page).
(() => {
  const btn = document.getElementById('mute-btn');

  function render() {
    btn.textContent = Music.isMuted() ? '🔇' : '🔊';
    btn.setAttribute('aria-label', Music.isMuted() ? 'Unmute music' : 'Mute music');
  }

  btn.addEventListener('click', () => {
    Music.toggleMute();
    render();
  });

  function bootstrap() {
    Music.start();
    document.removeEventListener('pointerdown', bootstrap);
    document.removeEventListener('keydown', bootstrap);
  }

  window.addEventListener('load', () => Music.start());
  document.addEventListener('pointerdown', bootstrap);
  document.addEventListener('keydown', bootstrap);

  render();
})();
