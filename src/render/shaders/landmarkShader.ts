import { lightingCommon } from './lighting';

/**
 * Hand-built Main Street landmarks. Solids carry per-vertex colour and
 * material; sign faces (USE_MAP) sample the sign atlas and glow after dark.
 */
export const landmarkVertex = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform vec3 uCamPos;
in vec3 color;
// roughness, emission, effect, seed. Effects: 0 none, 1 neon flicker, 2 bulb chase, 3 metal,
// 4 punched hotel windows, 5 glass curtain wall, 6 balconies, 7 floodlit wall, 8 blinking sign
// (cycles its frames quickly), 9 interior surface lit by the room lamps. On the facade effects
// 4-7, emission is a night-time floodlight wash whose hue is fract(seed) (negative: warm white).
// On interiors, emission is the room's ambient fill.
in vec4 aMat;
#ifdef USE_MAP
// uv (built in): 0..1 across the sign face
in vec4 aRect;     // atlas u0, v0, u1, v1
in float aFrames;  // stacked animation frames
out vec2 vUv;
flat out vec4 vRect;
flat out float vFrames;
#endif
#ifdef SHADOW_PASS
uniform mat4 uShadowMatrix;
out float vShadowZ;
#endif
out vec3 vWorld;
out vec3 vNormal;
out vec3 vColor;
flat out vec4 vMat;

void main() {
  vec3 world = position;
  vWorld = world;
  vNormal = normal;
  vColor = color;
  vMat = aMat;
#ifdef USE_MAP
  vUv = uv;
  vRect = aRect;
  vFrames = aFrames;
#endif
#ifdef SHADOW_PASS
  vShadowZ = (uShadowMatrix * vec4(world, 1.0)).z;
#else
  vec2 dc = world.xz - uCamPos.xz;
  world.y -= dot(dc, dc) / (2.0 * 7310000.0);
#endif
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  #include <logdepthbuf_vertex>
}
`;

export const landmarkFragment = /* glsl */ `
${lightingCommon}
#include <logdepthbuf_pars_fragment>
#ifdef USE_MAP
uniform sampler2D uMap;
in vec2 vUv;
flat in vec4 vRect;
flat in float vFrames;
#endif
#ifdef SHADOW_PASS
in float vShadowZ;
#endif
in vec3 vWorld;
in vec3 vNormal;
in vec3 vColor;
flat in vec4 vMat;
out vec4 outColor;

#define LAMPS 48
// Nearest room lamps to the camera: position and reach (m); colour and strength.
uniform vec4 uLamps[LAMPS];
uniform vec4 uLampCol[LAMPS];

/** Incandescent light from the room lamps, falling off to nothing at each lamp's reach. */
vec3 lampLight(vec3 p, vec3 n) {
  vec3 sum = vec3(0.0);
  for (int i = 0; i < LAMPS; i++) {
    vec4 l = uLamps[i];
    if (l.w <= 0.0) break;
    vec3 d = l.xyz - p;
    float r2 = dot(d, d);
    float reach = l.w * l.w;
    if (r2 > reach) continue;
    float fall = 1.0 - r2 / reach;
    float lambert = 0.3 + 0.7 * max(dot(n, d * inversesqrt(r2 + 1e-4)), 0.0);
    sum += uLampCol[i].rgb * uLampCol[i].a * fall * fall * lambert / (1.0 + r2 * 0.08);
  }
  return sum;
}

