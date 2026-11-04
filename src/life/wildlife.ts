import * as THREE from 'three';
import { G } from '../render/globals';
import type { ShadowMap } from '../render/shadows';
import { animalFragment, animalVertex } from '../render/shaders/animalShader';
import type { Heightfield } from '../world/heightfield';
import { LC } from '../world/meta';

/** Limb ids understood by the animal shader. */
const BODY = 0;
const HEAD = 5;
const TAIL = 6;

interface Part {
  geo: THREE.BufferGeometry;
  color: THREE.Color;
  limb: number;
  pivot: [number, number];
  phase: number;
}

class Builder {
  parts: Part[] = [];

  ellipsoid(c: [number, number, number], r: [number, number, number], color: string, limb = BODY, pivot: [number, number] = [0, 0], phase = 0, seg = 10) {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3)).scale(r[0], r[1], r[2]).translate(c[0], c[1], c[2]);
    this.parts.push({ geo: g, color: new THREE.Color(color), limb, pivot, phase });
    return this;
  }

  /** Tapered limb segment between two points. */
  limbSeg(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, color: string, limb: number, pivot: [number, number], phase = 0) {
    const d = b.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1).translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1)));
    this.parts.push({ geo: g, color: new THREE.Color(color), limb, pivot, phase });
    return this;
  }

  build(): THREE.BufferGeometry {
    let count = 0;
    const geos = this.parts.map((p) => {
      const g = p.geo.index ? p.geo.toNonIndexed() : p.geo;
      count += g.attributes.position.count;
      return g;
    });
    const pos = new Float32Array(count * 3);
    const nrm = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const limb = new Float32Array(count * 4);
    let o = 0;
    geos.forEach((g, k) => {
      const p = this.parts[k];
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array as Float32Array, o * 3);
      nrm.set(g.attributes.normal.array as Float32Array, o * 3);
      for (let i = 0; i < n; i++) {
        col.set([p.color.r, p.color.g, p.color.b], (o + i) * 3);
        limb.set([p.limb, p.pivot[0], p.pivot[1], p.phase], (o + i) * 4);
      }
      o += n;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    out.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    out.setAttribute('aLimb', new THREE.BufferAttribute(limb, 4));
    return out;
  }
}

interface QuadSpec {
  len: number;
  hipY: number;
  bodyR: [number, number];
  legR: number;
  neckLen: number;
  neckUp: number;
  headLen: number;
  headR: number;
  tailLen: number;
  tailR: number;
  tailDown: number;
  coat: string;
  belly: string;
  legs: string;
  face: string;
  tail: string;
  ears?: number;
  rump?: string;
  /** Leg phase offsets (front L, front R, hind L, hind R); default is a diagonal walk. */
  phases?: number[];
  /** Hind legs this much longer at the hip, for hares. */
  hindLift?: number;
  /** Horns curling back from the poll: base radius (m). Pronghorn prongs are tiny curls. */
  horns?: number;
  hornColor?: string;
}

