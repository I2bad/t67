/* illustrations/diorama.js — SYSTEM 1: a top-down "diorama" of the real
   social setting behind each concept's actors. Flat geometric props (rounded
   rects, rings, dim dots) in the section's --accent at reduced opacity, so the
   ball and peer dots always dominate. Props are STATIC SVG — the slight
   parallax against the actor layer is added by the demo loop in main.js.
   ILLO.diorama(svg, name) builds the group behind everything and returns it.  */
window.ILLO = window.ILLO || {};
ILLO.diorama = function (svg, name) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'diorama');

  // prop shorthands — all append into the diorama group
  function box(x, y, w, h, rx, cls) { return ILLO.create('rect', { x: x, y: y, width: w, height: h, rx: rx == null ? 12 : rx, 'class': cls || 'prop' }, g); }
  function ring(cx, cy, r, cls) { return ILLO.create('circle', { cx: cx, cy: cy, r: r, 'class': cls || 'prop-line' }, g); }
  function dot(cx, cy, r) { return ILLO.create('circle', { cx: cx, cy: cy, r: r, 'class': 'prop-dot' }, g); }
  function line(x1, y1, x2, y2) { return ILLO.create('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'class': 'prop-line' }, g); }
  function label(x, y, t) { var e = ILLO.create('text', { x: x, y: y, 'class': 'prop-label' }, g); e.textContent = t; return e; }

  var scenes = {
    // 01 — overhead lunch table: table outline, trays, one empty seat
    belong: function () {
      box(840, 188, 322, 234, 48, 'prop-line');                 // table top
      [[858, 226, 46, 30], [1002, 202, 46, 30], [1052, 328, 46, 30], [1000, 400, 46, 30]].forEach(function (t) { box(t[0], t[1], t[2], t[3], 8); }); // trays
      ring(880, 308, 30);                                        // the empty seat the ball drifts toward
    },
    // 02 — classroom: blackboard mounting the Asch cards, a row of desks
    conformity: function () {
      box(108, 76, 988, 324, 14, 'prop-line');                  // blackboard behind the cards
      [480, 640, 800, 960].forEach(function (x) { box(x - 46, 516, 92, 40, 8); }); // desks facing the board
    },
    // 03 — locker row: bays the full ball walks past, discarded parts left outside
    fitting: function () {
      [100, 268, 436].forEach(function (x) { box(x, 120, 150, 360, 10, 'prop-line'); line(x + 132, 290, x + 132, 320); }); // locker bays + handles
      dot(372, 432, 15); box(292, 168, 34, 30, 8);              // parts of you, shed outside
    },
    // 04 — food court: two counters, one crowded (where the trail leads), one empty
    looking: function () {
      box(980, 410, 172, 64, 12);                               // crowded counter (branch they took)
      line(986, 400, 1146, 400);                                // its queue rail
      box(980, 120, 172, 64, 12, 'prop-line');                  // the empty counter
    },
    // 05 — party floor around the spotlight: a doorway, cups, watchers at the edge
    direct: function () {
      box(70, 168, 78, 212, 6, 'prop-line'); line(126, 168, 126, 380); // doorway
      [[180, 112], [1042, 132], [206, 470], [1028, 456]].forEach(function (c) { box(c[0], c[1], 20, 26, 6); }); // cups
      [[150, 92], [182, 112], [1052, 100], [1082, 122]].forEach(function (w) { dot(w[0], w[1], 9); });          // watchers
    },
    // 06 — office at 7pm: desk grid, a couple of lamp glows, a lit EXIT nobody takes
    unspoken: function () {
      [[640, 210], [860, 210], [640, 372], [860, 372]].forEach(function (d) { box(d[0], d[1], 96, 46, 8); }); // desks
      ILLO.create('circle', { cx: 688, cy: 233, r: 40, 'class': 'prop-glow' }, g);   // a lamp still on
      ILLO.create('circle', { cx: 908, cy: 395, r: 40, 'class': 'prop-glow' }, g);
      ILLO.create('circle', { cx: 1138, cy: 300, r: 54, 'class': 'prop-glow' }, g);  // the exit's glow
      box(1116, 250, 44, 100, 6, 'prop-line'); label(1092, 236, 'EXIT');             // the door nobody walks toward
    },
    // 07 — a giant phone the ball stands on; static feed chips beneath its feet
    online: function () {
      box(440, 44, 320, 512, 48, 'prop-line');                  // phone body
      box(566, 60, 68, 14, 7); box(576, 534, 48, 8, 4);         // notch + home bar
      [386, 436, 486].forEach(function (y) { box(486, y, 228, 32, 8, 'prop-line'); }); // feed chips at its feet
    },
    // 08 — one subtle doorway on the path forward: walking away is a full sentence
    sayingno: function () {
      box(1052, 248, 60, 104, 6, 'prop-line'); line(1082, 248, 1082, 352);
    }
  };

  var build = scenes[name];
  if (!build) return null;
  build();
  svg.insertBefore(g, svg.firstChild); // behind the actors
  return g;
};
