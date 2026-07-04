/* audio.js — Howler: first-gesture unlock, mute toggle, hover/click UI sounds
   with per-element pitch variance, a section-change whoosh, a finale chime,
   and a low-volume background loop. Placeholder tones/noise are generated at
   runtime as WAV data-URIs so no binary assets are needed; drop real files
   into /assets/placeholders/ and swap the src arrays to upgrade. */
(function () {
  'use strict';

  // Build a WAV data URI from a sample-generator fn(i, n) → -1..1
  function wav(dur, gen) {
    var sr = 11025, n = Math.floor(sr * dur);
    var buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(off, s) { for (var i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, gen(i / sr, i, n))) * 32767, true);
    var bytes = new Uint8Array(buf), bin = '';
    for (var j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return 'data:audio/wav;base64,' + btoa(bin);
  }

  var sin = Math.sin, PI2 = Math.PI * 2;
  function tone(freq, vol) {
    return function (t, i, n) {
      var fade = Math.min(1, (n - i) / (n * 0.6));
      return sin(PI2 * freq * t) * vol * fade;
    };
  }

  var enabled = false;
  var hoverSnd, clickSnd, whooshSnd, chimeSnd, bgLoop;

  function build() {
    if (hoverSnd) return;
    hoverSnd = new Howl({ src: [wav(0.05, tone(880, 0.12))], volume: 0.22 });
    clickSnd = new Howl({ src: [wav(0.09, tone(520, 0.15))], volume: 0.3 });
    // whoosh: brown-ish noise swelling in and out — section transitions
    var bv = 0;
    whooshSnd = new Howl({
      src: [wav(0.5, function (t, i, n) {
        bv = Math.max(-1, Math.min(1, bv + (Math.random() * 2 - 1) * 0.18));
        return bv * 0.16 * Math.sin(Math.PI * i / n);
      })], volume: 0.28
    });
    // chime: soft two-note resolve — the finale's reward
    chimeSnd = new Howl({
      src: [wav(0.7, function (t, i, n) {
        var env = Math.pow(1 - i / n, 2.2);
        return (sin(PI2 * 523.25 * t) * 0.09 + sin(PI2 * 784 * t) * 0.07 * Math.min(1, t * 6)) * env;
      })], volume: 0.4
    });
    // ponytail: bg "loop" is a soft low hum placeholder; swap for a real loop file
    bgLoop = new Howl({ src: [wav(2.0, tone(110, 0.04))], loop: true, volume: 0.15 });
  }

  var btn = document.getElementById('soundToggle');

  function setEnabled(on) {
    enabled = on;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Toggle sound (currently on)' : 'Toggle sound (currently muted)');
    Howler.mute(!on);
    if (on) { build(); if (!bgLoop.playing()) bgLoop.play(); }
    else if (bgLoop) { bgLoop.pause(); }
  }

  // Sound stays off until the user explicitly enables it (this click is also
  // the unlocking gesture Howler needs).
  btn.addEventListener('click', function () { setEnabled(!enabled); });

  // UI sounds — hover pitch varies slightly per element so repeated hovers
  // don't sound mechanical
  document.addEventListener('mouseover', function (e) {
    if (!enabled) return;
    if (e.target.closest('a, button')) {
      var id = hoverSnd.play();
      hoverSnd.rate(0.92 + Math.random() * 0.22, id);
    }
  });
  document.addEventListener('click', function (e) {
    if (!enabled) return;
    if (e.target.closest('a, button') && e.target.closest('#soundToggle') === null) clickSnd.play();
  });

  // Hooks for the rest of the site (all no-ops while muted)
  var lastWhoosh = 0;
  window.AUDIO = {
    whoosh: function () {
      if (!enabled) return;
      var now = Date.now();
      if (now - lastWhoosh < 500) return; // don't machine-gun on fast scroll
      lastWhoosh = now;
      var id = whooshSnd.play();
      whooshSnd.rate(0.9 + Math.random() * 0.2, id);
    },
    chime: function () { if (enabled) chimeSnd.play(); },
    get enabled() { return enabled; }
  };
})();