/** Generic quadruped: barrel body, four jointed legs, neck and head on a grazing pivot. */
function quadruped(s: QuadSpec): THREE.BufferGeometry {
  const b = new Builder();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const bodyY = s.hipY + s.bodyR[1] * 0.35;
  const half = s.len / 2;
  b.ellipsoid([0, bodyY, 0], [s.bodyR[0], s.bodyR[1], half], s.coat, BODY, [0, 0], 0, 12);
  b.ellipsoid([0, bodyY - s.bodyR[1] * 0.45, 0.05], [s.bodyR[0] * 0.85, s.bodyR[1] * 0.6, half * 0.8], s.belly);
  b.ellipsoid([0, bodyY - s.bodyR[1] * 0.05, half * 0.55], [s.bodyR[0] * 1.05, s.bodyR[1] * 1.15, half * 0.45], s.coat);
  b.ellipsoid([0, bodyY + s.bodyR[1] * 0.05, -half * 0.6], [s.bodyR[0] * 1.02, s.bodyR[1] * 1.05, half * 0.42], s.coat);
  if (s.rump) b.ellipsoid([0, bodyY + s.bodyR[1] * 0.1, -half * 0.92], [s.bodyR[0] * 0.7, s.bodyR[1] * 0.7, half * 0.12], s.rump);
  // Legs: hip pivot, slight knee offset, narrowing to the hoof/paw.
  const hipZ = [half * 0.62, half * 0.62, -half * 0.68, -half * 0.68];
  const side = [1, -1, 1, -1];
  const phase = s.phases ?? [0, Math.PI, Math.PI, 0];
  for (let i = 0; i < 4; i++) {
    const x = side[i] * s.bodyR[0] * 0.55;
    const z = hipZ[i];
    const hipY = s.hipY * (i >= 2 ? 1 + (s.hindLift ?? 0) : 1);
    const knee = V(x, hipY * 0.48, z + (i < 2 ? 0.02 : -0.05) * s.len);
    // Shoulder / haunch muscle so legs don't read as sticks.
    const hind = i >= 2;
    b.ellipsoid([x * 1.05, hipY + s.bodyR[1] * 0.05, z + (hind ? -0.02 : 0.03) * s.len], [s.bodyR[0] * 0.5, hipY * (hind ? 0.36 : 0.3), s.len * (hind ? 0.13 : 0.1)], s.coat, i + 1, [hipY, z], phase[i], 8);
    b.limbSeg(V(x, hipY + s.bodyR[1] * 0.2, z), knee, s.legR * 1.6, s.legR, s.coat, i + 1, [hipY, z], phase[i]);
    b.limbSeg(knee, V(x, 0, z + (i < 2 ? 0.0 : -0.02) * s.len), s.legR, s.legR * 0.7, s.legs, i + 1, [hipY, z], phase[i]);
  }
  // Neck and head share the grazing pivot at the withers.
  const nz = half * 0.85;
  const ny = bodyY + s.bodyR[1] * 0.3;
  const top = V(0, ny + s.neckUp, nz + s.neckLen);
  b.limbSeg(V(0, ny - s.bodyR[1] * 0.2, nz - 0.05), top, s.bodyR[0] * 0.55, s.headR * 0.8, s.coat, HEAD, [ny, nz]);
  b.ellipsoid([0, top.y, top.z + s.headLen * 0.35], [s.headR * 0.75, s.headR, s.headLen * 0.6], s.face, HEAD, [ny, nz]);
  b.ellipsoid([0, top.y - s.headR * 0.25, top.z + s.headLen * 0.85], [s.headR * 0.5, s.headR * 0.55, s.headLen * 0.3], s.face, HEAD, [ny, nz], 0, 8);
  if (s.ears) {
    for (const sd of [-1, 1])
      b.ellipsoid([sd * s.headR * 0.9, top.y + s.headR * 0.7 + s.ears * 0.4, top.z + s.headLen * 0.05], [s.ears * 0.3, s.ears, s.ears * 0.16], s.coat, HEAD, [ny, nz], 0, 6);
  }
  if (s.horns) {
    // A heavy curl sweeping back, down and forward past the cheek.
    const hc = s.hornColor ?? '#8a7a62';
    for (const sd of [-1, 1]) {
      let prev = V(sd * s.headR * 0.45, top.y + s.headR * 0.75, top.z + s.headLen * 0.15);
      let r = s.horns;
      for (let k = 1; k <= 7; k++) {
        const a = (k / 7) * Math.PI * 1.45;
        const rad = s.headR * 1.25;
        const next = V(sd * (s.headR * 0.55 + k * 0.022), top.y + s.headR * 0.2 + Math.cos(a) * rad * 0.9, top.z - s.headLen * 0.05 - Math.sin(a) * rad);
        b.limbSeg(prev, next, r, r * 0.86, hc, HEAD, [ny, nz]);
        prev = next;
        r *= 0.86;
      }
    }
  }
  // Tail from the rump.
  const tz = -half * 0.98;
  const ty = bodyY + s.bodyR[1] * 0.35;
  b.limbSeg(V(0, ty, tz), V(0, ty - s.tailDown, tz - s.tailLen), s.tailR, s.tailR * 0.6, s.tail, TAIL, [ty, tz]);
  return b.build();
}

