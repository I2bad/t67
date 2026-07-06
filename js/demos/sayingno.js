/* demos/sayingno.js — Saying No: the finale. The shove comes, the ball
   plants and holds (springy anticipation), pushes the pressure BACK
   (repel impulse on the whole posse), reclaims its straight line with a
   satisfying settle, and an ally eases in alongside. This resolves the arc
   every other demo set up — it gets extra scroll room to breathe (see CSS)
   and a soft chime when the plant lands. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.sayingno = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var NS = 'http://www.w3.org/2000/svg';
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var bully = q('.bully')[0];
  var ally = q('.ally')[0];

  // A small posse follows the bully in — so the push-back has a crowd to move
  var posse = [];
  [[70, 268, 11], [55, 328, 9], [104, 342, 8]].forEach(function (d) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'peer'); c.setAttribute('cx', d[0]); c.setAttribute('cy', d[1]); c.setAttribute('r', d[2]);
    bully.parentNode.insertBefore(c, bully);
    posse.push(c);
  });

  gsap.set(ball, { x: 600, y: 300 });
  gsap.set(ally, { x: 520, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(q('.plant-ring')[0], { transformOrigin: '50% 50%' });

  // pressure field from the pressing dot — peaks on impact, disperses on the plant
  ILLO.field(svg, { follow: bully, base: 40, gap: 22, ball: ballCircle, near: 60, far: 280, min: 0.05, max: 0.15 });

  // CLIMAX veil: a slate wash that dims the whole scene for the plant beat.
  // The ball + "no." bubble are lifted above it so they stay lit (spotlight).
  var veil = null;
  if (!QUALITY.reduced && QUALITY.tier !== 'low') {
    veil = document.createElementNS(NS, 'rect');
    veil.setAttribute('class', 'climax-veil');
    veil.setAttribute('x', 0); veil.setAttribute('y', 0);
    veil.setAttribute('width', 1200); veil.setAttribute('height', 600);
    veil.setAttribute('fill', '#C2D5D7');
    gsap.set(veil, { opacity: 0 });
    svg.appendChild(veil);
    svg.appendChild(q('.no-bubble')[0]); // raise above the veil
    svg.appendChild(ball);
  }

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  // The same charge as section 5 — deliberately mirrored...
  tl.to(bully, { attr: { cx: 92 }, duration: 0.5, ease: EASE.soft }, 0.6)      // wind-up
    .to(bully, { attr: { cx: 554 }, duration: 1.4, ease: EASE.in }, 1.2)       // charge
    .to(posse, { x: 300, duration: 1.6, ease: EASE.in, stagger: { each: 0.1 } }, 1.3);

  // ...but this time: PLANT. Springy anticipation — the ball crouches
  // (widens, grips the line) a beat BEFORE contact. It saw this coming.
  tl.to(ballCircle, { scaleX: 1.18, scaleY: 0.82, duration: 0.35, ease: EASE.soft }, 2.15)
    // impact absorbed: deep squash, position barely gives...
    .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.12, ease: EASE.in }, 2.6)
    .to(ball, { x: 634, duration: 0.25, ease: EASE.out }, 2.65)
    // ...and is taken back. Not shoved. Planted.
    .to(ball, { x: 600, duration: 0.6, ease: EASE.out }, 2.9)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.32)' }, 2.75)
    // The plant reads as a shockwave ring + the word itself + the chime
    .fromTo(q('.plant-ring')[0], { opacity: 0.9, scale: 0.8 },
                                 { opacity: 0, scale: 2.8, duration: 1.3, ease: EASE.out, immediateRender: false }, 2.7)
    .to(q('.no-bubble'), { scale: 1, opacity: 1, duration: 0.6, ease: EASE.pop }, 2.9)
    .call(function () { if (window.AUDIO) AUDIO.chime(); }, [], 2.8);

  // THE BEAT DROP: the world dims for ~a beat while the biggest shockwave of
  // the whole site fires — and physically knocks the crowd back a few px.
  if (veil) tl.to(veil, { opacity: 0.5, duration: 0.22, ease: EASE.out }, 2.52)
              .to(veil, { opacity: 0, duration: 0.7, ease: EASE.soft }, 3.02);
  ILLO.impact(tl, 2.7, svg, 600, 300, { size: 230, particles: 6, nudge: 2 });
  tl.to(bully, { attr: { cx: 500 }, duration: 0.22, ease: EASE.out }, 2.68)   // shock shoves them back
    .to(posse, { x: '-=34', duration: 0.26, ease: EASE.out }, 2.7);

  // REPEL IMPULSE: the pressure gets pushed back — bully hard, posse
  // staggered a beat later (follow-through on the crowd)
  tl.to(bully, { attr: { cx: 310 }, duration: 0.9, ease: EASE.out }, 3.1)
    .to(posse, {
      x: 60, duration: 1.2, ease: EASE.out,
      stagger: { each: 0.12, ease: EASE.soft }
    }, 3.25)
    .to(bully, { attr: { cx: 140 }, opacity: 0.4, duration: 1.6, ease: EASE.soft }, 4.4)
    .to(posse, { opacity: 0.35, duration: 1.4, ease: EASE.soft }, 4.6);

  // THE SNAP: the wobbling dashed path straightens — the wavering version
  // fades as the clean solid line draws itself. The scene brightens; the
  // ball's own edge grows bolder. This is the payoff — give it room.
  tl.to(q('.wavy-path'), { opacity: 0, duration: 1.4, ease: EASE.soft }, 4.1)
    .to(q('.line-past'), { opacity: 0.4, duration: 1.4, ease: EASE.soft }, 4.4)
    .to(q('.glow-lift'), { opacity: 0.5, duration: 2.4, ease: EASE.soft }, 4.5)
    .to(ballCircle, { attr: { 'stroke-width': 4.5 }, duration: 1.2, ease: EASE.soft }, 4.6)
    .to(q('.reclaim-line')[0], { strokeDashoffset: 0, duration: 2.0, ease: EASE.inOut }, 4.2)
    // the straightened line drops into place with an elastic overshoot
    .fromTo(q('.reclaim-line')[0], { y: -6 }, { y: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)', immediateRender: false }, 5.5)
    .to(q('.no-bubble'), { opacity: 0, duration: 0.6, ease: EASE.soft }, 5.4)
    // An ally appears — one other "no" makes the next one easier
    .fromTo(ally, { x: 470 }, { opacity: 1, x: 520, duration: 1.0, ease: EASE.out, immediateRender: false }, 5.6)
    // Both travel the reclaimed line together, ally trailing slightly (overlap)
    .to(ball, { x: 1040, duration: 3.4, ease: EASE.inOut }, 6.4)
    .to(ally, { x: 950, duration: 3.4, ease: EASE.inOut }, 6.65)
    // A small victory stretch at the end — momentum, not struggle
    .to(ballCircle, { scaleX: 1.12, scaleY: 0.9, duration: 0.35, ease: EASE.out }, 9.6)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' }, 9.95);

  // "no." pops rather than fades — set its start state
  // the whole speech bubble pops in around its own centre (above the ball)
  gsap.set(q('.no-bubble'), { scale: 0.5, transformOrigin: '600px 200px', opacity: 0 });

  ILLO.ballFX(svg, ball, ballCircle, { r: 26 });

  // field notes: keep the climax clean — just name the outcome
  ILLO.notes(svg, tl, [
    { k: 'label', fig: true, x: 40, y: 44, t: 'FIG. 08 — SAYING NO', at: 0.2 },
    { k: 'label', x: 850, y: 232, t: 'boundary: held', at: 3.2 }
  ]);
  return tl;
};
