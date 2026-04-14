/* ═══════════════════════════════════════════
   WEDDING INVITE · app.js
   UI logic — countdown, reveal, scroll cue,
   touch ripple
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ════════════════════════════════
     COUNTDOWN TIMER
  ════════════════════════════════ */
  const WEDDING_DATE = new Date('2026-06-21T00:00:00');

  function updateCountdown() {
    const diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      document.getElementById('cd-d').textContent = '00';
      document.getElementById('cd-h').textContent = '00';
      document.getElementById('cd-m').textContent = '00';
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);

    document.getElementById('cd-d').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(mins).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 30000);

  /* ════════════════════════════════
     SCROLL REVEAL
     IntersectionObserver fires reveal
     animation when elements enter view.
  ════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('vis'), i * 70);
        revealObs.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ════════════════════════════════
     SCROLL CUE — hide after first scroll
     The arrow pulses to invite users to
     scroll; it fades away once they do.
  ════════════════════════════════ */
  const scrollCue = document.getElementById('scrollCue');

  function hideScrollCue() {
    if (scrollCue) {
      scrollCue.classList.add('hidden');
      window.removeEventListener('scroll', hideScrollCue);
      window.removeEventListener('touchmove', hideScrollCue);
    }
  }

  // Hide on any scroll or swipe
  window.addEventListener('scroll',    hideScrollCue, { passive: true, once: true });
  window.addEventListener('touchmove', hideScrollCue, { passive: true, once: true });

  // Also hide automatically after 6 seconds if user hasn't scrolled
  setTimeout(hideScrollCue, 6000);

  /* ════════════════════════════════
     TOUCH RIPPLE
     Gold ripple on every finger tap.
  ════════════════════════════════ */
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const el    = document.createElement('div');
    const size  = 90;

    el.className   = 'ripple';
    el.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${touch.clientX - size / 2}px;
      top:    ${touch.clientY - size / 2}px;
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }, { passive: true });

}());
