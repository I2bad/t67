/* demos/looking.js — Informational influence: at a fork, the ball follows
   whichever branch the peer dots took (they take the lower one). */
window.DEMOS = window.DEMOS || {};
window.DEMOS.looking = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.look-peer');
  var stem = q('#stemPath')[0], branchB = q('#branchB')[0], peerPath = q('#peerPath')[0];

  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(ball, { motionPath: { path: stem, align: stem, alignOrigin: [0.5, 0.5], end: 0 } });
  peers.forEach(function (p) {
    gsap.set(p, { motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5], end: 0 } });
  });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // Peer dots stream past and pick the lower branch, single file
  peers.forEach(function (p, i) {
    tl.to(p, {
      motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5] },
      duration: 4.2, ease: EASE.inOut
    }, i * 0.75);
  });

  // The ball travels the stem and stops at the fork — genuinely unsure
  tl.to(ball, {
    motionPath: { path: stem, align: stem, alignOrigin: [0.5, 0.5] },
    duration: 2.8, ease: EASE.out
  }, 1)
    // A "which way?" wobble while it watches where everyone went
    .to(ballCircle, { y: -12, duration: 0.55, ease: EASE.soft }, 4.0)
    .to(ballCircle, { y: 10, duration: 0.55, ease: EASE.soft }, 4.55)
    .to(ballCircle, { y: 0, duration: 0.45, ease: EASE.soft }, 5.1)
    // Anticipation: a tiny pull-back before committing to the crowd's branch
    .to(ballCircle, { x: -12, duration: 0.4, ease: EASE.soft }, 5.55)
    .to(ballCircle, { x: 0, duration: 0.3, ease: EASE.in }, 5.95)
    // Decision: not the "right way" branch — the one with footprints on it
    .to(ball, {
      motionPath: { path: branchB, align: branchB, alignOrigin: [0.5, 0.5] },
      duration: 3.2, ease: EASE.inOut
    }, 6.1);

  return tl;
};