interface SpeciesDef {
  id: string;
  geo: () => THREE.BufferGeometry;
  cap: number;
  radius: number;
  group: [number, number];
  walk: number;
  run: number;
  stride: number;
  flee: number;
  scale: [number, number];
  tints: string[];
  habitat: (hf: Heightfield, x: number, z: number) => boolean;
}

const slopeOf = (hf: Heightfield, x: number, z: number) => {
  const n = { x: 0, y: 1, z: 0 };
  hf.normal(x, z, n, 4);
  return 1 - n.y;
};

/** Open Great Basin range the herbivores browse: shadscale, sagebrush and black sage, washes, grass. */
const natural = (lc: number) =>
  lc === LC.SHADSCALE || lc === LC.SAGEBRUSH || lc === LC.BLACKSAGE || lc === LC.WASH || lc === LC.GRASS || lc === LC.PINYON || lc === LC.PLAYA || lc === LC.OTHER;

const SPECIES: SpeciesDef[] = [
  {
    id: 'horse',
    // Wild horses of the Stone Cabin and Montezuma Peak herds: bays, sorrels, greys and the odd palomino.
    geo: () =>
      quadruped({ len: 2.05, hipY: 0.98, bodyR: [0.3, 0.38], legR: 0.05, neckLen: 0.42, neckUp: 0.5, headLen: 0.58, headR: 0.13, tailLen: 0.75, tailR: 0.08, tailDown: 0.65, coat: '#ffffff', belly: '#f2ece4', legs: '#5a4a40', face: '#ffffff', tail: '#2a2220', ears: 0.09 }),
    cap: 30,
    radius: 2200,
    group: [4, 11],
    walk: 1.1,
    run: 13,
    stride: 1.8,
    flee: 70,
    scale: [0.88, 1.06],
    tints: ['#6a4430', '#8a5634', '#3a2a24', '#9a8a80', '#c8a868', '#a07850', '#5a3a2a'],
    habitat: (hf, x, z) => {
      const lc = hf.landcover(x, z);
      return (lc === LC.SHADSCALE || lc === LC.SAGEBRUSH || lc === LC.GRASS || lc === LC.PLAYA) && slopeOf(hf, x, z) < 0.18 && Math.hypot(x, z) > 2500;
    },
  },
  {
    id: 'deer',
    // Mule deer: big ears, white rump, black-tipped tail, browsing the pinyon-juniper slopes.
    geo: () =>
      quadruped({ len: 1.5, hipY: 0.82, bodyR: [0.2, 0.27], legR: 0.03, neckLen: 0.3, neckUp: 0.38, headLen: 0.3, headR: 0.085, tailLen: 0.18, tailR: 0.035, tailDown: 0.12, coat: '#ffffff', belly: '#e8e0d4', legs: '#c8b8a4', face: '#ffffff', tail: '#1a1614', ears: 0.13, rump: '#f2ece2' }),
    cap: 24,
    radius: 1800,
    group: [2, 6],
    walk: 0.9,
    run: 10,
    stride: 1.3,
    flee: 50,
    scale: [0.85, 1.1],
    tints: ['#8a7a6a', '#7e7064', '#968676', '#a08c74'],
    habitat: (hf, x, z) => {
      const lc = hf.landcover(x, z);
      return (lc === LC.PINYON || lc === LC.BLACKSAGE || lc === LC.WETLAND) && slopeOf(hf, x, z) < 0.45;
    },
  },
  {
    id: 'pronghorn',
    // Pronghorn: tan and white, short black prongs, the fastest thing in the valley.
    geo: () =>
      quadruped({ len: 1.25, hipY: 0.72, bodyR: [0.17, 0.23], legR: 0.026, neckLen: 0.28, neckUp: 0.32, headLen: 0.26, headR: 0.075, tailLen: 0.08, tailR: 0.03, tailDown: 0.04, coat: '#c08a50', belly: '#f4efe6', legs: '#c89a62', face: '#b07c48', tail: '#f4efe6', ears: 0.08, rump: '#f6f2ea', horns: 0.02, hornColor: '#1a1614' }),
    cap: 30,
    radius: 2400,
    group: [3, 12],
    walk: 1.0,
    run: 22,
    stride: 1.3,
    flee: 90,
    scale: [0.9, 1.06],
    tints: ['#ffffff', '#f2e6d4', '#e8dcc6'],
    habitat: (hf, x, z) => {
      const lc = hf.landcover(x, z);
      return (lc === LC.SHADSCALE || lc === LC.SAGEBRUSH || lc === LC.GRASS) && slopeOf(hf, x, z) < 0.12 && Math.hypot(x, z) > 3000;
    },
  },
  {
    id: 'burro',
    // Wild burros, descendants of the prospectors' pack animals. Jim Butler's burro found the silver.
    geo: () =>
      quadruped({ len: 1.45, hipY: 0.66, bodyR: [0.24, 0.3], legR: 0.045, neckLen: 0.26, neckUp: 0.22, headLen: 0.45, headR: 0.12, tailLen: 0.5, tailR: 0.03, tailDown: 0.45, coat: '#ffffff', belly: '#e8e2d8', legs: '#d8d0c4', face: '#ffffff', tail: '#3a3430', ears: 0.17 }),
    cap: 18,
    radius: 1600,
    group: [2, 6],
    walk: 0.8,
    run: 6,
    stride: 1.3,
    flee: 25,
    scale: [0.9, 1.08],
    tints: ['#7a7068', '#8a7e70', '#5e5650', '#9a8a76', '#6e5c4c'],
    habitat: (hf, x, z) => natural(hf.landcover(x, z)) && slopeOf(hf, x, z) < 0.3 && Math.hypot(x, z) > 1200,
  },
  {
    id: 'coyote',
    geo: () =>
      quadruped({ len: 0.95, hipY: 0.42, bodyR: [0.13, 0.16], legR: 0.025, neckLen: 0.16, neckUp: 0.1, headLen: 0.22, headR: 0.075, tailLen: 0.38, tailR: 0.06, tailDown: 0.2, coat: '#9a8a70', belly: '#d2c4a8', legs: '#8a7a60', face: '#9c8a70', tail: '#6a5a46', ears: 0.07 }),
    cap: 10,
    radius: 1500,
    group: [1, 3],
    walk: 1.4,
    run: 11,
    stride: 0.9,
    flee: 60,
    scale: [0.9, 1.1],
    tints: ['#ffffff', '#e8dcc8'],
    habitat: (hf, x, z) => {
      const lc = hf.landcover(x, z);
      return (natural(lc) || lc === LC.URBAN_OPEN) && slopeOf(hf, x, z) < 0.45;
    },
  },
  {
    id: 'jackrabbit',
    // Black-tailed jackrabbit: huge translucent ears, bounding off at the last moment.
    geo: () =>
      quadruped({ len: 0.5, hipY: 0.2, bodyR: [0.085, 0.1], legR: 0.016, neckLen: 0.06, neckUp: 0.08, headLen: 0.12, headR: 0.05, tailLen: 0.06, tailR: 0.03, tailDown: 0.0, coat: '#9a8a72', belly: '#d8ccb6', legs: '#8a7a64', face: '#9a8a74', tail: '#1e1a16', ears: 0.11, phases: [0, 0.3, Math.PI, Math.PI + 0.3], hindLift: 0.35 }),
    cap: 36,
    radius: 600,
    group: [1, 2],
    walk: 0.7,
    run: 13,
    stride: 0.7,
    flee: 22,
    scale: [0.9, 1.1],
    tints: ['#ffffff', '#efe4d4', '#e2d8c6'],
    habitat: (hf, x, z) => natural(hf.landcover(x, z)) && slopeOf(hf, x, z) < 0.25,
  },
];

