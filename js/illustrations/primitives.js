/* illustrations/primitives.js — the shared illustration system. Every scene
   builds from the same small family of primitives so the page feels like one
   hand drew it, while each section keeps its own visual treatment:
   peers with states, connective threads, ripples, ghosts/echoes, breathing,
   and a tiny boids-style flock. All loops are gated by the caller
   (reduced-motion / visibility) — primitives never start their own RAF. */
window.ILLO = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function create(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  return {
    create: create,

    // a peer circle; state via class: 'soft' (filled, no stroke) or line-art
    peer: function (parent, x, y, r, cls) {
      return create('circle', { cx: x, cy: y, r: r, 'class': cls || 'peer' }, parent);
    },

    // connective thread between two members (draw on with strokeDashoffset)
    thread: function (parent, x1, y1, x2, y2, cls) {
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 14; // gentle arc
      return create('path', {
        d: 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2,
        pathLength: 1, 'class': cls || 'thread art'
      }, parent);
    },

    // expanding ripple ring; returns the element (caller tweens or loops it)
    ripple: function (parent, x, y, cls) {
      return create('circle', { cx: x, cy: y, r: 10, 'class': cls || 'ripple' }, parent);
    },

    // ghost/echo of the ball — dashed memory of where it was / meant to be
    ghost: function (parent, x, y, r) {
      return create('circle', { cx: x, cy: y, r: r, 'class': 'self-ghost' }, parent);
    },

    // synchronized breathing on a set of nodes (subtle; time-based loop)
    breathe: function (els, amount, dur) {
      return gsap.to(els, {
        scale: 1 + (amount || 0.05), transformOrigin: '50% 50%',
        duration: dur || 2.2, yoyo: true, repeat: -1, ease: EASE.soft,
        stagger: { each: 0.12, from: 'center' }
      });
    },

    // a looping "talk ripple" above a peer — small ring that grows + fades
    talk: function (parent, x, y, delay) {
      var ring = create('circle', { cx: x, cy: y, r: 4, 'class': 'talk-ring' }, parent);
      var tw = gsap.fromTo(ring, { attr: { r: 4 }, opacity: 0.7 },
        { attr: { r: 14 }, opacity: 0, duration: 1.6, repeat: -1, repeatDelay: 1.1, delay: delay || 0, ease: EASE.out });
      return { el: ring, tween: tw };
    },

    /* boids-lite flock: n dots moving as one organism inside bounds.
       api.tick(dt) steps it (call from one shared ticker); api.repelFrom(x,y)
       opens a gap; api.still() freezes into a composed cluster (reduced/low). */
    flock: function (parent, n, cx, cy, spread) {
      var dots = [], i;
      for (i = 0; i < n; i++) {
        dots.push({
          el: create('circle', {
            cx: 0, cy: 0, r: 5 + Math.random() * 6,
            'class': 'peer flock-dot'
          }, parent),
          x: cx + (Math.random() - 0.5) * spread,
          y: cy + (Math.random() - 0.5) * spread,
          vx: 0, vy: 0,
          ph: Math.random() * Math.PI * 2
        });
      }
      var repel = null, t = 0;
      return {
        dots: dots,
        repelFrom: function (x, y) { repel = x === null ? null : { x: x, y: y }; },
        tick: function () {
          t += 0.016;
          // slow wandering centroid target — the organism breathes and turns
          var tx = cx + Math.sin(t * 0.4) * spread * 0.35;
          var ty = cy + Math.cos(t * 0.31) * spread * 0.28;
          dots.forEach(function (d, j) {
            var ax = (tx - d.x) * 0.0025 + Math.sin(t * 1.3 + d.ph) * 0.05; // cohesion + noise
            var ay = (ty - d.y) * 0.0025 + Math.cos(t * 1.1 + d.ph) * 0.05;
            dots.forEach(function (o) { // separation
              if (o === d) return;
              var dx = d.x - o.x, dy = d.y - o.y, q = dx * dx + dy * dy;
              if (q < 900 && q > 0.01) { ax += dx / q * 3.5; ay += dy / q * 3.5; }
            });
            if (repel) {
              var rx = d.x - repel.x, ry = d.y - repel.y, rd = Math.hypot(rx, ry);
              if (rd < 110 && rd > 0.01) { ax += rx / rd * 0.45; ay += ry / rd * 0.45; }
            }
            d.vx = (d.vx + ax) * 0.92; d.vy = (d.vy + ay) * 0.92;
            d.x += d.vx; d.y += d.vy;
            d.el.setAttribute('cx', d.x); d.el.setAttribute('cy', d.y);
          });
        },
        still: function () { // composed final cluster for reduced/low tiers
          dots.forEach(function (d, j) {
            var a = (j / dots.length) * Math.PI * 2;
            var r = spread * (0.18 + 0.22 * ((j * 7) % 3) / 2);
            d.el.setAttribute('cx', cx + Math.cos(a) * r);
            d.el.setAttribute('cy', cy + Math.sin(a) * r * 0.75);
          });
        }
      };
    }
  };
})();
