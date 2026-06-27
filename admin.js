(() => {
  const loginScreen = document.getElementById('login-screen');
  const adminScreen = document.getElementById('admin-screen');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const weightsList = document.getElementById('weights-list');
  const weightsForm = document.getElementById('weights-form');
  const totalDisplay = document.getElementById('total-display');
  const resetBtn = document.getElementById('reset-btn');
  const saveMsg = document.getElementById('save-msg');

  let config = SpinConfig.load();

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === SpinConfig.ADMIN_PASSWORD) {
      loginError.hidden = true;
      loginScreen.hidden = true;
      adminScreen.hidden = false;
      renderWeights();
    } else {
      loginError.hidden = false;
    }
  });

  function renderWeights() {
    weightsList.innerHTML = '';
    SpinConfig.OUTCOMES.forEach((key) => {
      const row = document.createElement('div');
      row.className = 'weight-row';
      row.innerHTML = `
        <label for="weight-${key}">${config[key].label}</label>
        <input id="weight-${key}" type="number" min="0" step="1" value="${config[key].weight}" data-key="${key}" />
      `;
      weightsList.appendChild(row);
    });
    updateTotal();
    weightsList.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', updateTotal);
    });
  }

  function updateTotal() {
    const total = SpinConfig.OUTCOMES.reduce((sum, key) => {
      const input = document.getElementById(`weight-${key}`);
      return sum + (parseFloat(input.value) || 0);
    }, 0);
    totalDisplay.textContent = `Total weight: ${total} (each outcome's chance = its weight / total)`;
  }

  weightsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    SpinConfig.OUTCOMES.forEach((key) => {
      const input = document.getElementById(`weight-${key}`);
      config[key].weight = Math.max(0, parseFloat(input.value) || 0);
    });
    SpinConfig.save(config);
    saveMsg.hidden = false;
    setTimeout(() => { saveMsg.hidden = true; }, 2000);
  });

  resetBtn.addEventListener('click', () => {
    config = SpinConfig.reset();
    renderWeights();
  });
})();
