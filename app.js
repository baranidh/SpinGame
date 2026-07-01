(() => {
  const nameScreen = document.getElementById('name-screen');
  const gameScreen = document.getElementById('game-screen');
  const nameForm = document.getElementById('name-form');
  const playerNameInput = document.getElementById('player-name');
  const playerNameDisplay = document.getElementById('player-name-display');
  const wheel = document.getElementById('wheel');
  const wheelRing = document.getElementById('wheel-ring');
  const spinBtn = document.getElementById('spin-btn');
  const resultEl = document.getElementById('result');
  const playAgainBtn = document.getElementById('play-again-btn');
  const rigControl = document.getElementById('rig-control');

  const config = SpinConfig.load();
  const segmentSize = 360 / SpinConfig.OUTCOMES.length;
  const labelRadius = 100; // px from centre to each label anchor
  let currentRotation = 0;
  let spinning = false;

  // Preset outcome chosen discreetly via the corner control. When null the
  // wheel falls back to a weighted random pick.
  let forcedOutcome = null;

  buildRivets();
  buildWheel();
  buildRigControl();

  // Gold rivets evenly spaced around the ring.
  function buildRivets() {
    const count = 16;
    const r = 148; // distance from centre within the 320px wrapper
    for (let i = 0; i < count; i += 1) {
      const rivet = document.createElement('div');
      rivet.className = 'rivet';
      rivet.style.transform = `rotate(${(360 / count) * i}deg) translateY(-${r}px)`;
      wheelRing.appendChild(rivet);
    }
  }

  function buildWheel() {
    // Segments are centred on the top (Jackpot at 12 o'clock) by starting the
    // conic gradient half a segment before 0deg.
    const stops = SpinConfig.OUTCOMES.map((key, i) => {
      return `${config[key].color} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`;
    }).join(', ');
    wheel.style.background = `conic-gradient(from ${-segmentSize / 2}deg, ${stops})`;

    wheel.querySelectorAll('.seg-label').forEach((el) => el.remove());

    SpinConfig.OUTCOMES.forEach((key, i) => {
      const mid = i * segmentSize; // segment centre angle (0 = top)
      const outer = document.createElement('div');
      outer.className = 'seg-label';
      // Position the label along the segment's centre line, kept upright within
      // the wheel's own frame.
      outer.style.transform = `rotate(${mid}deg) translateY(-${labelRadius}px) rotate(${-mid}deg)`;

      // Inner element counter-rotates the wheel's spin so the text always reads
      // horizontally (upright) in screen space, like the reference design.
      const inner = document.createElement('div');
      inner.className = 'seg-label-inner';
      inner.style.transform = `rotate(${-currentRotation}deg)`;

      const text = document.createElement('div');
      text.className = 'seg-text';
      text.textContent = config[key].label.toUpperCase();

      const icon = document.createElement('div');
      icon.className = 'seg-icon';
      icon.textContent = config[key].icon || '';

      inner.appendChild(text);
      inner.appendChild(icon);
      outer.appendChild(inner);
      wheel.appendChild(outer);
    });
  }

  // Small coloured dots in the corner. The last one tapped is the outcome the
  // next spin lands on; there is no visible "selected" state so it stays discreet.
  function buildRigControl() {
    SpinConfig.OUTCOMES.forEach((key) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rig-dot';
      dot.style.background = config[key].color;
      dot.addEventListener('click', () => {
        forcedOutcome = key;
        // Brief, subtle click acknowledgement only (no lasting highlight).
        dot.style.opacity = '0.35';
        setTimeout(() => { dot.style.opacity = ''; }, 120);
      });
      rigControl.appendChild(dot);
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

    const outcomeKey = forcedOutcome || SpinConfig.pickOutcome(SpinConfig.load());
    const outcomeIndex = SpinConfig.OUTCOMES.indexOf(outcomeKey);
    const segmentCenter = outcomeIndex * segmentSize; // 0 = top
    // Land somewhere inside the winning segment, near its centre.
    const jitter = (Math.random() * 2 - 1) * (segmentSize * 0.35);
    const targetAngle = segmentCenter + jitter;

    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const current = ((currentRotation % 360) + 360) % 360;
    const want = ((-targetAngle) % 360 + 360) % 360;
    const delta = ((want - current) % 360 + 360) % 360;
    currentRotation += fullSpins * 360 + delta;

    wheel.style.transform = `rotate(${currentRotation}deg)`;
    // Keep the labels upright as the wheel turns.
    wheel.querySelectorAll('.seg-label-inner').forEach((el) => {
      el.style.transform = `rotate(${-currentRotation}deg)`;
    });

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

  const RESULT = {
    jackpot: { text: '🎉 JACKPOT! 🎉', confetti: { count: 350, durationMs: 5000 } },
    bigWin: { text: '🎉 BIG WIN! 🎉', confetti: { count: 260, durationMs: 4000 } },
    mediumWin: { text: '🎉 MEDIUM WIN! 🎉', confetti: { count: 190, durationMs: 3200 } },
    smallWin: { text: 'SMALL WIN! 😊', confetti: { count: 130, durationMs: 2600 } },
    spinAgain: { text: 'SPIN AGAIN! 🔄', confetti: { count: 90, durationMs: 2000 } },
    betterLuck: { text: 'Better Luck Next Time 🍀', confetti: { count: 50, durationMs: 1600 } },
  };

  function showResult(outcomeKey) {
    const info = RESULT[outcomeKey] || { text: config[outcomeKey].label, confetti: { count: 120, durationMs: 2500 } };
    resultEl.textContent = info.text;
    resultEl.style.color = config[outcomeKey].color;
    resultEl.hidden = false;
    playAgainBtn.hidden = false;
    Confetti.burst(info.confetti);
  }
})();
