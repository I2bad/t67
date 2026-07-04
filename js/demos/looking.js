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
      duration: 4, ease: 'power1.inOut'
    }, i * 0.7);
  });

  // The ball travels the stem and stops at the fork — genuinely unsure
  tl.to(ball, {
    motionPath: { path: stem, align: stem, alignOrigin: [0.5, 0.5] },
    duration: 2.5, ease: 'power1.out'
  }, 1)
    // A "which way?" wobble while it watches where everyone went
    .to(ballCircle, { y: -12, duration: 0.5, ease: 'sine.inOut' }, 3.6)
    .to(ballCircle, { y: 10, duration: 0.5, ease: 'sine.inOut' }, 4.1)
    .to(ballCircle, { y: 0, duration: 0.4, ease: 'sine.inOut' }, 4.6)
    // Decision: not the "right way" branch — the one with footprints on it
    .to(ball, {
      motionPath: { path: branchB, align: branchB, alignOrigin: [0.5, 0.5] },
      duration: 3, ease: 'power1.inOut'
    }, 5.2);

  return tl;
};
