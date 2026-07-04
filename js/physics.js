/* physics.js — wow moment #1: the hero ball and peer dots become real
   Matter.js bodies. The ball has mass and a soft spring holding it to its
   center-line; peer dots are attracted toward it, collide, and physically
   knock it off course. The cursor repels the field, so the intro is
   interactive within the first seconds. Rendered as a metaball field
   (webgl/metaballs.js). Stepped from gsap.ticker — single RAF loop. */
window.initHeroPhysics = function () {
  'use strict';
  if (!window.Matter || !window.makeGLLayer) return null;

  var stage = document.querySelector('.hero-stage');
  var meta = window.initMetaballs(stage);
  if (!meta) return null;

  var M = Matter;
  var W = stage.clientWidth, H = stage.clientHeight;
  var engine = M.Engine.create();
  engine.gravity.y = 0;

  var BALL_R = 30;
  var ball = M.Bodies.circle(W / 2, H / 2, BALL_R, {
    restitution: 0.85, frictionAir: 0.03, density: 0.0016
  });
  // the "intended path": a soft spring back to the center of the line —
  // pressure can move you; something in you pulls back
  var anchor = M.Constraint.create({
    pointA: { x: W / 2, y: H / 2 }, bodyB: ball,
    stiffness: 0.004, damping: 0.06, length: 0
  });

  var dots = [];
  for (var i = 0; i < 9; i++) {
    var edge = Math.random();
    var x = edge < 0.5 ? (Math.random() < 0.5 ? -30 : W + 30) : Math.random() * W;
    var y = edge < 0.5 ? Math.random() * H : (Math.random() < 0.5 ? -30 : H + 30);
    dots.push(M.Bodies.circle(x, y, 9 + Math.random() * 9, {
      restitution: 0.9, frictionAir: 0.022, density: 0.0012
    }));
  }
  // walls just outside the stage keep the crowd in play
  var t = 120, walls = [
    M.Bodies.rectangle(W / 2, -t / 2 - 60, W * 2, t, { isStatic: true }),
    M.Bodies.rectangle(W / 2, H + t / 2 + 60, W * 2, t, { isStatic: true }),
    M.Bodies.rectangle(-t / 2 - 60, H / 2, t, H * 2, { isStatic: true }),
    M.Bodies.rectangle(W + t / 2 + 60, H / 2, t, H * 2, { isStatic: true })
  ];
  M.Composite.add(engine.world, [ball, anchor].concat(dots, walls));

  // collision squash: the ball's blob radius pulses with impact speed
  var pulse = 0;
  M.Events.on(engine, 'collisionStart', function (e) {
    e.pairs.forEach(function (p) {
      if (p.bodyA === ball || p.bodyB === ball) {
        var other = p.bodyA === ball ? p.bodyB : p.bodyA;
        var dv = Math.hypot(ball.velocity.x - other.velocity.x, ball.velocity.y - other.velocity.y);
        pulse = Math.min(0.5, pulse + dv * 0.045);
      }
    });
  });

  var mouse = { x: -9999, y: -9999 };
  var active = true;

  // only simulate while the hero is on screen
  var vis = ScrollTrigger.create({
    trigger: '#intro', start: 'top bottom', end: 'bottom top',
    onToggle: function (self) {
      active = self.isActive;
      meta && (stage.querySelector('.metaball-canvas').style.visibility = active ? 'visible' : 'hidden');
    }
  });

  // each dot breathes between attraction and repulsion on its own phase —
  // the crowd presses in, backs off, presses in again. Constant nudging,
  // never a permanent lump.
  var phases = dots.map(function () { return Math.random() * Math.PI * 2; });
  var speeds = dots.map(function () { return 0.25 + Math.random() * 0.35; });

  var ballsOut = [];
  function tick(time) {
    if (!active) return;
    dots.forEach(function (d, i) {
      var dx = ball.position.x - d.position.x, dy = ball.position.y - d.position.y;
      var dist = Math.hypot(dx, dy) || 1;
      // wave in [-0.65, 1]: mostly wants you, periodically retreats
      var wave = Math.sin(time * speeds[i] + phases[i]) * 0.825 + 0.175;
      var f = 1.1e-6 * d.mass * Math.min(dist, 420) * wave;
      M.Body.applyForce(d, d.position, { x: dx / dist * f, y: dy / dist * f });
      // cursor repel: your attention disturbs the field
      var mx = d.position.x - mouse.x, my = d.position.y - mouse.y;
      var md = Math.hypot(mx, my);
      if (md < 190 && md > 0.01) {
        var rf = (1 - md / 190) * 5.2e-4 * d.mass;
        M.Body.applyForce(d, d.position, { x: mx / md * rf, y: my / md * rf });
      }
    });
    // the cursor pushes the ball too — gently
    var bx = ball.position.x - mouse.x, by = ball.position.y - mouse.y;
    var bd = Math.hypot(bx, by);
    if (bd < 160 && bd > 0.01) {
      var bf = (1 - bd / 160) * 4e-4 * ball.mass;
      M.Body.applyForce(ball, ball.position, { x: bx / bd * bf, y: by / bd * bf });
    }

    M.Engine.update(engine, 1000 / 60);
    pulse *= 0.92;

    ballsOut.length = 0;
    ballsOut.push({ x: ball.position.x, y: ball.position.y, r: BALL_R * (1 + pulse) });
    dots.forEach(function (d) {
      ballsOut.push({ x: d.position.x, y: d.position.y, r: d.circleRadius });
    });
    meta.setBalls(ballsOut);
    meta.render();
  }
  gsap.ticker.add(tick);

  return {
    setMouse: function (clientX, clientY) {
      var r = stage.getBoundingClientRect();
      mouse.x = clientX - r.left; mouse.y = clientY - r.top;
    },
    destroy: function () {
      gsap.ticker.remove(tick);
      vis.kill();
      meta.destroy();
      M.Engine.clear(engine);
      // bring the SVG stand-ins back so the tweened hero still reads
      gsap.set(['#heroBall', '.hero-peer'], { autoAlpha: 1 });
    }
  };
};
