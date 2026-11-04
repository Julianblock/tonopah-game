import * as THREE from 'three';
import { Frame, FX, type Mat, SignBuilder, SolidBuilder, UP } from './builders';
import type { Heightfield } from './heightfield';
import type { Lot } from './props';
import type { SignRect } from './signAtlas';

/** An opening in a wall: centre x along the wall, sill height y, width and height. */
export interface Hole {
  x: number;
  y: number;
  w: number;
  h: number;
  glass?: boolean;
  /** Exterior trim colour around the opening. */
  trim?: string;
  /** Arched head (brick segmental arch) of this rise above the opening. */
  arch?: number;
}

export interface Site {
  x: number;
  z: number;
  radius: number;
}

/** Interior surfaces default to a soft fill so rooms never go pitch black between lamps. */
export const FILL = 0.5;

/**
 * Shared toolkit for the hand-built landmarks: solids, sign faces, window glass,
 * walls with real openings you can fly through, interior skins lit by room lamps.
 * All coordinates are in a landmark Frame: x along the frontage, z out toward the
 * street, y up from the ground at the frame origin.
 */
export class Kit {
  readonly s = new SolidBuilder();
  readonly glass = new SolidBuilder();
  readonly sg = new SignBuilder();
  /** Exterior light points: x, y, z, r, g, b, size, blink. */
  readonly lights: number[] = [];
  /** Room lamps: x, y, z, reach, r, g, b, power. */
  readonly lamps: number[] = [];
  readonly sites: Site[] = [];
  /** Exact footprints (frame-local rectangles) that nothing else may grow into. */
  readonly blocks: { fr: Frame; x0: number; x1: number; z0: number; z1: number }[] = [];
  readonly lots: Lot[] = [];
  readonly spots: { x: number; z: number; r: number; n: number }[] = [];
  readonly farSpots: { x: number; z: number; r: number; n: number }[] = [];
  seed = 0;
  /** Ambient fill for the interior being built; lower it for rooms meant to be dark. */
  fill = FILL;
  private c = new THREE.Color();

  constructor(
    readonly hf: Heightfield,
    readonly rects: Record<string, SignRect>,
    private hwy: number[][],
  ) {}

  // --- frames ----------------------------------------------------------------------

  /** Frame at (x, z) on the ground facing (fx, fz); reserves the lot when radius > 0. */
  frame(x: number, z: number, fx: number, fz: number, radius = 0, y = this.hf.height(x, z)) {
    if (radius > 0) this.sites.push({ x, z, radius });
    return new Frame(x, y, z, fx, fz);
  }

  /**
   * Frame on an OSM footprint (centre, long-axis angle) with its origin at the
   * middle of one long or short face. `face` picks the side: 0 +long-normal,
   * 1 -long-normal, 2 +long-axis end, 3 -long-axis end.
   */
  footprint(cx: number, cz: number, w: number, d: number, ang: number, face: 0 | 1 | 2 | 3, radius = Math.hypot(w, d) * 0.55, y?: number) {
    const ax = Math.cos(ang), az = Math.sin(ang);
    const nx = -az, nz = ax;
    const [fx, fz, off] = face === 0 ? [nx, nz, d / 2] : face === 1 ? [-nx, -nz, d / 2] : face === 2 ? [ax, az, w / 2] : [-ax, -az, w / 2];
    this.sites.push({ x: cx, z: cz, radius });
    const ox = cx + fx * off, oz = cz + fz * off;
    return new Frame(ox, y ?? this.hf.height(ox, oz), oz, fx, fz);
  }

  /** Reserves a frame-local rectangle: trees and props stay out of it. */
  block(fr: Frame, x0: number, x1: number, z0: number, z1: number) {
    this.blocks.push({ fr, x0, x1, z0, z1 });
  }

