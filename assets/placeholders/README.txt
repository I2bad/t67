Placeholder assets
==================

This folder is intentionally (almost) empty.

- "Videos" on the site are labeled CSS-gradient blocks (.video-ph). To upgrade,
  drop .mp4 files here and replace a placeholder with:
    <video muted loop playsinline data-src="assets/placeholders/party.mp4"></video>
  js/video-lazy.js will lazy-load and play/pause them automatically.

- Sounds are generated at runtime as short WAV tones (see js/audio.js).
  To upgrade, drop hover.wav / click.wav / loop.mp3 here and point the
  Howl src arrays at them.

- "Logos" in the Resources section are labeled boxes (.logo-box) on purpose —
  no third-party media is bundled.
