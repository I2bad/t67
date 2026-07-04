/* audio.js — Howler: first-gesture unlock, mute toggle, hover/click UI sounds,
   low-volume background loop. Placeholder tones are generated at runtime as
   WAV data-URIs so no binary assets are needed; drop real files into
   /assets/placeholders/ and swap the src arrays to upgrade. */
(function () {
  'use strict';

  // Generate a short sine-tone WAV as a data URI (our "placeholder tone").
  function toneWav(freq, dur, vol) {
    var sr = 8000, n = Math.floor(sr * dur);
    var buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(off, s) { for (var i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) {
      var fade = Math.min(1, (n - i) / (n * 0.5)); // fade out to avoid clicks
      v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * i / sr) * 32767 * vol * fade, true);
    }
    var bytes = new Uint8Array(buf), bin = '';
    for (var j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return 'data:audio/wav;base64,' + btoa(bin);
  }

  var enabled = false;
  var hoverSnd, clickSnd, bgLoop;

  function build() {
    if (hoverSnd) return;
    hoverSnd = new Howl({ src: [toneWav(880, 0.05, 0.12)], volume: 0.25 });
    clickSnd = new Howl({ src: [toneWav(520, 0.09, 0.15)], volume: 0.3 });
    // ponytail: bg "loop" is a soft low hum placeholder; swap for a real loop file
    bgLoop = new Howl({ src: [toneWav(110, 2.0, 0.04)], loop: true, volume: 0.15 });
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

  // UI sounds on interactive elements
  document.addEventListener('mouseover', function (e) {
    if (!enabled) return;
    if (e.target.closest('a, button')) hoverSnd.play();
  });
  document.addEventListener('click', function (e) {
    if (!enabled) return;
    if (e.target.closest('a, button') && e.target.closest('#soundToggle') === null) clickSnd.play();
  });
})();
