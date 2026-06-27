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

  buildWheel();

  function buildWheel() {
    const gradientParts = SpinConfig.OUTCOMES.map((key, i) => {
      const c = config[key].color;
      return `${c} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`;
    }).join(', ');
    wheel.style.background = `conic-gradient(${gradientParts})`;

    wheel.querySelectorAll('.wheel-label').forEach((el) => el.remove());
    SpinConfig.OUTCOMES.forEach((key, i) => {
      const mid = i * segmentSize + segmentSize / 2;
      const label = document.createElement('div');
      label.className = 'wheel-label';
      label.style.transform = `rotate(${mid}deg) translate(0, -42%) rotate(${-mid}deg)`;
      label.textContent = config[key].label;
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
