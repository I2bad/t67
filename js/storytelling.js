/* storytelling.js — the ball detaches and free-travels a winding SVG path
   (MotionPathPlugin, scrubbed) through three small dioramas: a lunch table
   under a lamp, a phone with a living feed, and a flocking crowd that opens
   to swallow it — plus the doorway out. Scenes draw on as line-art, then
   their light/fills breathe in; ambient life (talk ripples, feed scroll,
   boids flock) loops while the section is on screen. Word pills and peer
   nudges ride the same scrub. Exposes window.initStory(ctx). */
(function () {
  'use strict';

  window.initStory = function (ctx) {
    var reduced = ctx.reduced;
    var svg = document.getElementById('storySvg');
    var ball = document.getElementById('storyBall');
    var ballCircle = ball.querySelector('.ballc');
    var words = gsap.utils.toArray('.story-word');
    var scenes = ['.scene-table', '.scene-phone', '.scene-crowd', '.scene-door'];

    gsap.set(ballCircle, { transformOrigin: '50% 50%' });

    /* ---------- build the living details (shared by all modes) ---------- */

    // phone: a mini feed of cards inside the screen clip
    var roll = svg.querySelector('.feed-roll');
    for (var i = 0; i < 8; i++) {
      var cy = 170 + i * 48;
      ILLO.create('rect', { x: 658, y: cy, width: 74, height: 36, rx: 5, 'class': 'feed-card' }, roll);
      ILLO.create('circle', { cx: 668, cy: cy + 10, r: 4.5, 'class': 'feed-card-avatar' }, roll);
      ILLO.create('rect', { x: 678, y: cy + 7, width: 44, height: 4, rx: 2, 'class': 'feed-card-line' }, roll);
      ILLO.create('rect', { x: 678, y: cy + 16, width: 30, height: 4, rx: 2, 'class': 'feed-card-line' }, roll);
    }

    // crowd: a boids-lite flock parked on the ball's route
    var flock = ILLO.flock(svg.querySelector('.flock-home'), 13, 880, 600, 190);

    /* ---------- reduced motion: a composed final still ---------- */
    if (reduced) {
      gsap.set(ball, {
        motionPath: { path: '#storyPath', align: '#storyPath', alignOrigin: [0.5, 0.5], end: 1 }
      });
      flock.still();
      svg.querySelector('.like-count').textContent = '♡ 312';
      return;
    }

    // fills/glows start invisible and breathe in to their designed opacity
    // AFTER the line-art of their scene has drawn (tween to CSS value)
    function fadeUp(tl, sel, time, dur) {
      gsap.utils.toArray(sel).forEach(function (el) {
        var o = parseFloat(getComputedStyle(el).opacity) || 1;
        gsap.set(el, { opacity: 0 });
        tl.to(el, { opacity: o, duration: dur || 1.2, ease: EASE.soft }, time);
      });
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

    // Word pills build the sentence, timed to the ball's travel
    var wordTimes = [0.6, 2.0, 3.4, 5.0, 6.6, 8.0];
    words.forEach(function (w, i) {
      gsap.set(w, { rotation: i % 2 ? 4 : -4 });
      tl.to(w, { scale: 1, rotation: 0, duration: 0.55, ease: EASE.pop }, wordTimes[i]);
    });

    /* ---------- scenes: line-art draws, then light arrives ---------- */
    var sceneTimes = [1.0, 3.1, 5.2, 7.8];
    scenes.forEach(function (sel, i) {
      if (document.querySelector(sel + ' .art')) { // crowd has no strokes — it's all flock
        tl.to(sel + ' .art', {
          strokeDashoffset: 0, duration: 1.3, ease: EASE.inOut,
          stagger: { each: 0.14, ease: EASE.soft }
        }, sceneTimes[i]);
      }
      tl.to(sel + ' .scene-label', { opacity: 1, duration: 0.5, ease: EASE.soft }, sceneTimes[i] + 1.0);
    });
    // light/fill layers follow their strokes a beat later (overlap)
    fadeUp(tl, '.scene-table .lamp-glow, .scene-table .light-pool, .scene-table .scene-shadow', 1.8);
    fadeUp(tl, '.scene-table .table-peer, .scene-table .seat-ghost', 2.1, 0.7);
    fadeUp(tl, '.scene-phone .screen-glow, .scene-phone .phone-screen, .scene-phone .feed, .scene-phone .like-count', 3.9);
    fadeUp(tl, '.scene-crowd .flock-home, .scene-crowd .scene-shadow', 5.3);
    fadeUp(tl, '.scene-door .lamp-glow, .scene-door .scene-shadow', 8.6);

    // the ball leans toward the phone's glow as it passes (pulled by it)
    tl.to(ballCircle, { x: 22, y: -14, scaleX: 1.08, duration: 0.7, ease: EASE.soft }, 3.9)
      .to(ballCircle, { x: 0, y: 0, scaleX: 1, duration: 0.9, ease: EASE.soft }, 4.7);

    /* ---------- parallax depth: layers drift at different rates ---------- */
    [['.scene-table', 26, -20], ['.scene-phone', -34, 24], ['.scene-crowd', 14, -14], ['.scene-door', -22, 28]]
      .forEach(function (d) {
        tl.fromTo(d[0], { y: d[1] }, { y: d[2], duration: 10, ease: 'none' }, 0);
      });

    /* ---------- peer-dot nudges (anticipation → rush → follow-through) ---------- */
    tl.to('.sp1', { attr: { cx: 585, cy: 665 }, duration: 0.3, ease: EASE.soft }, 3.4)
      .to('.sp1', { attr: { cx: 500, cy: 545 }, duration: 0.7, ease: EASE.in }, 3.75)
      .to(ballCircle, { scaleX: 0.6, scaleY: 1.35, duration: 0.12, ease: EASE.in }, 4.4)
      .to(ballCircle, { x: 34, y: -26, duration: 0.6, ease: EASE.out }, 4.45)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.38)' }, 4.5)
      .to(ballCircle, { x: 0, y: 0, duration: 1.6, ease: EASE.soft }, 5.2)
      .to('.sp1', { attr: { cx: 430, cy: 600 }, duration: 1.2, ease: EASE.out }, 4.55);

    tl.to('.sp2', { attr: { cx: 1010, cy: 355 }, duration: 0.25, ease: EASE.soft }, 6.45)
      .to('.sp2', { attr: { cx: 1005, cy: 405 }, duration: 0.6, ease: EASE.in }, 6.75)
      .to(ballCircle, { scaleX: 0.65, scaleY: 1.3, duration: 0.12, ease: EASE.in }, 7.3)
      .to(ballCircle, { x: -20, y: 36, duration: 0.6, ease: EASE.out }, 7.35)
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.38)' }, 7.4)
      .to(ballCircle, { x: 0, y: 0, duration: 1.4, ease: EASE.soft }, 8)
      .to('.sp2', { attr: { cx: 1080, cy: 380 }, duration: 0.9, ease: EASE.out }, 7.45);

    // consistent ball identity: a cream ghost trail through the dark world
    // (no contact shadow — ink-on-near-black wouldn't read)
    ILLO.ballFX(svg, ball, ballCircle, { r: 26, contact: false });

    /* ---------- ambient life: loops that run while the story is on screen ---------- */
    var loops = [];
    var loopsOn = false;

    function startLoops() {
      if (loopsOn) return;
      loopsOn = true;
      var tableScene = svg.querySelector('.scene-table');
      // two members mid-conversation — ripples out of sync
      loops.push(ILLO.talk(tableScene, 248, 470, 0).tween);
      loops.push(ILLO.talk(tableScene, 322, 484, 0.9).tween);
      // the empty seat quietly invites
      loops.push(gsap.to('.seat-ghost', { opacity: 0.25, duration: 1.4, yoyo: true, repeat: -1, ease: EASE.soft }));
      // the feed scrolls forever; the like counter climbs with it
      loops.push(gsap.to(roll, {
        y: -96, duration: 3.2, repeat: -1, ease: 'none',
        modifiers: { y: function (y) { return (parseFloat(y) % 96) + 'px'; } }
      }));
      var likes = { n: 0 }, likeEl = svg.querySelector('.like-count');
      loops.push(gsap.to(likes, {
        n: 312, duration: 24, repeat: -1, ease: 'none',
        onUpdate: function () { likeEl.textContent = '♡ ' + Math.floor(likes.n); }
      }));
    }
    function stopLoops() {
      loopsOn = false;
      loops.forEach(function (t) { t.kill(); });
      loops = [];
    }

    // flock simulation + gap-opening, driven from the shared ticker
    var storyActive = false;
    var lowTier = QUALITY.tier === 'low';
    if (lowTier) flock.still();
    function flockTick() {
      if (!storyActive || lowTier) return;
      var p = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
      // as the ball arrives (~55–70% of the journey) the organism parts,
      // then closes behind it — it swallows you and moves on
      flock.repelFrom(p > 0.53 && p < 0.72 ? 880 : null, 600);
      flock.tick();
    }
    gsap.ticker.add(flockTick);

    ScrollTrigger.create({
      trigger: '#story', start: 'top bottom', end: 'bottom top',
      onToggle: function (self) {
        storyActive = self.isActive;
        if (self.isActive) startLoops(); else stopLoops();
      }
    });

    QUALITY.on(function (tier) {
      lowTier = tier === 'low';
      if (lowTier) flock.still();
    });
  };
})();
