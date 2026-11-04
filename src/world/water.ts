import * as THREE from 'three';
import type { HeightGrid, WorldData } from './loader';
import type { Heightfield } from './heightfield';
import type { RoadIndex } from './roadIndex';

/** Main water level grid: covers the land-cover square at this resolution. */
const RES = 2048;
/** Detail grid over the town region, for the mill ponds and lagoons on the edge of town. */
const DETAIL = { cx: 200, cz: 300, size: 6000, res: 1024 };
const NO_WATER = -1000;

export type WaterKind = 'lake' | 'river' | 'pond';

export interface WaterHit {
  level: number;
  /** 0 .. 1: how surely this point is inside the lake or a pond. */
  mask: number;
  depth: number;
}

interface Pond {
  pts: number[];
  level: number;
  depth: number;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** One square water-level grid: surface height, coverage mask and water-body name per cell. */
class WaterGrid {
  readonly level: Float32Array;
  readonly mask: Float32Array;
  readonly names: Uint16Array;

  constructor(
    readonly cx: number,
    readonly cz: number,
    readonly size: number,
    readonly res: number,
  ) {
    this.level = new Float32Array(res * res).fill(NO_WATER);
    this.mask = new Float32Array(res * res);
    this.names = new Uint16Array(res * res);
  }

  get cell() {
    return this.size / this.res;
  }
  x(i: number) {
    return this.cx + ((i + 0.5) / this.res - 0.5) * this.size;
  }
  z(j: number) {
    return this.cz + ((j + 0.5) / this.res - 0.5) * this.size;
  }
  /** Continuous texel coordinate of a world x / z. */
  fi(x: number) {
    return ((x - this.cx) / this.size + 0.5) * this.res - 0.5;
  }
  fj(z: number) {
    return ((z - this.cz) / this.size + 0.5) * this.res - 0.5;
  }
  contains(x: number, z: number) {
    return Math.abs(x - this.cx) < this.size / 2 && Math.abs(z - this.cz) < this.size / 2;
  }

  /** Bilinear level and mask, clamped to the grid edge like the GPU. */
  sample(x: number, z: number): [number, number] {
    const R = this.res;
    const fx = Math.min(R - 1.001, Math.max(0, this.fi(x)));
    const fz = Math.min(R - 1.001, Math.max(0, this.fj(z)));
    const x0 = Math.floor(fx);
    const z0 = Math.floor(fz);
    const tx = fx - x0;
    const tz = fz - z0;
    const i = z0 * R + x0;
    const bl = (a: Float32Array) => {
      const u = a[i] + (a[i + 1] - a[i]) * tx;
      const v = a[i + R] + (a[i + R + 1] - a[i + R]) * tx;
      return u + (v - u) * tz;
    };
    return [bl(this.level), bl(this.mask)];
  }

  nameAt(x: number, z: number): number {
    const R = this.res;
    const i = Math.min(R - 1, Math.max(0, Math.round(this.fi(x))));
    const j = Math.min(R - 1, Math.max(0, Math.round(this.fj(z))));
    return this.names[j * R + i];
  }

  /**
   * Spreads each water level a few cells beyond its shore so the surface mesh,
   * which is sampled per vertex, never dips toward "no water".
   */
  dilate(passes: number) {
    const L = this.level;
    const R = this.res;
    for (let p = 0; p < passes; p++) {
      const next = L.slice();
      for (let j = 1; j < R - 1; j++) {
        for (let i = 1; i < R - 1; i++) {
          const k = j * R + i;
          if (L[k] > NO_WATER) continue;
          let sum = 0, n = 0;
          const a = L[k - 1], b = L[k + 1], c = L[k - R], d = L[k + R];
          if (a > NO_WATER) (sum += a), n++;
          if (b > NO_WATER) (sum += b), n++;
          if (c > NO_WATER) (sum += c), n++;
          if (d > NO_WATER) (sum += d), n++;
          if (n) next[k] = sum / n;
        }
      }
      L.set(next);
    }
  }
}

/**
 * Tonopah's water: no lake, no river, only the stock tanks, mill ponds and the
 * sewage lagoons east of town. The washes are dry. Carves a bed below each pond
 * and bakes the water-level atlas the water and underwater shaders share: the
 * main grid on top, the town detail grid below it.
 */
export class Water {
  readonly size: number;
  readonly texture: THREE.DataTexture;
  /** Detail grid centre x, z and size, for the shaders. */
  readonly detail = new THREE.Vector3(DETAIL.cx, DETAIL.cz, DETAIL.size);
  /** Atlas layout: main grid's share of the height, detail grid's share of width and height, detail res. */
  readonly atlas: THREE.Vector4;
  /** No lake out here: kept for the shaders and cameras that ask. */
  readonly lakeLevel = NO_WATER;
  private main: WaterGrid;
  private det: WaterGrid;
  private nameList: { name: string; kind: WaterKind }[] = [{ name: '', kind: 'pond' }];

