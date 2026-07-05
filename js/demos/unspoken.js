/* demos/unspoken.js — Unspoken pressure as a silent tide: flow lines carry
   the whole field one direction like a slow current, and the ball — touching
   no one — is quietly carried along, bobbing slightly. Only a dashed ghost
   marks where it meant to stay. Eerie, wordless. 3 beats: the current wakes
   → the field slides → carried away (ghost left behind). */
window.DEMOS = window.DEMOS || {};
window.DEMOS.unspoken = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.drift-field .peer');

  gsap.set(ball, { x: 330, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  // one broad ambient field over the whole lane — pressure with no visible source
  ILLO.field(svg, { x: 640, y: 300, rings: 3, base: 150, gap: 92, broad: true, min: 0.035, max: 0.08 });
  gsap.set(q('.flow'), { opacity: 0 });
  gsap.set(q('.drift-ghost'), { opacity: 0 });

  // ambient: the current never stops — dashes crawl rightward forever
  if (!QUALITY.reduced) {
    q('.flow').forEach(function (f, i) {
      gsap.to(f, {
        strokeDashoffset: -240, duration: 9 + i * 1.7, repeat: -1, ease: 'none'
      });
    });
  }

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — THE CURRENT WAKES: flow lines surface, the water starts moving */
  tl.to(q('.flow'), {
    opacity: 0.22, duration: 1.6, ease: EASE.soft,
    stagger: { each: 0.25, ease: EASE.soft }
  }, 0);

  /* beat 2 — THE FIELD SLIDES: the whole cohort moves the SAME way, as one
     current — a uniform rightward drift that holds its formation */
  peers.forEach(function (p, i) {
    tl.to(p, { x: '+=' + (475 + (i % 3) * 14), duration: 7.6, ease: EASE.soft }, 0.8 + i * 0.12);
  });
  // the ball resists for a moment — a half-lean back against the flow…
  tl.to(ballCircle, { x: -8, rotation: -3, duration: 0.9, ease: EASE.soft }, 2.0)
    .to(ballCircle, { x: 0, rotation: 0, duration: 0.7, ease: EASE.soft }, 2.9);

  /* beat 3 — CARRIED: it slides too, bobbing on the current; the ghost stays */
  tl.to(q('.drift-ghost'), { opacity: 0.45, duration: 1.4, ease: EASE.soft }, 3.6)
    .to(ball, { x: 330 + 420, duration: 7, ease: EASE.soft }, 2.8)
    .to(ball, { rotation: 10, transformOrigin: '50% 50%', duration: 7, ease: EASE.soft }, 2.8)
    // gentle bob while adrift — flotsam, not a swimmer
    .to(ballCircle, { y: -7, duration: 1.1, yoyo: true, repeat: 5, ease: EASE.soft }, 3.2)
    .to(q('.quiet-say'), { opacity: 1, duration: 1.2, ease: EASE.soft }, 5.5);

  ILLO.ballFX(svg, ball, ballCircle, { r: 26 });
  return tl;
};
