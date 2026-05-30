/**
 * Quiz Popup – "Calcola il costo del tuo sito"
 * Antonio Ilacqua Portfolio 2026
 * Invia i dati a n8n via webhook POST JSON
 */
(function () {
  'use strict';

  // ─── CONFIG ──────────────────────────────────────────────────────────────
  const N8N_WEBHOOK_URL = 'https://aideesign.app.n8n.cloud/webhook/quiz-sito';

  // ─── DOMANDE QUIZ ────────────────────────────────────────────────────────
  const steps = [
    {
      id: 'attivita',
      title: 'Che tipo di attività hai?',
      subtitle: 'Seleziona quella che ti descrive meglio.',
      type: 'cards',
      options: [
        { value: 'professionista', label: 'Libero professionista', desc: 'Consulente, avvocato, medico…' },
        { value: 'pmi',            label: 'PMI / Negozio locale',  desc: 'Attività fisica sul territorio' },
        { value: 'ecommerce',      label: 'E-commerce',            desc: 'Vendo prodotti online' },
        { value: 'startup',        label: 'Startup / Tech',        desc: 'Progetto innovativo digitale' },
        { value: 'ente',           label: 'Ente / Associazione',   desc: 'Non-profit, comune, club…' },
      ],
    },
    {
      id: 'tipo_sito',
      title: 'Che tipo di sito ti serve?',
      subtitle: 'Scegli la soluzione più adatta al tuo obiettivo.',
      type: 'cards',
      options: [
        { value: 'vetrina',   label: 'Sito vetrina',    desc: 'Chi sei, cosa fai, come contattarti' },
        { value: 'portfolio', label: 'Portfolio / Blog', desc: 'Mostra i tuoi lavori e articoli' },
        { value: 'ecommerce', label: 'E-commerce',       desc: 'Vendi prodotti o servizi online' },
        { value: 'landing',   label: 'Landing page',     desc: 'Una pagina per una promozione specifica' },
        { value: 'aziendale', label: 'Sito aziendale',   desc: 'Struttura completa, più sezioni' },
      ],
    },
    {
      id: 'pagine',
      title: 'Quante pagine ti servono?',
      subtitle: 'Una stima è sufficiente, possiamo discuterne.',
      type: 'cards',
      options: [
        { value: 'small',  label: '1 – 5 pagine',  desc: 'Landing, portfolio essenziale' },
        { value: 'medium', label: '6 – 15 pagine', desc: 'Sito vetrina o aziendale standard' },
        { value: 'large',  label: '15+ pagine',    desc: 'Sito complesso o con molti prodotti' },
      ],
    },
    {
      id: 'situazione',
      title: 'Qual è la tua situazione attuale?',
      subtitle: '',
      type: 'cards',
      options: [
        { value: 'nuovo',    label: 'Parto da zero',   desc: 'Non ho ancora nessun sito' },
        { value: 'rinnovo',  label: 'Voglio rinnovarlo', desc: 'Ho un sito ma è datato o lento' },
        { value: 'problema', label: 'Non converte',     desc: 'Il sito c\'è ma non porta clienti' },
      ],
    },
    {
      id: 'extra',
      title: 'Cosa vuoi includere?',
      subtitle: 'Puoi scegliere più opzioni.',
      type: 'multi',
      options: [
        { value: 'seo',          label: 'SEO & Google',        desc: 'Posizionamento sui motori di ricerca' },
        { value: 'manutenzione', label: 'Manutenzione',        desc: 'Aggiornamenti, backup, sicurezza' },
        { value: 'copywriting',  label: 'Testi professionali', desc: 'Scrittura contenuti persuasivi' },
        { value: 'analytics',    label: 'Analytics & Report',  desc: 'Monitoraggio dati e performance' },
      ],
    },
    {
      id: 'contatto',
      title: 'Dove ti mando il preventivo?',
      subtitle: 'Ricevi subito la stima personalizzata nella tua email.',
      type: 'form',
    },
  ];

  // ─── PREZZI BASE ─────────────────────────────────────────────────────────
  const priceMap = {
    tipo_sito: { vetrina: 800, portfolio: 600, ecommerce: 2500, landing: 400, aziendale: 1500 },
    pagine:    { small: 1, medium: 1.4, large: 1.8 },
    extra:     { seo: 350, manutenzione: 120, copywriting: 280, analytics: 180 },
  };

  function calcPrice(answers) {
    const base  = priceMap.tipo_sito[answers.tipo_sito] || 800;
    const multi = priceMap.pagine[answers.pagine]        || 1;
    let extras  = 0;
    if (Array.isArray(answers.extra)) {
      answers.extra.forEach(e => { extras += priceMap.extra[e] || 0; });
    }
    const total = Math.round(base * multi + extras);
    return { min: Math.round(total * 0.85), max: Math.round(total * 1.15) };
  }

  // ─── STATO ───────────────────────────────────────────────────────────────
  let currentStep  = 0;
  let answers      = {};
  let multiSelect  = new Set();

  // ─── CREA DOM ─────────────────────────────────────────────────────────────
  function buildHTML() {
    const el = document.createElement('div');
    el.id = 'quiz-popup-root';
    el.innerHTML = `
      <!-- Overlay -->
      <div id="quiz-overlay" class="quiz-overlay" aria-hidden="true"></div>

      <!-- Floating CTA trigger (desktop bottom-right) -->
      <button id="quiz-fab" class="quiz-fab" aria-label="Calcola il preventivo del tuo sito">
        <svg class="quiz-fab__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="7" x2="16" y2="7"/>
          <line x1="8" y1="12" x2="8" y2="12"/>
          <line x1="12" y1="12" x2="12" y2="12"/>
          <line x1="16" y1="12" x2="16" y2="12"/>
          <line x1="8" y1="16" x2="8" y2="16"/>
          <line x1="12" y1="16" x2="16" y2="16"/>
        </svg>
        <span class="quiz-fab__label">Calcola il preventivo</span>
      </button>

      <!-- Modal -->
      <div id="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title" hidden>
        <!-- Close -->
        <button id="quiz-close" class="quiz-close" aria-label="Chiudi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Header fisso -->
        <div class="quiz-header">
          <div class="quiz-logo">
            <span class="quiz-logo__dot"></span>
            <span class="quiz-logo__text">antonioilacqua.it</span>
          </div>
          <!-- Progress bar -->
          <div class="quiz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
            <div id="quiz-progress-bar" class="quiz-progress__bar"></div>
          </div>
          <div id="quiz-step-counter" class="quiz-step-counter">Domanda 1 di 6</div>
        </div>

        <!-- Contenuto steps -->
        <div id="quiz-body" class="quiz-body"></div>

        <!-- Footer navigazione -->
        <div class="quiz-footer">
          <button id="quiz-prev" class="quiz-btn quiz-btn--ghost" hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Indietro
          </button>
          <button id="quiz-next" class="quiz-btn quiz-btn--primary">
            Avanti
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  }

  // ─── RENDER STEP ─────────────────────────────────────────────────────────
  function renderStep(idx) {
    const step    = steps[idx];
    const body    = document.getElementById('quiz-body');
    const prevBtn = document.getElementById('quiz-prev');
    const nextBtn = document.getElementById('quiz-next');
    const counter = document.getElementById('quiz-step-counter');
    const bar     = document.getElementById('quiz-progress-bar');

    // Aggiorna progress
    const pct = Math.round(((idx) / steps.length) * 100);
    bar.style.width = pct + '%';
    counter.textContent = `Domanda ${idx + 1} di ${steps.length}`;

    prevBtn.hidden = (idx === 0);
    nextBtn.textContent = '';

    if (step.type === 'form') {
      nextBtn.innerHTML = `Ricevi il preventivo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>`;
      counter.textContent = `Ultimo step • ${idx + 1} di ${steps.length}`;
    } else {
      nextBtn.innerHTML = `Avanti <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>`;
    }

    // Animazione uscita
    body.classList.add('quiz-body--exit');
    setTimeout(() => {
      body.innerHTML = buildStepHTML(step, idx);
      body.classList.remove('quiz-body--exit');
      body.classList.add('quiz-body--enter');
      setTimeout(() => body.classList.remove('quiz-body--enter'), 400);
      attachStepListeners(step);
    }, 200);
  }

  function buildStepHTML(step) {
    let html = `
      <div class="quiz-question">
        <h2 id="quiz-modal-title" class="quiz-question__title">${step.title}</h2>
        ${step.subtitle ? `<p class="quiz-question__sub">${step.subtitle}</p>` : ''}
      </div>
    `;

    if (step.type === 'cards' || step.type === 'multi') {
      const isMulti  = step.type === 'multi';
      const selected = isMulti
        ? Array.from(multiSelect)
        : (answers[step.id] ? [answers[step.id]] : []);

      html += `<div class="quiz-cards ${isMulti ? 'quiz-cards--multi' : ''}">`;
      step.options.forEach((opt, i) => {
        const active = selected.includes(opt.value) ? 'quiz-card--active' : '';
        html += `
          <button class="quiz-card ${active}" data-value="${opt.value}" data-step="${step.id}" type="button">
            <span class="quiz-card__num">${String(i + 1).padStart(2, '0')}</span>
            <span class="quiz-card__label">${opt.label}</span>
            ${opt.desc ? `<span class="quiz-card__desc">${opt.desc}</span>` : ''}
            <svg class="quiz-card__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
          </button>
        `;
      });
      html += `</div>`;
      if (isMulti) {
        html += `<p class="quiz-multi-hint">Seleziona tutto quello che ti interessa (anche nessuno)</p>`;
      }
    }

    if (step.type === 'form') {
      html += `
        <form id="quiz-form" class="quiz-form" novalidate>
          <div class="quiz-field">
            <label class="quiz-label" for="quiz-nome">Il tuo nome *</label>
            <input class="quiz-input" type="text" id="quiz-nome" name="nome"
              placeholder="Es. Mario Rossi" autocomplete="name" required
              value="${answers.nome || ''}" />
          </div>
          <div class="quiz-field">
            <label class="quiz-label" for="quiz-email">Email *</label>
            <input class="quiz-input" type="email" id="quiz-email" name="email"
              placeholder="mario@esempio.it" autocomplete="email" required
              value="${answers.email || ''}" />
          </div>
          <div class="quiz-field">
            <label class="quiz-label" for="quiz-tel">Telefono <span class="quiz-optional">(facoltativo)</span></label>
            <input class="quiz-input" type="tel" id="quiz-tel" name="telefono"
              placeholder="+39 3xx xxxxxxx" autocomplete="tel"
              value="${answers.telefono || ''}" />
          </div>
          <p class="quiz-privacy">
            Inviando accetti la nostra
            <a href="/privacy-policy.html" target="_blank">Privacy Policy</a>.
            Non riceverai spam, mai.
          </p>
        </form>
      `;
    }

    return html;
  }

  function attachStepListeners(step) {
    if (step.type === 'cards') {
      document.querySelectorAll('.quiz-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('quiz-card--active'));
          card.classList.add('quiz-card--active');
          answers[step.id] = card.dataset.value;
          // Auto-avanza dopo breve delay
          setTimeout(() => goNext(), 320);
        });
      });
    }

    if (step.type === 'multi') {
      // Ripristina selezione precedente
      if (Array.isArray(answers[step.id])) {
        answers[step.id].forEach(v => multiSelect.add(v));
      }
      document.querySelectorAll('.quiz-card').forEach(card => {
        if (multiSelect.has(card.dataset.value)) card.classList.add('quiz-card--active');
        card.addEventListener('click', () => {
          const v = card.dataset.value;
          if (multiSelect.has(v)) {
            multiSelect.delete(v);
            card.classList.remove('quiz-card--active');
          } else {
            multiSelect.add(v);
            card.classList.add('quiz-card--active');
          }
        });
      });
    }
  }

  // ─── NAVIGAZIONE ─────────────────────────────────────────────────────────
  function goNext() {
    const step = steps[currentStep];

    // Validazione
    if (step.type === 'cards' && !answers[step.id]) {
      shakeNextBtn(); return;
    }
    if (step.type === 'multi') {
      answers[step.id] = Array.from(multiSelect);
      multiSelect = new Set();
    }
    if (step.type === 'form') {
      if (!validateForm()) return;
    }

    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      submitQuiz();
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      // Se eravamo su multi, salva stato
      if (steps[currentStep].type === 'multi') {
        answers[steps[currentStep].id] = Array.from(multiSelect);
        multiSelect = new Set();
      }
      // Se il passo precedente era multi, ripristina
      currentStep--;
      if (steps[currentStep].type === 'multi') {
        const prev = answers[steps[currentStep].id];
        multiSelect = new Set(Array.isArray(prev) ? prev : []);
      }
      renderStep(currentStep);
    }
  }

  function validateForm() {
    const nome  = document.getElementById('quiz-nome');
    const email = document.getElementById('quiz-email');
    let ok = true;

    [nome, email].forEach(f => f.classList.remove('quiz-input--error'));

    if (!nome.value.trim()) { nome.classList.add('quiz-input--error'); ok = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('quiz-input--error'); ok = false;
    }
    if (!ok) shakeNextBtn();

    answers.nome     = nome.value.trim();
    answers.email    = email.value.trim();
    answers.telefono = document.getElementById('quiz-tel').value.trim();
    return ok;
  }

  function shakeNextBtn() {
    const btn = document.getElementById('quiz-next');
    btn.classList.add('quiz-btn--shake');
    setTimeout(() => btn.classList.remove('quiz-btn--shake'), 500);
  }

  // ─── SUBMIT & RISULTATO ──────────────────────────────────────────────────
  async function submitQuiz() {
    const body    = document.getElementById('quiz-body');
    const nextBtn = document.getElementById('quiz-next');
    const prevBtn = document.getElementById('quiz-prev');
    const bar     = document.getElementById('quiz-progress-bar');
    const counter = document.getElementById('quiz-step-counter');

    bar.style.width = '100%';
    counter.textContent = 'Elaborazione…';
    nextBtn.disabled = true;
    prevBtn.hidden   = true;

    body.innerHTML = `<div class="quiz-loading"><div class="quiz-spinner"></div><p>Calcolo il tuo preventivo…</p></div>`;

    const price = calcPrice(answers);

    // Payload n8n
    const payload = {
      ...answers,
      extra:       Array.isArray(answers.extra) ? answers.extra.join(', ') : '',
      prezzo_min:  price.min,
      prezzo_max:  price.max,
      timestamp:   new Date().toISOString(),
      source_page: window.location.href,
    };

    // reCAPTCHA v3 — disponibile solo se l'utente ha accettato i relativi cookie
    if (typeof grecaptcha !== 'undefined') {
      try {
        payload.recaptcha_token = await grecaptcha.execute(
          '6Ldsv7EsAAAAAA2eYbQjONhT-0GXXa8jBL30gVVK',
          { action: 'quiz' }
        );
      } catch (_) { /* silenzioso */ }
    }

    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // Silenzioso: mostriamo comunque il risultato
    }

    showResult(price, answers);
  }

  function labelOf(stepId, value) {
    const step = steps.find(s => s.id === stepId);
    if (!step || !step.options) return value;
    const opt = step.options.find(o => o.value === value);
    return opt ? opt.label : value;
  }

  function showResult(price, answers) {
    const body    = document.getElementById('quiz-body');
    const nextBtn = document.getElementById('quiz-next');
    const counter = document.getElementById('quiz-step-counter');

    counter.textContent = 'Preventivo inviato';

    const firstName = answers.nome ? answers.nome.split(' ')[0] : '';

    body.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.61 1.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 5.39 5.39l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.23"/>
            <polyline points="22,6 12,12 2,6"/>
          </svg>
        </div>

        <h2 class="quiz-result__title">Controlla la tua email${firstName ? `, ${firstName}` : ''}.</h2>
        <p class="quiz-result__sub">
          Ho inviato la stima personalizzata a <strong>${answers.email}</strong>.<br>
          Ti contatterò entro 24h con un preventivo preciso e gratuito.
        </p>

        <div class="quiz-result__summary">
          <div class="quiz-result__row"><span>Tipo sito</span><strong>${labelOf('tipo_sito', answers.tipo_sito)}</strong></div>
          <div class="quiz-result__row"><span>Dimensione</span><strong>${labelOf('pagine', answers.pagine)}</strong></div>
        </div>

        <p class="quiz-result__disclaimer">
          Non riceverai spam. Solo il tuo preventivo e, se vorrai, un contatto diretto da parte mia.
        </p>
      </div>
    `;

    nextBtn.hidden = true;
  }

  // ─── POPUP OPEN / CLOSE ──────────────────────────────────────────────────
  function openPopup() {
    const modal   = document.getElementById('quiz-modal');
    const overlay = document.getElementById('quiz-overlay');
    const fab     = document.getElementById('quiz-fab');

    modal.hidden  = false;
    overlay.classList.add('quiz-overlay--visible');
    document.body.style.overflow = 'hidden';
    fab.classList.add('quiz-fab--hidden');

    // Reset stato se quiz già completato
    if (currentStep >= steps.length - 1 &&
        document.querySelector('.quiz-result')) {
      currentStep = 0;
      answers     = {};
      multiSelect = new Set();
    }

    renderStep(currentStep);

    modal.classList.remove('quiz-modal--exit');
    requestAnimationFrame(() => modal.classList.add('quiz-modal--enter'));
  }

  function closePopup() {
    const modal   = document.getElementById('quiz-modal');
    const overlay = document.getElementById('quiz-overlay');
    const fab     = document.getElementById('quiz-fab');

    modal.classList.remove('quiz-modal--enter');
    modal.classList.add('quiz-modal--exit');
    overlay.classList.remove('quiz-overlay--visible');
    document.body.style.overflow = '';

    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('quiz-modal--exit');
      fab.classList.remove('quiz-fab--hidden');
    }, 350);
  }

  // ─── TRIGGER AUTOMATICO (exit-intent su desktop) ─────────────────────────
  function setupAutoTrigger() {
    let triggered = false;

    // Desktop: exit-intent (mouse esce dall'alto)
    document.addEventListener('mouseleave', e => {
      if (triggered) return;
      if (e.clientY <= 10) {
        triggered = true;
        setTimeout(openPopup, 400);
      }
    });

    // Mobile / fallback: dopo 45 secondi
    const timer = setTimeout(() => {
      if (!triggered) { triggered = true; openPopup(); }
    }, 45000);

    // Se l'utente apre manualmente, cancella il timer auto
    document.getElementById('quiz-fab').addEventListener('click', () => clearTimeout(timer));
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    buildHTML();

    document.getElementById('quiz-fab').addEventListener('click',    openPopup);
    document.getElementById('quiz-close').addEventListener('click',  closePopup);
    document.getElementById('quiz-overlay').addEventListener('click',closePopup);
    document.getElementById('quiz-next').addEventListener('click',   goNext);
    document.getElementById('quiz-prev').addEventListener('click',   goPrev);

    // Chiudi con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePopup();
    });

    setupAutoTrigger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