  constructor(world: WorldData, private hf: Heightfield, roads: RoadIndex) {
    this.size = world.meta.landcover.size;
    this.main = new WaterGrid(0, 0, this.size, RES);
    this.det = new WaterGrid(DETAIL.cx, DETAIL.cz, DETAIL.size, DETAIL.res);

    const nearRoad = (x: number, z: number) => {
      const r = roads.nearest(x, z, 20);
      return !!r && r.dist < r.halfWidth + 5;
    };
    for (const p of this.planPonds(world)) {
      this.carvePond(world.heights.inner, p, nearRoad);
      this.carvePond(world.heights.town, p, nearRoad);
      this.paintPond(this.main, p);
      this.paintPond(this.det, p);
    }
    this.main.dilate(8);
    this.det.dilate(10);

    const H = RES + DETAIL.res;
    this.atlas = new THREE.Vector4(RES / H, DETAIL.res / RES, DETAIL.res / H, DETAIL.res);
    const data = new Uint16Array(RES * H * 2).fill(THREE.DataUtils.toHalfFloat(NO_WATER));
    const put = (g: WaterGrid, row0: number) => {
      for (let j = 0; j < g.res; j++) {
        for (let i = 0; i < g.res; i++) {
          const k = j * g.res + i;
          const o = ((row0 + j) * RES + i) * 2;
          data[o] = THREE.DataUtils.toHalfFloat(g.level[k]);
          data[o + 1] = THREE.DataUtils.toHalfFloat(g.mask[k]);
        }
      }
    };
    put(this.main, 0);
    put(this.det, RES);
    this.texture = new THREE.DataTexture(data, RES, H, THREE.RGFormat, THREE.HalfFloatType);
    this.texture.minFilter = this.texture.magFilter = THREE.LinearFilter;
    this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.needsUpdate = true;
  }

  /** The finest grid covering (x, z). */
  private gridAt(x: number, z: number): WaterGrid | null {
    if (this.det.contains(x, z)) return this.det;
    return this.main.contains(x, z) ? this.main : null;
  }

  /** Water surface, mask and depth at (x, z); bilinear like the GPU. */
  sample(x: number, z: number): WaterHit {
    const g = this.gridAt(x, z);
    if (!g) return { level: NO_WATER, mask: 0, depth: 0 };
    const [level, mask] = g.sample(x, z);
    if (mask < 0.01) return { level: NO_WATER, mask: 0, depth: 0 };
    return { level, mask, depth: Math.max(0, level - this.hf.height(x, z)) };
  }

  /** Depth of water over the ground at (x, z), 0 on dry land. */
  depthAt(x: number, z: number): number {
    return this.sample(x, z).depth;
  }

  /** Name and kind of the water body at (x, z), if any. */
  bodyAt(x: number, z: number): { name: string; kind: WaterKind } | null {
    const g = this.gridAt(x, z);
    const k = g ? g.nameAt(x, z) : 0;
    return k ? this.nameList[k] : null;
  }

  private nameId(name: string, kind: WaterKind) {
    let k = this.nameList.findIndex((n) => n.name === name && n.kind === kind);
    if (k < 0) {
      k = this.nameList.length;
      this.nameList.push({ name, kind });
    }
    return k;
  }

