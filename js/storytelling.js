/* storytelling.js — the intro rebuilt as a scroll obstacle course.
   Two scrubbed tracks: a SMOOTH camera (the .course group pans down a tall
   world) and a BUMPY ball (rolls, falls, lands with squash + shockwave, rolls a
   slope, launches off a ramp, rolls out the doorway). Because the camera is
   smooth and the ball path is bumpy, drops read as real on-screen falls while
   the camera gives the trip its length. Scroll-scrubbed only (reversible).
   Keeps the four waypoint labels + the sentence; keeps ball gradient/shadow/
   trail/eyes. Exposes window.initStory(ctx).

   COMMIT 1 — core mechanic: camera, physics segments, waypoint pills, parallax
   set dressing, eyes, trail. (Living obstacles + differentiators land next.) */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  window.initStory = function (ctx) {
    var reduced = ctx.reduced;
    var svg = document.getElementById('storySvg');
    if (!svg) return;
    var course = svg.querySelector('.course');
    var far = svg.querySelector('.course-far');
    var shapes = svg.querySelector('.course-shapes');
    var pillsG = svg.querySelector('.course-pills');
    var peersG = svg.querySelector('.course-peers');
    var anchor = document.getElementById('storyBallAnchor');
    var ball = document.getElementById('storyBall');
    var ballCircle = ball.querySelector('.ballc');
    var C = function (t, a, p) { return ILLO.create(t, a, p); };

    gsap.set(ballCircle, { transformOrigin: '50% 50%' });

    // ---- beats: world coordinates the course descends through ----
    var BEAT = {
      lunch: { x: 700, y: 720, label: 'the lunch table' },
      phone: { x: 520, y: 1180, label: 'the phone' },
      crowd: { x: 880, y: 1720, label: 'the crowd' },
      door:  { x: 720, y: 2320, label: 'the doorway' }
    };
    var START = { x: 300, y: 300 };

    /* ---------- set dressing: giant thin-outline shapes (two depths) ---------- */
    function shape(tag, attrs, deep) {
      attrs['class'] = 'course-shape' + (deep ? ' deep' : '');
      return C(tag, attrs, deep ? far : shapes);
    }
    // lunch — a big table oval + legs (and a deeper echo)
    shape('ellipse', { cx: 700, cy: 792, rx: 300, ry: 96 });
    shape('line', { x1: 470, y1: 862, x2: 470, y2: 946 });
    shape('line', { x1: 930, y1: 862, x2: 930, y2: 946 });
    shape('ellipse', { cx: 690, cy: 720, rx: 470, ry: 170 }, true);
    // phone — an oversized phone the ball rolls across (+ deep echo)
    shape('rect', { x: 372, y: 940, width: 296, height: 496, rx: 44 });
    shape('rect', { x: 470, y: 958, width: 100, height: 16, rx: 8 });          // speaker
    shape('circle', { cx: 520, cy: 1410, r: 16 });                            // home dot
    shape('rect', { x: 300, y: 900, width: 440, height: 600, rx: 60 }, true);
    // crowd — a field of outlined rings the ball weaves through (living in step 2)
    var crowdRings = [];
    [[760, 1600, 30], [980, 1620, 36], [1040, 1740, 28], [800, 1800, 34],
     [700, 1700, 26], [900, 1660, 30], [1000, 1830, 24], [740, 1880, 30]].forEach(function (d) {
      crowdRings.push(shape('circle', { cx: d[0], cy: d[1], r: d[2] }));
    });
    shape('circle', { cx: 880, cy: 1720, r: 300 }, true);
    // doorway — a huge door outline the ball rolls out through
    shape('rect', { x: 560, y: 2050, width: 320, height: 540, rx: 8 });
    shape('rect', { x: 588, y: 2078, width: 264, height: 512, rx: 4 });
    shape('circle', { cx: 828, cy: 2330, r: 7 });                            // knob
    shape('rect', { x: 500, y: 1990, width: 440, height: 660, rx: 14 }, true);

    /* ---------- the track: thin lines the ball actually rolls on ----------
       laid at ball-bottom (world y + 26); the opening line simply ends, and
       the ball falls off it onto the lunch table. */
    var track = svg.querySelector('.course-track');
    function trk(d) { return C('path', { d: d, 'class': 'course-track-line' }, track); }
    trk('M180,326 H690');                       // the opening line (ends → drop)
    trk('M700,748 L520,1208');                  // slope down to the phone
    trk('M452,1236 L612,1150');                 // the launch ramp
    trk('M880,1746 L720,2346');                 // the run-out to the doorway

    /* ---------- waypoint pills: outline → fill + stamp + dip on landing ---------- */
    function waypoint(beat) {
      var w = beat.label.length * 15.5 + 64, h = 64;
      var g = C('g', { 'class': 'wp' }, pillsG);
      var box = C('rect', { x: beat.x - w / 2, y: beat.y - h / 2, width: w, height: h, rx: h / 2, 'class': 'wp-box' }, g);
      var txt = C('text', { x: beat.x, y: beat.y + 9, 'class': 'wp-text' }, g); txt.textContent = beat.label;
      return { g: g, box: box, txt: txt, beat: beat };
    }
    var wp = { lunch: waypoint(BEAT.lunch), phone: waypoint(BEAT.phone), crowd: waypoint(BEAT.crowd), door: waypoint(BEAT.door) };

    /* ---------- the sentence, dealt out as small pills along the way ---------- */
    var WORDS = [
      ['It quietly', 380, 520], ['shapes', 900, 560], ['what you', 356, 1060],
      ['say', 720, 1300], ['and what you', 1090, 1592], ['do', 560, 2160]
    ];
    var wordPills = WORDS.map(function (wd) {
      var g = C('g', { 'class': 'sw' }, pillsG);
      var w = wd[0].length * 12 + 34;
      C('rect', { x: wd[1] - w / 2, y: wd[2] - 20, width: w, height: 40, rx: 20, 'class': 'sw-box' }, g);
      var t = C('text', { x: wd[1], y: wd[2] + 7, 'class': 'sw-text' }, g); t.textContent = wd[0];
      return g;
    });

    /* ---------- reduced motion: a simple scrubbed descent, pills pre-filled ---------- */
    if (reduced) {
      [wp.lunch, wp.phone, wp.crowd, wp.door].forEach(function (w) { w.g.classList.add('lit'); gsap.set(w.txt, { opacity: 1 }); });
      gsap.set(wordPills, { opacity: 1 });
      gsap.set(anchor, { x: START.x, y: START.y });
      gsap.set(course, { y: 150 });
      var rtl = gsap.timeline({ scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: syncFar } });
      rtl.to(anchor, { x: BEAT.lunch.x, y: BEAT.lunch.y, ease: 'none', duration: 1 })
        .to(anchor, { x: BEAT.phone.x, y: BEAT.phone.y, ease: 'none', duration: 1 })
        .to(anchor, { x: BEAT.crowd.x, y: BEAT.crowd.y, ease: 'none', duration: 1 })
        .to(anchor, { x: BEAT.door.x, y: BEAT.door.y, ease: 'none', duration: 1 });
      rtl.to(course, { y: -270, ease: 'none', duration: 1 }, 0)
        .to(course, { y: -730, ease: 'none', duration: 1 }, 1)
        .to(course, { y: -1270, ease: 'none', duration: 1 }, 2)
        .to(course, { y: -1870, ease: 'none', duration: 1 }, 3);
      return;
    }

    /* ---------- the course ---------- */
    function syncFar() { gsap.set(far, { y: (gsap.getProperty(course, 'y') || 0) * 0.8 }); }

    gsap.set(anchor, { x: START.x, y: START.y });
    gsap.set(course, { y: 150 }); // start centred on the opening roll line (world y300)

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 0.8, onUpdate: syncFar }
    });

    // CAMERA — smooth descent through the beat centres (lags the ball's drops)
    tl.to(course, { y: -270, duration: 3.4, ease: 'power1.inOut' }, 0)       // → lunch
      .to(course, { y: -730, duration: 3.0, ease: 'power1.inOut' }, 4.6)     // → phone
      .to(course, { y: -1270, duration: 2.6, ease: 'power1.inOut' }, 7.0)    // → crowd
      .to(course, { y: -1870, duration: 3.0, ease: 'power1.inOut' }, 9.6);   // → doorway

    // BALL — bumpy physics segments
    tl.to(anchor, { x: 632, duration: 2.0 }, 0)                              // roll the opening line
      .to(anchor, { x: 664, duration: 0.4, ease: 'power2.in' }, 2.0)         // creep to the lip
      .to(anchor, { y: 720, duration: 1.1, ease: 'power2.in' }, 2.5)         // fall (accelerate)
      .to(anchor, { x: 700, duration: 1.1, ease: 'power1.in' }, 2.5)
      .to(ballCircle, { scaleX: 1.4, scaleY: 0.58, duration: 0.1, ease: 'power2.in' }, 3.5)   // land squash
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 1.0, ease: 'elastic.out(1, 0.35)' }, 3.62)
      .to(anchor, { y: 690, duration: 0.28, ease: 'power2.out' }, 3.62)      // small bounce
      .to(anchor, { y: 720, duration: 0.5, ease: 'bounce.out' }, 3.9)
      .to(anchor, { x: 520, y: 1180, duration: 2.0, ease: 'power1.inOut' }, 4.7) // roll the slope
      .to(anchor, { y: 1088, duration: 0.7, ease: 'power2.out' }, 7.0)       // launch: up
      .to(anchor, { x: 880, duration: 1.6, ease: 'none' }, 7.0)              // launch: across
      .to(anchor, { y: 1720, duration: 0.9, ease: 'power2.in' }, 7.7)        // launch: down
      .to(ballCircle, { scaleX: 1.32, scaleY: 0.64, duration: 0.1, ease: 'power2.in' }, 8.5)  // crowd land squash
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.85, ease: 'elastic.out(1, 0.4)' }, 8.6)
      .to(anchor, { x: 720, y: 2320, duration: 2.6, ease: 'power1.inOut' }, 9.6); // roll out the door

    // landing shockwaves (in the course group so they ride the camera)
    ILLO.impact(tl, 3.55, course, 700, 720, { size: 150, particles: 5 });
    ILLO.impact(tl, 8.52, course, 880, 1720, { size: 130, particles: 4 });

    // waypoint reveals — copy delivered by impact, not fade
    function land(w, t) {
      tl.to(w.box, { fill: 'rgba(247,245,240,1)', duration: 0.16, ease: 'power2.out' }, t)
        .to(w.box, { strokeOpacity: 0, duration: 0.2 }, t)
        .fromTo(w.txt, { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(2)', transformOrigin: w.beat.x + 'px ' + w.beat.y + 'px', immediateRender: false }, t + 0.02)
        .to(w.g, { y: 4, duration: 0.1, ease: 'power2.out' }, t)             // dip under the ball's weight
        .to(w.g, { y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }, t + 0.1);
    }
    land(wp.lunch, 3.55); land(wp.phone, 6.5); land(wp.crowd, 8.52); land(wp.door, 12.0);

    // sentence pills pop as the ball passes
    var wordTimes = [1.0, 3.7, 5.2, 6.7, 8.1, 11.2];
    wordPills.forEach(function (g, i) {
      gsap.set(g, { opacity: 0, scale: 0.6, transformOrigin: WORDS[i][1] + 'px ' + WORDS[i][2] + 'px' });
      tl.to(g, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, wordTimes[i]);
    });

    /* ---------- eyes: look ahead, glance down before drops, shut on landings ---------- */
    ILLO.faces(svg, tl, [{
      el: ballCircle, r: 26, tone: 'ink', look: [1, 0],
      steps: [
        [2.1, 0.2, 0.9, 1, 0.4],   // glance down at the lip
        [2.6, 0, 1, 0.5, 0.3],     // down + narrow through the fall
        [3.5, 0, 0, 0.05, 0.1],    // squeeze shut on impact
        [3.9, 1, 0, 1, 0.5],       // open, look ahead
        [7.5, 0.2, 0.8, 1, 0.4],   // glance down before the crowd drop
        [8.5, 0, 0, 0.05, 0.1],    // shut
        [8.8, 1, 0, 1, 0.5]        // open, ahead to the door
      ]
    }]);

    /* ---------- a cream ghost trail that rides the camera (svg-space echoes) ---------- */
    var echoes = [];
    for (var i = 0; i < 3; i++) {
      var e = C('circle', { r: 26 * (1 - i * 0.07), 'class': 'ball-echo' }, svg);
      e.style.opacity = 0; echoes.push({ el: e, x: 0, y: 0 });
    }
    var pt = svg.createSVGPoint();
    function ballCentre() {
      var m = svg.getScreenCTM(); if (!m) return null;
      var b = ballCircle.getBoundingClientRect();
      pt.x = b.left + b.width / 2; pt.y = b.top + b.height / 2;
      return pt.matrixTransform(m.inverse());
    }
    var active = false, primed = false;
    function trailTick() {
      if (!active) return;
      var c = ballCentre(); if (!c) return;
      if (!primed) { echoes.forEach(function (e) { e.x = c.x; e.y = c.y; }); primed = true; }
      var tx = c.x, ty = c.y;
      for (var j = 0; j < echoes.length; j++) {
        var e = echoes[j];
        e.x += (tx - e.x) * 0.34; e.y += (ty - e.y) * 0.34;
        e.el.setAttribute('cx', e.x); e.el.setAttribute('cy', e.y);
        var d = Math.hypot(e.x - c.x, e.y - c.y);
        e.el.style.opacity = Math.min(0.4, d * 0.02) * (1 - j * 0.22);
        tx = e.x; ty = e.y;
      }
    }
    gsap.ticker.add(trailTick);
    ScrollTrigger.create({
      trigger: '#story', start: 'top bottom', end: 'bottom top',
      onToggle: function (s) { active = s.isActive; if (!active) { primed = false; echoes.forEach(function (e) { e.el.style.opacity = 0; }); } }
    });
  };
})();
