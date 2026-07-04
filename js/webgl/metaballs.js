/* webgl/metaballs.js — the hero's peer-dot field rendered as WebGL metaballs
   so the crowd blobs and merges into an organic mass as it clusters around
   the ball (which is the biggest blob in the same field — when the crowd
   touches you, it visibly absorbs you). Positions come from js/physics.js.
   Rendered from the physics tick — no rAF of its own. */
window.initMetaballs = function (container) {
  'use strict';
  var MAX = 16;
  var canvas = document.createElement('canvas');
  canvas.className = 'metaball-canvas';
  container.appendChild(canvas);

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uCount;uniform vec3 uBalls[' + MAX + '];',
    'void main(){',
    '  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);', // y-down page coords
    '  float f=0.0;',
    '  for(int i=0;i<' + MAX + ';i++){',
    '    if(float(i)>=uCount)break;',
    '    vec3 b=uBalls[i];',
    '    vec2 d=p-b.xy;',
    '    f+=(b.z*b.z)/(dot(d,d)+1.0);',
    '  }',
    // hard-ish threshold with a soft halo just outside it
    '  float a=smoothstep(0.9,1.15,f);',
    '  float halo=smoothstep(0.35,0.9,f)*0.12;',
    '  vec3 cream=vec3(0.969,0.961,0.941);',
    '  float alpha=min(1.0,a+halo);',
    '  gl_FragColor=vec4(cream*alpha,alpha);', // premultiplied
    '}'
  ].join('\n');

  var layer = window.makeGLLayer(canvas, FRAG);
  if (!layer) { canvas.remove(); return null; }
  layer.gl.enable(layer.gl.BLEND);
  layer.gl.blendFunc(layer.gl.ONE, layer.gl.ONE_MINUS_SRC_ALPHA);

  var data = new Float32Array(MAX * 3);
  var count = 0;

  layer.resize(1.25);
  var onResize = function () { layer.resize(1.25); };
  window.addEventListener('resize', onResize);

  return {
    // balls: [{x, y, r}] in container CSS pixels
    setBalls: function (balls) {
      count = Math.min(balls.length, MAX);
      var dpr = canvas.width / Math.max(1, canvas.clientWidth);
      for (var i = 0; i < count; i++) {
        data[i * 3] = balls[i].x * dpr;
        data[i * 3 + 1] = balls[i].y * dpr;
        data[i * 3 + 2] = balls[i].r * dpr;
      }
      layer.set('uRes', canvas.width, canvas.height);
      layer.set('uCount', count);
      layer.setVec3Array('uBalls[0]', data);
    },
    render: function () {
      layer.gl.clearColor(0, 0, 0, 0);
      layer.gl.clear(layer.gl.COLOR_BUFFER_BIT);
      layer.render();
    },
    destroy: function () {
      window.removeEventListener('resize', onResize);
      layer.destroy();
    }
  };
};
