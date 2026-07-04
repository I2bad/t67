/* storytelling.js — the ball detaches and free-travels a winding SVG path
   (MotionPathPlugin, scrubbed). Word pills pop in to build a sentence timed
   to the ball's position; line-art scenes draw themselves in; peer dots
   nudge the ball off course. Exposes window.initStory(ctx). */
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
        trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 0.7
      }
    });

    // The defining move: ball follows the invisible winding path, 0 → 1
    tl.to(ball, {
      motionPath: { path: '#storyPath', align: '#storyPath', alignOrigin: [0.5, 0.5] },
      duration: 10
    }, 0);

    // Word pills build the sentence, timed to the ball's travel
    var wordTimes = [0.6, 2.0, 3.4, 5.0, 6.6, 8.0];
    words.forEach(function (w, i) {
      tl.to(w, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, wordTimes[i]);
    });

    // Line-art scenes draw themselves in (pathLength=1 → dashoffset 1 → 0)
    var sceneTimes = [1.2, 3.2, 5.6, 7.8];
    scenes.forEach(function (sel, i) {
      tl.to(sel + ' .art', { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power1.inOut' }, sceneTimes[i])
        .to(sel + ' .scene-label', { opacity: 1, duration: 0.4 }, sceneTimes[i] + 0.9);
    });

    // Peer-dot nudge #1: dot rushes the ball around 40% of the journey
    // (ball is near ~(480,500) then). Kick is applied to the inner circle so
    // it composes with the motion-path transform on the group.
    tl.to('.sp1', { attr: { cx: 500, cy: 545 }, duration: 0.8, ease: 'power2.in' }, 3.6)
      .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.12, ease: 'power2.in' }, 4.35)
      .to(ballCircle, { x: 34, y: -26, duration: 0.5, ease: 'power3.out' }, 4.4)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' }, 4.45)
      .to(ballCircle, { x: 0, y: 0, duration: 1.4, ease: 'power1.inOut' }, 5.1)
      .to('.sp1', { attr: { cx: 430, cy: 600 }, duration: 1 }, 4.5);

    // Nudge #2: around 70%, near (1000,430)
    tl.to('.sp2', { attr: { cx: 1005, cy: 405 }, duration: 0.7, ease: 'power2.in' }, 6.6)
      .to(ballCircle, { scaleX: 0.65, scaleY: 1.3, duration: 0.12, ease: 'power2.in' }, 7.25)
      .to(ballCircle, { x: -20, y: 36, duration: 0.5, ease: 'power3.out' }, 7.3)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, 7.35)
      .to(ballCircle, { x: 0, y: 0, duration: 1.2, ease: 'power1.inOut' }, 7.9)
      .to('.sp2', { attr: { cx: 1080, cy: 380 }, duration: 0.9 }, 7.4);
  };
})();
