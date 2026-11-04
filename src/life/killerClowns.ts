import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { G } from '../render/globals';
import { noiseCommon } from '../render/shaders/noise';
import type { CemeteryPlan } from '../world/cemetery';
import type { Heightfield } from '../world/heightfield';

const vertexShader = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform float uTime;
uniform float uPhase;
uniform float uLunge;
out vec3 vLocal;
out vec3 vN;
out vec3 vView;

void main() {
  vec3 p = position;
  // Baggy suit flapping as it rushes, hem trailing behind.
  float loose = 1.0 - smoothstep(0.0, 1.3, p.y);
  p.x -= loose * loose * (0.2 + uLunge * 0.5) + sin(p.y * 5.0 + uTime * 7.0 + uPhase) * 0.05 * loose;
  p.z += sin(p.y * 3.0 + uTime * 5.0 + uPhase) * 0.07 * loose;
  // The head lolls and twitches.
  float head = smoothstep(1.5, 1.7, p.y);
  p.z += head * sin(uTime * 13.0 + uPhase) * 0.025;
  p.x += head * uLunge * 0.12;
  vLocal = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const fragmentShader = /* glsl */ `
${noiseCommon}
#include <logdepthbuf_pars_fragment>
uniform float uTime;
uniform float uPhase;
uniform float uFade;
uniform float uInvExposure;
uniform vec3 uSuitA;
uniform vec3 uSuitB;
uniform vec3 uHat;
in vec3 vLocal;
in vec3 vN;
in vec3 vView;
out vec4 outColor;

void main() {
  #include <logdepthbuf_fragment>
  vec3 V = normalize(vView);
  vec3 N = normalize(vN);
  float facing = abs(dot(N, V));
  float rim = pow(1.0 - facing, 1.4);
  float y = vLocal.y;
  float ang = atan(vLocal.z, vLocal.x);
  // Harlequin suit: one colour each side, big polka dots.
  vec3 suit = vLocal.z > 0.0 ? uSuitA : uSuitB;
  vec2 dc = fract(vec2(ang * 1.6, y * 3.2)) - 0.5;
  suit = mix(suit, vec3(1.0), smoothstep(0.2, 0.15, length(dc)) * 0.8);
  vec3 col = suit;
  // White ruff, greasepaint face, a cone hat with a pompom.
  col = mix(col, vec3(1.0), smoothstep(1.43, 1.46, y) * (1.0 - smoothstep(1.53, 1.56, y)));
  float face = smoothstep(1.55, 1.58, y) * (1.0 - smoothstep(1.92, 1.95, y));
  col = mix(col, vec3(0.95, 0.93, 0.9), face);
  col = mix(col, uHat, smoothstep(1.94, 1.97, y));
  col = mix(col, vec3(1.0), smoothstep(2.28, 2.31, y));
  // Orange hair bursting out at the sides.
  float hair = face * smoothstep(0.55, 0.85, abs(sin(ang))) * smoothstep(1.62, 1.7, y) * (1.0 - smoothstep(1.86, 1.92, y));
  col = mix(col, vec3(1.0, 0.35, 0.05), hair);
  // On the front of the face (+x): black diamond eyes with red pinpricks, a grin full of teeth.
  float front = smoothstep(0.08, 0.16, vLocal.x);
  vec2 e = vec2(abs(vLocal.z) - 0.075, y - 1.8);
  float eye = front * step(abs(e.x) * 1.4 + abs(e.y), 0.06);
  float pupil = front * exp(-dot(e, e) / 0.00008);
  float mouthY = 1.66 + vLocal.z * vLocal.z * 3.5;
  float mouth = front * step(abs(y - mouthY), 0.03) * step(abs(vLocal.z), 0.15);
  float teeth = mouth * step(0.5, fract(vLocal.z * 40.0)) * step(abs(y - mouthY), 0.018);
  float nose = front * exp(-(pow(vLocal.z, 2.0) + pow(y - 1.73, 2.0)) / 0.0012);
  col = mix(col, vec3(0.02), eye);
  col = mix(col, vec3(0.7, 0.0, 0.02), mouth);
  col = mix(col, vec3(0.95, 0.9, 0.7), teeth);
  col = mix(col, vec3(1.0, 0.05, 0.05), nose);
  // Gloves.
  col = mix(col, vec3(1.0), step(0.8, vLocal.x) * step(y, 1.3));
  float mist = 0.6 + 0.4 * vnoise(vec2(ang * 3.0, y * 4.0 - uTime * 0.9 + uPhase));
  float hem = smoothstep(0.0, 0.5, y + (vnoise(vec2(ang * 5.0, uTime * 1.5)) - 0.5) * 0.4);
  vec3 lit = col * (0.07 + rim * 0.45) * mist * hem + vec3(0.4, 1.0, 0.5) * rim * 0.12 * hem;
  // The face glows on its own: pale greasepaint, the grin and teeth brightest of all.
  float paint = face * (1.0 - hair) * (1.0 - eye) * (1.0 - mouth);
  lit += vec3(0.85, 0.85, 0.8) * paint * 0.16 * mist + vec3(0.9, 0.02, 0.04) * (mouth - teeth) * 0.35 + vec3(1.0, 0.95, 0.75) * teeth * 0.4;
  lit += vec3(1.0, 0.1, 0.05) * pupil * 1.6 + vec3(1.0, 0.2, 0.2) * nose * 0.3;
  float flick = 0.85 + 0.15 * step(0.5, fract(sin(floor(uTime * 12.0) + uPhase) * 43758.5));
  outColor = vec4(lit * flick * uFade * uInvExposure, 1.0);
}
`;

/** Baggy clown suit, ruff, round head and a tall cone hat, as a lathe silhouette. */
function suit() {
  const prof = [
    [0.36, 0.0], [0.44, 0.3], [0.38, 0.75], [0.3, 1.05], [0.36, 1.3], [0.3, 1.42], [0.46, 1.47], [0.44, 1.53],
    [0.1, 1.56], [0.2, 1.62], [0.25, 1.75], [0.23, 1.88], [0.16, 1.94], [0.17, 1.96], [0.03, 2.28], [0.07, 2.31], [0.0, 2.38],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.LatheGeometry(prof, 32);
  body.computeVertexNormals();
  body.deleteAttribute('uv');
  // Long arms reaching forward from the shoulders, white gloves splayed.
  const parts: THREE.BufferGeometry[] = [body];
  for (const sz of [-1, 1]) {
    const arm = new THREE.CylinderGeometry(0.07, 0.1, 0.95, 8).rotateZ(-Math.PI / 2 + 0.25).translate(0.45, 1.25, sz * 0.36);
    const glove = new THREE.SphereGeometry(0.1, 8, 6).scale(1.3, 0.8, 1).translate(0.92, 1.12, sz * 0.36);
    for (const g of [arm, glove]) {
      g.deleteAttribute('uv');
      parts.push(g.index ? g.toNonIndexed() : g);
    }
  }
  return mergeGeometries([parts[0].toNonIndexed(), ...parts.slice(1)]);
}

const SUITS: [string, string, string][] = [
  ['#ff2a2a', '#ffd21a', '#2a6aff'],
  ['#2a6aff', '#ff2a8a', '#ffd21a'],
  ['#2aff6a', '#8a2aff', '#ff2a2a'],
  ['#ff8a1a', '#2affff', '#ff2a8a'],
  ['#f0f0f0', '#ff2a2a', '#1a1a1a'],
];

interface Clown {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  balloon: THREE.Mesh;
  string: THREE.Line;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  fade: number;
  /** Seconds before it climbs out of the ground again. */
  wait: number;
  /** 0..1 rising out of the grave. */
  rise: number;
}

/**
 * Easter egg: after dark the clowns come out of the old cemetery beside the
 * Clown Motel and come after you, bird or truck, floating up to your height
 * and lunging when they get close. Outrun them and they give up at the edge
 * of town; let one catch you and it shrieks into nothing and is back in its
 * grave, waiting.
 */
export class KillerClowns {
  readonly group = new THREE.Group();
  private clowns: Clown[] = [];
  private poly: number[];
  private home: THREE.Vector3;
  /** 0..1 how close the nearest one is (for the audio). */
  presence = 0;
  onCatch?: () => void;

  constructor(plan: CemeteryPlan, home: THREE.Vector3, private hf: Heightfield) {
    this.poly = plan.poly;
    this.home = home.clone();
    const geo = suit();
    const balloonGeo = new THREE.SphereGeometry(0.28, 14, 10).scale(1, 1.2, 1);
    const balloonMat = new THREE.MeshBasicMaterial({ color: '#c00010', transparent: true, opacity: 0.9 });
    SUITS.forEach(([a, b, h], i) => {
      const mat = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: G.uTime,
          uInvExposure: G.uInvExposure,
          uPhase: { value: i * 1.93 },
          uFade: { value: 0 },
          uLunge: { value: 0 },
          uSuitA: { value: new THREE.Color(a) },
          uSuitB: { value: new THREE.Color(b) },
          uHat: { value: new THREE.Color(h) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(1.3);
      mesh.frustumCulled = false;
      mesh.renderOrder = 8;
      const balloon = new THREE.Mesh(balloonGeo, balloonMat.clone());
      balloon.frustumCulled = false;
      const string = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#d8d8d8', transparent: true }));
      string.frustumCulled = false;
      this.group.add(mesh, balloon, string);
      const c: Clown = { mesh, mat, balloon, string, pos: new THREE.Vector3(), vel: new THREE.Vector3(), fade: 0, wait: i * 1.6, rise: 0 };
      this.grave(c);
      this.clowns.push(c);
    });
    this.group.visible = false;
  }

  /** Back into a random grave. */
  private grave(c: Clown) {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < this.poly.length; i += 2) {
      x0 = Math.min(x0, this.poly[i]);
      x1 = Math.max(x1, this.poly[i]);
      z0 = Math.min(z0, this.poly[i + 1]);
      z1 = Math.max(z1, this.poly[i + 1]);
    }
    for (let k = 0; k < 40; k++) {
      const x = x0 + Math.random() * (x1 - x0), z = z0 + Math.random() * (z1 - z0);
      if (inside(this.poly, x, z)) {
        c.pos.set(x, this.hf.height(x, z) - 2.4, z);
        break;
      }
    }
    c.vel.set(0, 0, 0);
    c.rise = 0;
    c.fade = 0;
  }

  update(dt: number, cam: THREE.Camera, actor: THREE.Vector3, night: number) {
    const dark = THREE.MathUtils.smoothstep(night, 0.6, 0.9);
    const fromHome = Math.hypot(actor.x - this.home.x, actor.z - this.home.z);
    const hunting = dark > 0 && fromHome < 450;
    this.group.visible = dark > 0 && (hunting || this.clowns.some((c) => c.fade > 0.01));
    this.presence = 0;
    if (!this.group.visible) return;
    const t = G.uTime.value;
    const to = new THREE.Vector3();
    for (const [i, c] of this.clowns.entries()) {
      const ground = this.hf.height(c.pos.x, c.pos.z);
      if (!hunting) {
        // You got away: they sink back toward the graves.
        c.fade = Math.max(0, c.fade - dt * 0.5);
        c.vel.multiplyScalar(Math.exp(-dt * 2));
        if (c.fade === 0) this.grave(c);
      } else if (c.wait > 0) {
        c.wait -= dt;
      } else if (c.rise < 1) {
        // Climbing out of the ground.
        c.rise = Math.min(1, c.rise + dt * 0.45);
        c.fade = c.rise;
        c.pos.y = ground - 2.4 * (1 - c.rise);
      } else {
        // Chase: steer at where you'll be, faster the further behind they fall.
        to.copy(actor).sub(c.pos);
        to.y += -1.1 + Math.sin(t * 1.3 + i) * 0.4;
        const d = to.length();
        const speed = THREE.MathUtils.clamp(7 + d * 0.12, 7, 24) * (1 + 0.6 * Math.max(0, 1 - d / 12));
        to.normalize().multiplyScalar(speed);
        // Spread out so they come from different sides.
        const side = new THREE.Vector3(-to.z, 0, to.x).normalize().multiplyScalar(Math.sin(t * 0.6 + i * 2.1) * 3);
        to.add(side);
        c.vel.lerp(to, Math.min(1, dt * 1.8));
        c.pos.addScaledVector(c.vel, dt);
        c.pos.y = Math.max(c.pos.y, this.hf.height(c.pos.x, c.pos.z) - 0.1);
        c.fade = Math.min(1, c.fade + dt * 0.5);
        if (d < 1.6) {
          this.onCatch?.();
          c.wait = 8 + Math.random() * 8;
          this.grave(c);
        }
      }
      const f = c.fade * dark;
      const near = c.pos.distanceTo(actor);
      this.presence = Math.max(this.presence, f * THREE.MathUtils.clamp(1 - (near - 3) / 60, 0, 1));
      c.mat.uniforms.uFade.value = f;
      c.mat.uniforms.uLunge.value = THREE.MathUtils.clamp(1 - (near - 2) / 10, 0, 1);
      c.mesh.position.copy(c.pos);
      const hv = Math.hypot(c.vel.x, c.vel.z);
      const look = hv > 0.5 ? Math.atan2(-c.vel.z, c.vel.x) : Math.atan2(-(cam.position.z - c.pos.z), cam.position.x - c.pos.x);
      c.mesh.rotation.set(0, look, -Math.min(0.5, hv * 0.02));
      // A red balloon on a string, dragged along behind.
      const bp = c.balloon.position;
      const want = c.pos.clone().add(new THREE.Vector3(0, 4.0 + Math.sin(t * 1.7 + i) * 0.2, 0)).addScaledVector(c.vel, -0.12);
      bp.lerp(want, Math.min(1, dt * 3));
      const bm = c.balloon.material as THREE.MeshBasicMaterial;
      bm.opacity = f * 0.9;
      bm.color.setRGB(0.5, 0.01, 0.03).multiplyScalar(G.uInvExposure.value * 0.25);
      c.balloon.visible = f > 0.02;
      const sp = c.string.geometry.attributes.position as THREE.BufferAttribute;
      sp.setXYZ(0, c.pos.x, c.pos.y + 1.7, c.pos.z);
      sp.setXYZ(1, bp.x, bp.y - 0.33, bp.z);
      sp.needsUpdate = true;
      const lm = c.string.material as THREE.LineBasicMaterial;
      lm.opacity = f;
      lm.color.setScalar(0.5 * G.uInvExposure.value * 0.25);
      c.string.visible = f > 0.02;
    }
  }
}

function inside(poly: number[], x: number, z: number) {
  let c = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const xi = poly[i], zi = poly[i + 1], xj = poly[j], zj = poly[j + 1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
