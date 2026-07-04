# PRESSURE.ed

A single-page, scroll-driven educational site about **peer pressure** — what it
is, how it works on us psychologically, and how to recognize and resist it.
A small white ball is "you"; peer dots nudge, shove, and tug it as you scroll.
The metaphor does the teaching.

## Run it

No build step — it's static files with CDN libraries.

```
# any static server works:
npx http-server -p 8123 .
# or
python -m http.server 8123
```

Then open http://localhost:8123. (Opening `index.html` directly from disk also
works, but a local server is recommended so the CDN fonts/scripts and
IntersectionObserver behave consistently.)

## Stack

- Plain HTML / CSS / vanilla JS — no framework, no build.
- **GSAP** + **ScrollTrigger** (scroll-linked animation, pinning) +
  **MotionPathPlugin** (the ball follows invisible SVG paths) — CDN.
- **Lenis** for smooth scroll, synced to ScrollTrigger.
- **Howler.js** for UI sounds + background loop (muted until you opt in).
- **lottie-web** for the small pulsing scroll-hint icon (inline animation data).

## Structure

```
index.html            all sections + inline demo SVGs
css/style.css         design tokens, chrome, panels, responsive, reduced-motion
js/main.js            Lenis/ScrollTrigger wiring, chrome, breadcrumb, bg fades
js/ball.js            hero ball + peer-dot nudges
js/storytelling.js    winding motion path, word pills, self-drawing scenes
js/audio.js           Howler: gesture unlock, mute toggle, generated tones
js/video-lazy.js      IntersectionObserver play/pause + lazy-load
js/demos/*.js         one scrubbed timeline per concept (belong … sayingno)
assets/placeholders/  see its README — how to swap in real media
```

## What's placeholder

- **All "videos"** are labeled gradient blocks — no third-party clips.
- **All sounds** are runtime-generated tones — no audio files.
- **Resource "logos"** are labeled boxes.
- Resource **links and citations are real and verifiable** (Cialdini's
  *Influence*, Asch 1955, Deutsch & Gerard 1955, Baumeister & Leary 1995,
  apa.org, KidsHealth, and real support organisations). No statistics or
  helpline numbers were invented; none are shown.

## Accessibility & motion

- `prefers-reduced-motion`: scrubbed/parallax motion is skipped and every demo
  renders its final state.
- Real heading hierarchy, keyboard-focusable menu (Esc closes), `aria-*` on
  menu/sound toggles, labels on all placeholder media.
- Pinning/heavy scrubbing is reduced on ≤768px viewports.
- Sound is off until the user presses the sound toggle (that press is also the
  audio-unlock gesture).

## Attribution & content origin

Structure, motion vocabulary, and interaction design are **inspired by
[Zajno's motion.ed](https://motion.zajno.com)**. This is an unaffiliated,
non-commercial **study project**. All copy, SVG artwork, and code here are
original; no third-party media or fonts are copied (fonts are free Google
Fonts: Space Grotesk, Space Mono, Playfair Display).

The subject matter can touch on bullying, substance use, and low moments. The
Resources section points readers to trusted adults and real professional
support services, and the copy aims to stay supportive and non-judgmental.
