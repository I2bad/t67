/* illustrations/faces.js — SYSTEM 3 (rolled out): minimal eyes on the ball and
   peer dots across the whole site. Two small marks each, no mouths. Direction
   is the point — eyes look toward what matters and are scrubbed with the scene.
   Each pair tracks its actor's centre AND scales with the actor's live squash
   (read from its transform) so the eyes never float off a stretching ball.
   Reduced motion: eyes present, resting gaze, no darting.

   One switch governs every set of eyes:  ILLO.FACES = false  disables them all.

   ILLO.faces(svg, tl, [
     { el, r, tone:'ink'|'cream', look:[x,y], open, steps:[[t,x,y,open,dur],…] }
   ])  — el is the circle whose rendered box gives centre + squash; look is the
   resting gaze (x right, y down, ~-1..1); steps scrub the gaze on the demo tl.  */
window.ILLO = window.ILLO || {};
ILLO.FACES = true; // ← single flag for all eyes site-wide

ILLO.faces = function (svg, tl, actors) {
  'use strict';
  if (!ILLO.FACES) return null;
  var reduced = QUALITY.reduced;
  var g = ILLO.create('g', { 'class': 'faces' }, svg); // on top — eyes sit on the face
  var pt = svg.createSVGPoint();

  function centre(el) {
    var m = svg.getScreenCTM(); if (!m) return null;
    var b = el.getBoundingClientRect();
    pt.x = b.left + b.width / 2; pt.y = b.top + b.height / 2;
    return pt.matrixTransform(m.inverse());
  }

  var items = actors.map(function (a) {
    var r = a.r || 24, tone = a.tone || 'ink';
    var ctrl = { x: a.look ? a.look[0] : 0, y: a.look ? a.look[1] : 0, open: a.open == null ? 1 : a.open };
    // scrubbed gaze — skipped under reduced motion, leaving the resting look
    if (tl && !reduced && a.steps) a.steps.forEach(function (s) {
      tl.to(ctrl, { x: s[1], y: s[2], open: s[3] == null ? 1 : s[3], duration: s[4] || 0.5, ease: EASE.soft }, s[0]);
    });
    return {
      el: a.el, r: r, ctrl: ctrl,
      e1: ILLO.create('ellipse', { 'class': 'eye-' + tone }, g),
      e2: ILLO.create('ellipse', { 'class': 'eye-' + tone }, g)
    };
  });

  function frame() {
    for (var k = 0; k < items.length; k++) {
      var it = items[k], c = centre(it.el); if (!c) continue;
      var sx = +gsap.getProperty(it.el, 'scaleX') || 1, sy = +gsap.getProperty(it.el, 'scaleY') || 1;
      var spread = it.r * 0.32, rise = it.r * 0.14, gaze = it.r * 0.24, er = Math.max(1, it.r * 0.11);
      var lx = it.ctrl.x, ly = it.ctrl.y, op = it.ctrl.open, pair = [[-1, it.e1], [1, it.e2]];
      // eyes inherit the actor's opacity, so they fade out when a dot dissolves
      // (Fitting mold), retreats (Saying No) or appears (the ally)
      var ao = +gsap.getProperty(it.el, 'opacity'); if (isNaN(ao)) ao = 1;
      for (var i = 0; i < 2; i++) {
        var e = pair[i][1];
        e.setAttribute('cx', (c.x + (pair[i][0] * spread + lx * gaze) * sx).toFixed(2));
        e.setAttribute('cy', (c.y + (-rise + ly * gaze) * sy).toFixed(2));
        e.setAttribute('rx', (er * sx).toFixed(2));
        e.setAttribute('ry', Math.max(0.4, er * op * sy).toFixed(2));
        e.style.opacity = ao;
      }
    }
  }

  var active = false;
  function tick() { if (active) frame(); }
  gsap.ticker.add(tick);
  var st = ScrollTrigger.create({
    trigger: svg.closest('section'), start: 'top bottom', end: 'bottom top',
    onToggle: function (s) { active = s.isActive; if (active) frame(); }
  });
  frame(); // paint once immediately (covers reduced/static)

  return { items: items, ctrl: function (i) { return items[i].ctrl; }, kill: function () { gsap.ticker.remove(tick); st.kill(); } };
};