  /** Stock tanks and the sewage lagoons east of town; big unnamed polygons are dry playas. */
  private planPonds(world: WorldData): Pond[] {
    const out: Pond[] = [];
    const half = world.meta.regions.inner.size * 0.47;
    for (const a of world.osm.waterAreas) {
      const p = a.pts;
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (let i = 0; i < p.length; i += 2) {
        minX = Math.min(minX, p[i]);
        maxX = Math.max(maxX, p[i]);
        minZ = Math.min(minZ, p[i + 1]);
        maxZ = Math.max(maxZ, p[i + 1]);
      }
      const ext = Math.max(maxX - minX, maxZ - minZ);
      if (ext > 200 || ext < 8 || Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minZ), Math.abs(maxZ)) > half) continue;
      const hs: number[] = [];
      for (let i = 0; i < p.length; i += 2) hs.push(this.hf.height(p[i], p[i + 1]));
      hs.sort((x, y) => x - y);
      out.push({ pts: p, level: hs[Math.floor(hs.length * 0.2)] - 0.3, depth: Math.min(3, 1 + ext * 0.01), name: a.name, minX, maxX, minZ, maxZ });
    }
    return out;
  }

  private pondDist(p: { pts: number[] }, x: number, z: number): number {
    const a = p.pts;
    let inside = false;
    let best = Infinity;
    for (let i = 0, j = a.length - 2; i < a.length; j = i, i += 2) {
      const xi = a[i], zi = a[i + 1], xj = a[j], zj = a[j + 1];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
      const ex = xj - xi, ez = zj - zi;
      const t = Math.max(0, Math.min(1, ((x - xi) * ex + (z - zi) * ez) / (ex * ex + ez * ez || 1)));
      best = Math.min(best, Math.hypot(x - xi - ex * t, z - zi - ez * t));
    }
    return inside ? best : -best;
  }

  private carvePond(g: HeightGrid, p: Pond, nearRoad: (x: number, z: number) => boolean) {
    const cell = g.size / g.res;
    const bank = cell * 1.5;
    const toI = (v: number, c: number) => ((v - c) / g.size + 0.5) * g.res - 0.5;
    const i0 = Math.max(0, Math.floor(toI(p.minX - bank, g.cx)));
    const i1 = Math.min(g.res - 1, Math.ceil(toI(p.maxX + bank, g.cx)));
    const j0 = Math.max(0, Math.floor(toI(p.minZ - bank, g.cz)));
    const j1 = Math.min(g.res - 1, Math.ceil(toI(p.maxZ + bank, g.cz)));
    for (let j = j0; j <= j1; j++) {
      const z = g.cz + ((j + 0.5) / g.res - 0.5) * g.size;
      for (let i = i0; i <= i1; i++) {
        const x = g.cx + ((i + 0.5) / g.res - 0.5) * g.size;
        const d = this.pondDist(p, x, z);
        if (d < -bank) continue;
        const target = d > 0 ? p.level - Math.min(p.depth, 0.3 + d * 0.12) : p.level + (-d / bank) * 1.0;
        const k = j * g.res + i;
        if (target < g.heights[k] && !nearRoad(x, z)) g.heights[k] = target;
      }
    }
  }

  private paintPond(g: WaterGrid, p: Pond) {
    const R = g.res;
    const cell = g.cell;
    const i0 = Math.max(0, Math.floor(g.fi(p.minX - cell * 2)));
    const i1 = Math.min(R - 1, Math.ceil(g.fi(p.maxX + cell * 2)));
    const j0 = Math.max(0, Math.floor(g.fj(p.minZ - cell * 2)));
    const j1 = Math.min(R - 1, Math.ceil(g.fj(p.maxZ + cell * 2)));
    if (i0 > i1 || j0 > j1) return;
    const id = this.nameId(p.name, 'pond');
    for (let j = j0; j <= j1; j++) {
      const z = g.z(j);
      for (let i = i0; i <= i1; i++) {
        const x = g.x(i);
        if (this.pondDist(p, x, z) < -cell * 1.5) continue;
        const k = j * R + i;
        if (g.mask[k] === 0 || p.level < g.level[k]) {
          g.level[k] = p.level;
          g.names[k] = id;
        }
        g.mask[k] = 1;
      }
    }
  }
}
