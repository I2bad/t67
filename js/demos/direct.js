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

  // The ask appears, then the dot winds up (big anticipation) and charges
  tl.to(q('.bully-say'), { opacity: 1, duration: 0.7, ease: EASE.soft }, 0.4)
    .to(bully, { attr: { cx: 1195 }, duration: 0.7, ease: EASE.soft }, 1.5)  // wind-up, drawn out
    .to(bully, { attr: { cx: 566 }, duration: 1.4, ease: EASE.in }, 2.3)    // charge!
    // the ball sees it coming — a flinch just before contact
    .to(ballCircle, { x: 10, duration: 0.25, ease: EASE.soft }, 3.35)
    // IMPACT — spark flash, hard squash, momentum shove with a skid-settle
    .to(q('.spark'), { opacity: 1, duration: 0.08 }, 3.7)
    .to(q('.spark'), { opacity: 0, duration: 0.45, ease: EASE.soft }, 3.85)
    .to(ballCircle, { x: 0, scaleX: 0.45, scaleY: 1.5, duration: 0.12, ease: EASE.in }, 3.68)
    .to(ball, { x: 260, duration: 1.3, ease: EASE.out }, 3.8)               // shoved
    .to(ball, { y: 288, duration: 0.28, ease: EASE.out }, 3.8)              // lifts slightly
    .to(ball, { y: 300, duration: 0.55, ease: 'bounce.out' }, 4.1)          // lands
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.1, 0.3)' }, 3.85)
    .to(bully, { attr: { cx: 640 }, duration: 0.6, ease: EASE.out }, 3.8)   // recoil
    // The ball sits where it was pushed — visibly not where it started
    .to(q('.bully-say'), { opacity: 0, duration: 0.7, ease: EASE.soft }, 5.6);

  return tl;
};
