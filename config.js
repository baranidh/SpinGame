// Shared config for the Spin Game.
// Outcome order also defines the fixed visual wheel segments (4 equal slices).
const SpinConfig = (() => {
  const OUTCOMES = ['winner', 'bigWinner', 'grandPrize', 'betterLuck'];

  const DEFAULTS = {
    winner: { label: 'Winner', weight: 35, color: '#2ecc71' },
    bigWinner: { label: 'Big Winner', weight: 20, color: '#3498db' },
    grandPrize: { label: 'Grand Prize', weight: 8, color: '#f1c40f' },
    betterLuck: { label: 'Better Luck Next Time', weight: 37, color: '#95a5a6' },
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function load() {
    return clone(DEFAULTS);
  }

  function pickOutcome(config) {
    const total = OUTCOMES.reduce((sum, key) => sum + Math.max(0, config[key].weight), 0);
    if (total <= 0) return OUTCOMES[OUTCOMES.length - 1];
    let roll = Math.random() * total;
    for (const key of OUTCOMES) {
      const w = Math.max(0, config[key].weight);
      if (roll < w) return key;
      roll -= w;
    }
    return OUTCOMES[OUTCOMES.length - 1];
  }

  return { OUTCOMES, DEFAULTS, load, pickOutcome };
})();
