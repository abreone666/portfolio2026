/* testimonial-card.js — Vanilla JS testimonial cards, no deps */
(function () {

  const TESTIMONIALS = [
    {
      name: 'Marco Seidita',
      role: 'Titolare',
      company: 'Seidita Steakhouse',
      quote: 'Sito online in 2 settimane, +40% prenotazioni nel primo mese. Antonio è preciso, veloce e sa davvero come raggiungere i clienti locali su Google.',
      initials: 'MS',
      rating: 5
    },
    {
      name: 'Lucia Bonaccorsi',
      role: 'Marketing Manager',
      company: 'Bonaccorsi Srl',
      quote: 'Design pulito, comunicazione diretta e risultati concreti. Il nostro e-commerce ha aumentato le conversioni del 35% dopo il restyling.',
      initials: 'LB',
      rating: 5
    },
    {
      name: 'Salvatore Fazio',
      role: 'CEO',
      company: 'F2 Agency',
      quote: 'Professionalità sopra la media. Antonio ha trasformato la nostra presenza online con un approccio strategico che nessun altra agenzia ci aveva proposto.',
      initials: 'SF',
      rating: 5
    }
  ];

  function starsSVG(n) {
    return Array.from({ length: 5 }, (_, i) => `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${i < n ? '#F59E0B' : '#374151'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`).join('');
  }

  function createCard(t) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.style.cssText = `
      background: #0f2321;
      border: 1px solid rgba(29,158,117,0.15);
      border-left: 3px solid #1D9E75;
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-family: 'Montserrat', sans-serif;
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    `;

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(29,158,117,0.15);border:2px solid rgba(29,158,117,0.4);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#1D9E75;flex-shrink:0;">${t.initials}</div>
        <div>
          <p style="font-weight:700;color:#fff;font-size:0.9rem;margin:0;">${t.name}</p>
          <p style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin:0;">${t.role} · ${t.company}</p>
        </div>
        <div style="display:flex;gap:2px;margin-left:auto;">${starsSVG(t.rating)}</div>
      </div>
      <p style="color:rgba(255,255,255,0.75);font-size:0.875rem;line-height:1.7;margin:0;">"${t.quote}"</p>
    `;
    return card;
  }

  function initTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    TESTIMONIALS.forEach((t, i) => {
      const card = createCard(t);
      container.appendChild(card);
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + i * 130);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonials);
  } else {
    initTestimonials();
  }

  window.TestimonialCards = { init: initTestimonials };
})();
