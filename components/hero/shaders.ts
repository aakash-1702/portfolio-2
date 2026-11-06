// GLSL for the hero signal field.
//
// 3D simplex noise: Ian McEwan & Stefan Gustavson (Ashima Arts), MIT licence.
// https://github.com/ashima/webgl-noise

const SNOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const FIELD_WIDTH = 84;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAmp;
uniform float uPixelRatio;
uniform float uFade;
attribute vec2 aGrid;
varying float vHeat;
varying float vAlpha;

${SNOISE}

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec3 p = position;
  float t = uTime;

  // A slow swell drifting toward the viewer: two octaves of noise.
  float n = snoise(vec3(p.x * 0.055, p.z * 0.06 + t * 0.10, t * 0.05)) * 1.35
          + snoise(vec3(p.x * 0.16 + 4.0, p.z * 0.17 + t * 0.22, t * 0.09)) * 0.38;

  // The cursor lifts a soft dome that rings outward.
  float d = distance(p.xz, uMouse);
  float dome = exp(-d * d * 0.045) * uMouseAmp;
  float ring = sin(d * 1.1 - t * 2.4) * exp(-d * 0.18) * uMouseAmp * 0.35;
  p.y += n + dome * 1.6 + ring;

  // A few rows carry packets: bright pulses with a tail, moving like requests through a pipeline.
  float row = aGrid.y;
  float lane = step(0.86, hash(row * 7.31 + 1.7));
  float speed = mix(5.0, 11.0, hash(row * 3.17));
  float span = ${FIELD_WIDTH.toFixed(1)} + 26.0;
  float head = mod(t * speed + hash(row) * span, span) - span * 0.5;
  float dx = head - p.x;
  float packet = lane * (exp(-dx * dx * 0.6) + step(0.0, dx) * exp(-dx * 0.35) * 0.45);

  float heat = clamp(0.5 + n * 0.45 + dome * 0.6, 0.0, 1.4);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float depth = -mv.z;
  gl_PointSize = (1.5 + heat * 1.5 + packet * 3.2) * uPixelRatio * (46.0 / depth);

  // Fade the far rows into the dark, the sides softly, and everything as the page scrolls away.
  float far = smoothstep(82.0, 30.0, depth);
  float side = 1.0 - smoothstep(0.3, 0.5, abs(p.x) / ${FIELD_WIDTH.toFixed(1)});
  vAlpha = (far * side * (0.26 + heat * 0.34) + packet * 0.95 * far) * uFade;
  vHeat = heat + packet * 2.0;
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uCold;
uniform vec3 uGold;
uniform vec3 uHot;
varying float vHeat;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.05, r);
  vec3 col = mix(uCold, uGold, smoothstep(0.85, 1.25, vHeat));
  col = mix(col, uHot, smoothstep(1.2, 2.0, vHeat));
  gl_FragColor = vec4(col, soft * vAlpha);
}
`;
