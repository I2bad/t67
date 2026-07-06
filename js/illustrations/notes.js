/* illustrations/notes.js — SYSTEM 2: the "field notes" layer. Thin dotted
   construction lines, measurement brackets, small force arrows, and mono-type
   labels ("FIG. 01 — …", "force: increasing") — the .ed physics-diagram
   annotation over each scene. Built INTO the demo's scrub timeline so each note
   reveals at the moment it becomes true and hides on scroll-back. Lines draw
   on; labels fade in. Low tier / reduced motion: final state, no draw-on.

   ILLO.notes(svg, tl, [ {k, ...opts, at} ]) — kinds:
     label   {x, y, t, at, fig, anchor}          fade in mono text
     dline   {x1,y1,x2,y2, at, dur}              dotted construction line, grows
     bracket {x1,y1,x2,y2, t, side, at}          measurement bracket + caption
     arrow   {x, y, a, len, at, out}             force arrow (accent), fades in  */
window.ILLO = window.ILLO || {};
ILLO.notes = function (svg, tl, list) {
  'use strict';
  var still = QUALITY.reduced || QUALITY.tier === 'low';
  var g = ILLO.create('g', { 'class': 'notes' }, svg); // appended last → on top

  function bracket(n) {
    var horiz = n.y1 === n.y2, d, cx, cy, anchor = 'middle';
    if (horiz) {
      var ty = n.side === 'down' ? n.y1 + 6 : n.y1 - 6;
      d = 'M' + n.x1 + ',' + ty + ' V' + n.y1 + ' H' + n.x2 + ' V' + ty;
      cx = (n.x1 + n.x2) / 2; cy = n.side === 'down' ? n.y1 + 24 : n.y1 - 12;
    } else {
      var tx = n.side === 'right' ? n.x1 + 6 : n.x1 - 6;
      d = 'M' + tx + ',' + n.y1 + ' H' + n.x1 + ' V' + n.y2 + ' H' + tx;
      cx = n.side === 'right' ? n.x1 + 12 : n.x1 - 12; cy = (n.y1 + n.y2) / 2 + 5;
      anchor = n.side === 'right' ? 'start' : 'end';
    }
    return { d: d, cx: cx, cy: cy, anchor: anchor };
  }

  function arrow(x, y, a, len) {
    var tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len, h = 11;
    var l = a + Math.PI - 0.5, r = a + Math.PI + 0.5;
    var d = 'M' + x + ',' + y + ' L' + tx + ',' + ty +
      ' M' + tx + ',' + ty + ' L' + (tx + Math.cos(l) * h) + ',' + (ty + Math.sin(l) * h) +
      ' M' + tx + ',' + ty + ' L' + (tx + Math.cos(r) * h) + ',' + (ty + Math.sin(r) * h);
    return ILLO.create('path', { d: d, 'class': 'note-arrow' }, g);
  }

  list.forEach(function (n) {
    var at = n.at || 0, dur = n.dur || 0.7, el, cap;

    if (n.k === 'label') {
      el = ILLO.create('text', { x: n.x, y: n.y, 'class': 'note-label' + (n.fig ? ' note-fig' : '') }, g);
      if (n.anchor) el.setAttribute('text-anchor', n.anchor);
      el.textContent = n.t;
      if (still) return;
      gsap.set(el, { opacity: 0, y: 6 });
      tl.to(el, { opacity: 1, y: 0, duration: dur, ease: EASE.soft }, at);

    } else if (n.k === 'dline') {
      el = ILLO.create('line', { x1: n.x1, y1: n.y1, x2: n.x2, y2: n.y2, 'class': 'note-dline' }, g);
      if (still) return;
      gsap.set(el, { attr: { x2: n.x1, y2: n.y1 } });
      tl.to(el, { attr: { x2: n.x2, y2: n.y2 }, duration: n.dur || 1.0, ease: EASE.inOut }, at);

    } else if (n.k === 'bracket') {
      var b = bracket(n);
      el = ILLO.create('path', { d: b.d, pathLength: 1, 'class': 'note-bracket' }, g);
      cap = ILLO.create('text', { x: b.cx, y: b.cy, 'text-anchor': b.anchor, 'class': 'note-label' }, g);
      cap.textContent = n.t;
      if (still) return;
      gsap.set(el, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(cap, { opacity: 0 });
      tl.to(el, { strokeDashoffset: 0, duration: dur, ease: EASE.inOut }, at)
        .to(cap, { opacity: 1, duration: dur, ease: EASE.soft }, at + 0.2);

    } else if (n.k === 'arrow') {
      el = arrow(n.x, n.y, n.a, n.len || 46);
      if (still) return;
      gsap.set(el, { opacity: 0, scale: 0.7, transformOrigin: n.x + 'px ' + n.y + 'px' });
      tl.to(el, { opacity: 1, scale: 1, duration: 0.5, ease: EASE.pop }, at);
      if (n.out != null) tl.to(el, { opacity: 0, duration: 0.6, ease: EASE.soft }, n.out);
    }
  });
  return g;
};
