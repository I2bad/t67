/* demos/conformity.js — Conformity (Asch): the ball abandons what it saw
   (dashed marker) to match the row of identical peer dots. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.conformity = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];

  // Start where "what you saw" is: big, low, apart from the row
  gsap.set(ball, { x: 220, y: 430 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(q('.peer'), { scale: 0, transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The row asserts itself, one identical dot at a time
  tl.to(q('.peer'), { scale: 1, duration: 0.5, stagger: 0.4, ease: 'back.out(2)' }, 0)
    // Hesitation: the ball leans toward its own answer twice...
    .to(ball, { x: 250, y: 420, duration: 0.8, ease: 'sine.inOut' }, 2)
    .to(ball, { x: 220, y: 430, duration: 0.8, ease: 'sine.inOut' }, 2.8)
    // ...then caves: moves up to join the row AND shrinks to match (r 34 → 22)
    .to(ball, { x: 1120, y: 308, duration: 3, ease: 'power2.inOut' }, 4)
    .to(ballCircle, { scale: 22 / 34, duration: 3, ease: 'power2.inOut' }, 4)
    // The dashed ghost of what it actually saw lingers, accusing
    .to(q('.dash-ghost'), { opacity: 0.9, duration: 1 }, 5.5)
    .to(ballCircle, { scaleX: (22 / 34) * 1.12, scaleY: (22 / 34) * 0.88, duration: 0.25, ease: 'power2.out' }, 7)
    .to(ballCircle, { scaleX: 22 / 34, scaleY: 22 / 34, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, 7.25);

  return tl;
};
