/* demos/fitting.js — Normative influence as a mold (silhouette treatment):
   six peers slide together and MERGE into one solid template with a small
   notch; the round ball squeezes in and comes out not-quite-round, leaving
   a dashed ghost of its original shape behind. 3 beats: self → mold →
   altered self. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.fitting = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.ring-formation .peer');
  var mold = q('.mold-fill')[0];

  gsap.set(ball, { x: 160, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(mold, { opacity: 0 });
  gsap.set(q('.fitting-echo'), { opacity: 0 });
  // peers start scattered; their markup positions sit on the mold's perimeter
  var scatter = [[600, 80], [1040, 100], [1120, 340], [880, 520], [590, 500], [500, 180]];
  peers.forEach(function (p, i) {
    gsap.set(p, { x: scatter[i][0] - +p.getAttribute('cx'), y: scatter[i][1] - +p.getAttribute('cy') });
  });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — THE MOLD FORMS: individuals gather, then melt into one shape */
  tl.to(peers, {
    x: 0, y: 0, duration: 2.2, ease: EASE.inOut,
    stagger: { each: 0.14, ease: EASE.soft }
  }, 0)
    // the merge: the silhouette rises as the individuals dissolve into it
    .to(mold, { opacity: 0.13, duration: 1.4, ease: EASE.soft }, 2.3)
    .to(peers, { opacity: 0, duration: 1.1, ease: EASE.soft, stagger: { each: 0.07 } }, 2.5)
    .to(q('.slot'), { opacity: 1, duration: 0.7, ease: EASE.soft }, 3.4);

  /* beat 2 — THE SQUEEZE: approach, breathe, leave your old shape behind */
  tl.to(ball, { x: 480, duration: 2.4, ease: EASE.inOut }, 3.8)
    // the dashed echo of the original, full-size self stays where it was
    .to(q('.fitting-echo'), { opacity: 0.45, duration: 0.9, ease: EASE.soft }, 5.4)
    .to(ballCircle, { scale: 1.08, duration: 0.4, ease: EASE.soft }, 6.0)  // deep breath
    .to(ballCircle, { scaleX: 0.5, scaleY: 0.85, duration: 0.5, ease: EASE.in }, 6.45)
    .to(ball, { x: 634, duration: 0.9, ease: EASE.out }, 6.8);

  /* beat 3 — ALTERED SELF: it fits now… but it isn't round anymore */
  tl.to(ballCircle, { scaleX: 0.62, scaleY: 0.76, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 7.6)
    .to(q('.slot'), { opacity: 0, duration: 0.5 }, 7.7)
    // the mold gives a satisfied pulse around its newest piece
    .to(mold, { opacity: 0.19, duration: 0.5, ease: EASE.out }, 8.3)
    .to(mold, { opacity: 0.14, duration: 0.8, ease: EASE.soft }, 8.8)
    // and the ball's own edge fades a little — less distinct than it was
    .to(ballCircle, { opacity: 0.85, duration: 1.0, ease: EASE.soft }, 8.8);

  return tl;
};
