/* quality.js — one quality manager gating physics/WebGL/effects.
   Tiers: high (physics + WebGL + everything), medium (WebGL bg, no physics),
   low (GSAP only, CSS grain). Auto-drops a tier if FPS sags; everything
   downstream subscribes via QUALITY.on(). */
window.QUALITY = (function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 768px)').matches ||
               window.matchMedia('(pointer: coarse)').matches;

  var tier;
  if (reduced || mobile) tier = 'low';
  else if ((navigator.hardwareConcurrency || 4) <= 4 || window.devicePixelRatio > 2.2) tier = 'medium';
  else tier = 'high';

  // ?quality=low|medium|high override for testing the tiers
  var forced = (location.search.match(/quality=(high|medium|low)/) || [])[1];
  if (forced) tier = forced;

  var listeners = [];
  function set(t) {
    if (t === tier) return;
    tier = t;
    listeners.forEach(function (fn) { fn(t); });
  }

  // FPS watchdog: rolling average over ~2s windows; drop one tier under 28fps.
  // gsap.ticker pauses with rAF in hidden tabs, so no false drops there.
  if (!reduced && !forced) {
    var last = performance.now(), acc = 0, n = 0;
    gsap.ticker.add(function () {
      var now = performance.now();
      acc += now - last; n++; last = now;
      if (n >= 120) {
        var fps = 1000 / (acc / n);
        acc = 0; n = 0;
        if (fps < 28) set(tier === 'high' ? 'medium' : 'low');
      }
    });
  }

  return {
    get tier() { return tier; },
    reduced: reduced,
    mobile: mobile,
    on: function (fn) { listeners.push(fn); },
    force: set // exposed for manual testing from the console
  };
})();
