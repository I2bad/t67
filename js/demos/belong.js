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
  tl.to(q('.soft-glow'), { scale: 1, opacity: 0.06, duration: 1.5, ease: 'power1.out' }, 0)
    .to(q('.belong-cluster .peer'), { scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(2)' }, 0.2)
    // The lone ball drifts over — slow start, accelerating as it gets closer
    .to(ball, {
      motionPath: { path: q('#belongPath')[0], align: q('#belongPath')[0], alignOrigin: [0.5, 0.5] },
      duration: 6, ease: 'power1.in'
    }, 1.5)
    // Glow breathes as the ball arrives; ball gives a small contented squash
    .to(q('.soft-glow'), { scale: 1.15, opacity: 0.1, duration: 1.5 }, 6)
    .to(ballCircle, { scaleX: 1.15, scaleY: 0.85, duration: 0.3, ease: 'power2.out' }, 7.4)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, 7.7);

  return tl;
};
