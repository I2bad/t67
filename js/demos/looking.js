/* demos/looking.js — Informational influence as a foggy crossroads:
   low visibility, a signpost with no answer, a stream of peers flowing down
   one branch — and the ball following the traffic. One contrarian dot takes
   the other path, alone. 3 beats: fog & fork → the stream commits →
   follow the footprints (fog thins only over the trodden branch). */
window.DEMOS = window.DEMOS || {};
window.DEMOS.looking = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.look-peer');
  var contrarian = q('.contrarian')[0];
  var stem = q('#stemPath')[0], branchA = q('#branchA')[0], branchB = q('#branchB')[0], peerPath = q('#peerPath')[0];

  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(ball, { motionPath: { path: stem, align: stem, alignOrigin: [0.5, 0.5], end: 0 } });
  peers.forEach(function (p) {
    gsap.set(p, { motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5], end: 0 } });
  });
  gsap.set(contrarian, { motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5], end: 0 }, opacity: 0 });
  gsap.set(q('.guide-vis'), { opacity: 0 });
  gsap.set(q('.fork-q'), { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — THE FORK: the roads surface, the signpost gives no answer */
  tl.to(q('.guide-vis'), { opacity: 0.55, duration: 1.4, ease: EASE.soft, stagger: 0.35 }, 0)
    .to(q('.signpost'), { strokeDashoffset: 0, duration: 0.5, ease: EASE.out }, 1.6);

  /* beat 2 — THE STREAM COMMITS: traffic picks the lower branch */
  peers.forEach(function (p, i) {
    tl.to(p, {
      motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5] },
      duration: 4.2, ease: EASE.inOut
    }, 1.2 + i * 0.75);
  });
  // the crowd leaves footprints down its branch — literal evidence of others
  tl.to(q('.footprints'), { strokeDashoffset: 0, duration: 3.4, ease: EASE.soft }, 2.4);
  // ...except one. The contrarian pauses at the fork, then goes the other way
  tl.to(contrarian, { opacity: 0.8, duration: 0.3 }, 2.6)
    .to(contrarian, {
      motionPath: { path: peerPath, align: peerPath, alignOrigin: [0.5, 0.5], end: 0.5 },
      duration: 2.0, ease: EASE.inOut
    }, 2.7)
    .to(contrarian, {
      motionPath: { path: branchA, align: branchA, alignOrigin: [0.5, 0.5], start: 0.05 },
      duration: 2.6, ease: EASE.inOut
    }, 5.0);

  // the ball reaches the fork and stalls — the "?" lands over its head
  tl.to(ball, {
    motionPath: { path: stem, align: stem, alignOrigin: [0.5, 0.5] },
    duration: 2.8, ease: EASE.out
  }, 1)
    .to(q('.fork-q'), { opacity: 0.7, scale: 1, duration: 0.5, ease: EASE.pop }, 3.9)
    // unsure: wobble, tremble, look both ways
    .to(ballCircle, { y: -12, duration: 0.55, ease: EASE.soft }, 4.0)
    .to(ballCircle, { y: 10, duration: 0.55, ease: EASE.soft }, 4.55)
    .to(ballCircle, { y: 0, duration: 0.45, ease: EASE.soft }, 5.1)
    .to(ballCircle, { x: 3, duration: 0.1, yoyo: true, repeat: 5, ease: EASE.soft }, 5.2)
    // anticipation: a tiny pull-back before committing to the crowd's branch
    .to(ballCircle, { x: -12, duration: 0.4, ease: EASE.soft }, 5.9)
    .to(ballCircle, { x: 0, duration: 0.3, ease: EASE.in }, 6.3);

  /* beat 3 — FOLLOW THE FOOTPRINTS: the ball walks the trodden trail */
  tl.to(q('.fork-q'), { opacity: 0, duration: 0.4 }, 6.4)
    .to(ball, {
      motionPath: { path: branchB, align: branchB, alignOrigin: [0.5, 0.5] },
      duration: 3.2, ease: EASE.inOut
    }, 6.6)
    // the footprints it's following brighten as it commits to them
    .to(q('.footprints'), { opacity: 0.9, duration: 1.6, ease: EASE.soft }, 6.6);

  ILLO.ballFX(svg, ball, ballCircle, { r: 24 });
  return tl;
};
