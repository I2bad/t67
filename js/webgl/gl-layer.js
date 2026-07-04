/* webgl/gl-layer.js — a micro WebGL helper: one fullscreen-triangle program
   per layer, uniform setters, DPR-capped resize. Hand-rolled instead of a
   library on purpose: our two shaders need ~nothing, and this keeps the
   whole GL footprint at one file with zero module/CDN coupling. */
window.makeGLLayer = function (canvas, fragSrc) {
  'use strict';
  var gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  gl.useProgram(prog); // single program per layer — stays bound

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var locP = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(locP);
  gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

  var locs = {};
  function loc(name) {
    if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
    return locs[name];
  }

  return {
    gl: gl,
    set: function (name) { // set('uX', 1) / ('uX', x, y) / ('uX', x, y, z)
      var l = loc(name), a = arguments;
      if (a.length === 2) gl.uniform1f(l, a[1]);
      else if (a.length === 3) gl.uniform2f(l, a[1], a[2]);
      else if (a.length === 4) gl.uniform3f(l, a[1], a[2], a[3]);
    },
    setVec3Array: function (name, f32) { gl.uniform3fv(loc(name), f32); },
    resize: function (dprCap) {
      var dpr = Math.min(dprCap || 1.5, window.devicePixelRatio || 1);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render: function () { gl.drawArrays(gl.TRIANGLES, 0, 3); },
    destroy: function () {
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      canvas.remove();
    }
  };
};
