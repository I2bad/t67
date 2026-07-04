/* storytelling.js — the ball detaches and free-travels a winding SVG path
   (MotionPathPlugin, scrubbed). Word pills pop in to build a sentence timed
   to the ball's position; line-art scenes draw themselves in; peer dots
   nudge the ball off course — each nudge now has anticipation (a wind-back
   before the rush) and follow-through (drift after contact).
   Exposes window.initStory(ctx). */
(function () {
  'use strict';

  window.initStory = function (ctx) {
    var reduced = ctx.reduced;
    var ball = document.getElementById('storyBall');
    var ballCircle = ball.querySelector('.ballc');
    var words = gsap.utils.toArray('.story-word');
    var scenes = ['.scene-table', '.scene-phone', '.scene-crowd', '.scene-door'];

    gsap.set(ballCircle, { transformOrigin: '50% 50%' });

    if (reduced) {
      // Final state: ball at the end of its path, everything visible
      gsap.set(ball, {
        motionPath: { path: '#storyPath', align: '#storyPath', alignOrigin: [0.5, 0.5], end: 1 }
      });
      return;
    }

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 0.8
      }
    });

    // The defining move: ball follows the invisible winding path, 0 → 1
    tl.to(ball, {
      motionPath: { path: '#storyPath', align: '#storyPath', alignOrigin: [0.5, 0.5] },
      duration: 10
    }, 0);

    // Word pills build the sentence, timed to the ball's travel — overshoot
    // pop with a slight rotation settle so each lands like a stamp
    var wordTimes = [0.6, 2.0, 3.4, 5.0, 6.6, 8.0];
    words.forEach(function (w, i) {
      gsap.set(w, { rotation: i % 2 ? 4 : -4 });
      tl.to(w, { scale: 1, rotation: 0, duration: 0.55, ease: EASE.pop }, wordTimes[i]);
    });

    // Line-art scenes draw themselves in (pathLength=1 → dashoffset 1 → 0),
    // strokes staggered so each scene assembles rather than appears
    var sceneTimes = [1.2, 3.2, 5.6, 7.8];
    scenes.forEach(function (sel, i) {
      tl.to(sel + ' .art', {
        strokeDashoffset: 0, duration: 1.4, ease: EASE.inOut,
        stagger: { each: 0.15, ease: EASE.soft }
      }, sceneTimes[i])
        .to(sel + ' .scene-label', { opacity: 1, duration: 0.5, ease: EASE.soft }, sceneTimes[i] + 1.05);
    });

    // Peer-dot nudge #1 (~40% of the journey, ball near (480,500)).
    // Kick is applied to the inner circle so it composes with the
    // motion-path transform on the group.
    tl.to('.sp1', { attr: { cx: 585, cy: 665 }, duration: 0.3, ease: EASE.soft }, 3.4)  // anticipation: wind back
      .to('.sp1', { attr: { cx: 500, cy: 545 }, duration: 0.7, ease: EASE.in }, 3.75)   // rush
      .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.12, ease: EASE.in }, 4.4)
      .to(ballCircle, { x: 34, y: -26, duration: 0.6, ease: EASE.out }, 4.45)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.38)' }, 4.5)
      .to(ballCircle, { x: 0, y: 0, duration: 1.6, ease: EASE.soft }, 5.2)
      .to('.sp1', { attr: { cx: 430, cy: 600 }, duration: 1.2, ease: EASE.out }, 4.55); // follow-through drift

    // Nudge #2 (~70%, near (1000,430)) — same grammar, different direction
    tl.to('.sp2', { attr: { cx: 1010, cy: 355 }, duration: 0.25, ease: EASE.soft }, 6.45)
      .to('.sp2', { attr: { cx: 1005, cy: 405 }, duration: 0.6, ease: EASE.in }, 6.75)
      .to(ballCircle, { scaleX: 0.65, scaleY: 1.3, duration: 0.12, ease: EASE.in }, 7.3)
      .to(ballCircle, { x: -20, y: 36, duration: 0.6, ease: EASE.out }, 7.35)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.38)' }, 7.4)
      .to(ballCircle, { x: 0, y: 0, duration: 1.4, ease: EASE.soft }, 8)
      .to('.sp2', { attr: { cx: 1080, cy: 380 }, duration: 1.1, ease: EASE.out }, 7.45);
  };
})();
