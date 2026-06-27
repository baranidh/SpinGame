// Minimal self-contained confetti burst, no external dependencies.
const Confetti = (() => {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function burst({ count = 150, colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'], durationMs = 3000 } = {}) {
    const newParticles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
    }));
    particles = particles.concat(newParticles);

    if (!animationId) {
      animationId = requestAnimationFrame(tick);
    }

    setTimeout(() => {
      particles = particles.filter((p) => !newParticles.includes(p));
    }, durationMs);
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationId = null;
    }
  }

  return { burst };
})();
