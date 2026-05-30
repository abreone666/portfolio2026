/* counter.js — Animated Number Counter, vanilla JS, no deps */
(function () {
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const raw = el.dataset.counter || '0';
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration || '1800', 10);

    const numMatch = raw.match(/[\d.]+/);
    if (!numMatch) return;
    const target = parseFloat(numMatch[0]);
    const isFloat = raw.includes('.');
    const decimals = isFloat ? (raw.split('.')[1] || '').length : 0;

    el.setAttribute('aria-live', 'polite');
    el.textContent = prefix + '0' + suffix;

    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = target * eased;
      const display = isFloat ? current.toFixed(decimals) : Math.floor(current);
      el.textContent = prefix + display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(c => obs.observe(c));
    } else {
      counters.forEach(animateCounter);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }

  window.AnimatedCounter = { init: initCounters, animate: animateCounter };
})();
