import * as THREE from 'three';
import { G } from '../render/globals';
import { landmarkFragment, landmarkVertex } from '../render/shaders/landmarkShader';
import type { ShadowMap } from '../render/shadows';
import type { Heightfield } from './heightfield';
import type { OsmData } from './meta';
import type { Lot } from './props';
import { buildSignAtlas, type SignRect } from './signAtlas';
import { Frame, FX, type Mat, SignBuilder, SolidBuilder, UP } from './builders';

interface Site {
  x: number;
  z: number;
  radius: number;
}

/**
 * Tonopah, hand-built: the Mizpah, the Belvada, the Clown Motel, Tonopah
 * Station, the courthouse on its hill and the headframes of the mining park.
 * Signs glow after dark.
 */
export class Landmarks {
  readonly group = new THREE.Group();
  readonly lights: number[] = [];
  readonly sites: Site[] = [];
  /** Customer parking in front of and beside the businesses. */
  readonly lots: Lot[] = [];
  /** Little knots of people outside the doors on Main Street. */
  readonly spots: { x: number; z: number; r: number; n: number }[] = [];
  /** And out by Tonopah Station and the Central Nevada Museum. */
  readonly farSpots: { x: number; z: number; r: number; n: number }[] = [];
  private solidMat: THREE.ShaderMaterial;
  private signMat: THREE.ShaderMaterial;
  private shadowMat: THREE.ShaderMaterial;
  private solidGeo: THREE.BufferGeometry;
  private hwy: number[][] = [];
  private hf: Heightfield;
  private s = new SolidBuilder();
  private sg = new SignBuilder();
  private rects: Record<string, SignRect>;
  private seed = 0;

