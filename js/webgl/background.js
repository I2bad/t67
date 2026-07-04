/* webgl/background.js — one persistent shader layer behind the whole page:
   animated grain, a slow fluid gradient that tracks the section palette,
   mouse-reactive distortion, and a flow "pulse" the zoom transition spikes.
   It sits at z-index 0; opaque section panels simply paint over it, so it's
   only ever visible where it earns it (the dark half + panel gaps).
   Driven from gsap.ticker — no competing rAF. */
window.initBackgroundGL = function (tier) {
  'use strict';
  var canvas = document.createElement('canvas');
  canvas.id = 'glbg';
  document.body.appendChild(canvas);

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec3 uColor;',
    'uniform vec2 uMouse;uniform float uPulse;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/uRes;',
    // fluid wobble — the whole field breathes slowly
    '  vec2 q=uv+0.035*vec2(sin(uTime*0.11+uv.y*3.2),cos(uTime*0.13+uv.x*2.7));',
    // mouse distortion: space bows gently away from the cursor
    '  vec2 m=uMouse/uRes;float md=distance(uv,vec2(m.x,1.0-m.y));',
    '  q+=0.035*(0.4+uPulse)*normalize(uv-vec2(m.x,1.0-m.y)+1e-4)*exp(-md*5.0);',
    // two drifting soft blobs lighten/darken the base palette color
    '  float b1=exp(-distance(q,vec2(0.32+0.2*sin(uTime*0.07),0.42+0.2*cos(uTime*0.09)))*2.2);',
    '  float b2=exp(-distance(q,vec2(0.74+0.16*cos(uTime*0.06),0.62+0.18*sin(uTime*0.08)))*2.4);',
    '  vec3 col=uColor*(1.0+0.12*b1-0.08*b2+uPulse*0.18*b1);',
    // additive warm lift so the flow still reads on near-black sections
    '  col+=(0.030*b1+0.018*b2+uPulse*0.05*b1)*vec3(1.0,0.97,0.92);',
    // animated grain
    '  col+=(hash(gl_FragCoord.xy+fract(uTime)*371.0)-0.5)*0.045;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  var layer = window.makeGLLayer(canvas, FRAG);
  if (!layer) { canvas.remove(); return null; }

  function hex2rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  var cur = hex2rgb('#0C0B0B'), target = cur.slice();
  var mouse = [-9999, 0], mouseSmooth = [-9999, 0];
  var pulse = 0;
  var dprCap = tier === 'high' ? 1.5 : 1;

  layer.resize(dprCap);
  var onResize = function () { layer.resize(dprCap); };
  window.addEventListener('resize', onResize);

  function tick(time) {
    // ease the palette + mouse every frame — nothing snaps
    for (var i = 0; i < 3; i++) cur[i] += (target[i] - cur[i]) * 0.045;
    mouseSmooth[0] += (mouse[0] - mouseSmooth[0]) * 0.08;
    mouseSmooth[1] += (mouse[1] - mouseSmooth[1]) * 0.08;
    pulse *= 0.955;
    var dpr = canvas.width / Math.max(1, canvas.clientWidth);
    layer.set('uRes', canvas.width, canvas.height);
    layer.set('uTime', time);
    layer.set('uColor', cur[0], cur[1], cur[2]);
    layer.set('uMouse', mouseSmooth[0] * dpr, mouseSmooth[1] * dpr);
    layer.set('uPulse', pulse);
    layer.render();
  }
  gsap.ticker.add(tick);

  return {
    setColor: function (hex) { target = hex2rgb(hex); },
    setMouse: function (x, y) { mouse[0] = x; mouse[1] = y; },
    pulse: function () { pulse = 1; },
    destroy: function () {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      layer.destroy();
    }
  };
};