  /** Nearest point on the highway and the road's direction there. */
  nearestHighway(x: number, z: number) {
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

  /** Lowest and highest ground under a footprint relative to the frame origin, for floors on slopes. */
  footRange(fr: Frame, x0: number, x1: number, z0: number, z1: number): [number, number] {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 6; j++) {
        const p = fr.p(x0 + ((x1 - x0) * i) / 6, 0, z0 + ((z1 - z0) * j) / 6);
        const h = this.hf.height(p.x, p.z) - fr.o.y;
        lo = Math.min(lo, h);
        hi = Math.max(hi, h);
      }
    }
    return [lo, hi];
  }

  // --- solids ----------------------------------------------------------------------

  geo(fr: Frame, g: THREE.BufferGeometry, x: number, y: number, z: number, color: string, mat: Mat = {}, yaw = 0) {
    this.s.add(g, fr.at(x, y, z, yaw), color, mat, this.seed);
  }

  /** Box standing on (x, y, z): y is its bottom. */
  box(fr: Frame, x: number, y: number, z: number, w: number, h: number, d: number, color: string, mat: Mat = {}, yaw = 0) {
    this.geo(fr, new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), x, y, z, color, mat, yaw);
  }

  cyl(fr: Frame, x: number, y: number, z: number, r0: number, r1: number, h: number, color: string, mat: Mat = {}, sides = 10) {
    this.geo(fr, new THREE.CylinderGeometry(r1, r0, h, sides).translate(0, h / 2, 0), x, y, z, color, mat);
  }

  sphere(fr: Frame, x: number, y: number, z: number, r: number, color: string, mat: Mat = {}, seg = 8) {
    this.geo(fr, new THREE.SphereGeometry(r, seg, Math.max(3, seg >> 1)), x, y, z, color, mat);
  }

  /** Strut between two local points. */
  beam(fr: Frame, a: THREE.Vector3, b: THREE.Vector3, size: number, color: string, mat: Mat = {}) {
    const d = b.clone().sub(a);
    const len = d.length();
    const g = new THREE.BoxGeometry(size, len, size).translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d.normalize());
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    this.s.add(g, fr.basis.clone().multiply(m), color, mat, this.seed);
  }

  /** Interior surface material: lit by the room lamps. */
  in(rough = 0.8, fill = this.fill): Mat {
    return { rough, glow: fill, fx: FX.INTERIOR };
  }

  /** Self-lit interior surface (lamp shades, screens, neon) at this brightness. */
  lit(power = 3): Mat {
    return { rough: 0.5, glow: Math.max(1.6, power), fx: FX.INTERIOR };
  }

  /** Interior box shorthand. */
  ibox(fr: Frame, x: number, y: number, z: number, w: number, h: number, d: number, color: string, rough = 0.8, yaw = 0) {
    this.box(fr, x, y, z, w, h, d, color, this.in(rough), yaw);
  }

  /** Flat pane of window glass centred at (x, y, z), facing local +z turned by yaw. */
  pane(fr: Frame, x: number, y: number, z: number, w: number, h: number, yaw = 0, tint = '#8aa0a8') {
    this.glass.add(new THREE.PlaneGeometry(w, h), fr.at(x, y, z, yaw), tint, {}, this.seed);
  }

  sign(fr: Frame, name: string, x: number, y: number, z: number, h: number, glow = 1, fx: number = FX.NONE, yaw = 0, both = false) {
    const s = this.rects[name];
    this.sg.quad(fr.p(x, y, z), fr.dir(yaw), UP, h * s.aspect, h, s, glow, fx, this.seed, both);
  }

  /** Width of a sign of height h. */
  signW(name: string, h: number) {
    return h * this.rects[name].aspect;
  }

  light(p: THREE.Vector3, r: number, g: number, b: number, size: number, blink = 0) {
    this.lights.push(p.x, p.y, p.z, r, g, b, size, blink);
  }

  /** A room lamp at local (x, y, z): warm incandescent unless a colour is given. */
  lamp(fr: Frame, x: number, y: number, z: number, reach = 7, power = 1, color = '#ffc98a') {
    const p = fr.p(x, y, z);
    this.c.set(color);
    this.lamps.push(p.x, p.y, p.z, reach, this.c.r, this.c.g, this.c.b, power);
  }

  spot(fr: Frame, x: number, z: number, r: number, n: number, far = false) {
    const c = fr.p(x, 0, z);
    (far ? this.farSpots : this.spots).push({ x: c.x, z: c.z, r, n });
  }

  lot(fr: Frame, cx: number, cz: number, w: number, d: number, fill = 0.6) {
    if (w < 6 || d < 6) return;
    const c = fr.p(cx, 0, cz);
    this.lots.push({ x: c.x, z: c.z, ang: Math.atan2(fr.r.z, fr.r.x), w, d, fill });
  }

  // --- architecture ----------------------------------------------------------------

  /**
   * Wall along local x from x0 to x1, outer face at depth z (facing +z), from y0
   * up to y1, thickness t, with openings cut right through. The outer half takes
   * the exterior colour; the inner half, when given, is an interior skin lit by
   * the room lamps. Glazed openings get a pane in the middle of the wall.
   */
  wall(fr: Frame, x0: number, x1: number, z: number, y0: number, y1: number, t: number, outer: string, inner: string | null, holes: Hole[] = [], mat: Mat = {}) {
    const cuts = new Set<number>([x0, x1]);
    for (const h of holes) {
      cuts.add(Math.max(x0, Math.min(x1, h.x - h.w / 2)));
      cuts.add(Math.max(x0, Math.min(x1, h.x + h.w / 2)));
    }
    const xs = [...cuts].sort((a, b) => a - b);
    const skin = (a: number, b: number, ya: number, yb: number) => {
      if (b - a < 0.005 || yb - ya < 0.005) return;
      if (inner) {
        this.box(fr, (a + b) / 2, ya, z - t / 4, b - a, yb - ya, t / 2, outer, mat);
        this.box(fr, (a + b) / 2, ya, z - (t * 3) / 4, b - a, yb - ya, t / 2, inner, this.in());
      } else {
        this.box(fr, (a + b) / 2, ya, z - t / 2, b - a, yb - ya, t, outer, mat);
      }
    };
    for (let i = 0; i + 1 < xs.length; i++) {
      const a = xs[i], b = xs[i + 1];
      const mid = (a + b) / 2;
      const col = holes.filter((h) => h.x - h.w / 2 <= mid && h.x + h.w / 2 >= mid).sort((p, q) => p.y - q.y);
      let y = y0;
      for (const h of col) {
        skin(a, b, y, Math.max(y, h.y));
        y = Math.max(y, h.y + h.h);
      }
      skin(a, b, y, y1);
    }
    for (const h of holes) {
      // Jamb returns line the opening so the wall reads thick from any angle.
      const jx = [h.x - h.w / 2, h.x + h.w / 2];
      const tc = h.trim ?? outer;
      for (const x of jx) this.box(fr, x, h.y, z - t / 2, 0.02, h.h, t, tc, mat);
      if (h.y > y0 + 0.01) this.box(fr, h.x, h.y - 0.02, z - t / 2, h.w, 0.02, t, tc, mat);
      this.box(fr, h.x, h.y + h.h, z - t / 2, h.w, 0.02, t, tc, mat);
      if (h.trim) {
        // Projecting sill and lintel.
        if (h.y > y0 + 0.3) this.box(fr, h.x, h.y - 0.12, z + 0.04, h.w + 0.3, 0.12, 0.16, h.trim, mat);
        if (h.arch) this.arch(fr, h.x, h.y + h.h, z + 0.02, h.w + 0.24, h.arch, h.trim, mat);
        else this.box(fr, h.x, h.y + h.h, z + 0.03, h.w + 0.24, 0.22, 0.12, h.trim, mat);
      }
      if (h.glass) this.pane(fr, h.x, h.y + h.h / 2, z - t / 2, h.w, h.h);
    }
  }

  /** Segmental brick arch over an opening: voussoir blocks fanned across the head. */
  arch(fr: Frame, cx: number, y: number, z: number, w: number, rise: number, color: string, mat: Mat = {}) {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n - 0.5;
      const yy = y + rise * (1 - 4 * u * u) * 0.6;
      this.box(fr, cx + u * w, yy, z, w / n + 0.02, 0.24, 0.12, color, mat, 0);
    }
  }

  /** Child frame on a side wall: local x runs along the wall, +z points outward. */
  side(fr: Frame, x: number, zMid: number, outward: 1 | -1) {
    return fr.sub(x, 0, zMid, (outward * Math.PI) / 2);
  }

  /** Floor (or ceiling) slab with an interior top and underside. */
  slab(fr: Frame, x: number, y: number, z: number, w: number, d: number, top: string, under: string | null = null, t = 0.3) {
    this.box(fr, x, y - t, z, w, t - 0.02, d, under ?? top, this.in(0.9));
    this.box(fr, x, y - 0.02, z, w, 0.02, d, top, this.in(0.6));
  }

  /** Straight flight of stairs climbing along local -z from (x, y, z). */
  stairs(fr: Frame, x: number, y: number, z: number, w: number, rise: number, steps: number, tread: string, riser: string, run = 0.28, yaw = 0, rail?: string) {
    const sf = fr.sub(x, y, z, yaw);
    const h = rise / steps;
    for (let i = 0; i < steps; i++) {
      this.box(sf, 0, i * h, -i * run - run / 2, w, h, run, riser, this.in(0.8));
      this.box(sf, 0, (i + 1) * h - 0.03, -i * run - run / 2 + 0.02, w + 0.04, 0.035, run + 0.04, tread, this.in(0.5));
    }
    if (rail) {
      const len = Math.hypot(steps * run, rise);
      const ang = Math.atan2(rise, steps * run);
      for (const sx of [-w / 2, w / 2]) {
        const g = new THREE.BoxGeometry(0.07, 0.07, len).translate(0, 0, -len / 2);
        this.s.add(g, sf.at(sx, 0.95, 0).multiply(new THREE.Matrix4().makeRotationX(ang)), rail, this.in(0.4), this.seed);
        for (let i = 0; i < steps; i += 2) this.box(sf, sx, (i + 1) * h, -i * run - run / 2, 0.035, 0.92, 0.035, rail, this.in(0.4));
      }
    }
  }

  /** Lit storefront glazing strip with mullions, for exterior shopfronts. */
  storefront(fr: Frame, cx: number, z: number, w: number, h: number, glow = 0.7) {
    this.box(fr, cx, 0.3, z, w, h, 0.12, '#3a2e22', { rough: 0.15, glow });
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 2.4) this.box(fr, cx + x, 0.3, z + 0.06, 0.12, h, 0.08, '#8a8a88', { fx: FX.METAL });
  }

  /** Tall parking-lot pole with a downlight. */
  lotLight(fr: Frame, x: number, z: number, led = true) {
    this.cyl(fr, x, -1, z, 0.12, 0.09, 10, '#6a6a6a', { rough: 0.5, fx: FX.METAL }, 6);
    this.box(fr, x, 9.8, z, 0.8, 0.25, 0.5, '#3a3a3a');
    const p = fr.p(x, 9.7, z);
    if (led) this.light(p, 0.9, 0.93, 1, 1.4);
    else this.light(p, 1, 0.55, 0.18, 1.4);
  }
}
