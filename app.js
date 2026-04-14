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
      ['cd-d','cd-h','cd-m'].forEach(id => document.getElementById(id).textContent = '00');
      return;
    }
    document.getElementById('cd-d').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 30000);

  /* ════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('vis'), i * 70);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const scrollHand = document.getElementById('scrollHand');

function hideScrollHand() {
  if (scrollHand) scrollHand.classList.add('hide');
}
window.addEventListener('scroll',    hideScrollHand, { passive: true, once: true });
window.addEventListener('touchmove', hideScrollHand, { passive: true, once: true });
setTimeout(hideScrollHand, 7000);
  /* ════════════════════════════════
     SCROLL CUE — 3-state logic
     
     The CSS animation (state 1) runs for
     1.8s delay + 1s duration = 2.8s total.
     At 2.9s we add .visible (state 2) which
     hands control to CSS transitions.
     On first scroll/touch we add .hidden
     (state 3) which fades it out smoothly.
  ════════════════════════════════ */
  const scrollCue = document.getElementById('scrollCue');

  // State 2: switch from animation to transition after CSS anim completes
  const visibleTimer = setTimeout(() => {
    if (scrollCue) scrollCue.classList.add('visible');
  }, 2900); // 1800ms delay + 1000ms duration + 100ms buffer

  function hideScrollCue() {
    clearTimeout(visibleTimer);
    if (!scrollCue) return;
    // Ensure .visible is set so transition works even if user scrolls early
    scrollCue.classList.add('visible');
    // Small rAF delay so the transition property is applied before opacity change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollCue.classList.add('hidden');
      });
    });
  }

  window.addEventListener('scroll',    hideScrollCue, { passive: true, once: true });
  window.addEventListener('touchmove', hideScrollCue, { passive: true, once: true });

  // Auto-hide after 7s regardless
  setTimeout(hideScrollCue, 7000);

  /* ════════════════════════════════
     TOUCH RIPPLE
  ════════════════════════════════ */
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const el = document.createElement('div');
    const size = 90;
    el.className = 'ripple';
    el.style.cssText = `width:${size}px;height:${size}px;left:${touch.clientX - size/2}px;top:${touch.clientY - size/2}px;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }, { passive: true });

}());