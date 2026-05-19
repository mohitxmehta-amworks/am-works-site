// Intersection Observer for scroll reveals
const reveals = document.querySelectorAll('.reveal');

// Only animate if IntersectionObserver is supported
if ('IntersectionObserver' in window) {
  // First hide all reveals
  reveals.forEach(el => el.classList.add('hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.remove('hidden');
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  reveals.forEach(el => observer.observe(el));

  // Safety fallback: make everything visible after 2s regardless
  setTimeout(() => {
    reveals.forEach(el => {
      el.classList.remove('hidden');
      el.classList.add('animate-in');
    });
  }, 2000);
}

// ── LIQUID BLOB EFFECT ───────────────────────────────────
(function () {
  const canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;
  const hero = canvas.parentElement;
  const ctx  = canvas.getContext('2d');

  function resize() {
    canvas.width  = hero.offsetWidth  || window.innerWidth;
    canvas.height = hero.offsetHeight || window.innerHeight;
  }

  // Wait for layout before sizing
  window.addEventListener('load', resize);
  window.addEventListener('resize', resize);
  resize();

  // Palette as rgba — vivid so they show against dark navy
  const PALETTE = [
    [36,  140, 255],   // bright blue
    [0,   180, 255],   // electric cyan
    [100, 80,  255],   // indigo
    [20,  220, 200],   // teal
    [255, 180, 40 ],   // gold
    [80,  160, 255],   // sky
    [180, 100, 255],   // violet
    [0,   200, 160],   // mint
  ];

  const NUM = 10;
  let blobs = [];

  function initBlobs() {
    const W = canvas.width  || window.innerWidth;
    const H = canvas.height || window.innerHeight;
    blobs = Array.from({ length: NUM }, (_, i) => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 2.0,
      vy: (Math.random() - 0.5) * 2.0,
      r:  Math.random() * 180 + 140,
      ci: i % PALETTE.length,
      phase: Math.random() * Math.PI * 2,
    }));
  }
  initBlobs();
  window.addEventListener('load', initBlobs);

  // Cursor / touch
  const cursor = { x: -9999, y: -9999, on: false };
  hero.addEventListener('mousemove', e => {
    const rc = hero.getBoundingClientRect();
    cursor.x = e.clientX - rc.left;
    cursor.y = e.clientY - rc.top;
    cursor.on = true;
  });
  hero.addEventListener('mouseleave', () => { cursor.on = false; });
  hero.addEventListener('touchmove', e => {
    const rc = hero.getBoundingClientRect();
    cursor.x = e.touches[0].clientX - rc.left;
    cursor.y = e.touches[0].clientY - rc.top;
    cursor.on = true;
  }, { passive: true });
  hero.addEventListener('touchend', () => { cursor.on = false; });

  function drawBlob(x, y, r, col, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},${alpha})`);
    g.addColorStop(0.45,`rgba(${col[0]},${col[1]},${col[2]},${alpha * 0.5})`);
    g.addColorStop(1,   `rgba(${col[0]},${col[1]},${col[2]},0)`);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    if (!W || !H) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, W, H);

    blobs.forEach(b => {
      b.vx += (Math.random() - 0.5) * 0.14;
      b.vy += (Math.random() - 0.5) * 0.14;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 2.2) { b.vx *= 2.2/sp; b.vy *= 2.2/sp; }
      b.x += b.vx; b.y += b.vy;
      b.phase += 0.012;

      // Soft bounce
      if (b.x < -b.r)  { b.x = -b.r;  b.vx =  Math.abs(b.vx); }
      if (b.x > W+b.r) { b.x = W+b.r; b.vx = -Math.abs(b.vx); }
      if (b.y < -b.r)  { b.y = -b.r;  b.vy =  Math.abs(b.vy); }
      if (b.y > H+b.r) { b.y = H+b.r; b.vy = -Math.abs(b.vy); }

      const pulse = b.r + Math.sin(b.phase) * 22;
      drawBlob(b.x, b.y, pulse, PALETTE[b.ci], 0.75);
    });

    // Cursor orb
    if (cursor.on) {
      drawBlob(cursor.x, cursor.y, 220, [100, 200, 255], 0.9);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

   // Contact form handler
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = this.querySelector('.form-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const payload = {
    fname:   document.getElementById('fname').value.trim(),
    lname:   document.getElementById('lname').value.trim(),
    email:   document.getElementById('email').value.trim(),
    company: document.getElementById('company').value.trim(),
    entity:  document.getElementById('entity').value,
    message: document.getElementById('message').value.trim()
  };

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywWbdIrDkWDjngotRA7wNU3cQru6vRpYNhiquQ7G1LunAsxNpsyaWUDVRpyj2N682W/exec';

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';

  } catch (err) {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    alert('Something went wrong. Please email us directly at operations@roomofrequirement.co');
  }
});

// ── MOBILE DRAWER ───────────────────────────────────────
(function() {
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const links = document.querySelectorAll('[data-drawer-link]');
  if (!burger || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  }

  burger.addEventListener('click', () => {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  links.forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
  // Auto-close if resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && drawer.classList.contains('open')) closeDrawer();
  });
})();
