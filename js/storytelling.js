/* storytelling.js — the intro rebuilt as a scroll obstacle course.
   Two scrubbed tracks: a SMOOTH camera (the .course group pans down a tall
   world) and a BUMPY ball (rolls, falls, lands with squash + shockwave, rolls a
   slope, launches off a ramp, rolls out the doorway). Because the camera is
   smooth and the ball path is bumpy, drops read as real on-screen falls while
   the camera gives the trip its length. Scroll-scrubbed only (reversible) —
   the whole thing is one GSAP timeline whose progress is driven by native
   scrollY via ScrollTrigger's scrub; there is no separate input listener of
   any kind here. "Hesitation" is a pure visual pause baked into the timeline
   (the ball's x tween just idles for a beat) — it never touches scroll input.
   Keeps the four waypoint labels + the sentence; keeps ball gradient/shadow/
   trail/eyes. Exposes window.initStory(ctx). */
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
    // narrow screens: the wide course won't fit, so the camera also follows the
    // ball horizontally (locks it to centre-x) — pills land centred + readable
    var MOBILE = window.matchMedia('(max-width: 768px)').matches;

    gsap.set(ballCircle, { transformOrigin: '50% 50%' });

    // #3 COLOR ESCALATION — a viewport-fixed backdrop (behind everything) that
    // starts pure hero ink and lets the lesson's colour bleed in by the doorway
    var bg = C('rect', { x: -300, y: -300, width: 2040, height: 1500, 'class': 'course-bg', fill: '#0C0B0B' }, svg);
    svg.insertBefore(bg, svg.firstChild);

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
    // crowd — faint outline set dressing behind the living dots (built later)
    [[720, 1600, 28], [1032, 1642, 32], [1012, 1852, 26]].forEach(function (d) { shape('circle', { cx: d[0], cy: d[1], r: d[2] }); });
    shape('circle', { cx: 880, cy: 1720, r: 300 }, true);
    // doorway — a huge door outline the ball rolls out through
    shape('rect', { x: 560, y: 2050, width: 320, height: 540, rx: 8 });
    shape('rect', { x: 588, y: 2078, width: 264, height: 512, rx: 4 });
    shape('circle', { cx: 828, cy: 2330, r: 7 });                            // knob
    shape('rect', { x: 500, y: 1990, width: 440, height: 660, rx: 14 }, true);

    /* ---------- densified scene props: outline-only, clear of path + pills ---------- */
    function rprop(tag, attrs, r, deep) { var e = shape(tag, attrs, deep); if (r) e.setAttribute('transform', 'rotate(' + r[0] + ' ' + r[1] + ' ' + r[2] + ')'); return e; }
    function heart(cx, cy, s, deep) {
      return shape('path', { d: 'M' + cx + ',' + (cy + s * 0.35) + ' C' + (cx - s * 1.1) + ',' + (cy - s * 0.35) + ' ' + (cx - s * 0.5) + ',' + (cy - s * 1.05) + ' ' + cx + ',' + (cy - s * 0.35) + ' C' + (cx + s * 0.5) + ',' + (cy - s * 1.05) + ' ' + (cx + s * 1.1) + ',' + (cy - s * 0.35) + ' ' + cx + ',' + (cy + s * 0.35) + ' Z' }, deep);
    }
    // LUNCH — chairs (one pulled out, one tipped over), trays + cups, crumpled paper (all right of the down-left exit)
    shape('rect', { x: 980, y: 742, width: 66, height: 66, rx: 12 });
    shape('rect', { x: 1082, y: 806, width: 66, height: 66, rx: 12 });
    rprop('rect', { x: 872, y: 918, width: 64, height: 64, rx: 12 }, [44, 904, 950]);
    shape('rect', { x: 812, y: 780, width: 62, height: 26, rx: 6 });
    shape('circle', { cx: 858, cy: 762, r: 10 }); shape('circle', { cx: 928, cy: 792, r: 9 });
    shape('circle', { cx: 1016, cy: 902, r: 13 }); shape('circle', { cx: 1016, cy: 902, r: 7 });
    // PHONE — chat bubbles rising, a face-down phone, scattered hearts, an earbud (all left of the phone)
    shape('rect', { x: 196, y: 1006, width: 96, height: 52, rx: 20 });
    shape('rect', { x: 236, y: 1092, width: 78, height: 44, rx: 18 });
    shape('rect', { x: 184, y: 1188, width: 108, height: 56, rx: 22 });
    rprop('rect', { x: 168, y: 1320, width: 108, height: 196, rx: 22 }, [-18, 222, 1418]);
    heart(300, 962, 12); heart(226, 1052, 10); heart(158, 1150, 9);
    shape('circle', { cx: 336, cy: 1420, r: 12 }); shape('line', { x1: 336, y1: 1432, x2: 330, y2: 1470 });
    // SAY (phone→crowd transition, world y~1230-1480) — a couple more props so
    // this stretch isn't empty: a small side table, a second chat bubble
    shape('rect', { x: 838, y: 1246, width: 70, height: 46, rx: 8 });
    shape('line', { x1: 856, y1: 1292, x2: 856, y2: 1330 }); shape('line', { x1: 902, y1: 1292, x2: 902, y2: 1330 });
    shape('rect', { x: 792, y: 1408, width: 84, height: 46, rx: 18 });
    // CROWD — big out-of-focus dots (deep), footprints, a dropped cup
    shape('circle', { cx: 1108, cy: 1632, r: 74 }, true); shape('circle', { cx: 628, cy: 1812, r: 62 }, true); shape('circle', { cx: 1010, cy: 1918, r: 54 }, true);
    [[712, 1982], [758, 2016], [812, 2000], [792, 2052]].forEach(function (p) { shape('ellipse', { cx: p[0], cy: p[1], rx: 11, ry: 6 }); });
    rprop('rect', { x: 686, y: 1852, width: 42, height: 24, rx: 8 }, [24, 707, 1864]);
    // DOORWAY — coat hook, floor mat, a soft light wedge, a chair facing away
    shape('path', { d: 'M604,2108 h20 v14' });
    shape('ellipse', { cx: 720, cy: 2560, rx: 150, ry: 26 });
    C('path', { d: 'M704,2078 L878,2052 L900,2588 L708,2588 Z', 'class': 'door-light' }, far);
    shape('rect', { x: 852, y: 2360, width: 74, height: 74, rx: 10 });
    // DO (doorway zone) — a couple more props: a wall frame, a small plant
    shape('rect', { x: 430, y: 2064, width: 52, height: 68, rx: 4 }); shape('line', { x1: 442, y1: 2076, x2: 470, y2: 2076 });
    shape('circle', { cx: 966, cy: 2258, r: 20 }); shape('line', { x1: 966, y1: 2258, x2: 966, y2: 2292 });
    // ambient props between beats (tiny — discover, not notice)
    shape('path', { d: 'M330,948 l34,-14 l-14,30 l-8,-14 Z' });               // paper plane
    shape('path', { d: 'M1060,1498 q14,-12 27,-1 q-3,21 -27,14 Z' });         // sock
    shape('circle', { cx: 596, cy: 2016, r: 9 }); shape('circle', { cx: 596, cy: 2016, r: 4 }); // bottle cap

    // ambient drifting dots down the whole course — something is always in
    // motion, so the scroll never reads as dead (kept off the ball's path)
    var ambient = [[196, 440, 8], [1190, 700, 7], [232, 980, 7], [1210, 1420, 8], [980, 2040, 7], [300, 2200, 7], [1160, 2360, 8]];
    var ambientDots = ambient.map(function (a) { return C('circle', { cx: a[0], cy: a[1], r: a[2], 'class': 'peer story-ambient' }, far); });

    // No telegraph line: the ball's ghost trail shows where it's BEEN, and the
    // props/pill edges are the ground. The only hint is a short ~28px dash that
    // follows just under the ball while it's rolling (built with the trail).

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
    function syncFar() {
      var cy = gsap.getProperty(course, 'y') || 0;
      gsap.set(far, { y: cy * 0.8 });
      if (MOBILE) { // horizontal follow: keep the ball centred as the world pans
        // follow the ball's FULL x (path + carry offset) so the crowd-carry
        // can't shove it off a narrow screen
        var bx = (gsap.getProperty(anchor, 'x') || 0) + (gsap.getProperty(ball, 'x') || 0);
        var cx = 720 - bx;
        gsap.set(course, { x: cx }); gsap.set(far, { x: cx * 0.8 });
      }
    }

    gsap.set(anchor, { x: START.x, y: START.y });
    gsap.set(course, { y: 150 }); // start centred on the opening roll line (world y300)

    // Built as a plain, unattached timeline first — exactly the shape the 8
    // concept demos use (js/main.js: build(svg) -> tl.pause() -> a SEPARATE
    // ScrollTrigger.create({..., animation: tl}) once the whole timeline
    // exists). The ScrollTrigger wiring happens at the very end of this
    // function, after every tween below has been added.
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.pause();

    // CAMERA — smooth descent through the beat centres (lags the ball's drops,
    // by design — see the matching ball segment below; lags preserved exactly)
    tl.to(course, { y: -270, duration: 2.35, ease: 'power1.inOut' }, 0)      // → lunch (opening compressed, see below)
      .to(course, { y: -730, duration: 3.0, ease: 'power1.inOut' }, 3.55)    // → phone
      .to(course, { y: -1270, duration: 2.6, ease: 'power1.inOut' }, 5.95)   // → crowd
      .to(course, { y: -1870, duration: 3.0, ease: 'power1.inOut' }, 8.55);  // → doorway

    // BALL — bumpy physics segments. The opening (roll/creep/hesitate) is
    // deliberately short: the course should get to its first payoff fast.
    tl.to(anchor, { x: 632, duration: 1.1 }, 0)                              // roll the opening line
      .to(anchor, { x: 664, duration: 0.3, ease: 'power2.in' }, 1.1)         // creep to the lip
      // HESITATION — purely visual: the ball's x idles at the lip for a beat
      // while the timeline (and scroll) keep moving; it never blocks input.
      .to(anchor, { x: 676, duration: 0.3, ease: 'power1.inOut' }, 1.4)      // hover at the lip
      .to(anchor, { y: 720, duration: 0.9, ease: 'power2.in' }, 1.7)         // COMMIT: fall (accelerate)
      .to(anchor, { x: 662, duration: 0.9, ease: 'power1.in' }, 1.7)         // onto the pill's EDGE (uneven dip)
      .to(ballCircle, { scaleX: 1.4, scaleY: 0.58, duration: 0.1, ease: 'power2.in' }, 2.45)   // land squash
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 1.0, ease: 'elastic.out(1, 0.35)' }, 2.57)
      .to(anchor, { y: 690, duration: 0.28, ease: 'power2.out' }, 2.57)      // small bounce
      .to(anchor, { y: 720, duration: 0.5, ease: 'bounce.out' }, 2.85)
      .to(anchor, { x: 520, y: 1180, duration: 2.0, ease: 'power1.inOut' }, 3.65) // roll the slope
      .to(anchor, { y: 1088, duration: 0.7, ease: 'power2.out' }, 5.95)      // launch: up
      .to(anchor, { x: 880, duration: 1.6, ease: 'none' }, 5.95)             // launch: across
      .to(anchor, { y: 1720, duration: 0.9, ease: 'power2.in' }, 6.65)       // launch: down
      .to(ballCircle, { scaleX: 1.32, scaleY: 0.64, duration: 0.1, ease: 'power2.in' }, 7.45)  // crowd land squash
      .to(ballCircle, { scaleX: 1, scaleY: 1, duration: 0.85, ease: 'elastic.out(1, 0.4)' }, 7.55)
      .to(anchor, { x: 720, y: 2320, duration: 2.4, ease: 'power1.inOut' }, 8.55)  // roll to the doorway
      // THE EXIT: it rolls THROUGH the doorway and out, alone, eyes forward —
      // straight into "YOU HAVE FELT IT BEFORE"
      .to(anchor, { y: 2560, duration: 1.1, ease: 'power1.in' }, 11.35);

    // camera follows the ball out through the door
    tl.to(course, { y: -2110, duration: 1.3, ease: 'power1.inOut' }, 11.45);

    // ground-contact dash: a short mark under the ball WHILE it rolls, fading
    // out while airborne. The only ground hint — never drawn ahead of the ball.
    var groundDash = C('line', { 'class': 'ground-dash' }, svg);
    var gc = { v: 1 };
    tl.to(gc, { v: 0, duration: 0.2, ease: 'none' }, 1.45)   // leaves the lip → airborne
      .to(gc, { v: 1, duration: 0.25, ease: 'none' }, 2.65)  // lands, rolls the slope
      .to(gc, { v: 0, duration: 0.2, ease: 'none' }, 5.85)   // launches
      .to(gc, { v: 1, duration: 0.25, ease: 'none' }, 7.65); // lands, rolls out
    // continuous drift on the ambient dots — motion is never absent
    ambientDots.forEach(function (d, i) {
      gsap.to(d, { x: (i % 2 ? 22 : -22), y: (i % 3 ? 16 : -16), duration: 3.2 + i * 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });

    // #3 the lesson's colour bleeds into the dark, one waypoint at a time
    tl.to(bg, { fill: '#120E13', duration: 3.0, ease: 'none' }, 2.35)       // lunch: a first warmth
      .to(bg, { fill: '#0F1016', duration: 2.6, ease: 'none' }, 5.45)       // phone: cool
      .to(bg, { fill: '#171120', duration: 2.2, ease: 'none' }, 7.45)       // crowd: plum
      .to(bg, { fill: '#221a2c', duration: 3.0, ease: 'none' }, 8.55);      // doorway: the coloured world

    // landing shockwaves (in the course group so they ride the camera)
    ILLO.impact(tl, 2.50, course, 700, 720, { size: 150, particles: 5 });
    ILLO.impact(tl, 7.47, course, 880, 1720, { size: 130, particles: 4 });

    // waypoint reveals — copy delivered by impact, not fade
    function land(w, t) {
      tl.to(w.box, { fill: 'rgba(247,245,240,1)', duration: 0.16, ease: 'power2.out' }, t)
        .to(w.box, { strokeOpacity: 0, duration: 0.2 }, t)
        .fromTo(w.txt, { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(2)', transformOrigin: w.beat.x + 'px ' + w.beat.y + 'px', immediateRender: false }, t + 0.02)
        .to(w.g, { y: 4, duration: 0.1, ease: 'power2.out' }, t)             // dip under the ball's weight
        .to(w.g, { y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }, t + 0.1);
    }
    land(wp.lunch, 2.50); land(wp.phone, 5.45); land(wp.crowd, 7.47); land(wp.door, 10.95);

    // #4 IMPACT ON TYPE (once only) — the phone label's letters scatter as
    // physics objects when the ball rolls on, then reassemble into the pill
    wp.phone.txt.textContent = ''; // the per-letter version takes over
    (function () {
      var lab = BEAT.phone.label, ls = 15.5, sx = BEAT.phone.x - (lab.length - 1) * ls / 2, i = 0;
      lab.split('').forEach(function (ch) {
        i++;
        if (ch === ' ') return;
        var x0 = sx + (i - 1) * ls, y0 = BEAT.phone.y + 9;
        var lt = C('text', { x: x0, y: y0, 'class': 'wp-text', 'text-anchor': 'middle' }, wp.phone.g);
        lt.textContent = ch;
        var ang = Math.random() * Math.PI * 2, dist = 46 + Math.random() * 66;
        gsap.set(lt, { opacity: 0, transformOrigin: x0 + 'px ' + y0 + 'px' });
        tl.fromTo(lt, { opacity: 0, x: 0, y: 0, rotation: 0 },
          { opacity: 1, x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 34, rotation: (Math.random() - 0.5) * 140, duration: 0.32, ease: 'power2.out', immediateRender: false }, 5.37 + i * 0.015)
          .to(lt, { x: 0, y: 0, rotation: 0, duration: 0.72, ease: 'back.out(1.5)' }, 5.81 + i * 0.02); // reassemble
      });
    })();

    // sentence pills pop as the ball passes
    var wordTimes = [0.5, 2.65, 4.15, 5.65, 7.05, 10.15];
    wordPills.forEach(function (g, i) {
      gsap.set(g, { opacity: 0, scale: 0.6, transformOrigin: WORDS[i][1] + 'px ' + WORDS[i][2] + 'px' });
      tl.to(g, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, wordTimes[i]);
    });

    /* ---------- living obstacles: the course itself pressures the ball ---------- */
    // LUNCH — two dots already sit on the pill; the ball drops onto the EDGE,
    // the pill tilts under the uneven weight, and they shuffle aside grudgingly
    var lunchDots = [
      C('circle', { cx: 660, cy: 700, r: 15, 'class': 'peer story-npc' }, peersG),
      C('circle', { cx: 742, cy: 702, r: 14, 'class': 'peer story-npc' }, peersG)
    ];
    var lw = BEAT.lunch.label.length * 15.5 + 64;
    tl.to(wp.lunch.g, { rotation: -3.4, transformOrigin: (BEAT.lunch.x + lw / 2) + 'px 720px', duration: 0.12, ease: 'power2.out' }, 2.50)
      .to(wp.lunch.g, { rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 2.65)
      .to(lunchDots[0], { attr: { cx: 588 }, duration: 0.5, ease: 'power2.out' }, 2.57)   // grudging shuffle
      .to(lunchDots[1], { attr: { cx: 808 }, duration: 0.6, ease: 'power2.out' }, 2.71);

    // CROWD (centerpiece) — the ball lands among living dots; they close in
    // behind it (the path narrows), then CARRY it off its line a short way.
    var crowdPts = [[742, 1660, 16], [1010, 1662, 15], [1028, 1786, 17], [760, 1822, 15], [690, 1742, 14], [980, 1844, 16], [906, 1606, 15]];
    var crowd = crowdPts.map(function (d) { return C('circle', { cx: d[0], cy: d[1], r: d[2], 'class': 'peer story-npc' }, peersG); });
    tl.to(crowd[4], { attr: { cx: 812, cy: 1712 }, duration: 0.7, ease: 'power2.inOut' }, 7.55)   // close in behind the wake
      .to(crowd[0], { attr: { cx: 828, cy: 1654 }, duration: 0.7, ease: 'power2.inOut' }, 7.65)
      .to(crowd[6], { attr: { cx: 872, cy: 1634 }, duration: 0.7, ease: 'power2.inOut' }, 7.75);
    tl.to(ball, { y: -48, x: 78, duration: 0.7, ease: 'power2.out' }, 7.70)   // lifted off its line — crowd-passed
      .to(ball, { y: 0, x: 0, duration: 0.8, ease: 'power2.inOut' }, 8.40);   // set back down on its line
    tl.to(crowd[1], { attr: { cx: 994, cy: 1690 }, duration: 0.7, ease: 'power2.out' }, 7.75)   // dots that carry it
      .to(crowd[2], { attr: { cx: 964, cy: 1706 }, duration: 0.7, ease: 'power2.out' }, 7.80)
      .to([crowd[1], crowd[2]], { attr: { cy: '+=28' }, duration: 0.8, ease: 'power2.inOut' }, 8.40); // release

    // FOLLOWER — one dot peels off and trails the ball to the door, a step
    // behind; it stops dead at the threshold and cannot cross. Ball exits alone.
    var follower = C('circle', { cx: 942, cy: 1742, r: 15, 'class': 'peer story-npc' }, peersG);
    gsap.set(follower, { opacity: 0 });
    tl.to(follower, { opacity: 0.85, duration: 0.4 }, 8.45)
      .to(follower, { attr: { cx: 806, cy: 2140 }, duration: 2.4, ease: 'power1.inOut' }, 8.55)  // trails to the threshold
      .to(follower, { attr: { cx: 786 }, duration: 0.3, ease: 'power2.out' }, 11.15)             // reaches for the door…
      .to(follower, { attr: { cx: 806 }, duration: 0.6, ease: 'back.out(2)' }, 11.45);           // …can't cross — recoils, stays behind

    // #5 THE COUNTER CHASES — at the phone the like-badge (reused from Online)
    // detaches, chases the ball, ringing up, until the crowd bounce flings it off
    var badge = C('g', { 'class': 'story-badge' }, peersG);
    C('circle', { cx: 0, cy: 0, r: 17, 'class': 'badge-dot' }, badge);
    var bnum = C('text', { x: 0, y: 6, 'class': 'badge-num' }, badge); bnum.textContent = '0';
    gsap.set(badge, { opacity: 0, x: 560, y: 1150 });
    var bn = { v: 0 };
    tl.to(badge, { opacity: 1, duration: 0.3 }, 5.25)                                  // pops off the phone
      .to(badge, { x: 660, y: 1300, duration: 0.9, ease: 'power1.inOut' }, 5.55)       // gives chase…
      .to(badge, { x: 812, y: 1660, duration: 1.2, ease: 'power1.inOut' }, 6.55)       // …trailing through the launch
      .to(bn, { v: 214, duration: 2.0, ease: 'power1.in', onUpdate: function () { bnum.textContent = bn.v > 99 ? '99+' : Math.floor(bn.v); } }, 5.45)
      .to(badge, { x: 1080, y: 1540, rotation: 40, duration: 0.5, ease: 'power2.out' }, 7.50)  // flung off on the bounce
      .to(badge, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 7.65);

    /* ---------- eyes: look ahead, glance down before drops, shut on landings,
       and SNAP WIDE when the crowd carries it ---------- */
    ILLO.faces(svg, tl, [{
      el: ballCircle, r: 26, tone: 'ink', look: [1, 0],
      steps: [
        [1.35, 0.15, 1, 1, 0.3],       // peer down at the lip (hesitation)
        [1.85, 0, 1, 0.4, 0.3],        // down + narrow through the fall
        [2.45, 0, 0, 0.05, 0.1],       // squeeze shut on impact
        [2.85, 1, 0, 1, 0.5],          // open, look ahead
        [6.45, 0.2, 0.8, 1, 0.4],      // glance down before the crowd drop
        [7.45, 0, 0, 0.05, 0.1],       // shut on the crowd landing
        [7.80, -0.2, -0.2, 1.7, 0.3],  // eyes SNAP WIDE — carried, didn't choose this
        [8.45, 1, 0, 1, 0.6]           // set down, recover, look ahead to the door
      ]
    }]);
    // the crowd + lunch dots watch the ball; the follower keeps its eyes on it
    ILLO.faces(svg, null, crowd.map(function (c) {
      var cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), dx = 880 - cx, dy = 1720 - cy, d = Math.hypot(dx, dy) || 1;
      return { el: c, r: +c.getAttribute('r'), tone: 'ink', look: [dx / d, dy / d] };
    }).concat(lunchDots.map(function (c) {
      return { el: c, r: +c.getAttribute('r'), tone: 'ink', look: [(+c.getAttribute('cx') < 700 ? 0.7 : -0.7), 0] };
    }), [{ el: follower, r: 15, tone: 'ink', look: [-0.3, 0.9] }]));

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
      // short ground dash under the ball while rolling
      groundDash.setAttribute('x1', c.x - 14); groundDash.setAttribute('x2', c.x + 14);
      groundDash.setAttribute('y1', c.y + 25); groundDash.setAttribute('y2', c.y + 25);
      groundDash.style.opacity = gc.v * 0.45;
    }
    gsap.ticker.add(trailTick);
    ScrollTrigger.create({
      trigger: '#story', start: 'top bottom', end: 'bottom top',
      onToggle: function (s) { active = s.isActive; if (!active) { primed = false; groundDash.style.opacity = 0; echoes.forEach(function (e) { e.el.style.opacity = 0; }); } }
    });

    // The whole course timeline is fully built — wire it to native scroll now,
    // in the exact same shape the 8 concept demos use.
    ScrollTrigger.create({
      trigger: '#story', start: 'top top', end: 'bottom bottom',
      scrub: 0.8, animation: tl, onUpdate: syncFar
    });
  };
})();
