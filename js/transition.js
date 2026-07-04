/* transition.js — wow moment #2: the seam between the dark "how it works"
   header and lesson one is replaced by a zoom-through morph. The ball (a
   cream dot) swells until it fills the screen, and the first pastel panel
   blooms open from inside it as a growing circle — a continuous camera-zoom
   with no visible cut. The shader background's flow spikes through it.
   The medium demonstrates the message: you enter the lessons through "you". */
window.initZoomTransition = function (ctx) {
  'use strict';
  if (ctx.reduced || QUALITY.mobile) return;

  var panel = document.getElementById('belonging');
  var dot = document.createElement('div');
  dot.className = 'zoom-dot';
  document.body.appendChild(dot);

  var ORIGIN = '50% 42%'; // where the circle blooms from, on both layers
  gsap.set(panel, { clipPath: 'circle(0% at ' + ORIGIN + ')' });

  // scale needed for the 400px base dot to cover any viewport corner
  function coverScale() {
    return (Math.hypot(window.innerWidth, window.innerHeight) / 400) * 1.06;
  }
  var SMALL = 56 / 400; // on-screen "ball" size while it arrives

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#how-intro', start: 'center center',
      endTrigger: panel, end: 'top top',
      scrub: 0.8, invalidateOnRefresh: true,
      onToggle: function () { if (window.BG) BG.pulse(); } // flow spike at the seam
    }
  });

  // anticipation: the outgoing heading recedes — the camera pulls focus
  tl.to('#how-intro .giant-heading', {
    scale: 0.9, autoAlpha: 0.35, filter: 'blur(3px)',
    transformOrigin: '50% 50%', duration: 1, ease: EASE.soft
  }, 0)
    .to('#how-intro .kicker', { autoAlpha: 0, duration: 0.5, ease: EASE.soft }, 0)
    // the ball arrives small... (early: it must cover the viewport BEFORE
    // the section palette switches underneath it, or the seam shows)
    .fromTo(dot, { autoAlpha: 0, scale: SMALL * 0.15 },
      { autoAlpha: 1, scale: SMALL, duration: 0.4, ease: EASE.out }, 0.05)
    // ...breathes once (anticipation before the leap)...
    .to(dot, { scale: SMALL * 0.82, duration: 0.25, ease: EASE.soft }, 0.5)
    // ...then swells to swallow the viewport
    .to(dot, { scale: coverScale, duration: 1.3, ease: EASE.inOut }, 0.8)
    // the lesson blooms open from inside the ball
    .to(panel, {
      clipPath: 'circle(141% at ' + ORIGIN + ')', duration: 1.7, ease: EASE.inOut
    }, 1.7)
    // content settles from a slight zoom — the "camera" lands
    .fromTo(panel.querySelector('.concept-inner'),
      { scale: 1.07, transformOrigin: '50% 15%' },
      { scale: 1, duration: 1.7, ease: EASE.soft }, 1.7)
    .to(dot, { autoAlpha: 0, duration: 0.5, ease: EASE.soft }, 2.9);
};