interface Animal {
  alive: boolean;
  x: number;
  y: number;
  z: number;
  h: number;
  target: number;
  v: number;
  phase: number;
  graze: number;
  state: number; // 0 graze, 1 walk, 2 flee
  timer: number;
  scale: number;
  hx: number; // herd centre
  hz: number;
}

class Population {
  readonly mesh: THREE.Mesh;
  readonly geo: THREE.InstancedBufferGeometry;
  private animals: Animal[] = [];
  private t0: Float32Array;
  private t1: Float32Array;

  constructor(readonly def: SpeciesDef, material: THREE.ShaderMaterial) {
    const base = def.geo();
    const g = new THREE.InstancedBufferGeometry();
    for (const k of Object.keys(base.attributes)) g.setAttribute(k, base.attributes[k]);
    this.t0 = new Float32Array(def.cap * 4);
    this.t1 = new Float32Array(def.cap * 4);
    const tint = new Float32Array(def.cap * 3);
    const c = new THREE.Color();
    for (let i = 0; i < def.cap; i++) {
      c.set(def.tints[Math.floor(Math.random() * def.tints.length)]);
      const v = 0.9 + Math.random() * 0.2;
      tint.set([c.r * v, c.g * v, c.b * v], i * 3);
      this.animals.push({ alive: false, x: 0, y: 0, z: 0, h: 0, target: 0, v: 0, phase: Math.random() * 6.28, graze: 1, state: 0, timer: 0, scale: 1, hx: 0, hz: 0 });
    }
    g.setAttribute('aT0', new THREE.InstancedBufferAttribute(this.t0, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aT1', new THREE.InstancedBufferAttribute(this.t1, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 3));
    g.instanceCount = 0;
    this.geo = g;
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
  }

  /** Spawns a group in suitable habitat somewhere in the ring around the camera. */
  private spawnGroup(hf: Heightfield, cx: number, cz: number, startIdx: number) {
    const d = this.def;
    for (let tries = 0; tries < 24; tries++) {
      const a = Math.random() * Math.PI * 2;
      const r = d.radius * (0.25 + 0.75 * Math.sqrt(Math.random()));
      const gx = cx + Math.cos(a) * r;
      const gz = cz + Math.sin(a) * r;
      if (!d.habitat(hf, gx, gz)) continue;
      const n = d.group[0] + Math.floor(Math.random() * (d.group[1] - d.group[0] + 1));
      const heading = Math.random() * Math.PI * 2;
      let placed = 0;
      for (let i = startIdx; i < this.animals.length && placed < n; i++) {
        const an = this.animals[i];
        if (an.alive) continue;
        const spread = Math.sqrt(n) * d.stride * 3;
        an.x = gx + (Math.random() - 0.5) * spread;
        an.z = gz + (Math.random() - 0.5) * spread;
        if (!d.habitat(hf, an.x, an.z)) continue;
        an.alive = true;
        an.y = hf.height(an.x, an.z);
        an.h = heading + (Math.random() - 0.5) * 1.5;
        an.target = an.h;
        an.state = Math.random() < 0.7 ? 0 : 1;
        an.timer = Math.random() * 10;
        an.graze = an.state === 0 ? 1 : 0;
        an.scale = d.scale[0] + Math.random() * (d.scale[1] - d.scale[0]);
        an.hx = gx;
        an.hz = gz;
        placed++;
      }
      return;
    }
  }

  update(dt: number, hf: Heightfield, cam: THREE.Vector3, bird: THREE.Vector3) {
    const d = this.def;
    const far = d.radius * 1.35;
    let free = -1;
    for (let i = 0; i < this.animals.length; i++) {
      const a = this.animals[i];
      if (a.alive && Math.hypot(a.x - cam.x, a.z - cam.z) > far) a.alive = false;
      if (!a.alive && free < 0) free = i;
    }
    // Top up one group per frame so spawning cost stays flat.
    if (free >= 0) this.spawnGroup(hf, cam.x, cam.z, free);

    let n = 0;
    for (const a of this.animals) {
      if (!a.alive) continue;
      const bx = a.x - bird.x;
      const bz = a.z - bird.z;
      const bd = Math.hypot(bx, bz);
      const close = bd < d.flee && bird.y - a.y < d.flee * 0.8;
      a.timer -= dt;
      if (close) {
        a.state = 2;
        a.target = Math.atan2(bx, bz) + Math.sin(a.phase * 0.1) * 0.3;
        a.timer = 3 + Math.random() * 3;
      } else if (a.timer <= 0) {
        // Alternate grazing and ambling; drift back toward the herd.
        a.state = a.state === 0 ? 1 : 0;
        a.timer = a.state === 0 ? 6 + Math.random() * 20 : 3 + Math.random() * 8;
        const hx = a.hx - a.x;
        const hz = a.hz - a.z;
        const toHerd = Math.atan2(hx, hz);
        a.target = Math.hypot(hx, hz) > d.stride * 10 ? toHerd : a.h + (Math.random() - 0.5) * 2;
      }
      const speed = a.state === 2 ? d.run : a.state === 1 ? d.walk : 0;
      a.v += (speed - a.v) * Math.min(1, dt * (a.state === 2 ? 3 : 1.2));
      let dh = a.target - a.h;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      a.h += dh * Math.min(1, dt * (a.state === 2 ? 4 : 1.2));
      const nx = a.x + Math.sin(a.h) * a.v * dt;
      const nz = a.z + Math.cos(a.h) * a.v * dt;
      if (a.v > 0.01) {
        if (d.habitat(hf, nx, nz) || a.state === 2) {
          a.x = nx;
          a.z = nz;
          a.y = hf.height(a.x, a.z);
        } else {
          a.target = a.h + Math.PI * (0.6 + Math.random() * 0.8);
        }
      }
      a.graze += ((a.state === 0 ? 1 : 0) - a.graze) * Math.min(1, dt * 1.5);
      a.phase += (a.v / (d.stride * a.scale)) * Math.PI * dt;
      const gait = a.v < d.walk * 0.3 ? 0 : a.v <= d.walk * 1.2 || d.run <= d.walk ? a.v / d.walk : 1 + Math.min(1, (a.v - d.walk) / (d.run - d.walk));
      this.t0.set([a.x, a.y, a.z, a.h], n * 4);
      this.t1.set([a.scale, a.phase, gait, a.graze], n * 4);
      n++;
    }
    this.geo.instanceCount = n;
    (this.geo.attributes.aT0 as THREE.InstancedBufferAttribute).needsUpdate = true;
    (this.geo.attributes.aT1 as THREE.InstancedBufferAttribute).needsUpdate = true;
  }

  get count() {
    return this.geo.instanceCount;
  }

  nearest(p: THREE.Vector3) {
    let best = Infinity;
    for (const a of this.animals) if (a.alive) best = Math.min(best, Math.hypot(a.x - p.x, a.y - p.y, a.z - p.z));
    return best;
  }
}

/** Wild horses, mule deer, pronghorn, burros, coyotes and jackrabbits living around the player. */
export class Wildlife {
  readonly group = new THREE.Group();
  readonly material: THREE.ShaderMaterial;
  readonly shadowMaterial: THREE.ShaderMaterial;
  readonly pops: Population[];

  constructor(private hf: Heightfield) {
    this.material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: animalVertex,
      fragmentShader: animalFragment,
      uniforms: { ...G },
    });
    this.shadowMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: animalVertex,
      fragmentShader: animalFragment,
      uniforms: this.material.uniforms,
      defines: { SHADOW_PASS: '' },
    });
    this.pops = SPECIES.map((s) => new Population(s, this.material));
    for (const p of this.pops) this.group.add(p.mesh);
  }

  addShadowCasters(shadow: ShadowMap) {
    for (const p of this.pops) shadow.addCaster(p.geo, this.shadowMaterial);
  }

  update(dt: number, cam: THREE.Vector3, bird: THREE.Vector3) {
    dt = Math.min(dt, 0.1);
    for (const p of this.pops) p.update(dt, this.hf, cam, bird);
  }

  nearest(p: THREE.Vector3, id: string) {
    return this.pops.find((q) => q.def.id === id)?.nearest(p) ?? Infinity;
  }

  counts() {
    return Object.fromEntries(this.pops.map((p) => [p.def.id, p.count]));
  }
}
