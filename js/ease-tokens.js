/* ease-tokens.js — the site's motion vocabulary, defined once and reused
   everywhere as design tokens. No raw stock eases in expressive motion;
   scrub-mapped parallax may still use 'none' (that's a mapping, not motion).

   EASE.out   — long-tailed entrance: fast start, long gentle settle
   EASE.in    — committed attack for charges/impacts (hard arrival)
   EASE.inOut — expressive in-out for the ball and big scene moves
   EASE.soft  — gentle, for backgrounds / parallax / quiet drifts
   EASE.pop   — slight overshoot for UI accents (pills, cards, dots)     */
(function () {
  'use strict';
  gsap.registerPlugin(CustomEase);

  CustomEase.create('eOut', 'M0,0 C0.16,1 0.29,1 1,1');
  CustomEase.create('eIn', 'M0,0 C0.55,0 0.85,0.25 1,1');
  CustomEase.create('eInOut', 'M0,0 C0.72,0 0.08,1 1,1');
  CustomEase.create('eSoft', 'M0,0 C0.36,0 0.22,1 1,1');
  CustomEase.create('ePop', 'M0,0 C0.26,0 0.28,1.22 0.5,1.12 C0.72,1.02 0.82,1 1,1');

  window.EASE = { out: 'eOut', in: 'eIn', inOut: 'eInOut', soft: 'eSoft', pop: 'ePop' };
})();
