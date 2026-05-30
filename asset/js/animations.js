/* animations.js — Motion.js enhancement layer for antonioilacqua.it */

document.addEventListener('DOMContentLoaded', function () {

  if (typeof Motion === 'undefined') {
    console.warn('[animations.js] Motion not found — skipping enhancements.');
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const { animate, inView, stagger, spring } = Motion;

  // ─── 3.1 HERO ────────────────────────────────────────────────────────────────

  // Badge "Disponibile"
  const badge = document.querySelector('#home .reveal-on-scroll:first-child');
  if (badge) {
    animate(badge, { scale: [0.8, 1], opacity: [0, 1] },
      { duration: 0.5, delay: 0.1, easing: spring({ stiffness: 300, damping: 20 }) });
  }

  // H1 word-by-word
  const h1 = document.querySelector('#home h1');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent.trim());
    const originalHTML = h1.innerHTML;
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(tn => {
      const words = tn.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w) {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    const wordSpans = h1.querySelectorAll('span[style]');
    if (wordSpans.length) {
      animate(wordSpans, { opacity: [0, 1], y: [20, 0] },
        { delay: stagger(0.07, { start: 0.2 }), duration: 0.6,
          easing: [0.215, 0.61, 0.355, 1] });
    }
  }

  // Subheadline
  const sub = document.querySelector('#home p.reveal-on-scroll');
  if (sub) {
    animate(sub, { opacity: [0, 1], y: [16, 0] },
      { duration: 0.65, delay: 0.55 });
  }

  // CTA buttons
  const ctaWrap = document.querySelector('#home .flex.flex-col.sm\\:flex-row.gap-3');
  const ctaBtns = ctaWrap ? ctaWrap.querySelectorAll('button') : [];
  if (ctaBtns.length) {
    animate(ctaBtns, { scale: [0.92, 1], opacity: [0, 1] },
      { delay: stagger(0.1, { start: 0.75 }), duration: 0.5,
        easing: spring({ stiffness: 350, damping: 25 }) });
  }

  // Avatar strip
  const avatarStrip = document.querySelector('#home .pt-4.flex.items-center');
  if (avatarStrip) {
    animate(avatarStrip, { opacity: [0, 1], x: [-20, 0] },
      { duration: 0.5, delay: 0.9 });
  }

  // Laptop mockup
  const laptop = document.querySelector('#home .laptop');
  if (laptop) {
    if (isDesktop) {
      laptop.style.willChange = 'transform';
      animate(laptop, { opacity: [0, 1], y: [40, 0], rotateY: ['5deg', '0deg'] },
        { duration: 1.0, delay: 0.3, easing: [0.16, 1, 0.3, 1] });
      setTimeout(() => { laptop.style.willChange = ''; }, 1500);
    } else {
      animate(laptop, { opacity: [0, 1] }, { duration: 0.8, delay: 0.3 });
    }
  }

  // Trust bar logos
  const logoGrid = document.querySelector('#home .grid.grid-cols-5');
  if (logoGrid) {
    const logos = logoGrid.querySelectorAll('div');
    inView(logoGrid, () => {
      animate(logos, { opacity: [0, 1], x: [-16, 0] },
        { delay: stagger(0.08), duration: 0.5 });
    }, { amount: 0.3 });
  }

  // ─── 3.2 AUTHORITY CARDS ─────────────────────────────────────────────────────

  const authorityCards = document.querySelectorAll('.space-y-6 > div.rounded-3xl');
  if (authorityCards.length) {
    inView(authorityCards[0], () => {
      animate(authorityCards, { opacity: [0, 1], x: [32, 0] },
        { delay: stagger(0.13), duration: 0.65, easing: [0.215, 0.61, 0.355, 1] });
    }, { amount: 0.25 });

    if (isDesktop) {
      authorityCards.forEach(card => {
        const icon = card.querySelector('.material-symbols-outlined');
        card.addEventListener('mouseenter', () => {
          animate(card, { scale: 1.02 },
            { duration: 0.25, easing: spring({ stiffness: 400, damping: 28 }) });
          if (icon) animate(icon, { rotate: 8, scale: 1.15 },
            { duration: 0.25, easing: spring() });
        });
        card.addEventListener('mouseleave', () => {
          animate(card, { scale: 1 }, { duration: 0.2 });
          if (icon) animate(icon, { rotate: 0, scale: 1 }, { duration: 0.2 });
        });
      });
    }
  }

  // Formazione card border animate
  const formazioneCard = document.querySelector('.reveal-on-scroll.delay-300 .rounded-xl.border.border-primary\\/10');
  if (formazioneCard) {
    inView(formazioneCard, () => {
      animate(formazioneCard, { borderColor: ['rgba(29,158,117,0)', 'rgba(29,158,117,0.3)'] },
        { duration: 0.8, delay: 0.4 });
    }, { amount: 0.3 });
  }

  // ─── 3.3 METODO — progress bar + step text + dot bounce ──────────────────────

  const progressEl = document.getElementById('metodo-progress');
  if (progressEl) {
    const observer = new MutationObserver(() => {
      const target = progressEl.style.width;
      if (target) {
        animate(progressEl, { width: target },
          { duration: 0.6, easing: [0.4, 0, 0.2, 1] });
      }
    });
    observer.observe(progressEl, { attributes: true, attributeFilter: ['style'] });
  }

  // Metodo step text entrance on activateStep
  const metodoSteps = document.querySelectorAll('.metodo-step');
  metodoSteps.forEach(step => {
    const stepObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const content = entry.target.querySelectorAll('h3, p, ul');
          animate(content, { opacity: [0.4, 1], x: [12, 0] }, { duration: 0.45 });
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    stepObs.observe(step);
  });

  // Dot bounce on click
  const metodoDots = document.querySelectorAll('.metodo-dot');
  metodoDots.forEach(dot => {
    dot.addEventListener('click', () => {
      animate(dot, { scale: [1, 1.4, 1] }, { duration: 0.35, easing: spring() });
    });
  });

  // ─── 3.4 SERVIZI CARDS ───────────────────────────────────────────────────────

  const serviceCards = document.querySelectorAll('#services .rounded-3xl');
  if (serviceCards.length) {
    inView(serviceCards[0], () => {
      animate(serviceCards, { opacity: [0, 1], y: [40, 0] },
        { delay: stagger(0.1), duration: 0.6 });
    }, { amount: 0.2 });

    if (isDesktop) {
      serviceCards.forEach(card => {
        const arrowIcon = card.querySelector('.material-symbols-outlined.group-hover\\/link\\:translate-x-1');
        card.addEventListener('mouseenter', () => {
          if (arrowIcon) animate(arrowIcon, { x: 4 }, { duration: 0.2 });
        });
        card.addEventListener('mouseleave', () => {
          if (arrowIcon) animate(arrowIcon, { x: 0 }, { duration: 0.2 });
        });
      });
    }
  }

  // ─── 3.5 LOCAL / SICILY ──────────────────────────────────────────────────────

  const localSection = document.querySelector('section.bg-primary');
  if (localSection) {
    const localH2 = localSection.querySelector('h2');
    if (localH2) {
      localH2.setAttribute('aria-label', localH2.textContent.trim());
      inView(localH2, () => {
        const walker2 = document.createTreeWalker(localH2, NodeFilter.SHOW_TEXT);
        const tNodes = [];
        let n2;
        while ((n2 = walker2.nextNode())) tNodes.push(n2);
        tNodes.forEach(tn => {
          const words = tn.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          words.forEach(w => {
            if (/^\s+$/.test(w)) {
              frag.appendChild(document.createTextNode(w));
            } else if (w) {
              const span = document.createElement('span');
              span.style.display = 'inline-block';
              span.textContent = w;
              frag.appendChild(span);
            }
          });
          tn.parentNode.replaceChild(frag, tn);
        });
        const wSpans = localH2.querySelectorAll('span[style]');
        if (wSpans.length) {
          animate(wSpans, { opacity: [0, 1], y: [16, 0] },
            { delay: stagger(0.07), duration: 0.55, easing: [0.215, 0.61, 0.355, 1] });
        }
      }, { amount: 0.3 });
    }

    // NAP card entrance
    const napCard = localSection.querySelector('.lg\\:w-80');
    if (napCard) {
      inView(napCard, () => {
        animate(napCard, { opacity: [0, 1], x: [30, 0] },
          { duration: 0.6, delay: 0.3 });
      }, { amount: 0.3 });
    }

    // CTA "Vedi su Google" pulse
    const googleBtn = localSection.querySelector('a[href*="google"]');
    if (googleBtn) {
      googleBtn.style.willChange = 'transform';
      inView(googleBtn, () => {
        setTimeout(() => {
          animate(googleBtn, { scale: [1, 1.04, 1] },
            { duration: 1.4, repeat: Infinity, easing: 'ease-in-out' });
        }, 1500);
      }, { amount: 0.5 });
    }
  }

  // ─── 3.6 FAQ ACCORDION ───────────────────────────────────────────────────────

  const faqDetails = document.querySelectorAll('#faq details');

  // Entrance
  if (faqDetails.length) {
    inView(faqDetails[0], () => {
      animate(faqDetails, { opacity: [0, 1], y: [20, 0] },
        { delay: stagger(0.08), duration: 0.5 });
    }, { amount: 0.1 });
  }

  // Animated open/close
  faqDetails.forEach(details => {
    const body = details.querySelector('.px-6.pb-6');
    if (!body) return;

    details.addEventListener('toggle', () => {
      if (details.open) {
        body.style.overflow = 'hidden';
        const h = body.scrollHeight;
        animate(body, { opacity: [0, 1], height: ['0px', h + 'px'] },
          { duration: 0.3, easing: [0.4, 0, 0.2, 1] });
        setTimeout(() => { body.style.overflow = ''; body.style.height = ''; }, 320);
      } else {
        body.style.overflow = 'hidden';
        const h = body.scrollHeight;
        animate(body, { opacity: [1, 0], height: [h + 'px', '0px'] },
          { duration: 0.25 });
        setTimeout(() => { body.style.overflow = ''; body.style.height = ''; }, 270);
      }
    });
  });

  // ─── 3.7 BLOG CARDS ──────────────────────────────────────────────────────────

  const blogSection = document.getElementById('blog');
  if (blogSection) {
    const blogCards = blogSection.querySelectorAll('a[href]');
    if (blogCards.length) {
      inView(blogCards[0], () => {
        animate(blogCards, { opacity: [0, 1], y: [30, 0] },
          { delay: stagger(0.1), duration: 0.6 });
      }, { amount: 0.15 });
    }
  }

  // ─── 3.8 HEADER SCROLL ───────────────────────────────────────────────────────

  const header = document.querySelector('.glass-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 80);
    }, { passive: true });
  }

});
