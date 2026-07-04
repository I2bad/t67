/* demos/belong.js — The Need to Belong: the lone ball drifts toward a warm
   cluster of peer dots. Returns a scrub-ready timeline. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.belong = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];

  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(ball, { motionPath: { path: q('#belongPath')[0], align: q('#belongPath')[0], alignOrigin: [0.5, 0.5], end: 0 } });
  gsap.set(q('.belong-cluster .peer'), { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(q('.soft-glow'), { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The group warms up first — its pull is what moves the ball
  tl.to(q('.soft-glow'), { scale: 1, opacity: 0.06, duration: 1.8, ease: EASE.soft }, 0)
    .to(q('.belong-cluster .peer'), {
      scale: 1, duration: 0.8, ease: EASE.pop,
      stagger: { each: 0.18, ease: EASE.soft }
    }, 0.2)
    // Anticipation: the lone ball leans away for a beat — hesitates —
    .to(ballCircle, { x: -14, duration: 0.6, ease: EASE.soft }, 1.4)
    .to(ballCircle, { x: 0, duration: 0.5, ease: EASE.soft }, 2.0)
    // — then commits: slow start, accelerating as the pull takes hold
    .to(ball, {
      motionPath: { path: q('#belongPath')[0], align: q('#belongPath')[0], alignOrigin: [0.5, 0.5] },
      duration: 6, ease: EASE.inOut
    }, 2.2)
    // Glow breathes as the ball arrives; cluster shifts to make room
    .to(q('.soft-glow'), { scale: 1.15, opacity: 0.1, duration: 1.8, ease: EASE.soft }, 6.5)
    .to(q('.belong-cluster .peer'), {
      x: 8, duration: 1.2, ease: EASE.soft, stagger: { each: 0.08, ease: EASE.soft }
    }, 7.2)
    // ...and the ball gives a small contented squash on arrival
    .to(ballCircle, { scaleX: 1.15, scaleY: 0.85, duration: 0.35, ease: EASE.out }, 8.0)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 8.35);

  return tl;
};