void main() {
  #include <logdepthbuf_fragment>
#ifdef SHADOW_PASS
  outColor = vec4(vShadowZ, 0.0, 0.0, 1.0);
  return;
#endif
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 albedo = vColor;
  float rough = vMat.x;
  float glow = vMat.y;
  float fx = vMat.z;
#ifdef USE_MAP
  // Message boards and neon signs cycle through stacked frames.
  float frame = 0.0;
  if (vFrames > 1.5) {
    float rate = fx > 0.5 && fx < 1.5 ? 0.0 : fx > 7.5 ? 1.6 : 1.0 / 4.0;
    frame = rate > 0.0
      ? mod(floor(uTime * rate + vMat.w * 7.0), vFrames)
      // Neon tube buzzing on and off at random.
      : step(0.93, hash12(vec2(floor(uTime * 6.0), vMat.w)));
  }
  vec2 fuv = vec2(vUv.x, (vUv.y + frame) / vFrames);
  vec4 tex = texture(uMap, mix(vRect.xy, vRect.zw, fuv));
  if (tex.a < 0.5) discard;
  albedo = tex.rgb;
#endif
  vec3 emit = vec3(0.0);
  if (fx > 3.5 && fx < 7.5) {
    vec3 wash = vMat.w < 0.0 ? vec3(1.0, 0.86, 0.7) : clamp(abs(mod(fract(vMat.w) * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0) * 0.8 + 0.2;
    float wall = 1.0;
    // Floodlights at the foot of the wall throw overlapping cones up the face.
    float cone = 1.0;
    if (abs(n.y) < 0.4) {
      vec2 tw = normalize(vec2(-n.z, n.x));
      float c = 0.5 + 0.5 * cos(dot(vWorld.xz, tw) * 6.2832 / 11.0);
      cone = 0.62 + 0.38 * c * c;
    }
    if (fx < 6.5 && abs(n.y) < 0.4) {
      // Room grid on the facade: bays 3.6 m wide, floors 3.1 m apart.
      vec2 t2 = normalize(vec2(-n.z, n.x));
      vec2 g = vec2(dot(vWorld.xz, t2) / 3.6, vWorld.y / 3.1);
      vec2 cell = floor(g);
      vec2 f = fract(g);
      vec2 fw = fwidth(g);
      float win;
      float cover;
      if (fx < 4.5) {
        win = smoothstep(0.2 - fw.x, 0.2 + fw.x, f.x) * smoothstep(0.8 + fw.x, 0.8 - fw.x, f.x)
            * smoothstep(0.28 - fw.y, 0.28 + fw.y, f.y) * smoothstep(0.86 + fw.y, 0.86 - fw.y, f.y);
        cover = 0.35;
      } else if (fx < 5.5) {
        float mx = smoothstep(0.03 + fw.x, 0.03 - fw.x, abs(f.x * 2.0 - floor(f.x * 2.0 + 0.5)));
        float my = smoothstep(0.07 + fw.y, 0.07 - fw.y, 0.5 - abs(f.y - 0.5));
        win = 1.0 - max(mx, my);
        cover = 0.85;
      } else {
        win = smoothstep(0.06 - fw.x, 0.06 + fw.x, f.x) * smoothstep(0.94 + fw.x, 0.94 - fw.x, f.x)
            * smoothstep(0.3 - fw.y, 0.3 + fw.y, f.y) * smoothstep(0.97 + fw.y, 0.97 - fw.y, f.y);
        // Balcony slab and white rail along each floor.
        float slab = smoothstep(0.24 + fw.y, 0.24 - fw.y, f.y);
        albedo = mix(albedo, vec3(0.92, 0.91, 0.88), slab);
        cover = 0.6;
      }
      float aa = clamp(1.4 - max(fw.x, fw.y) * 2.5, 0.0, 1.0);
      win = mix(cover, win, aa);
      float h = hash12(cell + floor(vMat.w) * 17.31);
      vec3 glass = fx > 4.5 && fx < 5.5 ? vColor * 0.7 : vec3(0.09, 0.11, 0.13);
      if (fx > 4.5 && fx < 5.5) albedo = vec3(0.7, 0.68, 0.64);
      albedo = mix(albedo, glass, win);
      rough = mix(rough, 0.1, win);
      // Rooms lit after dark: mostly warm lamps, the odd cool TV glow, curtains half drawn.
      float lit = mix(0.55, step(0.45, h), aa) * win;
      vec3 lc = mix(vec3(1.0, 0.7, 0.4), vec3(0.75, 0.85, 1.0), step(0.88, h)) * (0.45 + 0.55 * fract(h * 7.31));
      emit += lc * lit * uNight * 0.3 * uInvExposure;
      wall = 1.0 - win * (fx > 4.5 && fx < 5.5 ? 0.55 : 0.8);
    }
    vec3 lamp = fx > 4.5 && fx < 5.5 ? mix(vColor, vec3(0.92), 0.6) : vColor;
    emit += wash * lamp * glow * cone * wall * uNight * 0.2 * uInvExposure;
  } else if (glow > 0.0 && (fx < 8.5 || fx > 9.5)) {
    float on = 1.0;
    if (fx > 1.5 && fx < 2.5) {
      // Marquee bulbs chasing along the sign.
      float k = fract(vWorld.x * 0.9 + vWorld.z * 0.9 - uTime * 2.5);
      on = 0.35 + 0.65 * step(0.5, k);
    }
    // Lit signs are readable by day and blaze at night.
    // Neon, marquee bulbs and blinking signs burn hotter than backlit panels after dark.
    float tube = (fx > 0.5 && fx < 2.5) || fx > 7.5 ? 2.2 : 1.0;
    emit = albedo * albedo * glow * on * mix(0.08, 0.6 * tube, uNight) * uInvExposure;
    albedo *= 0.8;
  }
  if (fx > 2.5 && fx < 3.5) rough = 0.3;
  float shadow = shadowAt(vWorld + n * 0.2, 0.0012);
#ifdef GLASS_PASS
  // Window glass: a faint tint looking straight in, a sky mirror at grazing angles.
  vec3 V = normalize(uCamPos - vWorld);
  float F = 0.04 + 0.96 * pow(1.0 - abs(dot(n, V)), 5.0);
  vec3 R = reflect(-V, n);
  R.y = abs(R.y) + 0.02;
  vec3 refl = skyRadianceDir(normalize(R)) * mix(1.0, 0.35, uNight);
  float a = clamp(0.1 + F * 0.85, 0.0, 0.92);
  vec3 gcol = (refl * F + vColor * 0.02) / a;
  outColor = vec4(applyAtmosphere(gcol, vWorld), a);
  return;
#endif
  vec3 col;
  if (fx > 8.5 && fx < 9.5) {
    // Indoors: the sky only leaks in through the windows; the lamps do the rest,
    // authored in display units so a lit lobby reads the same by day or night.
    vec3 lamp = lampLight(vWorld, n) + vec3(1.0, 0.78, 0.55) * glow;
    col = shadeSurface(albedo * 0.85, n, vWorld, 1.0, rough, shadow * 0.25) * 0.22 + albedo * lamp * 0.18 * uInvExposure;
  } else {
    col = shadeSurface(albedo * 0.85, n, vWorld, 1.0, rough, shadow) + emit;
  }
  col = applyAtmosphere(col, vWorld);
  outColor = vec4(col, 1.0);
}
`;
