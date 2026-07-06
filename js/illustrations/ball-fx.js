/* illustrations/ball-fx.js — site-wide ball identity. The radial-gradient
   fill + drop shadow are pure CSS (so every ball, even static ones, reads as
   one physical object). This module adds the two parts that need per-frame
   tracking: a trailing ghost tail (chain-lerped echoes that bloom while the
   ball moves and melt at rest) and a soft contact shadow beneath it.
   One ticker per ball, gated by section visibility + quality tier. */
window.ILLO = window.ILLO || {};
ILLO.ballFX = function (svg, ballGroup, ballCircle, opts) {
  'use strict';
  opts = opts || {};
  if (QUALITY.reduced) return null;                 // reduced motion: CSS-only identity
  var NS = 'http://www.w3.org/2000/svg';
  var section = svg.closest('section');
  var r = opts.r || 26;
  var wantContact = opts.contact !== false;         // off for dark scenes (ink-on-ink)
  var N = QUALITY.tier === 'low' ? 0 : (opts.echoes || 3);
  var contactRx = opts.contactRx || r * 0.86;
  var contactRy = opts.contactRy || r * 0.3;
  var contactDy = opts.contactDy || r * 0.92;

  var frag = document.createDocumentFragment();
  var contact = null;
  if (wantContact) {
    contact = document.createElementNS(NS, 'ellipse');
    contact.setAttribute('class', 'ball-contact');
    contact.setAttribute('rx', contactRx);
    contact.setAttribute('ry', contactRy);
    frag.appendChild(contact);
  }
  var echoes = [];
  for (var i = 0; i < N; i++) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'ball-echo');
    c.setAttribute('r', r * (1 - i * 0.07));
    c.style.opacity = 0;
    frag.appendChild(c);
    echoes.push({ el: c, x: 0, y: 0 });
  }
  ballGroup.parentNode.insertBefore(frag, ballGroup); // behind the ball, above the scene

  var pt = svg.createSVGPoint();
  function center() {
    var m = svg.getScreenCTM(); if (!m) return null;
    var b = ballCircle.getBoundingClientRect();
    pt.x = b.left + b.width / 2; pt.y = b.top + b.height / 2;
    var p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  var active = false, primed = false;
  function tick() {
    if (!active) return;
    var c = center(); if (!c) return;
    if (!primed) { echoes.forEach(function (e) { e.x = c.x; e.y = c.y; }); primed = true; }
    if (contact) {
      contact.setAttribute('cx', c.x);
      contact.setAttribute('cy', c.y + contactDy);
    }
    // chain-lerp tail: each echo trails the one ahead; opacity tracks how far
    // it has fallen behind, so the tail appears only while the ball is moving
    var tx = c.x, ty = c.y;
    for (var i = 0; i < echoes.length; i++) {
      var e = echoes[i];
      e.x += (tx - e.x) * 0.34; e.y += (ty - e.y) * 0.34;
      e.el.setAttribute('cx', e.x); e.el.setAttribute('cy', e.y);
      var d = Math.hypot(e.x - c.x, e.y - c.y);
      e.el.style.opacity = Math.min(0.42, d * 0.022) * (1 - i * 0.22);
      tx = e.x; ty = e.y;
    }
  }
  gsap.ticker.add(tick);
  var st = ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: function (s) {
      active = s.isActive;
      if (!active) { primed = false; echoes.forEach(function (e) { e.el.style.opacity = 0; }); }
    }
  });

  return { kill: function () { gsap.ticker.remove(tick); st.kill(); } };
};
