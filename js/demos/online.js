/* demos/online.js — Online pressure as a living feed: notification cards
   stack around the ball and RE-ping in waves, a counter climbs, and a
   comparison meter on the ball swings as pings land. The ball jitters and
   shrinks under a barrage that visibly never stops (ambient re-pings keep
   running while the section is on screen). Cards are built here in JS so
   the HTML stays lean. 3 beats: first cards → the barrage scales →
   it keeps going without you. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.online = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var grid = q('.ping-grid')[0];
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];

  gsap.set(ball, { x: 600, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });

  // build a 5x3 wall of notification cards (skipping cells near the ball)
  var cards = [];
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 5; c++) {
      var x = 170 + c * 220, y = 110 + r * 170;
      if (Math.abs(x - 600) < 150 && Math.abs(y - 300) < 130) continue;
      var g = ILLO.create('g', { 'class': 'feed-cell' }, grid);
      ILLO.create('rect', { x: x - 52, y: y - 17, width: 104, height: 34, rx: 8, 'class': 'feed-card-l' }, g);
      ILLO.create('circle', { cx: x - 36, cy: y, r: 6, 'class': 'feed-avatar-l' }, g);
      ILLO.create('rect', { x: x - 24, y: y - 7, width: 56, height: 4.5, rx: 2, 'class': 'feed-line-l' }, g);
      ILLO.create('rect', { x: x - 24, y: y + 2, width: 36, height: 4.5, rx: 2, 'class': 'feed-line-l' }, g);
      var ring = ILLO.create('circle', { cx: x, cy: y, r: 20, 'class': 'impact-ripple' }, g);
      gsap.set(g, { transformOrigin: x + 'px ' + y + 'px', scale: 0 });
      cards.push({ g: g, ring: ring, x: x, y: y });
    }
  }

  var tl = gsap.timeline({ defaults: { ease: 'none' } });
  var rand = gsap.utils.random;

  // pressure field pulsing around "you" — the feed's constant compression
  var onField = ILLO.field(svg, { x: 600, y: 300, base: 80, gap: 34, min: 0.04, max: 0.12 });
  tl.to(onField.i, { v: 0.72, duration: 5, ease: EASE.in }, 1)
    .to(onField.i, { v: 0.52, duration: 2, ease: EASE.soft }, 6.5);

  /* beat 1 + 2 — cards stack in, each landing with a ping; the counter
     climbs; the meter on the ball swings with every hit */
  cards.forEach(function (card) {
    var t = rand(0.2, 6.0);
    tl.to(card.g, { scale: 1, duration: 0.5, ease: EASE.pop }, t)
      .fromTo(card.ring, { opacity: 0.6, attr: { r: 16 } },
        { opacity: 0, attr: { r: 60 }, duration: 1.1, ease: EASE.out, immediateRender: false }, t + 0.3);
  });

  // the counter: likes-and-follows arithmetic, always going up
  var n = { v: 0 }, counter = q('.counter-text')[0];
  tl.to(n, {
    v: 1284, duration: 7.5, ease: EASE.in,
    onUpdate: function () {
      counter.textContent = n.v > 999 ? (n.v / 1000).toFixed(1) + 'k' : Math.floor(n.v);
    }
  }, 0.4);

  // the red badge on "you": the single focal accent. Pops in, its unread
  // count climbs, and it flinches bigger on the notification waves.
  var badge = q('.badge')[0], bnum = q('.badge-num')[0], bn = { v: 0 };
  gsap.set(badge, { scale: 0, transformOrigin: '50% 50%' });
  tl.to(badge, { scale: 1, duration: 0.5, ease: EASE.pop }, 1.0)
    .to(bn, {
      v: 99, duration: 6, ease: EASE.in,
      onUpdate: function () { bnum.textContent = bn.v >= 99 ? '99+' : Math.floor(bn.v); }
    }, 1.2)
    .to(badge, { scale: 1.25, duration: 0.2, yoyo: true, repeat: 1, ease: EASE.soft }, 3.4)
    .to(badge, { scale: 1.25, duration: 0.2, yoyo: true, repeat: 1, ease: EASE.soft }, 5.6);

  // comparison meter around the ball: fills, dips, refills — never settles
  tl.to(q('.meter-ring'), { strokeDashoffset: 0.35, duration: 2.2, ease: EASE.out }, 1.2)
    .to(q('.meter-ring'), { strokeDashoffset: 0.75, duration: 1.4, ease: EASE.inOut }, 3.6)
    .to(q('.meter-ring'), { strokeDashoffset: 0.15, duration: 1.8, ease: EASE.out }, 5.2)
    .to(q('.meter-ring'), { strokeDashoffset: 0.6, duration: 1.4, ease: EASE.inOut }, 7.2);

  // the ball can't settle: continuous jitter, and it shrinks under the noise
  var jx = [8, -10, 5, -7, 11, -4, 6, -9];
  jx.forEach(function (dx, i) {
    tl.to(ballCircle, { x: dx, y: jx[(i + 3) % jx.length] * 0.7, duration: 0.65, ease: EASE.soft }, 1 + i * 0.78);
  });
  tl.to(ballCircle, { scale: 0.82, duration: 6.2, ease: EASE.in }, 1.5)
    .to(q('.d-label')[0], { opacity: 1, duration: 1.2, ease: EASE.soft }, 6.2);

  /* beat 3 — ambient: re-pings + pulse waves + a CRT-ish shimmer that keep
     running while the section is on screen. The feed doesn't need you. */
  var loops = [];
  function startLoops() {
    if (loops.length || QUALITY.reduced || QUALITY.tier === 'low') return;
    cards.forEach(function (card, i) {
      loops.push(gsap.fromTo(card.ring, { opacity: 0.5, attr: { r: 16 } }, {
        opacity: 0, attr: { r: 52 }, duration: 1.3, ease: EASE.out,
        repeat: -1, repeatDelay: rand(2.5, 6), delay: rand(0, 4), immediateRender: false
      }));
      loops.push(gsap.to(card.g, {
        scale: 1.05, duration: 0.35, yoyo: true, repeat: -1,
        repeatDelay: rand(3, 7), delay: rand(0, 4), ease: EASE.soft
      }));
    });
    // waves pulsing outward through the whole wall
    q('.wave').forEach(function (w, i) {
      loops.push(gsap.fromTo(w, { opacity: 0.35, attr: { r: 40 } }, {
        opacity: 0, attr: { r: 560 }, duration: 4.5, ease: EASE.soft,
        repeat: -1, delay: i * 2.2, immediateRender: false
      }));
    });
    // faint shimmer on the wall — screens, not paper
    loops.push(gsap.to(grid, { opacity: 0.92, duration: 0.09, yoyo: true, repeat: -1, repeatDelay: 1.7 }));
  }
  function stopLoops() { loops.forEach(function (t) { t.kill(); }); loops = []; gsap.set(grid, { opacity: 1 }); }
  ScrollTrigger.create({
    trigger: '#online', start: 'top bottom', end: 'bottom top',
    onToggle: function (self) { self.isActive ? startLoops() : stopLoops(); }
  });

  // field notes: the comparison that never resolves (scene is busy — keep it to two)
  ILLO.notes(svg, tl, [
    { k: 'bracket', x1: 450, y1: 546, x2: 750, y2: 546, side: 'down', t: 'comparison', at: 4.8 },
    { k: 'label', fig: true, x: 40, y: 44, t: 'FIG. 07 — ONLINE & SOCIAL PRESSURE', at: 0.2 },
    { k: 'label', x: 150, y: 505, t: 'comparison: never closes', at: 3.0 }
  ]);

  // eyes: the ball can't stop tracking the chips pinging in from every side
  ILLO.faces(svg, tl, [
    { el: ballCircle, r: 26, tone: 'ink', look: [1, -0.6],
      steps: [[1.5, 1, -0.6], [2.5, -1, 0.5], [3.5, 1, 0.6], [4.5, -1, -0.6], [5.5, 0.8, 0], [6.5, -0.8, 0.2]] }
  ]);

  return tl;
};
