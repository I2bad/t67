/* demos/unspoken.js — Unspoken pressure: the field of dots drifts one way
   and the ball is slowly, silently tugged along. No collision. No words. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.unspoken = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var peers = q('.drift-field .peer');

  gsap.set(ball, { x: 330, y: 300 });
  gsap.set(q('.d-ball .ballc')[0], { transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // Everyone drifts right — slightly different speeds so it reads as a crowd,
  // not a formation
  peers.forEach(function (p, i) {
    tl.to(p, { x: 560 + (i % 3) * 60, duration: 7.5 + (i % 4) * 0.6, ease: EASE.soft }, i * 0.18);
  });

  // The caption lands mid-drift, once the pull is already visible
  tl.to(q('.quiet-say'), { opacity: 1, duration: 1.2, ease: EASE.soft }, 3);

  // The ball follows late and slower — tugged, not pushed. It never decides;
  // it just ends up somewhere else. The dashed line marks where it started.
  tl.to(ball, { x: 330 + 420, duration: 7, ease: EASE.soft }, 2)
    .to(ball, { rotation: 10, transformOrigin: '50% 50%', duration: 7, ease: EASE.soft }, 2);

  return tl;
};
