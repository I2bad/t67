/* demos/direct.js — Direct pressure: a peer dot charges in and shoves the
   ball hard off its spot. Big squash-and-stretch on impact. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.direct = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var bully = q('.bully')[0];

  gsap.set(ball, { x: 520, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The ask appears, then the dot winds up and charges
  tl.to(q('.bully-say'), { opacity: 1, duration: 0.6 }, 0.4)
    .to(bully, { attr: { cx: 1180 }, duration: 0.5, ease: 'power1.out' }, 1.6) // wind-up
    .to(bully, { attr: { cx: 566 }, duration: 1.4, ease: 'power3.in' }, 2.2)  // charge!
    // IMPACT — spark flash, hard squash, momentum shove with a skid-settle
    .to(q('.spark'), { opacity: 1, duration: 0.08 }, 3.6)
    .to(q('.spark'), { opacity: 0, duration: 0.4 }, 3.75)
    .to(ballCircle, { scaleX: 0.45, scaleY: 1.5, duration: 0.12, ease: 'power3.in' }, 3.58)
    .to(ball, { x: 260, duration: 1.1, ease: 'power3.out' }, 3.7)             // shoved
    .to(ball, { y: 288, duration: 0.25, ease: 'power2.out' }, 3.7)            // lifts slightly
    .to(ball, { y: 300, duration: 0.5, ease: 'bounce.out' }, 3.95)            // lands
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.3)' }, 3.75)
    .to(bully, { attr: { cx: 640 }, duration: 0.5, ease: 'power2.out' }, 3.7) // recoil
    // The ball sits where it was pushed — visibly not where it started
    .to(q('.bully-say'), { opacity: 0, duration: 0.6 }, 5.4);

  return tl;
};