  constructor(osm: OsmData, hf: Heightfield) {
    this.hf = hf;
    const atlas = buildSignAtlas();
    this.rects = atlas.rects;
    for (const r of osm.roads) if (r.kind === 'trunk') this.hwy.push(r.pts);

    const poi = (name: string) => osm.pois.find((p) => p.name === name);
    const site = (name: string, fallback: [number, number]) => {
      const p = poi(name);
      return p ? [p.x, p.z] : fallback;
    };

    this.welcome(-1700, -1100, -1);
    this.welcome(1300, 1900, 1);

    this.solidMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: landmarkVertex,
      fragmentShader: landmarkFragment,
      uniforms: { ...G },
      side: THREE.DoubleSide,
    });
    this.signMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: landmarkVertex,
      fragmentShader: landmarkFragment,
      uniforms: { ...G, uMap: { value: atlas.texture } },
      defines: { USE_MAP: '' },
    });
    this.shadowMat = this.solidMat.clone();
    this.shadowMat.uniforms = this.solidMat.uniforms;
    this.shadowMat.defines = { SHADOW_PASS: '' };
    this.solidGeo = this.s.build();
    this.group.add(new THREE.Mesh(this.solidGeo, this.solidMat), new THREE.Mesh(this.sg.build(), this.signMat));
  }

  /** True where a hand-built landmark already stands (OSM buildings skip these lots). */
  occupies(x: number, z: number) {
    return this.sites.some((s) => Math.hypot(x - s.x, z - s.z) < s.radius);
  }

  addShadowCasters(shadow: ShadowMap) {
    shadow.addCaster(this.solidGeo, this.shadowMat);
  }

  // --- helpers ---------------------------------------------------------------------

  /** Nearest point on US-95 and the road's direction there. */
  private nearestHighway(x: number, z: number) {
    let best = { d: Infinity, px: x, pz: z, tx: 1, tz: 0 };
    for (const p of this.hwy) {
      for (let i = 0; i + 3 < p.length; i += 2) {
        const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
        const dx = bx - ax, dz = bz - az;
        const l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
        const px = ax + dx * t, pz = az + dz * t;
        const d = Math.hypot(x - px, z - pz);
        if (d < best.d) {
          const l = Math.sqrt(l2);
          best = { d, px, pz, tx: dx / l, tz: dz / l };
        }
      }
    }
    return best;
  }

  /** Frame at (x, z) facing the highway. */
  private frameFacing(x: number, z: number, radius: number) {
    const h = this.nearestHighway(x, z);
    let fx = h.px - x;
    let fz = h.pz - z;
    if (Math.hypot(fx, fz) < 1) { fx = -h.tz; fz = h.tx; }
    this.sites.push({ x, z, radius });
    return { fr: new Frame(x, this.hf.height(x, z), z, fx, fz), hwy: h };
  }

  private box(fr: Frame, x: number, y: number, z: number, w: number, h: number, d: number, color: string, mat: Mat = {}, yaw = 0) {
    const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
    this.s.add(g, fr.at(x, y, z, yaw), color, mat, this.seed);
  }

  private cyl(fr: Frame, x: number, y: number, z: number, r0: number, r1: number, h: number, color: string, mat: Mat = {}, sides = 10) {
    const g = new THREE.CylinderGeometry(r1, r0, h, sides).translate(0, h / 2, 0);
    this.s.add(g, fr.at(x, y, z), color, mat, this.seed);
  }

  /** Sign face on a wall: centre (x, y, z) in the frame, facing local yaw (0 = toward the road). */
  private sign(fr: Frame, name: string, x: number, y: number, z: number, h: number, glow = 1, fx: number = FX.NONE, yaw = 0, both = false) {
    const s = this.rects[name];
    this.sg.quad(fr.p(x, y, z), fr.dir(yaw), UP, h * s.aspect, h, s, glow, fx, this.seed, both);
  }

  /**
   * Highway pylon: poles beside the road carrying stacked double-sided panels
   * turned broadside to traffic. Returns the frame of the pylon.
   */
  private pylon(hwy: { px: number; pz: number; tx: number; tz: number }, side: THREE.Vector3, setback: number, poles: number, panels: { name: string; h: number; y: number; glow?: number; fx?: number; bare?: boolean }[], poleColor = '#5a5a5c') {
    const x = hwy.px + side.x * setback;
    const z = hwy.pz + side.z * setback;
    // Panel faces point along the road so both directions of traffic read them.
    const fr = new Frame(x, this.hf.height(x, z), z, hwy.tx, hwy.tz);
    const top = Math.max(...panels.map((p) => p.y + p.h / 2));
    const width = Math.max(...panels.map((p) => p.h * this.rects[p.name].aspect));
    const sp = poles > 1 ? width * 0.32 : 0;
    for (let i = 0; i < poles; i++) {
      const px = poles > 1 ? (i ? sp : -sp) : 0;
      this.cyl(fr, px, -1, 0, poles > 1 ? 0.3 : 0.45, poles > 1 ? 0.26 : 0.38, top + 0.4, poleColor, { rough: 0.5, fx: FX.METAL });
    }
    for (const p of panels) {
      const w = p.h * this.rects[p.name].aspect;
      if (!p.bare) this.box(fr, 0, p.y - p.h / 2 - 0.15, 0, w + 0.3, p.h + 0.3, 0.5, '#2a2a2c', { rough: 0.6 });
      this.sg.quad(fr.p(0, p.y, 0.25), fr.r, UP, w, p.h, this.rects[p.name], p.glow ?? 1, p.fx ?? FX.NONE, this.seed, false);
      this.sg.quad(fr.p(0, p.y, -0.25), fr.r.clone().negate(), UP, w, p.h, this.rects[p.name], p.glow ?? 1, p.fx ?? FX.NONE, this.seed + 0.5, false);
    }
    return fr;
  }

  /** Parking lot centred at local (cx, cz), stall rows along local x. */
  private spot(fr: Frame, x: number, z: number, r: number, n: number) {
    const c = fr.p(x, 0, z);
    this.spots.push({ x: c.x, z: c.z, r, n });
  }

  private lot(fr: Frame, cx: number, cz: number, w: number, d: number, fill = 0.6) {
    if (w < 6 || d < 6) return;
    const c = fr.p(cx, 0, cz);
    this.lots.push({ x: c.x, z: c.z, ang: Math.atan2(fr.r.z, fr.r.x), w, d, fill });
  }

  private light(p: THREE.Vector3, r: number, g: number, b: number, size: number, blink = 0) {
    this.lights.push(p.x, p.y, p.z, r, g, b, size, blink);
  }

  /** Tall parking-lot pole with a downlight. */
  private lotLight(fr: Frame, x: number, z: number, led = true) {
    this.cyl(fr, x, -1, z, 0.12, 0.09, 10, '#6a6a6a', { rough: 0.5, fx: FX.METAL }, 6);
    this.box(fr, x, 9.8, z, 0.8, 0.25, 0.5, '#3a3a3a');
    const p = fr.p(x, 9.7, z);
    if (led) this.light(p, 0.9, 0.93, 1, 1.4);
    else this.light(p, 1, 0.55, 0.18, 1.4);
  }

  /** Gas canopy: columns, fascia band from the atlas, glowing light panels underneath. */
  private canopy(fr: Frame, cx: number, cz: number, w: number, d: number, clear: number, band: string, fasciaColor: string) {
    const fh = 1.3;
    this.box(fr, cx, clear, cz, w, fh, d, fasciaColor, { rough: 0.5 });
    // Fascia band on all four sides.
    const bandH = fh * 0.92;
    const bandRect = this.rects[band];
    const mid = clear + fh / 2;
    this.sg.quad(fr.p(cx, mid, cz + d / 2), fr.r, UP, w, bandH, bandRect, 0.5, FX.NONE, this.seed);
    this.sg.quad(fr.p(cx, mid, cz - d / 2), fr.r.clone().negate(), UP, w, bandH, bandRect, 0.5, FX.NONE, this.seed);
    this.sg.quad(fr.p(cx + w / 2, mid, cz), fr.f.clone().negate(), UP, d, bandH, bandRect, 0.5, FX.NONE, this.seed);
    this.sg.quad(fr.p(cx - w / 2, mid, cz), fr.f, UP, d, bandH, bandRect, 0.5, FX.NONE, this.seed);
    // Recessed LED panels: the canopy blazes white at night.
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const px = cx + (i - 1) * w * 0.3;
        const pz = cz + (j - 0.5) * d * 0.45;
        this.box(fr, px, clear - 0.04, pz, w * 0.18, 0.04, d * 0.22, '#fff6e8', { glow: 1.6 });
        this.light(fr.p(px, clear - 0.1, pz), 1, 0.97, 0.92, 2.2);
      }
    }
    // Columns and pump islands.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = cx + sx * w * 0.3;
        const z = cz + sz * d * 0.22;
        this.box(fr, x, -1, z, 0.6, clear + 1, 0.6, '#e8e6e0', { rough: 0.5 });
        this.box(fr, x, -0.6, z, 1.2, 0.8, 4.4, '#cfcac0');
        this.box(fr, x, 0.2, z + 1.1, 0.8, 1.7, 0.5, '#d8d8dc', { rough: 0.4 });
        this.box(fr, x, 1.2, z + 1.1, 0.7, 0.5, 0.52, '#1a1a1e', { glow: 0.5 });
      }
    }
  }

  /** Lit storefront glazing strip on the front wall at local z. */
  private storefront(fr: Frame, cx: number, z: number, w: number, h: number, glow = 0.7) {
    this.box(fr, cx, 0.3, z, w, h, 0.12, '#3a2e22', { rough: 0.15, glow });
    // Mullions.
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 2.4) this.box(fr, cx + x, 0.3, z + 0.06, 0.12, h, 0.08, '#8a8a88', { fx: FX.METAL });
  }

  // --- landmarks --------------------------------------------------------------------

  /** The welcome sign beside US-95: a brown routed-wood board on log posts, on a rock mound. */
  private welcome(x: number, z: number, dir: number) {
    this.seed = 16;
    const h = this.nearestHighway(x, z);
    const side = new THREE.Vector3(-h.tz, 0, h.tx).multiplyScalar(dir);
    const px = h.px + side.x * 15;
    const pz = h.pz + side.z * 15;
    // Face oncoming traffic: southbound drivers see the north sign, and vice versa.
    const fr = new Frame(px, this.hf.height(px, pz), pz, -h.tx * dir, -h.tz * dir);
    const rock = new THREE.Shape([
      new THREE.Vector2(-2.9, 0), new THREE.Vector2(2.9, 0), new THREE.Vector2(3.15, 1.7), new THREE.Vector2(2.5, 3.3),
      new THREE.Vector2(-2.3, 3.55), new THREE.Vector2(-3.05, 2.5), new THREE.Vector2(-2.75, 0.9),
    ]);
    const slab = new THREE.ExtrudeGeometry(rock, { depth: 1.1, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 1 }).translate(0, 0, -0.55);
    this.s.add(slab, fr.at(0, 0.7, 0), '#c2a47c', { rough: 1, fx: FX.WASH, glow: 0.9 }, -16);
    this.sign(fr, 'welcome', 0, 2.42, 0.69, 2.9, 0.6);
    // Rubble mound the slab is bedded in.
    const stone = new THREE.DodecahedronGeometry(0.75, 0);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const r = (i % 2 ? 3.3 : 2.4) + Math.sin(i * 3.7) * 0.4;
      const m = fr.at(Math.cos(a) * r, i % 2 ? -0.1 : 0.35, Math.sin(a) * r * 0.5, i).multiply(new THREE.Matrix4().makeScale(1 + (i % 3) * 0.25, 0.75, 1));
      this.s.add(stone, m, ['#8a6e52', '#9a826a', '#7a6450'][i % 3], { rough: 1 }, this.seed);
    }
    const mound = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(3.6, 0.9, 1.8);
    this.s.add(mound, fr.at(0, -0.2, 0), '#8e765c', { rough: 1 }, this.seed);
    // The floodlight perched on top.
    this.box(fr, 0.6, 4.35, 0.2, 0.7, 0.45, 0.5, '#2a2a2a', { fx: FX.METAL });
    this.light(fr.p(0.6, 4.3, 0.8), 1, 0.85, 0.6, 1.2);
  }
}
