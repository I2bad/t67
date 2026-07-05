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

  // connective threads between neighbours (and one saved for the ball)
  var centers = [[918, 252], [978, 242], [1018, 298], [978, 356], [914, 346], [950, 300]];
  var threadWrap = q('.huddle-threads')[0];
  [[0, 1], [1, 2], [2, 3], [3, 4], [5, 0], [5, 2], [5, 4]].forEach(function (p) {
    ILLO.thread(threadWrap, centers[p[0]][0], centers[p[0]][1], centers[p[1]][0], centers[p[1]][1]);
  });
  var ballThread = ILLO.thread(threadWrap, 950, 300, 884, 308);

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
      opacity: 0.16, duration: 0.8, ease: EASE.soft,
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

  return tl;
};
