/* demos/conformity.js — Conformity as an actual Asch panel (line-art
   treatment): a reference line, three options, and a queue of peers who
   commit to the wrong one in sequence. The ball trembles, leans toward the
   answer it believes (a thread to C), then gulps and joins the row under B.
   3 beats: the test → the room commits → the flip. */
window.DEMOS = window.DEMOS || {};
window.DEMOS.conformity = function (svg) {
  'use strict';
  var q = gsap.utils.selector(svg);
  var ball = q('.d-ball')[0];
  var ballCircle = q('.d-ball .ballc')[0];
  var peers = q('.queue-peer');
  var row = q('.commit-row')[0];

  // a tick mark above each committed peer (drawn on commit)
  var seatX = [716, 754, 792, 830], ticks = [];
  for (var i = 0; i < 5; i++) { // 4 peers + one for the ball
    var x = i < 4 ? seatX[i] : 872;
    ticks.push(ILLO.create('path', {
      d: 'M' + (x - 7) + ',390 l5,6 l10,-12', pathLength: 1, 'class': 'tick'
    }, row));
  }

  gsap.set(ball, { x: 620, y: 480 });
  gsap.set(ballCircle, { transformOrigin: '50% 50%' });
  gsap.set(q('.truth-hint'), { opacity: 0 });

  // the waiting crowd feels like people: tone variation + a soft idle
  // breathing while they stand in line (independent of the scrub)
  var queue = q('.queue-peer');
  queue.forEach(function (p, i) { gsap.set(p, { opacity: [0.9, 0.72, 0.84, 0.68][i] || 0.8, transformOrigin: '50% 50%' }); });
  if (!QUALITY.reduced) ILLO.breathe(queue, 0.06, 2.7);

  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* beat 1 — THE TEST: cards and lines draw themselves */
  tl.to(q('.asch-card'), {
    strokeDashoffset: 0, duration: 1.2, ease: EASE.inOut, stagger: 0.5
  }, 0)
    .to(q('.ref-line'), { strokeDashoffset: 0, duration: 0.7, ease: EASE.inOut }, 0.9)
    .to(q('.opt'), {
      strokeDashoffset: 0, duration: 0.7, ease: EASE.inOut,
      stagger: { each: 0.35, ease: EASE.soft }
    }, 1.6)
    // the honest match quietly marks itself — you can see it
    .to(q('.truth-hint'), { opacity: 0.6, duration: 0.6, ease: EASE.soft }, 2.9)
    .to(q('.belief-thread'), { strokeDashoffset: 0, duration: 0.9, ease: EASE.inOut }, 3.1);

  /* beat 2 — THE ROOM COMMITS: one by one, under the wrong line */
  peers.forEach(function (p, i) {
    var t = 3.6 + i * 0.85;
    tl.to(p, {
      attr: { cx: seatX[i], cy: 430 }, duration: 0.7, ease: EASE.inOut
    }, t)
      .to(ticks[i], { strokeDashoffset: 0, duration: 0.3, ease: EASE.out }, t + 0.6);
  });
  // the ball watches — trembles, leans toward what it saw
  tl.to(ballCircle, { x: 4, duration: 0.12, yoyo: true, repeat: 7, ease: EASE.soft }, 4.2)
    .to(ball, { x: 660, duration: 1.0, ease: EASE.soft }, 5.2)   // lean toward C
    .to(ball, { x: 630, duration: 0.8, ease: EASE.soft }, 6.3);  // ...pulled back

  /* beat 3 — THE FLIP: gulp, sever the belief, join the row, tick the box */
  tl.to(ballCircle, { scaleY: 0.78, scaleX: 1.12, duration: 0.16, ease: EASE.in }, 7.3) // gulp
    .to(ballCircle, { scaleY: 1, scaleX: 1, duration: 0.4, ease: EASE.out }, 7.5)
    .to(q('.belief-thread'), { opacity: 0, duration: 0.8, ease: EASE.soft }, 7.5)
    .to(q('.truth-hint'), { opacity: 0.25, duration: 1.2, ease: EASE.soft }, 7.7)
    .to(ball, { x: 872, y: 430, duration: 1.6, ease: EASE.inOut }, 7.9)
    .to(ballCircle, { scale: 15 / 24, duration: 1.6, ease: EASE.inOut }, 7.9) // shrinks to fit the row
    .to(ballCircle, { opacity: 0.82, duration: 1.2, ease: EASE.soft }, 8.6)
    .to(ticks[4], { strokeDashoffset: 0, duration: 0.35, ease: EASE.out }, 9.6) // it even ticks the box
    .to(ballCircle, { scaleX: (15 / 24) * 1.1, scaleY: (15 / 24) * 0.9, duration: 0.25, ease: EASE.out }, 9.95)
    .to(ballCircle, { scaleX: 15 / 24, scaleY: 15 / 24, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, 10.2);

  return tl;
};
