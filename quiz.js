(() => {
  const QUESTIONS = [
    {
      q: 'What is the main goal of decentralized authentication?',
      options: [
        'To remove reliance on a single central identity provider/authority',
        'To make the internet faster',
        'To get rid of the need for any login',
        'To store all passwords in one big database',
      ],
      answer: 0,
    },
    {
      q: 'What does “DID” stand for in decentralized identity?',
      options: [
        'Digital Identity Document',
        'Decentralized Identifier',
        'Distributed ID Database',
        'Direct Identity Delegation',
      ],
      answer: 1,
    },
    {
      q: 'Where does a user typically store their decentralized identity and keys?',
      options: [
        'In a digital identity wallet',
        'On a central authentication server',
        'In a browser cookie',
        'In a public directory for everyone to read',
      ],
      answer: 0,
    },
    {
      q: 'What is typically used to prove ownership of a decentralized identity?',
      options: [
        'A username and password',
        'A public/private key pair (cryptographic keys)',
        'An email one-time code',
        'A security question',
      ],
      answer: 1,
    },
  ];

  const form = document.getElementById('quiz-form');
  const submitBtn = document.getElementById('quiz-submit');
  const retryBtn = document.getElementById('quiz-retry');
  const resultEl = document.getElementById('quiz-result');
  const tabs = document.querySelectorAll('.tab');
  const spinPanel = document.getElementById('spin-panel');
  const quizPanel = document.getElementById('quiz-panel');
  const rigControl = document.getElementById('rig-control');

  render();

  function render() {
    form.innerHTML = '';
    QUESTIONS.forEach((item, qi) => {
      const block = document.createElement('div');
      block.className = 'quiz-q';

      const title = document.createElement('div');
      title.className = 'quiz-q-title';
      title.textContent = `${qi + 1}. ${item.q}`;
      block.appendChild(title);

      item.options.forEach((opt, oi) => {
        const label = document.createElement('label');
        label.className = 'quiz-opt';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `q${qi}`;
        input.value = String(oi);
        const span = document.createElement('span');
        span.textContent = opt;
        label.appendChild(input);
        label.appendChild(span);
        block.appendChild(label);
      });

      form.appendChild(block);
    });
  }

  submitBtn.addEventListener('click', () => {
    let score = 0;
    QUESTIONS.forEach((item, qi) => {
      const selected = form.querySelector(`input[name="q${qi}"]:checked`);
      const inputs = form.querySelectorAll(`input[name="q${qi}"]`);
      inputs.forEach((input) => {
        const label = input.closest('.quiz-opt');
        const oi = Number(input.value);
        input.disabled = true;
        if (oi === item.answer) {
          label.classList.add('correct');
        } else if (selected && Number(selected.value) === oi) {
          label.classList.add('wrong');
        }
      });
      if (selected && Number(selected.value) === item.answer) score += 1;
    });

    resultEl.textContent = `You got ${score} / ${QUESTIONS.length} correct!`;
    resultEl.style.color = score === QUESTIONS.length ? '#39ff14' : score === 0 ? '#e0322e' : '#00eaff';
    resultEl.hidden = false;
    submitBtn.hidden = true;
    retryBtn.hidden = false;

    const intensity = [
      { count: 40, durationMs: 1500 },
      { count: 90, durationMs: 2000 },
      { count: 150, durationMs: 2600 },
      { count: 230, durationMs: 3200 },
      { count: 330, durationMs: 4200 },
    ][score] || { count: 120, durationMs: 2500 };
    if (window.Confetti) Confetti.burst(intensity);
  });

  retryBtn.addEventListener('click', () => {
    render();
    resultEl.hidden = true;
    retryBtn.hidden = true;
    submitBtn.hidden = false;
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const which = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      spinPanel.hidden = which !== 'spin';
      quizPanel.hidden = which !== 'quiz';
      // The discreet preset control only applies to the spin wheel.
      if (rigControl) rigControl.style.display = which === 'spin' ? '' : 'none';
    });
  });
})();
