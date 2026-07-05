/* illustrations/field.js — SYSTEM 1: the pressure field. Faint concentric
   contour rings (topographic / magnetic-field style) around a peer cluster,
   drawn in the section's --accent at low opacity. Intensity drives ring
   tightening + opacity; an optional slow ripple travels outward. Intensity
   can come from proximity to the ball (auto) or be tweened by the demo.
   Subtle by design — if a ring is the first thing you notice, it's too loud.

   ILLO.field(svg, {
     x, y | follow:<el>   // fixed centre, or track an element's centre
     ball:<el>            // if set, intensity = proximity of ball to centre
     rings, base, gap     // geometry
     min, max             // opacity range
     near, far            // proximity → intensity mapping (px)
     broad                // ambient field: constant mid intensity, big soft rings
     ripple               // slow outward ripple (default true)
   }) → { i:{v}, kill }   // tween .i.v to drive intensity manually            */
window.ILLO = window.ILLO || {};
ILLO.field = function (svg, opts) {
  'use strict';
  opts = opts || {};
  var NS = 'http://www.w3.org/2000/svg';
  var rings = opts.rings || 3, base = opts.base || 64, gap = opts.gap || 26;
  var min = opts.min != null ? opts.min : 0.05;
  var max = opts.max != null ? opts.max : 0.14;
  var broad = !!opts.broad;

  var els = [], frag = document.createDocumentFragment();
  for (var k = 0; k < rings; k++) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'field-ring' + (broad ? ' field-broad' : ''));
    c.setAttribute('r', base + k * gap);
    els.push(c); frag.appendChild(c);
  }
  svg.insertBefore(frag, svg.firstChild); // behind the scene — it's background force

  var cx = opts.x || 0, cy = opts.y || 0;
  var follow = opts.follow || null, ball = opts.ball || null;
  var intensity = { v: broad ? 0.55 : 0 };
  var near = opts.near || 90, far = opts.far || 320;

  function render(iv, phase) {
    for (var i = 0; i < els.length; i++) {
      var r0 = base + i * gap;
      var rip = phase ? Math.sin(phase - i * 0.9) * 6 * iv : 0;
      var falloff = 1 - i * 0.22;
      els[i].setAttribute('cx', cx);
      els[i].setAttribute('cy', cy);
      els[i].setAttribute('r', r0 * (1 - 0.16 * iv) + rip);
      els[i].style.opacity = (min + (max - min) * iv) * falloff;
    }
  }

  // reduced motion / low tier: static rings, no ticker, no ripple
  if (QUALITY.reduced || QUALITY.tier === 'low') {
    render(broad ? 0.55 : 0.5, 0);
    return { i: intensity, kill: function () { els.forEach(function (c) { c.remove(); }); } };
  }

  var section = svg.closest('section');
  var active = false, t0 = performance.now();
  var pt = svg.createSVGPoint();
  function centreOf(el) {
    var m = svg.getScreenCTM(); if (!m) return null;
    var b = el.getBoundingClientRect();
    pt.x = b.left + b.width / 2; pt.y = b.top + b.height / 2;
    var p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  function tick() {
    if (!active) return;
    if (follow) { var fc = centreOf(follow); if (fc) { cx = fc.x; cy = fc.y; } }
    else { cx = opts.x || 0; cy = opts.y || 0; }
    var iv = intensity.v;
    if (ball) {
      var bc = centreOf(ball);
      if (bc) { var d = Math.hypot(bc.x - cx, bc.y - cy); iv = Math.max(0, Math.min(1, (far - d) / (far - near))); }
    }
    render(iv, opts.ripple === false ? 0 : (performance.now() - t0) * 0.0016);
  }
  gsap.ticker.add(tick);
  var st = ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: function (s) { active = s.isActive; }
  });

  return { i: intensity, kill: function () { gsap.ticker.remove(tick); st.kill(); els.forEach(function (c) { c.remove(); }); } };
};
