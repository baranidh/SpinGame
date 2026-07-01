// Shared config for the Spin Game.
// Outcome order defines the wheel segments, clockwise starting at the top.
const SpinConfig = (() => {
  const OUTCOMES = ['jackpot', 'bigWin', 'mediumWin', 'smallWin', 'spinAgain', 'betterLuck'];

  const DEFAULTS = {
    jackpot: { label: 'Jackpot', weight: 6, color: '#F2C230', icon: '🏆' },
    bigWin: { label: 'Big Win', weight: 12, color: '#E0322E', icon: '🎁' },
    mediumWin: { label: 'Medium Win', weight: 18, color: '#E8722A', icon: '⭐' },
    smallWin: { label: 'Small Win', weight: 24, color: '#4CAF50', icon: '😊' },
    spinAgain: { label: 'Spin Again', weight: 20, color: '#2F55C7', icon: '🔄' },
    betterLuck: { label: 'Better Luck Next Time', weight: 20, color: '#6A2C9A', icon: '🍀' },
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
