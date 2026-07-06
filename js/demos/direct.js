/* demos/direct.js — Direct pressure staged as a confrontation under a
   spotlight: the ball stands in its pool of light, a bigger bolder peer
   approaches with a wind-up and its dare, then the hard collision — squash,
   spark, impact ripples — and the ball is knocked out of the light,
   wobbling, its shadow trailing it. 3 beats: the stage → the dare → the shove. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.direct = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var bully = q('.bully')[0];
  var shadowYou = q('.shadow-you')[0];
  var shadowBully = q('.shadow-bully')[0];

  gsap.set(ball, { x: 520, y: 300 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  // pressure field emanating from the bully — compresses against the ball as it charges
  ILLO.field(svg, { follow: bully, base: 42, gap: 22, ball: ballCircle, near: 66, far: 300, min: 0.06, max: 0.16 });
  gsap.set(q('.spotlight'), { opacity: 0 });
  gsap.set(q('.shadow-soft'), { opacity: 0 });
  gsap.set(q('.dare'), { opacity: 0, scale: 0.7, transformOrigin: '1005px 223px' });

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — THE STAGE: light finds the ball; shadows ground everything */
  tl.to(q('.spotlight'), { opacity: 0.4, duration: 1.4, ease: EASE.soft }, 0.2)
    .to(q('.shadow-soft'), { opacity: 0.16, duration: 1.0, ease: EASE.soft }, 0.8)
    // small self-assured idle: the ball owns its spot of light
    .to(ballCircle, { scaleY: 1.04, duration: 0.6, yoyo: true, repeat: 1, ease: EASE.soft }, 1.2);

  /* beat 2 — THE DARE: the big one arrives, winds up, says its line */
  tl.to(q('.dare'), { opacity: 1, scale: 1, duration: 0.6, ease: EASE.pop }, 1.9)
    .to(bully, { attr: { cx: 1195 }, duration: 0.7, ease: EASE.soft }, 2.4)   // wind-up, drawn out
    .to(shadowBully, { attr: { cx: 1195 }, duration: 0.7, ease: EASE.soft }, 2.4)
    .to(bully, { attr: { cx: 566 }, duration: 1.4, ease: EASE.in }, 3.2)      // charge!
    .to(shadowBully, { attr: { cx: 566, rx: 40 }, duration: 1.4, ease: EASE.in }, 3.2)
    .to(q('.dare'), { opacity: 0, duration: 0.4 }, 4.1)
    // the ball sees it coming — a flinch just before contact
    .to(ballCircle, { x: 10, duration: 0.25, ease: EASE.soft }, 4.35);

  /* beat 3 — THE SHOVE: spark, shockwave, squash; knocked out of the light */
  tl.to(q('.spark'), { opacity: 1, duration: 0.08 }, 4.7)
    .to(q('.spark'), { opacity: 0, duration: 0.45, ease: EASE.soft }, 4.85)
    .to(ballCircle, { x: 0, scaleX: 0.45, scaleY: 1.5, duration: 0.12, ease: EASE.in }, 4.68);
  // shared impact language — dust sprays leftward with the shove; small nudge
  ILLO.impact(tl, 4.7, svg, 548, 300, { size: 150, particles: 4, dir: Math.PI, nudge: 1.5 });
  tl
    .to(ball, { x: 250, duration: 1.3, ease: EASE.out }, 4.8)                 // shoved out of the pool
    .to(shadowYou, { attr: { cx: 250 }, duration: 1.3, ease: EASE.out }, 4.8) // shadow chases it
    .to(ball, { y: 288, duration: 0.28, ease: EASE.out }, 4.8)                // lifts…
    .to(shadowYou, { attr: { rx: 22 }, opacity: 0.08, duration: 0.28, ease: EASE.out }, 4.8)
    .to(ball, { y: 300, duration: 0.55, ease: 'bounce.out' }, 5.1)            // …lands
    .to(shadowYou, { attr: { rx: 34 }, opacity: 0.16, duration: 0.55, ease: EASE.out }, 5.1)
    .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.1, 0.3)' }, 4.95)
    .to(bully, { attr: { cx: 650 }, duration: 0.6, ease: EASE.out }, 4.8)     // recoil into the light
    .to(shadowBully, { attr: { cx: 650, rx: 32 }, duration: 0.6, ease: EASE.out }, 4.8)
    // out in the dim: the ball reads smaller, less lit — visibly displaced
    .to(ballCircle, { opacity: 0.85, duration: 1.0, ease: EASE.soft }, 6.2)
    .to(q('.spot-pool'), { opacity: 0.5, duration: 1.2, ease: EASE.soft }, 6.2); // the light stays where it was

  // field notes: the mounting force (with the field), then displacement
  ILLO.notes(svg, tl, [
    { k: 'label', fig: true, x: 40, y: 44, t: 'FIG. 05 — DIRECT PRESSURE', at: 0.2 },
    { k: 'arrow', x: 800, y: 300, a: Math.PI, len: 64, at: 3.4, out: 4.7 },
    { k: 'label', x: 620, y: 250, t: 'force: increasing', anchor: 'end', at: 3.4 },
    { k: 'label', x: 170, y: 250, t: 'knocked off its line', at: 5.4 }
  ]);

  return tl;
};
