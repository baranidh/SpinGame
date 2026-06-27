(() => {
  const nameScreen = document.getElementById('name-screen');
  const gameScreen = document.getElementById('game-screen');
  const nameForm = document.getElementById('name-form');
  const playerNameInput = document.getElementById('player-name');
  const playerNameDisplay = document.getElementById('player-name-display');
  const wheel = document.getElementById('wheel');
  const spinBtn = document.getElementById('spin-btn');
  const resultEl = document.getElementById('result');
  const playAgainBtn = document.getElementById('play-again-btn');

  const config = SpinConfig.load();
  const segmentSize = 360 / SpinConfig.OUTCOMES.length;
  let currentRotation = 0;
  let spinning = false;

  // Neon glow colour per outcome for the wheel labels (TRON palette).
  const LABEL_GLOW = {
    winner: '#2bf0ff',
    bigWinner: '#5aa6ff',
    grandPrize: '#ffce5c',
    betterLuck: '#bcd6e8',
  };

  buildWheel();

  function buildWheel() {
    const gradientParts = SpinConfig.OUTCOMES.map((key, i) => {
      const c = config[key].color;
      return `${c} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`;
    }).join(', ');
    wheel.style.background = `conic-gradient(${gradientParts})`;
    wheel.style.setProperty('--wheel-rot', '0deg');

    wheel.querySelectorAll('.wheel-label').forEach((el) => el.remove());
    SpinConfig.OUTCOMES.forEach((key, i) => {
      const mid = i * segmentSize + segmentSize / 2;
      // Outer element positions the label within its segment (and keeps it
      // upright relative to the wheel). The inner element cancels the wheel's
      // rotation so the text always reads upright in screen space — including
      // the winning segment that stops under the pointer.
      const label = document.createElement('div');
      label.className = 'wheel-label';
      label.style.transform = `rotate(${mid}deg) translateY(-78px) rotate(${-mid}deg)`;

      const text = document.createElement('div');
      text.className = 'label-text';
      text.style.transform = 'rotate(calc(-1 * var(--wheel-rot)))';
      const glow = LABEL_GLOW[key] || '#d6fbff';
      text.style.color = glow;
      text.style.textShadow = `0 0 4px ${glow}, 0 0 12px ${glow}`;
      text.textContent = config[key].label;

      label.appendChild(text);
      wheel.appendChild(label);
    });
  }

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    if (!name) return;
    playerNameDisplay.textContent = name;
    nameScreen.hidden = true;
    gameScreen.hidden = false;
  });

  spinBtn.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    resultEl.hidden = true;
    playAgainBtn.hidden = true;

    const liveConfig = SpinConfig.load();
    const outcomeKey = SpinConfig.pickOutcome(liveConfig);
    const outcomeIndex = SpinConfig.OUTCOMES.indexOf(outcomeKey);
    const segmentStart = outcomeIndex * segmentSize;
    const padding = segmentSize * 0.15;
    const targetAngle = segmentStart + padding + Math.random() * (segmentSize - 2 * padding);

    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const delta = ((360 - targetAngle) - (currentRotation % 360) + 360) % 360;
    currentRotation += fullSpins * 360 + delta;

    wheel.style.transform = `rotate(${currentRotation}deg)`;
    // Keep the labels upright by counter-rotating them in sync with the wheel.
    wheel.style.setProperty('--wheel-rot', `${currentRotation}deg`);

    wheel.addEventListener('transitionend', function onEnd() {
      wheel.removeEventListener('transitionend', onEnd);
      showResult(outcomeKey);
      spinning = false;
      spinBtn.disabled = false;
    }, { once: true });
  });

  playAgainBtn.addEventListener('click', () => {
    resultEl.hidden = true;
    playAgainBtn.hidden = true;
  });

  function showResult(outcomeKey) {
    const outcome = config[outcomeKey] || SpinConfig.DEFAULTS[outcomeKey];
    resultEl.textContent = outcomeKey === 'betterLuck'
      ? `${outcome.label} — try again!`
      : `🎉 ${outcome.label}! 🎉`;
    resultEl.className = `result ${outcomeKey}`;
    resultEl.hidden = false;
    playAgainBtn.hidden = false;

    const intensity = {
      grandPrize: { count: 300, durationMs: 4500 },
      bigWinner: { count: 200, durationMs: 3500 },
      winner: { count: 150, durationMs: 3000 },
      betterLuck: { count: 60, durationMs: 1800 },
    }[outcomeKey] || { count: 100, durationMs: 2500 };

    Confetti.burst(intensity);
  }
})();
