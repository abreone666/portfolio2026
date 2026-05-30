/* floating-cta.js — Floating sticky bottom CTA bar, vanilla JS, no deps */
(function () {

  function init() {
    const wa  = document.querySelector('.wa-float');
    const fab = document.getElementById('quiz-fab');

    function shiftUp() {
      if (wa)  wa.style.bottom  = '80px';
      if (fab) fab.style.bottom = '148px'; /* 80 + 56 + 12 */
    }
    function shiftDown() {
      if (wa)  wa.style.bottom  = '';
      if (fab) fab.style.bottom = '';
    }

    const bar = document.createElement('div');
    bar.id = 'floating-cta-bar';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Chiamata all\'azione');
    bar.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 40;
      background: rgba(12, 29, 27, 0.97);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(29,158,117,0.2);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Montserrat', sans-serif;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
      will-change: transform;
    `;

    bar.innerHTML = `
      <p style="flex:1;color:rgba(255,255,255,0.8);font-size:0.8rem;margin:0;line-height:1.4;">
        <strong style="color:#fff;">Hai un progetto in mente?</strong> Parliamone gratis.
      </p>
      <a href="#contatti" id="floating-cta-btn"
        style="background:#1D9E75;color:#fff;font-weight:700;font-size:0.8rem;padding:0.6rem 1.25rem;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:background 0.2s;"
        onmouseover="this.style.background='#17855f'"
        onmouseout="this.style.background='#1D9E75'">
        Inizia ora →
      </a>
      <button id="floating-cta-close" aria-label="Chiudi"
        style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.2rem;cursor:pointer;padding:0.25rem;line-height:1;flex-shrink:0;">✕</button>
    `;

    document.body.appendChild(bar);

    const closeBtn = bar.querySelector('#floating-cta-close');
    const ctaBtn = bar.querySelector('#floating-cta-btn');

    closeBtn.addEventListener('click', () => {
      bar.style.transform = 'translateY(100%)';
      sessionStorage.setItem('floatingCtaDismissed', '1');
      shiftDown();
    });

    ctaBtn.addEventListener('click', () => {
      bar.style.transform = 'translateY(100%)';
      shiftDown();
    });

    if (sessionStorage.getItem('floatingCtaDismissed')) return;

    let shown = false;
    function checkScroll() {
      if (shown) return;
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled >= 0.3) {
        shown = true;
        bar.style.transform = 'translateY(0)';
        shiftUp();
        window.removeEventListener('scroll', checkScroll);
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
