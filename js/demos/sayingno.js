/* demos/sayingno.js — Saying No: the shove comes, the ball plants and holds,
   says no, then reclaims its straight path — and an ally joins it.
   This resolves the arc every other demo set up. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.sayingno = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var bully = q('.bully')[0];
  var ally = q('.ally')[0];

  gsap.set(ball, { x: 600, y: 300 });
  gsap.set(ally, { x: 520, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(q('.plant-ring')[0], { transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The same charge as section 5 — deliberately mirrored...
  tl.to(bully, { attr: { cx: 100 }, duration: 0.4, ease: 'power1.out' }, 0.6)
    .to(bully, { attr: { cx: 554 }, duration: 1.3, ease: 'power3.in' }, 1.2)
    // ...but this time: PLANT. Squash absorbed, position held.
    .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.12, ease: 'power3.in' }, 2.5)
    .to(ball, { x: 640, duration: 0.25, ease: 'power2.out' }, 2.55)  // gives a little...
    .to(ball, { x: 600, duration: 0.5, ease: 'power2.out' }, 2.8)    // ...and takes it back
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' }, 2.65)
    // The plant reads as a shockwave ring + the word itself
    .fromTo(q('.plant-ring')[0], { opacity: 0.9, scale: 0.8 },
                                 { opacity: 0, scale: 2.6, duration: 1, ease: 'power1.out' }, 2.6)
    .to(q('.no-say'), { opacity: 1, duration: 0.4 }, 2.9)
    // The pressure retreats
    .to(bully, { attr: { cx: 300 }, duration: 0.8, ease: 'power2.out' }, 3.2)
    .to(bully, { attr: { cx: 140 }, opacity: 0.4, duration: 1.2, ease: 'power1.inOut' }, 4.2)
    // The straight path redraws itself — the line is yours again
    .to(q('.reclaim-line')[0], { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 3.8)
    .to(q('.no-say'), { opacity: 0, duration: 0.5 }, 4.6)
    // An ally appears — one other "no" makes the next one easier
    .to(ally, { opacity: 1, duration: 0.6 }, 4.8)
    // Both travel the reclaimed line together, ally trailing slightly
    .to(ball, { x: 1040, duration: 3, ease: 'power1.inOut' }, 5.4)
    .to(ally, { x: 950, duration: 3, ease: 'power1.inOut' }, 5.55)
    // A small victory stretch at the end — momentum, not struggle
    .to(ballCircle, { scaleX: 1.12, scaleY: 0.9, duration: 0.3, ease: 'sine.out' }, 8.2)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, 8.5);

  return tl;
};
