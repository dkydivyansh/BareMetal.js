export function mount() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_4');
  if (!canvas) return;

  let observer;
  let reqId;
  const mouseHandler = (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  };

  // Sync the WebGL drawing-buffer size with the CSS-driven layout size.
  function syncSize() {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(syncSize);
    observer.observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  
  const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
  const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.5;
    
    // Liquid metal noise
    for(float i=1.0; i<4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + t);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + t);
    }

    vec3 color = vec3(0.02); // Base dark
    float glow = 0.05 / length(p);
    
    // Accent color from design system (Synthetic Purple)
    vec3 accent = vec3(0.5, 0.2, 1.0); 
    
    color += accent * glow * 0.5;
    color += accent * (0.1 / length(p + vec2(sin(t), cos(t)) * 0.2));

    gl_FragColor = vec4(color, 1.0);
}`;

  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', mouseHandler);

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    reqId = requestAnimationFrame(render);
  }
  render(0);

  return {
    destroy: () => {
      window.removeEventListener('mousemove', mouseHandler);
      cancelAnimationFrame(reqId);
      if (observer) observer.disconnect();
    }
  };
}
