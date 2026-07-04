/* main.js — Lenis + ScrollTrigger + MotionPath setup, fixed chrome,
   section modules. Everything else hangs off what's wired here. */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');
  var ctx = { reduced: reduced };

  /* ---------- Lenis smooth scroll, synced to ScrollTrigger ---------- */
  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis; // handy for debugging / console scroll control
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToHash(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Preloader: 0→100 counter, then reveal ---------- */
  var pre = document.getElementById('preloader');
  if (reduced) {
    pre.remove();
  } else {
    var num = { n: 0 };
    var preTl = gsap.timeline({ onComplete: function () { pre.remove(); ScrollTrigger.refresh(); } });
    preTl.from('.pre-title', { yPercent: 110, duration: 0.9, ease: 'power3.out' }, 0.1)
      .from('.pre-sub', { autoAlpha: 0, duration: 0.6 }, 0.6)
      .to(num, {
        n: 100, duration: 1.6, ease: 'power1.inOut', snap: { n: 1 },
        onUpdate: function () { document.getElementById('preNum').textContent = num.n; }
      }, 0.2)
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.25');
  }

  /* ---------- Menu overlay ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menuClose = document.getElementById('menuClose');
  var overlay = document.getElementById('menuOverlay');
  var menuLinks = overlay.querySelectorAll('.menu-list a');

  function setMenu(open) {
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) {
      if (!reduced) {
        gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
        gsap.fromTo(menuLinks, { yPercent: 110 }, {
          yPercent: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1
        });
      }
      menuLinks[0].focus();
    } else {
      menuBtn.focus();
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(true); });
  menuClose.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) setMenu(false);
  });

  /* ---------- All in-page anchors go through Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (overlay.classList.contains('open')) setMenu(false);
      scrollToHash(a.getAttribute('href'));
    });
  });

  /* ---------- Breadcrumb + background cross-fade + chrome inversion ---------- */
  var crumb = document.getElementById('crumb');
  var named = gsap.utils.toArray('[data-name]');

  function applySection(section) {
    // breadcrumb cross-fade
    if (crumb.textContent !== section.dataset.name) {
      gsap.to(crumb, {
        autoAlpha: 0, y: -6, duration: 0.18, overwrite: 'auto', onComplete: function () {
          crumb.textContent = section.dataset.name;
          gsap.fromTo(crumb, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.18 });
        }
      });
    }
    // page background fades toward the section's color (visible in the
    // rounded-corner gaps and on dark sections)
    gsap.to('body', { backgroundColor: section.dataset.bg, duration: 0.6, overwrite: 'auto' });
    document.body.classList.toggle('light', section.dataset.mode === 'light');
  }

  // Boundary pattern (enter / leaveBack) instead of an active window — this
  // stays correct across pinned sections whose spacers stretch the layout.
  named.forEach(function (section, i) {
    ScrollTrigger.create({
      trigger: section, start: 'top 55%',
      onEnter: function () { applySection(section); },
      onLeaveBack: function () { applySection(named[Math.max(0, i - 1)]); }
    });
  });

  /* ---------- Thin scroll-progress indicator ---------- */
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      gsap.set('#progressBar', { scaleX: self.progress });
    }
  });

  /* ---------- Split headings into words + staggered reveal ---------- */
  document.querySelectorAll('.split').forEach(function (el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="w"><span class="wi">' + w + '</span></span>';
    }).join(' ');
    if (reduced) return;
    var words = el.querySelectorAll('.wi');
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: function () {
        gsap.to(words, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' });
      }
    });
  });

  /* ---------- Hero + storytelling (ball.js / storytelling.js) ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 769px)', function () {
    window.initHero(ctx);
  });
  mm.add('(max-width: 768px)', function () {
    // mobile: no kinetic scrub — park the sentences readably
    gsap.set('.hero-line', { position: 'relative', top: 'auto', bottom: 'auto', x: 0, margin: '1rem 1.25rem' });
  });
  window.initStory(ctx);

  /* ---------- Scenario showcase: pinned horizontal slider (desktop) ---------- */
  mm.add('(min-width: 769px)', function () {
    if (reduced) return;
    var track = document.querySelector('.scenario-track');
    gsap.to(track, {
      x: function () { return -(track.scrollWidth - window.innerWidth + 120); },
      ease: 'none',
      scrollTrigger: {
        trigger: '#scenarios', start: 'top top', pin: true, scrub: 0.5,
        refreshPriority: 1, // compute the pin spacer before section triggers below it
        end: function () { return '+=' + (track.scrollWidth - window.innerWidth + 120); },
        invalidateOnRefresh: true
      }
    });
  });

  /* ---------- Two types: contrast reveal ---------- */
  if (!reduced) {
    gsap.set('.type-neg', { x: -80, autoAlpha: 0 });
    gsap.set('.type-pos', { x: 80, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: '.types-grid', start: 'top 75%', once: true,
      onEnter: function () {
        gsap.to('.type-neg, .type-pos', { x: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.15 });
      }
    });
  }

  /* ---------- Concept demos: build each timeline, scrub it to scroll ---------- */
  document.querySelectorAll('.demo-scroll').forEach(function (wrap) {
    var svg = wrap.querySelector('.demo-svg');
    var build = window.DEMOS && window.DEMOS[svg.dataset.demo];
    if (!build) return;
    var tl = build(svg);
    tl.pause();
    if (reduced) { tl.progress(1); return; } // show the idea's final state
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom',
      scrub: 0.6, animation: tl
    });
  });

  /* ---------- Resources arrow draws itself ---------- */
  if (!reduced) {
    ScrollTrigger.create({
      trigger: '#resources', start: 'top 70%', once: true,
      onEnter: function () {
        gsap.to('.arrow-art', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
      }
    });
  }

  /* ---------- Idle attract/repel breathing on ambient peer dots ---------- */
  if (!reduced) {
    gsap.utils.toArray('.hero-peer, .story-peer, .belong-cluster .peer, .drift-field .peer')
      .forEach(function (p, i) {
        gsap.to(p, {
          y: '+=' + (6 + (i % 3) * 3), duration: 1.4 + (i % 5) * 0.3,
          yoyo: true, repeat: -1, ease: 'sine.inOut'
        });
      });
  }

  /* ---------- Custom cursor ---------- */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var cursor = document.getElementById('cursor');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power2.out' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power2.out' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX - 9); cy(e.clientY - 9); });
    document.addEventListener('mouseover', function (e) {
      cursor.classList.toggle('grow', !!e.target.closest('a, button'));
    });
  }

  /* ---------- Tiny Lottie: pulsing ring on the scroll hint ---------- */
  if (window.lottie && document.getElementById('hintLottie')) {
    lottie.loadAnimation({
      container: document.getElementById('hintLottie'),
      renderer: 'svg', loop: true, autoplay: !reduced,
      // minimal inline animation: a ring that grows and fades (no .json asset)
      animationData: {
        v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'pulse', ddd: 0, assets: [],
        layers: [{
          ddd: 0, ind: 1, ty: 4, nm: 'ring', sr: 1,
          ks: {
            o: { a: 1, k: [{ t: 0, s: [80] }, { t: 60, s: [0] }] },
            r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] },
            s: { a: 1, k: [{ t: 0, s: [30, 30, 100] }, { t: 60, s: [100, 100, 100] }] }
          },
          ao: 0,
          shapes: [{
            ty: 'gr', it: [
              { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [80, 80] } },
              { ty: 'st', c: { a: 0, k: [0.97, 0.96, 0.94, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 6 } },
              { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }],
          ip: 0, op: 60, st: 0
        }]
      }
    });
  }

  /* ---------- Keep trigger math honest once web fonts arrive ---------- */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
