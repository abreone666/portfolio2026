/**
 * Cookie Consent Manager – antonioilacqua.it
 * GDPR · Direttiva ePrivacy · Linee guida Garante Privacy 2021
 * Versione banner: 1.0 · Aprile 2026
 *
 * Categorie gestite:
 *   analytics  – Google Analytics 4
 *   recaptcha  – Google reCAPTCHA v3
 *   maps       – Google Maps Embed
 *
 * Storage: localStorage['ai_cookie_consent'] (JSON)
 * Scadenza consenso: 12 mesi
 */
(function () {
  'use strict';

  /* ─── Costanti ─────────────────────────────────────────────── */
  var KEY      = 'ai_cookie_consent';
  var VERSION  = '1.0';
  var EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 12 mesi

  var GA_ID       = 'G-2ZHP3MV6NG';
  var RC_KEY      = '6Ldsv7EsAAAAAA2eYbQjONhT-0GXXa8jBL30gVVK';
  var MAPS_SRC    = 'https://maps.google.com/maps?q=Antonio+Franco+Ilacqua+Web+Designer+Milazzo+ME+Italia&output=embed&hl=it&z=14';

  /* ─── CSS ───────────────────────────────────────────────────── */
  var CSS = [
    /* Banner */
    '#cc-banner{position:fixed;bottom:0;left:0;right:0;z-index:99998;',
      'background:#0c1d1b;color:#fff;padding:18px 24px;',
      'box-shadow:0 -4px 32px rgba(0,0,0,.4);',
      'font-family:Montserrat,system-ui,sans-serif;font-size:14px;line-height:1.6;',
      'transform:translateY(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);}',
    '#cc-banner.cc-show{transform:translateY(0);}',
    '#cc-b-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}',
    '#cc-b-text{flex:1;min-width:220px;}',
    '#cc-b-text strong{display:block;font-size:15px;font-weight:700;margin-bottom:4px;}',
    '#cc-b-text p{color:rgba(255,255,255,.7);margin:0;font-size:13px;}',
    '#cc-b-text a{color:#009640;text-decoration:underline;}',
    '#cc-b-btns{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;}',

    /* Pannello overlay */
    '#cc-overlay{position:fixed;inset:0;z-index:99999;',
      'background:rgba(0,0,0,.6);backdrop-filter:blur(3px);',
      'display:flex;align-items:flex-end;justify-content:center;',
      'opacity:0;transition:opacity .25s;pointer-events:none;}',
    '#cc-overlay.cc-show{opacity:1;pointer-events:all;}',
    '#cc-panel{background:#0c1d1b;color:#fff;width:100%;max-width:560px;',
      'border-radius:20px 20px 0 0;padding:28px 24px 32px;',
      'font-family:Montserrat,system-ui,sans-serif;',
      'max-height:92vh;overflow-y:auto;',
      'transform:translateY(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);}',
    '@media(min-width:600px){#cc-panel{border-radius:20px;margin-bottom:24px;max-height:88vh;}}',
    '#cc-overlay.cc-show #cc-panel{transform:translateY(0);}',
    '#cc-panel h2{font-size:17px;font-weight:800;margin:0 0 6px;}',
    '#cc-panel > p{font-size:13px;color:rgba(255,255,255,.68);margin:0 0 20px;}',

    /* Toggle item */
    '.cc-item{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;margin-bottom:10px;}',
    '.cc-item-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}',
    '.cc-item-head strong{font-size:13px;font-weight:700;}',
    '.cc-item-head span.cc-always{font-size:11px;color:#009640;font-weight:700;white-space:nowrap;}',
    '.cc-item p{font-size:12px;color:rgba(255,255,255,.55);margin:6px 0 0;}',

    /* Toggle switch */
    '.cc-toggle{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;}',
    '.cc-toggle input{opacity:0;width:0;height:0;position:absolute;}',
    '.cc-slider{position:absolute;inset:0;background:rgba(255,255,255,.15);border-radius:22px;',
      'cursor:pointer;transition:background .2s;}',
    '.cc-toggle input:checked + .cc-slider{background:#009640;}',
    '.cc-toggle input:disabled + .cc-slider{cursor:not-allowed;opacity:.5;}',
    '.cc-slider:before{content:"";position:absolute;height:16px;width:16px;',
      'left:3px;bottom:3px;background:#fff;border-radius:50%;',
      'transition:transform .2s;}',
    '.cc-toggle input:checked + .cc-slider:before{transform:translateX(18px);}',

    /* Pulsanti */
    '.cc-btn{padding:10px 18px;border-radius:10px;font-family:inherit;font-size:13px;',
      'font-weight:700;cursor:pointer;border:none;transition:opacity .15s;white-space:nowrap;}',
    '.cc-btn:hover{opacity:.85;}',
    '.cc-btn-outline{background:transparent;border:1px solid rgba(255,255,255,.25);color:#fff;}',
    '.cc-btn-ghost{background:transparent;border:none;color:rgba(255,255,255,.6);',
      'font-size:12px;padding:8px 12px;text-decoration:underline;cursor:pointer;font-family:inherit;}',
    '.cc-btn-ghost:hover{color:#fff;}',
    '.cc-btn-primary{background:#009640;color:#fff;}',
    '#cc-p-foot{display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;}',
    '#cc-p-foot .cc-btn{flex:1;}',
  ].join('');

  /* ─── Stato ─────────────────────────────────────────────────── */
  var consent = null; // oggetto corrente letto da localStorage

  /* ─── Lettura / Scrittura ────────────────────────────────────── */
  function loadConsent() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.ts || !obj.exp) return null;
      if (Date.now() > obj.exp) { localStorage.removeItem(KEY); return null; } // scaduto
      return obj;
    } catch (e) { return null; }
  }

  function saveConsent(cats) {
    var now = Date.now();
    var obj = {
      v:    VERSION,
      ts:   now,
      exp:  now + EXPIRY_MS,
      cats: cats
    };
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
    return obj;
  }

  /* ─── Consent Mode v2 helpers ────────────────────────────────── */
  function grantGtag(analyticsGranted) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      analytics_storage:    analyticsGranted ? 'granted' : 'denied',
      ad_storage:           'denied',
      ad_user_data:         'denied',
      ad_personalization:   'denied'
    });
  }

  /* ─── Caricamento dinamico script ───────────────────────────── */
  function loadScript(src, id, onload) {
    if (document.getElementById(id)) { if (onload) onload(); return; }
    var s = document.createElement('script');
    s.src = src; s.id = id; s.async = true;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function loadGA4() {
    // GA4 è già inizializzato in-page con Consent Mode v2; basta aggiornare il grant
    grantGtag(true);
  }

  function loadRecaptcha() {
    loadScript(
      'https://www.google.com/recaptcha/api.js?render=' + RC_KEY,
      'rc-script',
      function () {
        // Notifica il form che reCAPTCHA è disponibile
        var ev = new Event('recaptcha-ready');
        document.dispatchEvent(ev);
      }
    );
  }

  function enableMaps() {
    var ph = document.getElementById('cc-maps-ph');
    if (!ph) return;
    var wrap = ph.parentNode;
    var iframe = document.createElement('iframe');
    iframe.title  = 'Antonio Ilacqua Web Designer — Milazzo';
    iframe.src    = MAPS_SRC;
    iframe.width  = '100%';
    iframe.height = '100%';
    iframe.setAttribute('style', 'border:0;min-height:320px;display:block;');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    if (wrap) {
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
    }
  }

  /* ─── Applica il consenso ────────────────────────────────────── */
  function applyConsent(cats) {
    if (cats.analytics)  loadGA4();
    if (cats.recaptcha)  loadRecaptcha();
    if (cats.maps)       enableMaps();
  }

  /* ─── CSS injection ─────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cc-styles')) return;
    var s = document.createElement('style');
    s.id = 'cc-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ─── Banner ─────────────────────────────────────────────────── */
  function showBanner() {
    if (document.getElementById('cc-banner')) return;
    injectStyles();
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Informativa cookie');
    el.innerHTML =
      '<div id="cc-b-inner">' +
        '<div id="cc-b-text">' +
          '<strong>Utilizziamo i cookie</strong>' +
          '<p>Usiamo cookie tecnici (necessari) e cookie analitici di terze parti (Google Analytics, reCAPTCHA, Maps). ' +
          'Puoi scegliere quali accettare. ' +
          '<a href="/cookie-policy.html">Cookie Policy</a></p>' +
        '</div>' +
        '<div id="cc-b-btns">' +
          '<button class="cc-btn cc-btn-outline" id="cc-b-reject" type="button">Rifiuta tutti</button>' +
          '<button class="cc-btn cc-btn-ghost" id="cc-b-custom" type="button">Personalizza</button>' +
          '<button class="cc-btn cc-btn-primary" id="cc-b-accept" type="button">Accetta tutti</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('cc-show'); });
    });
    document.getElementById('cc-b-accept').addEventListener('click', acceptAll);
    document.getElementById('cc-b-reject').addEventListener('click', rejectAll);
    document.getElementById('cc-b-custom').addEventListener('click', showPanel);
  }

  function hideBanner() {
    var el = document.getElementById('cc-banner');
    if (!el) return;
    el.classList.remove('cc-show');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380);
  }

  /* ─── Pannello personalizzazione ─────────────────────────────── */
  function showPanel() {
    hideBanner();
    if (document.getElementById('cc-overlay')) return;
    injectStyles();

    var cats = consent ? consent.cats : { analytics: false, recaptcha: false, maps: false };

    var ov = document.createElement('div');
    ov.id = 'cc-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Personalizza le tue preferenze cookie');

    ov.innerHTML =
      '<div id="cc-panel">' +
        '<h2>Personalizza le preferenze cookie</h2>' +
        '<p>Gestisci quali cookie accettare. I cookie tecnici sono sempre attivi e non possono essere disabilitati.</p>' +

        /* Cookie tecnici */
        '<div class="cc-item">' +
          '<div class="cc-item-head">' +
            '<strong>Cookie tecnici necessari</strong>' +
            '<span class="cc-always">Sempre attivi</span>' +
          '</div>' +
          '<p>Necessari per il funzionamento del sito (preferenze tema, gestione sessione). Non possono essere disabilitati.</p>' +
        '</div>' +

        /* Analytics */
        '<div class="cc-item">' +
          '<div class="cc-item-head">' +
            '<strong>Google Analytics 4</strong>' +
            '<label class="cc-toggle" aria-label="Abilita Google Analytics">' +
              '<input type="checkbox" id="cc-t-analytics"' + (cats.analytics ? ' checked' : '') + '>' +
              '<span class="cc-slider"></span>' +
            '</label>' +
          '</div>' +
          '<p>Statistiche anonime sul traffico: pagine visitate, durata, dispositivo, provenienza. Fornitore: Google Ireland Ltd. Cookie: _ga (2a), _ga_* (2a), _gid (24h).</p>' +
        '</div>' +

        /* reCAPTCHA */
        '<div class="cc-item">' +
          '<div class="cc-item-head">' +
            '<strong>Google reCAPTCHA v3</strong>' +
            '<label class="cc-toggle" aria-label="Abilita Google reCAPTCHA">' +
              '<input type="checkbox" id="cc-t-recaptcha"' + (cats.recaptcha ? ' checked' : '') + '>' +
              '<span class="cc-slider"></span>' +
            '</label>' +
          '</div>' +
          '<p>Protegge il form di contatto dallo spam. Analizza il comportamento in modo invisibile. Fornitore: Google LLC. Cookie: _GRECAPTCHA (6 mesi).</p>' +
        '</div>' +

        /* Maps */
        '<div class="cc-item">' +
          '<div class="cc-item-head">' +
            '<strong>Google Maps</strong>' +
            '<label class="cc-toggle" aria-label="Abilita Google Maps">' +
              '<input type="checkbox" id="cc-t-maps"' + (cats.maps ? ' checked' : '') + '>' +
              '<span class="cc-slider"></span>' +
            '</label>' +
          '</div>' +
          '<p>Mappa interattiva nella sezione contatti. Senza questo cookie la mappa non è interattiva. Fornitore: Google Ireland Ltd. Cookie: NID (6 mesi), 1P_JAR (30g).</p>' +
        '</div>' +

        /* Footer panel */
        '<div id="cc-p-foot">' +
          '<button class="cc-btn cc-btn-outline" id="cc-p-reject" type="button">Rifiuta tutti</button>' +
          '<button class="cc-btn cc-btn-primary" id="cc-p-save" type="button">Salva preferenze</button>' +
          '<button class="cc-btn cc-btn-primary" id="cc-p-accept" type="button">Accetta tutti</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(ov);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { ov.classList.add('cc-show'); });
    });

    // Focus trap: primo elemento focusabile
    var firstBtn = ov.querySelector('button, input');
    if (firstBtn) firstBtn.focus();

    // Chiudi cliccando overlay (non pannello)
    ov.addEventListener('click', function (e) {
      if (e.target === ov) hidePanel();
    });

    // ESC chiude
    document.addEventListener('keydown', onEsc);

    document.getElementById('cc-p-accept').addEventListener('click', acceptAll);
    document.getElementById('cc-p-reject').addEventListener('click', rejectAll);
    document.getElementById('cc-p-save').addEventListener('click', saveCustom);
  }

  function hidePanel() {
    var ov = document.getElementById('cc-overlay');
    if (!ov) return;
    ov.classList.remove('cc-show');
    document.removeEventListener('keydown', onEsc);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
  }

  function onEsc(e) {
    if (e.key === 'Escape') hidePanel();
  }

  /* ─── Azioni consenso ────────────────────────────────────────── */
  function acceptAll() {
    var cats = { analytics: true, recaptcha: true, maps: true };
    consent = saveConsent(cats);
    applyConsent(cats);
    hideBanner();
    hidePanel();
  }

  function rejectAll() {
    var cats = { analytics: false, recaptcha: false, maps: false };
    consent = saveConsent(cats);
    grantGtag(false);
    hideBanner();
    hidePanel();
  }

  function saveCustom() {
    var cats = {
      analytics:  !!document.getElementById('cc-t-analytics')  && document.getElementById('cc-t-analytics').checked,
      recaptcha:  !!document.getElementById('cc-t-recaptcha')  && document.getElementById('cc-t-recaptcha').checked,
      maps:       !!document.getElementById('cc-t-maps')       && document.getElementById('cc-t-maps').checked,
    };
    consent = saveConsent(cats);
    applyConsent(cats);
    hidePanel();
  }

  /* ─── Init ───────────────────────────────────────────────────── */
  function init() {
    consent = loadConsent();

    if (consent) {
      // Consenso già espresso e valido: applica subito
      applyConsent(consent.cats);
      return;
    }

    // Nessun consenso o scaduto: mostra banner
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  /* ─── API pubblica ───────────────────────────────────────────── */
  window.cookieConsent = {
    /** Riapre il pannello preferenze (es. dal footer) */
    show: function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showPanel);
      } else {
        showPanel();
      }
    },
    /** Revoca il consenso e ricarica (es. per test) */
    revoke: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    }
  };

  init();
})();
