/* illustrations/impact.js — SYSTEM 2: one shared impact language for
   collisions and decisive moments. A thin expanding-ring shockwave (stroke
   fades as it grows), a few dust particles that arc and fade, and — for the
   biggest hits only — a 1-2px viewport nudge. Everything is added INTO the
   demo's scrub timeline at a given time, so it scrubs deterministically
   (no fire-and-forget state left behind when you scroll back).

   ILLO.impact(tl, at, svg, x, y, {
     size,        // shockwave reach in px (also scales particles)
     particles,   // dust count (default 3)
     dir,         // spray direction in radians (default: all around)
     nudge        // viewport jolt in px, biggest hits only (default 0)
   })
   Reduced motion: nothing. Low tier: shockwave ring only (no dust/nudge).   */
window.ILLO = window.ILLO || {};
ILLO.impact = function (tl, at, svg, x, y, opts) {
  'use strict';
  opts = opts || {};
  if (QUALITY.reduced) return;
  var NS = 'http://www.w3.org/2000/svg';
  var low = QUALITY.tier === 'low';
  var size = opts.size || 120;

  function shock(rMax, w, o, dur) {
    var ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('class', 'impact-shock');
    ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 10);
    if (w) ring.style.strokeWidth = w;
    svg.appendChild(ring); // on top of the scene
    tl.fromTo(ring, { attr: { r: 10 }, opacity: o },
      { attr: { r: rMax }, opacity: 0, duration: dur, ease: EASE.out, immediateRender: false }, at);
  }
  shock(size, 2, 0.55, 0.9);
  if (size > 150) shock(size * 1.5, 1.2, 0.3, 1.3); // a second faint ring for big hits

  if (low) return; // low tier stops at the ring

  // dust particles: arc up-and-out, then fall and fade
  var n = opts.particles || 3;
  for (var i = 0; i < n; i++) {
    var ang = (opts.dir != null ? opts.dir : (Math.PI * 2 * i / n)) + (Math.random() - 0.5) * 0.9;
    var dist = size * 0.35 + Math.random() * size * 0.25;
    var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
    var p = document.createElementNS(NS, 'circle');
    p.setAttribute('class', 'impact-dust');
    p.setAttribute('cx', x); p.setAttribute('cy', y);
    p.setAttribute('r', 2 + Math.random() * 2.5);
    svg.appendChild(p);
    gsap.set(p, { opacity: 0 });
    tl.to(p, {
      keyframes: { x: [0, dx * 0.6, dx], y: [0, dy - 18, dy + 8], opacity: [0.85, 0.7, 0] },
      duration: 0.7 + Math.random() * 0.35, ease: EASE.out, immediateRender: false
    }, at);
  }

  // viewport nudge — transient jolt on the scene container, biggest hits only
  if (opts.nudge) {
    var stage = svg.closest('.demo-stage') || svg;
    tl.call(function () {
      gsap.to(stage, { keyframes: { x: [opts.nudge, -opts.nudge * 0.6, 0] }, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    }, null, at);
  }
};
