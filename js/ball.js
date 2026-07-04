/* ball.js — the "you" ball in the hero: kinetic sentences slide past while
   the ball sits pinned on its line, then peer dots arrive and visibly nudge
   it off course. Exposes window.initHero(ctx). */
(function () {
  'use strict';

  window.initHero = function (ctx) {
    var reduced = ctx.reduced;
    var ball = document.getElementById('heroBall');
    var ballCircle = ball.querySelector('.ballc');
    var line1 = document.querySelector('.line-1');
    var line2 = document.querySelector('.line-2');
    var hint = document.getElementById('scrollHint');

    gsap.set(ballCircle, { transformOrigin: '50% 50%' });

    if (reduced) return; // static hero: ball on its line, sentences readable

    // Idle "alive" wobble on the ball (time-based, not scrubbed — subtle)
    gsap.to(ballCircle, {
      scale: 1.04, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#intro', start: 'top top', end: 'bottom bottom', scrub: 0.6
      }
    });

    // Giant sentences travel horizontally past the pinned ball
    tl.fromTo(line1, { x: () => window.innerWidth * 0.55 },
                     { x: () => -line1.scrollWidth * 0.9, duration: 6 }, 0)
      .fromTo(line2, { x: () => window.innerWidth * 0.9 },
                     { x: () => -line2.scrollWidth * 0.75, duration: 6 }, 1.5)
      .to(hint, { autoAlpha: 0, duration: 0.5 }, 0.3);

    // Peer dots slide in along the line...
    tl.to('.hero-peer.p1', { attr: { cx: 790 }, duration: 2, ease: 'power1.in' }, 3)
      .to('.hero-peer.p2', { attr: { cx: 866 }, duration: 2, ease: 'power1.in' }, 3.2);

    // ...first bump: squash + shove left
    tl.to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.15, ease: 'power2.in' }, 5)
      .to(ball, { x: -70, duration: 0.5, ease: 'power3.out' }, 5.1)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 5.15)
      .to('.hero-peer.p1', { attr: { cx: 760 }, duration: 0.4 }, 5.1);

    // ...second, harder bump: pushed below the line entirely
    tl.to('.hero-peer.p2', { attr: { cx: 700 }, duration: 0.7, ease: 'power1.in' }, 6)
      .to(ballCircle, { scaleX: 0.55, scaleY: 1.4, duration: 0.15, ease: 'power2.in' }, 6.6)
      .to(ball, { x: -150, y: 90, duration: 0.9, ease: 'power2.out' }, 6.7)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)' }, 6.75)
      .to('.hero-ring', { attr: { r: 60 }, opacity: 0.2, duration: 1 }, 6.7);
  };
})();
