/* video-lazy.js — IntersectionObserver: play/pause real <video> elements and
   toggle .in-view on gradient placeholders. The site currently ships only
   gradient placeholders, but the code path supports real videos: give them
   <video muted loop playsinline data-src="..."> and they lazy-load + autoplay
   in view, pause out of view. */
(function () {
  'use strict';
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      el.classList.toggle('in-view', entry.isIntersecting);
      if (el.tagName === 'VIDEO') {
        if (entry.isIntersecting) {
          if (el.dataset.src && !el.src) el.src = el.dataset.src; // lazy-load
          el.play().catch(function () {}); // autoplay can be blocked; fine
        } else {
          el.pause();
        }
      }
    });
  }, { rootMargin: '100px', threshold: 0.15 });

  document.querySelectorAll('video, .video-ph').forEach(function (el) { io.observe(el); });
})();
