/* =============================================================
   Christian De Asis — Portfolio interactions
   Vanilla, performant, reduced-motion aware
   ============================================================= */
(function () {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Theme ---------- */
  const THEME_KEY = 'cda-theme';
  const root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }
  (function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved || 'dark');
  })();
  function bindTheme() {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cur = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        applyTheme(cur === 'light' ? 'dark' : 'light');
      });
    });
  }

  /* ---------- Nav: scroll state + hide on scroll down ---------- */
  function bindNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    let last = 0;
    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 24);
      if (y > 400 && y > last + 4) nav.classList.add('hidden');
      else if (y < last - 4 || y < 200) nav.classList.remove('hidden');
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function bindMenu() {
    const btn = document.querySelector('[data-menu-btn]');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;
    function close() { menu.classList.remove('open'); btn.classList.remove('open'); document.body.style.overflow = ''; }
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Scroll progress ---------- */
  function bindProgress() {
    const bar = document.querySelector('.progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Reveal on scroll (rect-based, rAF/IO-independent) ---------- */
  function revealEl(el) {
    if (el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'in');
    if (el.hasAttribute('data-reveal-clip')) el.setAttribute('data-reveal-clip', 'in');
  }
  function bindReveal() {
    let els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-reveal-clip]'));
    if (prefersReduced) { els.forEach(revealEl); return; }
    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = els.length - 1; i >= 0; i--) {
        const r = els[i].getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > -40) { revealEl(els[i]); els.splice(i, 1); }
      }
    }
    let ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { check(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();                                   // synchronous first pass (above-the-fold)
    setTimeout(check, 200);                    // settle after fonts/layout
    // failsafe: never leave content stuck hidden if frames are throttled
    setTimeout(() => { els.slice().forEach(revealEl); els.length = 0; }, 2600);
  }

  /* ---------- Stagger children helper ---------- */
  function applyStagger() {
    document.querySelectorAll('[data-stagger]').forEach((parent) => {
      const step = parseFloat(parent.getAttribute('data-stagger')) || 0.08;
      Array.from(parent.children).forEach((child, i) => {
        if (child.hasAttribute('data-reveal') || child.hasAttribute('data-reveal-clip')) {
          child.style.setProperty('--reveal-delay', (i * step).toFixed(2) + 's');
        }
      });
    });
  }

  /* ---------- Count up (rect-based) ---------- */
  function animateCount(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    const dur = 1400; const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  function bindCounters() {
    let els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    if (prefersReduced) { els.forEach((el) => el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '')); return; }
    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = els.length - 1; i >= 0; i--) {
        const r = els[i].getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > 0) { animateCount(els[i]); els.splice(i, 1); }
      }
    }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { check(); ticking = false; });
    }, { passive: true });
    check();
    setTimeout(() => { els.slice().forEach((el) => { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); }); }, 2800);
  }

  /* ---------- Magnetic buttons ---------- */
  function bindMagnetic() {
    if (isTouch || prefersReduced) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.getAttribute('data-magnetic')) || 0.4;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * strength).toFixed(2) + 'px,' + (y * strength).toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Project spotlight (pointer-follow glow) ---------- */
  function bindSpotlight() {
    if (isTouch) return;
    document.querySelectorAll('.project').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  function bindCursor() {
    if (isTouch || prefersReduced) return;
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();
    const hov = 'a, button, [data-magnetic], input, textarea, .project, .channel';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(hov)) ring.classList.add('is-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(hov)) ring.classList.remove('is-hover'); });
  }

  /* ---------- Scrollspy for nav ---------- */
  function bindScrollSpy() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = {};
    links.forEach((l) => { map[l.getAttribute('href').slice(1)] = l; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          if (map[e.target.id]) map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Hero prompt typing ---------- */
  function bindPromptType() {
    const el = document.querySelector('[data-type]');
    if (!el) return;
    const full = el.getAttribute('data-type');
    if (prefersReduced) { el.textContent = full; return; }
    el.textContent = '';
    let i = 0;
    function step() {
      if (i <= full.length) { el.textContent = full.slice(0, i); i++; setTimeout(step, 45 + Math.random() * 40); }
    }
    setTimeout(step, 900);
  }

  /* ---------- Contact form ---------- */
  function bindForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const status = form.querySelector('.form-status');
    function setInvalid(field, on) { field.classList.toggle('invalid', on); }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const msg = form.querySelector('#message');
      const nameF = name.closest('.field'), emailF = email.closest('.field'), msgF = msg.closest('.field');
      if (!name.value.trim()) { setInvalid(nameF, true); ok = false; } else setInvalid(nameF, false);
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) { setInvalid(emailF, true); ok = false; } else setInvalid(emailF, false);
      if (msg.value.trim().length < 10) { setInvalid(msgF, true); ok = false; } else setInvalid(msgF, false);
      if (!ok) { status.textContent = '// please fix the highlighted fields'; status.style.color = 'oklch(0.7 0.18 25)'; return; }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…';
      status.style.color = ''; status.textContent = '';
      setTimeout(() => {
        form.classList.add('success');
        btn.textContent = 'Message sent ✓';
        status.textContent = '// thanks, ' + name.value.trim().split(' ')[0] + " — I'll reply within 24h.";
        form.reset();
        setTimeout(() => { btn.disabled = false; btn.textContent = btn.dataset.label; }, 2600);
      }, 1100);
    });
    form.querySelectorAll('input, textarea').forEach((inp) => {
      inp.addEventListener('input', () => inp.closest('.field').classList.remove('invalid'));
    });
  }

  /* ---------- Lightbox (click a screenshot to enlarge / view actual size) ---------- */
  function bindLightbox() {
    const shots = Array.prototype.slice.call(document.querySelectorAll('.shot'))
      .filter((img) => !img.closest('a'));            // skip shots that are navigation links (homepage cards)
    if (!shots.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">×</button>' +
      '<figure class="lightbox-fig"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(overlay);
    const lbImg = overlay.querySelector('img');
    const lbCap = overlay.querySelector('figcaption');
    const closeBtn = overlay.querySelector('.lightbox-close');
    let lastFocus = null;

    function open(img) {
      lastFocus = document.activeElement;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = img.alt || '';
      overlay.classList.remove('zoomed');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      overlay.classList.remove('open', 'zoomed');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    shots.forEach((img) => {
      img.classList.add('zoomable');
      const canvas = img.closest('.mockup-canvas') || img.parentElement;
      if (canvas && !canvas.querySelector('.zoom-hint')) {
        const hint = document.createElement('span');
        hint.className = 'zoom-hint';
        hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2M11 8.5v5M8.5 11h5"/></svg>Enlarge';
        canvas.appendChild(hint);
      }
      img.addEventListener('click', () => open(img));
    });

    lbImg.addEventListener('click', (e) => { e.stopPropagation(); overlay.classList.toggle('zoomed'); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    overlay.addEventListener('click', close);          // click backdrop closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  /* ---------- Year ---------- */
  function setYear() { document.querySelectorAll('[data-year]').forEach((e) => e.textContent = new Date().getFullYear()); }

  /* ---------- Init ---------- */
  function init() {
    bindTheme(); bindNav(); bindMenu(); bindProgress();
    applyStagger(); bindReveal(); bindCounters();
    bindMagnetic(); bindSpotlight(); bindCursor();
    bindScrollSpy(); bindPromptType(); bindForm(); bindLightbox(); setYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
