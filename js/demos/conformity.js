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
  tl.to(q('.peer'), {
    scale: 1, duration: 0.7, ease: EASE.pop,
    stagger: { each: 0.45, ease: EASE.soft }
  }, 0)
    // Hesitation: the ball leans toward its own answer twice...
    .to(ball, { x: 250, y: 420, duration: 0.9, ease: EASE.soft }, 2.2)
    .to(ball, { x: 220, y: 430, duration: 0.9, ease: EASE.soft }, 3.1)
    // ...pulls back a touch (anticipation)...
    .to(ball, { x: 205, y: 438, duration: 0.5, ease: EASE.soft }, 4.0)
    // ...then caves: joins the row AND shrinks to match (r 34 → 22)
    .to(ball, { x: 1120, y: 308, duration: 3.2, ease: EASE.inOut }, 4.5)
    .to(ballCircle, { scale: 22 / 34, duration: 3.2, ease: EASE.inOut }, 4.5)
    // The dashed ghost of what it actually saw lingers, accusing
    .to(q('.dash-ghost'), { opacity: 0.9, duration: 1.2, ease: EASE.soft }, 6.2)
    // Landing settle — a beat late, like it isn't quite sure it fits
    .to(ballCircle, { scaleX: (22 / 34) * 1.12, scaleY: (22 / 34) * 0.88, duration: 0.3, ease: EASE.out }, 7.8)
    .to(ballCircle, { scaleX: 22 / 34, scaleY: 22 / 34, duration: 0.7, ease: 'elastic.out(1, 0.45)' }, 8.1);

  return tl;
};
