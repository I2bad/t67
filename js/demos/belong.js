/* demos/belong.js — The Need to Belong, as a warm huddle (soft-fill
   treatment): overlapping circles breathe together, connected by threads.
   The lone ball leans toward the warmth, tests the edge, a member shifts
   aside, and the huddle absorbs it. 3 beats: outside → drawn in → absorbed. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.belong = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var path = q('#belongPath')[0];
  var members = q('.huddle .peer');
  var opener = q('.huddle-opener')[0];

  // clean proximity network: connect each member to its two nearest
  // neighbours with straight threads (replaces the old crossing arcs that
  // read as scribble). Dedupe edges so no line is drawn twice.
  var centers = [[918, 252], [978, 242], [1018, 298], [978, 356], [914, 346], [950, 300]];
  var threadWrap = q('.huddle-threads')[0];
  function link(x1, y1, x2, y2) {
    return ILLO.create('line', {
      x1: x1, y1: y1, x2: x2, y2: y2, pathLength: 1, 'class': 'thread'
    }, threadWrap);
  }
  var seen = {};
  centers.forEach(function (c, i) {
    centers.map(function (o, j) { return { j: j, d: Math.hypot(o[0] - c[0], o[1] - c[1]) }; })
      .filter(function (e) { return e.j !== i; })
      .sort(function (a, b) { return a.d - b.d; })
      .slice(0, 2).forEach(function (e) {
        var key = Math.min(i, e.j) + '-' + Math.max(i, e.j);
        if (seen[key]) return; seen[key] = 1;
        link(centers[i][0], centers[i][1], centers[e.j][0], centers[e.j][1]);
      });
  });
  var ballThread = link(950, 300, 884, 308); // the newcomer's first tie-in

  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(ball, { motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5], end: 0 } });
  // entry is animated on OPACITY so the ambient breathe loop can own scale
  // (a breathe started while scale=0 would capture 0 as its start value)
  gsap.set(members, { opacity: 0 });
  gsap.set(q('.soft-glow'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(q('.belong-start'), { opacity: 0 });

  // ambient: the huddle breathes in sync while the page lives
  if (!QUALITY.reduced) ILLO.breathe(members, 0.04, 2.4);

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — SETUP: the group warms up, threads bind it together */
  tl.to(q('.soft-glow'), { scale: 1, opacity: 0.06, duration: 1.8, ease: EASE.soft }, 0)
    .to(members, {
      // tone variation between members — they read as distinct people
      opacity: function (i) { return [0.62, 0.44, 0.56, 0.48, 0.6, 0.5][i] || 0.5; },
      duration: 0.8, ease: EASE.soft,
      stagger: { each: 0.15, from: 'center' }
    }, 0.2)
    .to(q('.huddle-threads .thread'), {
      strokeDashoffset: 0, duration: 0.9, ease: EASE.inOut,
      stagger: { each: 0.1, ease: EASE.soft }
    }, 1.0)
    // the lone ball notices: leans and stretches toward the warmth
    .to(ballCircle, { scaleX: 1.09, scaleY: 0.96, rotation: 4, duration: 0.7, ease: EASE.soft }, 1.6)
    .to(ballCircle, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.5, ease: EASE.soft }, 2.3);

  /* beat 2 — DRAWN IN: it crosses, tests the edge, a member makes room */
  tl.to(ball, {
    motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] },
    duration: 4.2, ease: EASE.inOut
  }, 2.6)
    // a dashed echo of where it started stays behind
    .to(q('.belong-start'), { opacity: 0.4, duration: 1, ease: EASE.soft }, 3.2)
    // the group turns toward the newcomer — a collective lean its way
    .to(members, { x: '-=7', duration: 1.1, ease: EASE.soft, stagger: { each: 0.05, from: 'edges' } }, 5.6)
    // test touch: bump the edge, small polite recoil
    .to(ballCircle, { x: 14, duration: 0.3, ease: EASE.in }, 6.8)
    .to(ballCircle, { x: -8, scaleX: 0.92, duration: 0.3, ease: EASE.out }, 7.1)
    .to(ballCircle, { x: 0, scaleX: 1, duration: 0.4, ease: EASE.soft }, 7.4)
    // ...and the huddle answers: the opener shifts aside, a space appears
    .to(opener, { x: 24, y: 26, duration: 0.9, ease: EASE.inOut }, 7.2)
    .to(q('.gap-ghost'), { opacity: 0.8, duration: 0.5, ease: EASE.soft }, 7.4);

  /* beat 3 — ABSORBED: it slips in; the group closes around it, warmer */
  tl.to(ball, { x: '+=14', duration: 0.8, ease: EASE.out }, 7.9)
    .to(q('.gap-ghost'), { opacity: 0, duration: 0.4 }, 8.1)
    .to(ballThread, { strokeDashoffset: 0, duration: 0.7, ease: EASE.inOut }, 8.3)
    // members lean in a touch — the circle re-forms around the newcomer
    .to(members, {
      x: function (i) { return (882 - centers[i][0]) * 0.06; },
      y: function (i) { return (308 - centers[i][1]) * 0.06; },
      duration: 1.1, ease: EASE.soft, stagger: { each: 0.06 }
    }, 8.4)
    .to(q('.soft-glow'), { scale: 1.15, opacity: 0.1, duration: 1.4, ease: EASE.soft }, 8.4)
    .to(ballCircle, { scaleX: 1.15, scaleY: 0.85, duration: 0.35, ease: EASE.out }, 9.3)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 9.65);

  // pressure field around the group — tightens as the ball is drawn in
  ILLO.field(svg, { x: 945, y: 300, base: 74, gap: 26, ball: ballCircle, near: 130, far: 380, min: 0.05, max: 0.15 });
  ILLO.ballFX(svg, ball, ballCircle, { r: 26 });
  return tl;
};
