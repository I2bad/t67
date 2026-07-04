/* ball.js — the "you" ball in the hero: kinetic sentences slide past while
   the ball sits pinned on its line, then peer dots arrive and visibly nudge
   it off course. When the physics layer (js/physics.js) owns the hero, this
   module only drives the sentences — the ball and dots become real bodies.
   Exposes window.initHero(ctx). */
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

    var physicsOwnsBall = function () { return !!window.PHYSICS; };

    // Idle "alive" wobble on the ball (time-based, not scrubbed — subtle).
    // Skipped when physics owns the ball; momentum does the living then.
    gsap.to(ballCircle, {
      scale: 1.045, duration: 1.8, yoyo: true, repeat: -1, ease: EASE.soft,
      onRepeat: function () { if (physicsOwnsBall()) this.kill(); }
    });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#intro', start: 'top top', end: 'bottom bottom', scrub: 0.8
      }
    });

    // Giant sentences travel horizontally past the pinned ball
    tl.fromTo(line1, { x: () => window.innerWidth * 0.55 },
                     { x: () => -line1.scrollWidth * 0.9, duration: 6 }, 0)
      .fromTo(line2, { x: () => window.innerWidth * 0.9 },
                     { x: () => -line2.scrollWidth * 0.75, duration: 6 }, 1.5)
      .to(hint, { autoAlpha: 0, y: 20, duration: 0.5, ease: EASE.soft }, 0.3);

    // The tweened nudge choreography only runs when physics doesn't —
    // otherwise real collisions produce it (Phase 2 wow moment #1).
    tl.call(function () {}, [], 3); // keep timeline length stable either way
    if (!physicsOwnsBall()) {
      // Peer dots slide in along the line...
      tl.to('.hero-peer.p1', { attr: { cx: 790 }, duration: 2, ease: EASE.in }, 3)
        .to('.hero-peer.p2', { attr: { cx: 866 }, duration: 2, ease: EASE.in }, 3.2);

      // ...anticipation: the first dot pulls back a touch before striking
      tl.to('.hero-peer.p1', { attr: { cx: 812 }, duration: 0.3, ease: EASE.soft }, 4.7)
        .to('.hero-peer.p1', { attr: { cx: 776 }, duration: 0.2, ease: EASE.in }, 5)
        // first bump: squash + shove left, long elastic settle
        .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.15, ease: EASE.in }, 5.15)
        .to(ball, { x: -70, duration: 0.7, ease: EASE.out }, 5.25)
        .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.38)' }, 5.3)
        .to('.hero-peer.p1', { attr: { cx: 748 }, duration: 0.5, ease: EASE.out }, 5.25);

      // second, harder bump: wind-up, then pushed below the line entirely
      tl.to('.hero-peer.p2', { attr: { cx: 900 }, duration: 0.35, ease: EASE.soft }, 6)
        .to('.hero-peer.p2', { attr: { cx: 700 }, duration: 0.6, ease: EASE.in }, 6.35)
        .to(ballCircle, { scaleX: 0.55, scaleY: 1.4, duration: 0.15, ease: EASE.in }, 6.9)
        .to(ball, { x: -150, y: 90, duration: 1.1, ease: EASE.out }, 7)
        .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 1.0, ease: 'elastic.out(1, 0.32)' }, 7.05)
        // follow-through: the ring keeps expanding after the ball has left
        .to('.hero-ring', { attr: { r: 62 }, opacity: 0.18, duration: 1.4, ease: EASE.soft }, 7.1);
    } else {
      // physics owns the ball — fade the SVG stand-ins, the field renders them
      gsap.set(['#heroBall', '.hero-peer'], { autoAlpha: 0 });
      tl.to('.hero-ring', { attr: { r: 60 }, opacity: 0.25, duration: 2, ease: EASE.soft }, 6);
    }
  };
})();
