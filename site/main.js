/* ============================================
   SYNTH3D — main.js
   ============================================ */

// ── Nav scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ── Hamburger / mobile menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── Terminal typing effect + render reveal ──
const outputEl = document.getElementById('terminalOutput');
const preview  = document.getElementById('renderPreview');
const lines = [
  '▸ Parsing prompt...',
  '▸ Building scene graph...',
  '▸ Applying materials & lighting...',
  '▸ Rendering in Unity HDRP...',
  '✔ Scene ready! (2.9s)',
];

function typeLines(lines, el, delay = 400) {
  let i = 0;
  function next() {
    if (i >= lines.length) {
      if (preview) preview.classList.add('visible');
      return;
    }
    const div = document.createElement('div');
    div.textContent = lines[i];
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s ease';
    el.appendChild(div);
    requestAnimationFrame(() => { div.style.opacity = '1'; });
    i++;
    setTimeout(next, delay);
  }
  setTimeout(next, 3000); // wait for typing animation
}
if (outputEl) typeLines(lines, outputEl);

// ── Slider ──
const track   = document.getElementById('sliderTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsEl  = document.getElementById('sliderDots');

if (track) {
  const slides = track.querySelectorAll('.slide');
  let current  = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Touch / swipe
  let touchStart = 0;
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
  });

  startAuto();
}

// ── Intersection observer — fade-in on scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity    = '1';
      entry.target.style.transform  = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-card, .feature-card, .slide-info').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});