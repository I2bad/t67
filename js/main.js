/* main.js — Lenis + ScrollTrigger + MotionPath setup, fixed chrome,
   section modules, and the shared motion baseline (velocity skew, parallax,
   magnetic hovers, cursor). Everything else hangs off what's wired here.
   Eases come from js/ease-tokens.js (EASE.*) — no stock eases for motion. */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);

  var reduced = QUALITY.reduced;
  if (reduced) document.documentElement.classList.add('reduced');
  var ctx = { reduced: reduced };

  /* ---------- Lenis smooth scroll, synced to ScrollTrigger ----------
     Slightly higher inertia than default for weight; single RAF: lenis,
     physics and WebGL all run off gsap.ticker. */
  var lenis = null;
  if (!reduced) {
    // Hardening: if Lenis fails to construct (a blocked CDN script, a hostile
    // extension, etc.) this must NOT throw here — a synchronous throw at
    // top-level would abort every statement below it in this file, including
    // all the hash-nav/menu/section wiring. Native browser scroll still works
    // with lenis === null; ScrollTrigger just reads the native scrollY.
    try {
      lenis = new Lenis({
        duration: 1.35,
        easing: function (t) { return 1 - Math.pow(1 - t, 3.4); },
        smoothWheel: true
      });
      window.__lenis = lenis; // handy for debugging / console scroll control
      lenis.on('scroll', ScrollTrigger.update);
      var lastRaf = performance.now();
      function rafTick(time) {
        // one bad frame inside Lenis must never permanently wedge scrolling —
        // catch so gsap.ticker keeps calling this every subsequent frame
        try { lenis.raf(time * 1000); lastRaf = performance.now(); } catch (err) { if (window.console) console.error('lenis raf', err); }
      }
      gsap.ticker.add(rafTick);
      gsap.ticker.lagSmoothing(0);

      // Watchdog: the whole site's scroll depends on this RAF loop landing
      // every frame. Battery-saver throttling, a backgrounded tab's paused
      // rAF, or a heavy main-thread stall can all starve it. If real wheel
      // input arrives but Lenis hasn't ticked in ~200ms, stop trusting it —
      // destroy it and let native scroll (which ScrollTrigger already listens
      // to independently) take over. Passive listener: never blocks the wheel.
      // Must remove rafTick from the ticker too, or it keeps calling
      // lenis.raf() on a destroyed instance every frame forever.
      var watchdogDone = false;
      function lenisWatchdog() {
        if (watchdogDone || !lenis) return;
        if (performance.now() - lastRaf > 200) {
          watchdogDone = true;
          if (window.console) console.warn('Lenis raf stalled — falling back to native scroll');
          gsap.ticker.remove(rafTick);
          try { lenis.destroy(); } catch (e) {}
          lenis = null; window.__lenis = null;
          window.removeEventListener('wheel', lenisWatchdog);
        }
      }
      window.addEventListener('wheel', lenisWatchdog, { passive: true });
    } catch (err) {
      lenis = null;
      if (window.console) console.error('Lenis init failed — falling back to native scroll', err);
    }
  }

  var hashScrollTimer = null, lastHashRefresh = 0;
  function getTargetScrollTop(target) {
    return Math.max(0, window.pageYOffset + target.getBoundingClientRect().top);
  }
  function scrollToHash(hash, opts) {
    var target = document.querySelector(hash);
    if (!target) return;
    opts = opts || {};
    // Pins above (scenarios) and lazy media can stale the measurements, which
    // lands us on the wrong section. Refresh, then wait a frame so the
    // refreshed pin spacers are reflected before we resolve the target top.
    if (hashScrollTimer) cancelAnimationFrame(hashScrollTimer);
    // refresh() is a full reflow — throttle it so rapid menu clicks can't stack
    // reflows and freeze the renderer. Once every 700ms keeps offsets honest.
    var now = performance.now();
    if (now - lastHashRefresh > 700) {
      if (ScrollTrigger.clearScrollMemory) ScrollTrigger.clearScrollMemory();
      ScrollTrigger.refresh();
      lastHashRefresh = now;
    }
    hashScrollTimer = requestAnimationFrame(function () {
      hashScrollTimer = requestAnimationFrame(function () {
        var top = getTargetScrollTop(target);
        var immediate = !!opts.immediate;
        if (immediate && lenis) {
          lenis.scrollTo(top, { immediate: true, force: true });
          applySection(target, { silent: true });
          ScrollTrigger.update();
        } else if (immediate || !lenis) {
          window.scrollTo({ top: top, behavior: immediate ? 'auto' : 'smooth' });
        } else {
          lenis.scrollTo(top, {
            duration: 1.6,
            easing: function (t) { return 1 - Math.pow(1 - t, 4); }
          });
        }
      });
    });
  }
  function syncHashFromLocation(opts) {
    if (location.hash.length > 1) scrollToHash(location.hash, opts);
  }
  // Direct hash edits / back-forward navigation (anchor clicks are handled below
  // and go through scrollToHash too).
  window.addEventListener('hashchange', function () {
    syncHashFromLocation({ immediate: false });
  });
  var resizeHashTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeHashTimer);
    resizeHashTimer = setTimeout(function () {
      syncHashFromLocation({ immediate: true });
    }, 180);
  });

  /* ---------- Split helpers (words for lines, chars for display type) ---------- */
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="w"><span class="wi">' + w + '</span></span>';
    }).join(' ');
    return el.querySelectorAll('.wi');
  }
  // Char split that preserves child-element styling (e.g. the .pre-dot span)
  function splitChars(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split('').forEach(function (ch) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) walk(child);
      });
    })(el);
    return el.querySelectorAll('.ch');
  }

  /* ---------- Preloader: 0→100 counter, char-by-char title, parallax exit ---------- */
  var pre = document.getElementById('preloader');
  if (reduced) {
    pre.remove();
  } else {
    var chars = splitChars(document.querySelector('.pre-title'));
    gsap.set(chars, { display: 'inline-block', yPercent: 120, rotation: 8, filter: 'blur(6px)' });
    var num = { n: 0 };
    var preTl = gsap.timeline({ onComplete: function () { pre.remove(); ScrollTrigger.refresh(); } });
    preTl.to(chars, {
      yPercent: 0, rotation: 0, filter: 'blur(0px)', duration: 1.1, ease: EASE.out,
      stagger: { each: 0.04, ease: EASE.soft }
    }, 0.15)
      .from('.pre-sub', { autoAlpha: 0, y: 14, duration: 0.9, ease: EASE.out }, 0.8) // follow-through
      .to(num, {
        n: 100, duration: 1.9, ease: EASE.inOut, snap: { n: 1 },
        onUpdate: function () { document.getElementById('preNum').textContent = num.n; }
      }, 0.2)
      // anticipation: the panel breathes up a touch before committing to exit
      .to(pre, { yPercent: 1.2, duration: 0.25, ease: EASE.soft }, '+=0.15')
      .to(pre, { yPercent: -100, duration: 1.1, ease: EASE.inOut }, '<0.2')
      // title trails the panel a few frames — follow-through on the exit
      .to('.pre-title', { yPercent: 55, duration: 1.1, ease: EASE.inOut }, '<0.06');
  }

  /* ---------- Menu overlay: clip wipe + staggered rotate-in links ---------- */
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
        gsap.fromTo(overlay,
          { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 1 },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: EASE.inOut });
        gsap.fromTo(menuLinks, { yPercent: 120, rotation: 5 }, {
          yPercent: 0, rotation: 0, duration: 0.9, ease: EASE.out,
          stagger: { each: 0.055, ease: EASE.soft }, delay: 0.25
        });
        gsap.fromTo('.menu-foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.7 });
      }
      menuLinks[0].focus();
    } else {
      if (!reduced) gsap.to(overlay, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: EASE.inOut });
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
      var href = a.getAttribute('href');
      if (history.pushState) history.pushState(null, '', href);
      else location.hash = href;
      scrollToHash(href, { immediate: false });
    });
  });

  /* ---------- Breadcrumb + background cross-fade + chrome inversion ---------- */
  var crumb = document.getElementById('crumb');
  var named = gsap.utils.toArray('[data-name]');

  function applySection(section, opts) {
    opts = opts || {};
    // breadcrumb cross-fade with a little motion blur
    if (crumb.textContent !== section.dataset.name) {
      gsap.to(crumb, {
        autoAlpha: 0, y: -8, filter: 'blur(3px)', duration: 0.22, ease: EASE.in,
        overwrite: 'auto', onComplete: function () {
          crumb.textContent = section.dataset.name;
          gsap.fromTo(crumb, { autoAlpha: 0, y: 8, filter: 'blur(3px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.35, ease: EASE.out });
        }
      });
      if (!opts.silent && window.AUDIO) AUDIO.whoosh();
    }
    // page background fades toward the section's color (visible in the
    // rounded-corner gaps and on dark sections); shader layer follows
    gsap.to('body', { backgroundColor: section.dataset.bg, duration: 0.9, ease: EASE.soft, overwrite: 'auto' });
    if (window.BG) BG.setColor(section.dataset.bg);
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
    onUpdate: function (self) { gsap.set('#progressBar', { scaleX: self.progress }); }
  });

  /* ---------- Split headings: masked word reveal with rotation + settle ---------- */
  document.querySelectorAll('.split').forEach(function (el) {
    var words = splitWords(el);
    if (reduced) return;
    gsap.set(words, { yPercent: 115, rotation: 6, transformOrigin: '0% 100%' });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: function () {
        gsap.to(words, {
          yPercent: 0, rotation: 0, duration: 1.1, ease: EASE.out,
          stagger: { each: 0.06, ease: EASE.soft }
        });
      }
    });
  });

  /* ---------- Giant heading: char-by-char with blur-in ---------- */
  (function () {
    var giant = document.querySelector('.giant-heading');
    if (!giant || reduced) return;
    // .split already wrapped words; split those words into chars
    var chars = [];
    giant.querySelectorAll('.wi').forEach(function (w) { chars = chars.concat(Array.prototype.slice.call(splitChars(w))); });
    gsap.set(chars, { display: 'inline-block', yPercent: 120, rotation: 10, filter: 'blur(8px)' });
    gsap.set(giant.querySelectorAll('.wi'), { yPercent: 0, rotation: 0 }); // chars take over from the word tween
    ScrollTrigger.create({
      trigger: giant, start: 'top 80%', once: true,
      onEnter: function () {
        gsap.to(chars, {
          yPercent: 0, rotation: 0, filter: 'blur(0px)', duration: 1.2, ease: EASE.out,
          stagger: { each: 0.035, ease: EASE.soft }
        });
      }
    });
  })();

  /* ---------- Concept header choreography: overlap & follow-through ----------
     Numeral lands first, description arrives a beat later, the deco diamond
     spins in last with a pop — nothing enters alone or all at once. */
  if (!reduced) {
    document.querySelectorAll('.concept').forEach(function (section) {
      var num = section.querySelector('.concept-num');
      var desc = section.querySelector('.concept-desc');
      var deco = section.querySelector('.deco');
      if (num) gsap.set(num, { yPercent: 40, autoAlpha: 0, rotation: -6 });
      if (desc) gsap.set(desc, { y: 36, autoAlpha: 0 });
      if (deco) gsap.set(deco, { scale: 0, rotation: -120, transformOrigin: '50% 50%' });
      ScrollTrigger.create({
        trigger: section, start: 'top 70%', once: true,
        onEnter: function () {
          var tl = gsap.timeline();
          if (num) tl.to(num, { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 1.2, ease: EASE.out }, 0);
          if (desc) tl.to(desc, { y: 0, autoAlpha: 1, duration: 1.0, ease: EASE.out }, 0.18);
          if (deco) tl.to(deco, { scale: 1, rotation: 0, duration: 0.9, ease: EASE.pop }, 0.35);
        }
      });
    });
  }

  /* ---------- Parallax depth layers inside concept panels ---------- */
  if (!reduced) {
    document.querySelectorAll('.concept').forEach(function (section) {
      var num = section.querySelector('.concept-num');
      if (num) gsap.to(num, {
        yPercent: -22, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
      var deco = section.querySelector('.deco');
      if (deco) gsap.to(deco, {
        y: 140, rotation: 60, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.4 }
      });
    });
    gsap.to('.res-arrow', {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: '#resources', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  }

  /* ---------- Scroll-velocity skew: big elements lean with momentum ---------- */
  if (!reduced) {
    var skewTargets = gsap.utils.toArray('.hero-line, .scenario-track, .concept-title, .showsup, .giant-heading, .section-heading');
    var skewNow = 0;
    gsap.ticker.add(function () {
      if (!lenis) return;
      var target = gsap.utils.clamp(-4.5, 4.5, (lenis.velocity || 0) * 0.16);
      skewNow += (target - skewNow) * 0.09; // eased approach, eased release
      if (Math.abs(skewNow) < 0.02 && target === 0) return;
      gsap.set(skewTargets, { skewY: skewNow });
    });
  }

  /* ---------- Quality-gated layers: WebGL background + hero physics ----------
     Booted BEFORE initHero so ball.js knows whether physics owns the ball. */
  function bootLayers(tier) {
    if (reduced) return;
    // Hardening: WebGL/Matter.js init can throw on odd GPU/driver combos —
    // that must stay contained here, never abort the rest of this script
    // (initHero/initStory/menu/hash-nav all run AFTER this call).
    try {
      if (tier !== 'low' && window.initBackgroundGL && !window.BG) {
        window.BG = window.initBackgroundGL(tier);
      }
      if (tier === 'high' && window.initHeroPhysics && !window.PHYSICS && !QUALITY.mobile) {
        window.PHYSICS = window.initHeroPhysics();
      }
    } catch (err) {
      if (window.console) console.error('bootLayers failed — continuing without WebGL/physics', err);
    }
  }
  bootLayers(QUALITY.tier);
  QUALITY.on(function (tier) {
    // dropping a tier: tear down what no longer belongs
    if (tier !== 'high' && window.PHYSICS) { PHYSICS.destroy(); window.PHYSICS = null; }
    if (tier === 'low' && window.BG) { BG.destroy(); window.BG = null; }
  });

  /* ---------- Hero + storytelling (ball.js / storytelling.js) ----------
     Hardening: matchMedia invokes this callback SYNCHRONOUSLY when the query
     already matches, as a plain statement in this IIFE — an uncaught throw
     here would abort everything below (magnetic hovers, cursor, zoom
     transition, font-ready refresh). A half-built scrub timeline can also
     leave the sticky course frozen on one frame for its whole scroll range,
     which reads exactly like "scroll stopped working" even though it hasn't. */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 769px)', function () {
    try { window.initHero(ctx); } catch (err) { if (window.console) console.error('initHero failed', err); }
  });
  mm.add('(max-width: 768px)', function () {
    // mobile: no kinetic scrub — park the sentences readably
    gsap.set('.hero-line', { position: 'relative', top: 'auto', bottom: 'auto', x: 0, margin: '1rem 1.25rem' });
  });
  try { window.initStory(ctx); } catch (err) { if (window.console) console.error('initStory failed', err); }

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
    // depth inside the slider: captions trail their cards slightly
    gsap.utils.toArray('.scenario-card figcaption').forEach(function (cap, i) {
      gsap.from(cap, {
        x: 60 + i * 8, ease: 'none',
        scrollTrigger: { trigger: '#scenarios', start: 'top top', end: '+=1200', scrub: 1.1 }
      });
    });
  });

  /* ---------- Two types: contrast reveal with overlap ---------- */
  if (!reduced) {
    gsap.set('.type-neg', { x: -90, rotation: -2, autoAlpha: 0 });
    gsap.set('.type-pos', { x: 90, rotation: 2, autoAlpha: 0 });
    gsap.set('.types-note', { autoAlpha: 0, y: 20 });
    // diagram start states (both balls sit on their line; peers offstage)
    gsap.set('.tn-peer', { x: -60, autoAlpha: 0 });
    gsap.set('.tp-peer', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(['.tn-ball', '.tp-ball'], { transformOrigin: '50% 50%' });
    ScrollTrigger.create({
      trigger: '.types-grid', start: 'top 75%', once: true,
      onEnter: function () {
        gsap.timeline()
          .to('.type-neg', { x: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: EASE.out }, 0)
          .to('.type-pos', { x: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: EASE.out }, 0.14)
          .to('.types-note', { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE.out }, 0.55)
          // NEGATIVE: pink peers crowd in, shove the ball down off its line;
          // a dashed ghost marks where it should have stayed
          .to('.tn-peer', { x: 0, autoAlpha: 1, duration: 0.8, ease: EASE.pop, stagger: 0.08 }, 0.7)
          .to('.tn-ghost', { autoAlpha: 1, duration: 0.6, ease: EASE.soft }, 1.5)
          .to('.tn-ball', { scaleX: 1.25, scaleY: 0.78, duration: 0.14, ease: EASE.in }, 1.55)
          .to('.tn-ball', { y: 64, duration: 0.9, ease: EASE.out }, 1.6)
          .to('.tn-ball', { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 1.7)
          // POSITIVE: green peers ahead pull the ball further ALONG the line
          .to('.tp-peer', { scale: 1, autoAlpha: 1, duration: 0.7, ease: EASE.pop, stagger: 0.1 }, 0.85)
          .to('.tp-ball', { x: 96, duration: 1.4, ease: EASE.inOut }, 1.3)
          .to('.tp-ball', { scaleX: 1.12, scaleY: 0.9, duration: 0.22, yoyo: true, repeat: 1, ease: EASE.soft }, 2.4)
          .to('.tp-peer', { scale: 1.12, duration: 0.5, yoyo: true, repeat: 1, ease: EASE.soft, stagger: 0.06 }, 2.6);
      }
    });
  }

  // Two Faces cards: eyes act, not decorate. Negative-side peers stare at the
  // ball; positive-side peers look the direction it's travelling. Static gaze
  // (also renders under reduced motion). Eyes track actor opacity as peers fade in.
  if (window.ILLO && ILLO.faces) {
    var negSvg = document.querySelector('.type-neg .type-art');
    var posSvg = document.querySelector('.type-pos .type-art');
    var toArr = function (nl) { return Array.prototype.slice.call(nl); };
    if (negSvg) ILLO.faces(negSvg, null, [
      { el: negSvg.querySelector('.tn-ball'), r: 22, tone: 'ink', look: [-0.5, 0.3] }
    ].concat(toArr(negSvg.querySelectorAll('.tn-peer')).map(function (p) {
      return { el: p, r: +p.getAttribute('r'), tone: 'ink', look: [1, 0] };
    })));
    if (posSvg) ILLO.faces(posSvg, null, [
      { el: posSvg.querySelector('.tp-ball'), r: 22, tone: 'ink', look: [1, 0] }
    ].concat(toArr(posSvg.querySelectorAll('.tp-peer')).map(function (p) {
      return { el: p, r: +p.getAttribute('r'), tone: 'ink', look: [1, 0] };
    })));
  }

  /* ---------- Concept demos: build each timeline, scrub it to scroll ---------- */
  document.querySelectorAll('.demo-scroll').forEach(function (wrap) {
    var svg = wrap.querySelector('.demo-svg');
    var build = window.DEMOS && window.DEMOS[svg.dataset.demo];
    if (!build) return;
    // top-down setting behind the actors (static props); built before the demo
    // so it sits at the back of the paint order
    if (window.ILLO && ILLO.diorama) ILLO.diorama(svg, svg.dataset.demo);
    var tl = build(svg);
    tl.pause();
    if (reduced) { tl.progress(1); return; } // show the idea's final state
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom',
      scrub: 0.6, animation: tl
    });
    // subtle depth: the prop layer parallaxes a touch against the actors
    // (skip on low tier — props stay, motion drops)
    if (QUALITY.tier !== 'low') {
      var dio = svg.querySelector('.diorama');
      if (dio) gsap.fromTo(dio, { y: -14 }, {
        y: 14, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    }
  });

  /* ---------- Resources arrow draws itself ---------- */
  if (!reduced) {
    ScrollTrigger.create({
      trigger: '#resources', start: 'top 70%', once: true,
      onEnter: function () {
        gsap.to('.arrow-art', { strokeDashoffset: 0, duration: 1.6, ease: EASE.inOut });
      }
    });
  }

  /* ---------- Idle attract/repel breathing on ambient peer dots ---------- */
  if (!reduced) {
    gsap.utils.toArray('.hero-peer, .story-peer, .belong-cluster .peer, .drift-field .peer')
      .forEach(function (p, i) {
        gsap.to(p, {
          y: '+=' + (6 + (i % 3) * 3), duration: 1.6 + (i % 5) * 0.35,
          yoyo: true, repeat: -1, ease: EASE.soft
        });
      });
  }

  /* ---------- Magnetic hovers: pills/buttons ease toward the cursor ---------- */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    gsap.utils.toArray('.pill, .round-btn, .menu-list a, .see').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.45, ease: EASE.soft });
      var qy = gsap.quickTo(el, 'y', { duration: 0.45, ease: EASE.soft });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.3);
        qy((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE.pop, overwrite: 'auto' });
      });
    });
  }

  /* ---------- Custom cursor: trailing lerp, hover labels, velocity squash ---------- */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var cursor = document.getElementById('cursor');
    var label = document.createElement('span');
    label.className = 'cursor-label';
    cursor.appendChild(label);
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: EASE.soft });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: EASE.soft });
    var lastX = 0, lastY = 0, lastT = performance.now();
    window.addEventListener('mousemove', function (e) {
      cx(e.clientX - 9); cy(e.clientY - 9);
      // directional squash from pointer speed — released with a soft tween
      var now = performance.now(), dt = Math.max(8, now - lastT);
      var speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt; // px/ms
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      // no squash while hovering something — the grown labeled state stays calm
      var s = cursor.classList.contains('grow') ? 0 : Math.min(0.35, speed * 0.18);
      gsap.to(cursor, {
        scaleX: 1 + s, scaleY: 1 - s * 0.7,
        rotation: s ? (Math.atan2(e.movementY, e.movementX) * 180 / Math.PI) : 0,
        duration: 0.3, ease: EASE.soft, overwrite: 'auto'
      });
      if (window.BG) BG.setMouse(e.clientX, e.clientY);
      if (window.PHYSICS) PHYSICS.setMouse(e.clientX, e.clientY);
    });
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('a, button, [data-cursor]');
      cursor.classList.toggle('grow', !!target);
      var text = '';
      if (target) {
        text = target.getAttribute('data-cursor') ||
          (target.classList.contains('see') ? 'watch' :
            target.closest('.menu-list') ? 'go' :
              target.tagName === 'A' ? 'open' : '');
      }
      label.textContent = text;
      cursor.classList.toggle('labeled', !!text);
    });
  }

  /* ---------- The killer transition: ball zooms through into lesson one ---------- */
  if (window.initZoomTransition) window.initZoomTransition(ctx);

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
