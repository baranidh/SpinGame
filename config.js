// Shared config for the Spin Game.
// Outcome order also defines the fixed visual wheel segments (4 equal slices).
const SpinConfig = (() => {
  const OUTCOMES = ['winner', 'bigWinner', 'grandPrize', 'betterLuck'];

  const DEFAULTS = {
    winner: { label: 'Winner', weight: 35, color: '#07262e' },
    bigWinner: { label: 'Big Winner', weight: 20, color: '#0a1730' },
    grandPrize: { label: 'Grand Prize', weight: 8, color: '#2c2207' },
    betterLuck: { label: 'Better Luck Next Time', weight: 37, color: '#161d24' },
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
