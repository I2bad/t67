/* demos/online.js — Online pressure: a grid of notification dots pings at
   the ball from every direction; it jitters and shrinks under the barrage.
   The grid is built here in JS so the HTML stays lean. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.online = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var NS = 'http://www.w3.org/2000/svg';
  var grid = q('.ping-grid')[0];
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];

  gsap.set(ball, { x: 600, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });

  // Build a 6x3 grid of ping dots (skipping cells too close to the ball)
  var pings = [];
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 6; c++) {
      var x = 150 + c * 180, y = 130 + r * 170;
      if (Math.abs(x - 600) < 120 && Math.abs(y - 300) < 120) continue;
      var g = document.createElementNS(NS, 'g');
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'peer'); dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 9);
      var ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 9);
      ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', 'currentColor');
      ring.setAttribute('stroke-width', '2'); ring.style.color = 'var(--ink)'; ring.style.opacity = '0';
      g.appendChild(dot); g.appendChild(ring); grid.appendChild(g);
      pings.push({ dot: dot, ring: ring });
    }
  }
  gsap.set(grid.querySelectorAll('.peer'), { scale: 0, transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });
  var rand = gsap.utils.random;

  // Each notification pops in and "pings" (expanding ring) at its own moment —
  // spread across the whole scrub so it never stops
  pings.forEach(function (p) {
    var t = rand(0.2, 6.5);
    tl.to(p.dot, { scale: 1, duration: 0.45, ease: EASE.pop, transformOrigin: '50% 50%' }, t)
      .fromTo(p.ring, { attr: { r: 9 }, opacity: 0.8 },
                      { attr: { r: 42 }, opacity: 0, duration: 1.4, ease: EASE.out }, t + 0.1)
      .fromTo(p.ring, { attr: { r: 9 }, opacity: 0.8 },
                      { attr: { r: 42 }, opacity: 0, duration: 1.4, ease: EASE.out }, t + rand(1.8, 3.2));
  });

  // The ball can't settle: continuous jitter, and it shrinks under the noise
  var jx = [8, -10, 5, -7, 11, -4, 6, -9];
  jx.forEach(function (dx, i) {
    tl.to(ballCircle, { x: dx, y: jx[(i + 3) % jx.length] * 0.7, duration: 0.65, ease: EASE.soft }, 1 + i * 0.78);
  });
  tl.to(ballCircle, { scale: 0.82, duration: 6.2, ease: EASE.in }, 1.5)
    .to(q('.d-label')[0], { opacity: 1, duration: 1.2, ease: EASE.soft }, 5.5);

  return tl;
};
