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

  const SVG_NS = 'http://www.w3.org/2000/svg';

  buildWheel();

  function buildWheel() {
    const gradientParts = SpinConfig.OUTCOMES.map((key, i) => {
      const c = config[key].color;
      return `${c} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`;
    }).join(', ');
    wheel.style.background = `conic-gradient(${gradientParts})`;

    const existing = wheel.querySelector('.wheel-text');
    if (existing) existing.remove();

    // Curved labels that follow the wheel's perimeter, drawn as SVG text on a
    // circular arc centred on each segment.
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'wheel-text');
    svg.setAttribute('viewBox', '0 0 100 100');
    const defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);

    const baseRadius = 35; // mid arc radius within the 100x100 viewBox
    const lineGap = 7; // radial distance between wrapped lines
    const baseFont = 4.6;
    const entries = []; // collected for measurement once the SVG is in the DOM

    SpinConfig.OUTCOMES.forEach((key, i) => {
      const mid = i * segmentSize + segmentSize / 2;
      const glow = LABEL_GLOW[key] || '#d6fbff';
      // Wrap the label so every letter fits comfortably; each line gets its own
      // concentric arc so nothing is squished or clipped.
      const lines = wrapLabel(config[key].label.toUpperCase(), 11);
      const n = lines.length;

      lines.forEach((line, l) => {
        const radius = baseRadius + ((n - 1) / 2 - l) * lineGap; // outer line first
        const span = segmentSize * 0.94;
        const a0 = ((mid - span / 2) * Math.PI) / 180;
        const a1 = ((mid + span / 2) * Math.PI) / 180;
        const x0 = 50 + radius * Math.sin(a0);
        const y0 = 50 - radius * Math.cos(a0);
        const x1 = 50 + radius * Math.sin(a1);
        const y1 = 50 - radius * Math.cos(a1);

        const pathId = `arc-${key}-${l}`;
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('d', `M ${x0.toFixed(3)} ${y0.toFixed(3)} A ${radius} ${radius} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`);
        path.setAttribute('fill', 'none');
        defs.appendChild(path);

        const pathLen = radius * (a1 - a0);
        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('fill', glow);
        text.setAttribute('font-size', String(baseFont));
        text.setAttribute('font-family', 'Audiowide, Orbitron, sans-serif');
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('dominant-baseline', 'central');
        text.style.filter = `drop-shadow(0 0 0.7px ${glow}) drop-shadow(0 0 1.8px ${glow})`;

        const textPath = document.createElementNS(SVG_NS, 'textPath');
        textPath.setAttribute('href', `#${pathId}`);
        textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${pathId}`);
        textPath.setAttribute('startOffset', '50%');
        textPath.textContent = line;

        text.appendChild(textPath);
        svg.appendChild(text);
        entries.push({ text, textPath, pathLen });
      });
    });

    wheel.appendChild(svg);
    fitLabels(entries, baseFont);
  }

  // Measure each label's real rendered width and centre it on its arc by
  // computing an explicit startOffset (avoids iOS Safari's textLength/anchor
  // bugs on <textPath>, which were clipping the trailing letters). Shrinks the
  // font only when a label genuinely doesn't fit.
  function fitLabels(entries, baseFont) {
    entries.forEach(({ text, textPath, pathLen }) => {
      let len = 0;
      try {
        len = textPath.getComputedTextLength();
      } catch (e) {
        len = 0;
      }
      if (!len) {
        // Not measurable (e.g. wheel still hidden) — fall back to centring.
        textPath.setAttribute('startOffset', '50%');
        text.setAttribute('text-anchor', 'middle');
        return;
      }
      const maxLen = pathLen * 0.94;
      if (len > maxLen) {
        const fs = baseFont * (maxLen / len);
        text.setAttribute('font-size', fs.toFixed(3));
        len = maxLen;
      }
      const offset = Math.max(0, (pathLen - len) / 2);
      textPath.setAttribute('startOffset', offset.toFixed(3));
      text.setAttribute('text-anchor', 'start');
    });
  }

  // Greedily wrap a label into lines no longer than maxChars (keeps whole words).
  function wrapLabel(label, maxChars) {
    const words = label.split(' ');
    const lines = [];
    let current = '';
    words.forEach((word) => {
      if (!current) {
        current = word;
      } else if ((current + ' ' + word).length <= maxChars) {
        current += ' ' + word;
      } else {
        lines.push(current);
        current = word;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    if (!name) return;
    playerNameDisplay.textContent = name;
    nameScreen.hidden = true;
    gameScreen.hidden = false;
    // Rebuild now that the wheel is visible so label widths can be measured
    // and centred precisely.
    buildWheel();
  });

  // Re-fit labels once the web fonts have loaded (measurements depend on them).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!gameScreen.hidden) buildWheel();
    });
  }

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
