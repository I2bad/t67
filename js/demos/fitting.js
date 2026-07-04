/* demos/fitting.js — Normative influence: the group forms a shape with one
   small empty slot; the ball shrinks itself to fit it. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.fitting = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.ring-formation .peer');

  gsap.set(ball, { x: 160, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  // Peers start scattered, then snap into formation
  var scatter = [[820, 90], [1030, 260], [900, 500], [660, 520], [520, 460], [560, 140]];
  peers.forEach(function (p, i) {
    gsap.set(p, { x: scatter[i][0] - +p.getAttribute('cx'), y: scatter[i][1] - +p.getAttribute('cy') });
  });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The group clicks into its shape — the norm forms, each dot overshooting
  // its seat slightly before settling
  tl.to(peers, {
    x: 0, y: 0, duration: 2.2, ease: EASE.pop,
    stagger: { each: 0.16, ease: EASE.soft }
  }, 0)
    .to(q('.slot'), { opacity: 1, duration: 0.7, ease: EASE.soft }, 2.4)
    // The ball approaches at full size...
    .to(ball, { x: 480, y: 300, duration: 2.6, ease: EASE.inOut }, 3.0)
    // ...takes a breath (anticipation: inflate slightly before compressing)...
    .to(ballCircle, { scale: 1.08, duration: 0.4, ease: EASE.soft }, 5.4)
    // ...then squeezes to enter (slot r=18 vs ball r=27) — visible compression
    .to(ballCircle, { scaleX: 0.55, scaleY: 0.85, duration: 0.5, ease: EASE.in }, 5.85)
    .to(ball, { x: 600, y: 300, duration: 0.9, ease: EASE.out }, 6.2)
    .to(ballCircle, { scaleX: 18 / 27, scaleY: 18 / 27, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, 6.9)
    // The formation gives a satisfied pulse: you fit now. Smaller, but you fit.
    .to(peers, {
      scale: 1.12, transformOrigin: '50% 50%', duration: 0.45, ease: EASE.out,
      stagger: { each: 0.05, ease: EASE.soft }
    }, 7.8)
    .to(peers, { scale: 1, duration: 0.7, ease: EASE.soft, stagger: { each: 0.05 } }, 8.3);

  return tl;
};
