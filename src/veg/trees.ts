import * as THREE from 'three';
import { G } from '../render/globals';
import type { ShadowMap } from '../render/shadows';
import type { Heightfield } from '../world/heightfield';
import type { RoadIndex } from '../world/roadIndex';
import { LC } from '../world/meta';
import { buildPlant, ROSETTE_FORMS, type PlantForm } from './treeGeometry';
import { SPECIES_COUNT, treeFragment, treeVertex } from './treeShader';
import { lowPower } from '../ui/device';

export const TREE = {
  SAGEBRUSH: 0,
  SHADSCALE: 1,
  RABBITBRUSH: 2,
  WILLOW: 3,
  PINYON: 4,
  TAMARISK: 5,
  TOWN: 6,
  COTTONWOOD: 7,
  JUNIPER: 8,
  EPHEDRA: 9,
  POPLAR: 10,
  CHOLLA: 11,
} as const;

export interface PlantedTree {
  x: number;
  z: number;
  r: number;
  h: number;
  sp: number;
}

const TILE = 250;
const LOD0 = lowPower ? 110 : 170;
const LOD1 = lowPower ? 1100 : 1900;
const LOD2 = lowPower ? 4000 : 6500;
const CAP = lowPower ? [6000, 30000, 40000] : [14000, 70000, 90000];
/** Beyond the imagery zone, tiles are grown procedurally within this range. */
const OUTER_R = lowPower ? 1600 : 2600;
const OUTER_DROP = lowPower ? 2400 : 3600;
const LC_HALF = 25000;

/** Geometry form per species, and how many distinct variants of it exist. */
const FORM: PlantForm[] = ['creosote', 'round', 'creosote', 'tree', 'cone', 'feathery', 'tree', 'tree', 'cone', 'yucca', 'tree', 'cholla'];
const VARIANTS: Record<PlantForm, number> = { creosote: 3, round: 1, tree: 2, cone: 2, feathery: 1, joshua: 1, yucca: 1, palm: 1, cholla: 1 };
/** Share of the instance budget per form. */
const BUDGET: Record<PlantForm, number> = { creosote: 1.6, round: 0.6, tree: 0.15, cone: 0.7, feathery: 0.05, joshua: 0.01, yucca: 0.2, palm: 0.01, cholla: 0.05 };
/** Small plants vanish into the ground texture past this range. */
const MAX_DIST: number[] = [1100, 900, 1000, LOD2, LOD2, LOD2, LOD2, LOD2, LOD2, 900, LOD2, 700];

// Month keyframes (Jan..Dec) for leaf amount per species.
const LEAF_KF: number[][] = [
  [0.9, 0.9, 1, 1, 1, 1, 0.95, 0.92, 0.95, 1, 0.95, 0.9], // big sagebrush (evergreen, sheds in drought)
  [0.6, 0.7, 0.95, 1, 1, 0.85, 0.75, 0.75, 0.75, 0.7, 0.65, 0.6], // shadscale / bud sage
  [0.5, 0.5, 0.7, 0.9, 1, 1, 1, 1, 1, 0.9, 0.7, 0.55], // rubber rabbitbrush
  [0.0, 0.0, 0.2, 0.75, 1, 1, 1, 1, 1, 0.75, 0.3, 0.02], // coyote willow at the springs
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // singleleaf pinyon
  [0.3, 0.3, 0.7, 1, 1, 1, 1, 1, 1, 0.9, 0.55, 0.35], // tamarisk
  [0.0, 0.0, 0.35, 0.9, 1, 1, 1, 1, 1, 0.85, 0.3, 0.0], // town trees (Siberian elm, black locust)
  [0.0, 0.0, 0.5, 1, 1, 1, 1, 1, 1, 0.9, 0.45, 0.02], // Fremont cottonwood
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Utah juniper
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Mormon tea
  [0.0, 0.0, 0.3, 0.9, 1, 1, 1, 1, 1, 0.8, 0.25, 0.0], // Lombardy poplar
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // plains pricklypear
];

// Leaf colour keyframes: [winter, spring, summer, fall] (sRGB hex).
const LEAF_COL: string[][] = [
  ['#7a7e68', '#7e8668', '#868a70', '#7e826a'],
  ['#8e8a74', '#888c6a', '#9a9278', '#8a8470'],
  ['#7a8058', '#788a52', '#7e8a56', '#808250'],
  ['#5c5a48', '#6a7a40', '#5c6a3a', '#b0943e'],
  ['#3a4630', '#3e4c32', '#3c4830', '#3c4830'],
  ['#6a6050', '#6a7a5a', '#64705a', '#8a7a5a'],
  ['#5c5a48', '#647a3c', '#56683a', '#b89a3a'],
  ['#706a5e', '#8aa84b', '#5f7a38', '#c99c34'],
  ['#47543e', '#4a5a40', '#48563e', '#47543e'],
  ['#6e7a44', '#7a8a46', '#74823f', '#707a42'],
  ['#5c5a48', '#6e8a40', '#5c7638', '#d4b240'],
  ['#6a7a48', '#72844a', '#6e7e46', '#6c7a46'],
];
const BARK = ['#6a6052', '#7a7062', '#6a6050', '#5e5048', '#4a4038', '#5a4a40', '#4c443c', '#8a8274', '#6e5a48', '#5a5048', '#7a7468', '#3a3428'];
const THATCH = ['#6a6258', '#7a7062', '#5a4c40', '#5e5048', '#4a4038', '#5a4a40', '#4c443c', '#8a8274', '#6e6558', '#857660', '#a08a62', '#d8cca8'];

/** Bloom colour, the month (0 = Jan 1) it peaks, and how long it lasts (months). */
const BLOOM: Partial<Record<number, { col: string; peak: number; width: number }>> = {
  // Rabbitbrush turns the valleys gold in September; sagebrush flowers dull yellow after it.
  [TREE.RABBITBRUSH]: { col: '#e8c02a', peak: 8.6, width: 1.0 },
  [TREE.SAGEBRUSH]: { col: '#b8a858', peak: 9.4, width: 0.8 },
  [TREE.TAMARISK]: { col: '#d8a0b0', peak: 4.6, width: 1.0 },
  [TREE.CHOLLA]: { col: '#e8c860', peak: 5.2, width: 0.5 },
};

function kf(keys: number[], m: number) {
  const i0 = ((Math.floor(m) % 12) + 12) % 12;
  const i1 = (i0 + 1) % 12;
  const t = m - Math.floor(m);
  return keys[i0] + (keys[i1] - keys[i0]) * t;
}

/** Same as the GLSL hash12. */
export function hash12(x: number, y: number) {
  const f = (v: number) => v - Math.floor(v);
  let a = f(x * 0.1031), b = f(y * 0.1031), c = f(x * 0.1031);
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d;
  b += d;
  c += d;
  return f((a + b) * c);
}

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

interface Tile {
  data: Float32Array; // 8 floats per plant: x y z rot r h species seed
  count: number;
  cx: number;
  cz: number;
  minY: number;
  maxY: number;
}

interface Kind {
  geo: THREE.InstancedBufferGeometry;
  a0: THREE.InstancedBufferAttribute;
  a1: THREE.InstancedBufferAttribute;
  cap: number;
  n: number;
}

/**
 * Plant size for a species: crown radius and height (m). Rosette plants are
 * modelled in height units, so their radius equals their height.
 */
function sizeFor(sp: number, s: number, s2: number): [number, number] {
  switch (sp) {
    case TREE.SAGEBRUSH:
      return [0.45 + s * 0.55, 0.5 + s2 * 0.9];
    case TREE.SHADSCALE:
      return [0.3 + s * 0.35, 0.3 + s2 * 0.4];
    case TREE.RABBITBRUSH:
      return [0.5 + s * 0.5, 0.6 + s2 * 0.9];
    case TREE.WILLOW:
      return [2.0 + s * 1.3, 3 + s2 * 2.5];
    case TREE.PINYON:
      return [1.6 + s * 1.6, 3.5 + s2 * 4.5];
    case TREE.TAMARISK:
      return [2.5 + s * 1.5, 3.5 + s2 * 2.5];
    case TREE.TOWN:
      return [2.5 + s * 2, 5 + s2 * 4];
    case TREE.COTTONWOOD:
      return [4 + s * 3, 12 + s2 * 6];
    case TREE.JUNIPER:
      // Shaggy, many-stemmed Utah junipers: broader and lower than the pinyons.
      return [1.4 + s * 1.6, 2.2 + s2 * 3.3];
    case TREE.EPHEDRA: {
      const h = 0.5 + s * 0.6;
      return [h, h];
    }
    case TREE.POPLAR:
      // Lombardy poplars planted as windbreaks in the old yards.
      return [1.4 + s * 0.8, 11 + s2 * 7];
    default: {
      const h = 0.25 + s * 0.3;
      return [h, h];
    }
  }
}

/**
 * Species for a plant seen in the imagery, from the land-cover band it stands
 * in (shadscale flats, the sagebrush belt, black sage hills, pinyon-juniper
 * crests, washes, springs and town) and how dark its blob is.
 */
function speciesFor(lc: number, dark: number, s: number): number {
  const big = 0.6 + dark * 1.5;
  switch (lc) {
    case LC.WETLAND:
      return s < 0.55 ? TREE.WILLOW : s < 0.75 ? TREE.TAMARISK : TREE.RABBITBRUSH;
    case LC.WASH:
      if (dark > 0.3 && s < 0.1) return TREE.WILLOW;
      return s < 0.5 ? TREE.RABBITBRUSH : s < 0.85 ? TREE.SAGEBRUSH : TREE.SHADSCALE;
    case LC.URBAN_OPEN:
      // "Developed open" is mostly mine dumps, the US-95 corridor and dirt lots: still desert.
      return s < 0.35 ? TREE.RABBITBRUSH : s < 0.8 ? TREE.SAGEBRUSH : TREE.SHADSCALE;
    case LC.URBAN_LOW:
    case LC.URBAN_MED:
    case LC.URBAN_HIGH:
      // Tonopah yards: Siberian elms and locusts, the odd poplar windbreak, rabbitbrush in the lots.
      if (s < 0.2) return TREE.TOWN;
      if (s < 0.26) return TREE.POPLAR;
      if (s < 0.3) return TREE.JUNIPER;
      if (s < 0.65) return TREE.RABBITBRUSH;
      return TREE.SAGEBRUSH;
    case LC.FARM:
      return s < 0.6 ? TREE.TOWN : TREE.COTTONWOOD;
    case LC.PINYON:
      if (s < 0.5 * big) return TREE.PINYON;
      if (s < 0.8 * big) return TREE.JUNIPER;
      return s < 0.9 ? TREE.SAGEBRUSH : TREE.EPHEDRA;
    case LC.SAGEBRUSH:
      if (s < 0.04 * big) return TREE.JUNIPER;
      if (s < 0.2) return TREE.RABBITBRUSH;
      if (s < 0.24) return TREE.EPHEDRA;
      return s < 0.9 ? TREE.SAGEBRUSH : TREE.SHADSCALE;
    case LC.BLACKSAGE:
      if (s < 0.14 * big) return TREE.JUNIPER;
      if (s < 0.2 * big) return TREE.PINYON;
      if (s < 0.32) return TREE.EPHEDRA;
      if (s < 0.34) return TREE.CHOLLA;
      return s < 0.85 ? TREE.SAGEBRUSH : TREE.RABBITBRUSH;
    case LC.SHADSCALE:
      if (s < 0.08) return TREE.RABBITBRUSH;
      if (s < 0.12) return TREE.EPHEDRA;
      return s < 0.7 ? TREE.SHADSCALE : TREE.SAGEBRUSH;
    case LC.PLAYA:
      return s < 0.7 ? TREE.SHADSCALE : TREE.RABBITBRUSH;
    default:
      return s < 0.5 ? TREE.SAGEBRUSH : s < 0.9 ? TREE.SHADSCALE : TREE.RABBITBRUSH;
  }
}

/** Real Great Basin plants: every sagebrush, pinyon and juniper detected in the aerial imagery. */
export class Trees {
  readonly group = new THREE.Group();
  readonly material: THREE.ShaderMaterial;
  private tiles: Tile[] = [];
  /** kinds[form][variant][lod] */
  private kinds = new Map<PlantForm, Kind[][]>();
  private allKinds: Kind[] = [];
  private lastPos = new THREE.Vector3(1e9, 0, 0);
  private lastQuat = new THREE.Quaternion();
  private frustum = new THREE.Frustum();
  private projView = new THREE.Matrix4();
  private box = new THREE.Box3();
  counts = [0, 0, 0];
  total = 0;
  private tileMap = new Map<number, Tile>();
  private zone = 0;
  private outer = new Map<string, Tile>();
  private hf: Heightfield;

  /** Hand-placed plants on top of those detected in the imagery (town landscaping, cemetery). */
  constructor(
    buf: ArrayBuffer,
    zone: number,
    hf: Heightfield,
    private roads?: RoadIndex,
    private planted: PlantedTree[] = [],
    private water?: { depthAt(x: number, z: number): number; sample(x: number, z: number): { mask: number; depth: number } },
    /** True where a hand-built landmark stands; imagery plants there are dropped. */
    private clear?: (x: number, z: number) => boolean,
  ) {
    this.hf = hf;
    this.material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: treeVertex,
      fragmentShader: treeFragment,
      uniforms: {
        ...G,
        uLeafColor: { value: Array.from({ length: SPECIES_COUNT }, () => new THREE.Color()) },
        uBarkColor: { value: BARK.map((h) => new THREE.Color(h)) },
        uThatchColor: { value: THATCH.map((h) => new THREE.Color(h)) },
        uBloomColor: { value: Array.from({ length: SPECIES_COUNT }, (_, s) => new THREE.Color(BLOOM[s]?.col ?? '#ffffff')) },
        uLeafAmount: { value: new Array(SPECIES_COUNT).fill(1) },
        uBloom: { value: new Array(SPECIES_COUNT).fill(0) },
        // Sagebrush and rabbitbrush are airy, see-through shrubs; shadscale is twiggy.
        uOpen: { value: [0.8, 0.45, 0.9, 0.3, 0, 0.35, 0.2, 0, 0.1, 0, 0.1, 0] },
        uFallTint: { value: new THREE.Color('#a0783a') },
      },
      side: THREE.DoubleSide,
    });

    for (const form of Object.keys(VARIANTS) as PlantForm[]) {
      const vs: Kind[][] = [];
      for (let v = 0; v < VARIANTS[form]; v++) {
        const lods: Kind[] = [];
        for (let lod = 0; lod < 3; lod++) {
          const base = buildPlant(form, lod as 0 | 1 | 2, 7 + v * 31 + lod);
          const g = new THREE.InstancedBufferGeometry();
          g.index = base.index;
          for (const k of Object.keys(base.attributes)) g.setAttribute(k, base.attributes[k]);
          const cap = Math.ceil((CAP[lod] * BUDGET[form]) / VARIANTS[form]) + 64;
          const a0 = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
          const a1 = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
          a0.setUsage(THREE.DynamicDrawUsage);
          a1.setUsage(THREE.DynamicDrawUsage);
          g.setAttribute('aInst0', a0);
          g.setAttribute('aInst1', a1);
          g.instanceCount = 0;
          const mesh = new THREE.Mesh(g, this.material);
          mesh.frustumCulled = false;
          this.group.add(mesh);
          const kind = { geo: g, a0, a1, cap, n: 0 };
          lods.push(kind);
          this.allKinds.push(kind);
        }
        vs.push(lods);
      }
      this.kinds.set(form, vs);
    }
    this.decode(buf, zone, hf);
  }

  private push(out: number[], x: number, z: number, sp: number, seed: number) {
    const [r, h] = sizeFor(sp, hash(seed * 7.7), hash(seed * 3.3));
    out.push(x, this.hf.height(x, z) - (ROSETTE_FORMS.has(FORM[sp]) ? 0.1 : 0.3), z, seed * 6.2831, r, h, sp, hash(seed * 17.3));
  }

  /** Plants for one tile outside the imagery zone, from land cover alone. */
  private growTile(ti: number, tj: number): Tile | null {
    const hf = this.hf;
    const x0 = ti * TILE, z0 = tj * TILE;
    const out: number[] = [];
    for (let z = z0 + 5; z < z0 + TILE; z += 10)
      for (let x = x0 + 5; x < x0 + TILE; x += 10) {
        const seed = hash(x * 0.311 + z * 0.917);
        const jx = x + (hash(seed * 3.1) - 0.5) * 9, jz = z + (hash(seed * 5.3) - 0.5) * 9;
        const lc = hf.landcover(jx, jz);
        let p = 0;
        if (this.water) {
          const w = this.water.sample(jx, jz);
          if (w.depth > 0.05) continue;
          // Willow thickets crowd the springs and ponds.
          if (w.mask > 0.03) p = 0.5;
        }
        if (lc === LC.PINYON) p = Math.max(p, 0.16);
        else if (lc === LC.SAGEBRUSH || lc === LC.BLACKSAGE) p = Math.max(p, 0.12);
        else if (lc === LC.SHADSCALE || lc === LC.WASH) p = Math.max(p, 0.06);
        else if (lc === LC.PLAYA) p = Math.max(p, 0.005);
        else if (lc === LC.WETLAND) p = Math.max(p, 0.3);
        else if (lc >= LC.URBAN_OPEN && lc <= LC.URBAN_HIGH) p = Math.max(p, 0.06);
        if (hash(seed * 11.7) > p) continue;
        const road = this.roads?.nearest(jx, jz, 12);
        if (road && road.dist < road.halfWidth + 1.8) continue;
        const sp = p >= 0.5 ? TREE.WILLOW : speciesFor(lc, 0.3, hash(seed * 23.1));
        this.push(out, jx, jz, sp, seed);
      }
    if (!out.length) return null;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < out.length; i += 8) {
      minY = Math.min(minY, out[i + 1]);
      maxY = Math.max(maxY, out[i + 1] + out[i + 5]);
    }
    return { data: new Float32Array(out), count: out.length / 8, cx: x0 + TILE / 2, cz: z0 + TILE / 2, minY, maxY };
  }

  /** Grows outer tiles near the camera (a few per call) and drops far ones. Returns true if anything changed. */
  private growOuter(cx: number, cz: number): boolean {
    let changed = false;
    const zh = this.zone / 2;
    for (const [key, t] of this.outer) {
      if (Math.hypot(t.cx - cx, t.cz - cz) > OUTER_DROP) {
        this.outer.delete(key);
        if (t.count) this.tiles.splice(this.tiles.indexOf(t), 1);
        changed = true;
      }
    }
    const want: [number, number, number][] = [];
    const n = Math.ceil(OUTER_R / TILE);
    const ci = Math.floor(cx / TILE), cj = Math.floor(cz / TILE);
    for (let tj = cj - n; tj <= cj + n; tj++)
      for (let ti = ci - n; ti <= ci + n; ti++) {
        const x = (ti + 0.5) * TILE, z = (tj + 0.5) * TILE;
        if (Math.abs(x) < zh && Math.abs(z) < zh) continue;
        if (Math.abs(x) > LC_HALF || Math.abs(z) > LC_HALF) continue;
        const d = Math.hypot(x - cx, z - cz);
        if (d > OUTER_R || this.outer.has(ti + ',' + tj)) continue;
        want.push([d, ti, tj]);
      }
    want.sort((a, b) => a[0] - b[0]);
    const t0 = performance.now();
    for (const [, ti, tj] of want) {
      if (performance.now() - t0 > 6) break;
      const t = this.growTile(ti, tj);
      const empty: Tile = { data: new Float32Array(0), count: 0, cx: (ti + 0.5) * TILE, cz: (tj + 0.5) * TILE, minY: 0, maxY: 0 };
      this.outer.set(ti + ',' + tj, t ?? empty);
      if (t) {
        this.tiles.push(t);
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Deepest trunk overlapping a circle at (x, z), as a push-out direction and
   * depth. Shrubs, Mormon tea and cactus are ignored (the truck rolls over them).
   */
  trunkHit(x: number, z: number, radius: number): { nx: number; nz: number; depth: number } | null {
    const zone = this.zone;
    const tilesN = Math.ceil(zone / TILE);
    const reach = radius + 1;
    const i0 = Math.floor((x - reach + zone / 2) / TILE), i1 = Math.floor((x + reach + zone / 2) / TILE);
    const j0 = Math.floor((z - reach + zone / 2) / TILE), j1 = Math.floor((z + reach + zone / 2) / TILE);
    let best: { nx: number; nz: number; depth: number } | null = null;
    for (let tj = j0; tj <= j1; tj++)
      for (let ti = i0; ti <= i1; ti++) {
        if (ti < 0 || tj < 0 || ti >= tilesN || tj >= tilesN) continue;
        const t = this.tileMap.get(tj * tilesN + ti);
        if (t) check(t);
      }
    const g0 = Math.floor((x - reach) / TILE), g1 = Math.floor((x + reach) / TILE);
    const h0 = Math.floor((z - reach) / TILE), h1 = Math.floor((z + reach) / TILE);
    for (let tj = h0; tj <= h1; tj++)
      for (let ti = g0; ti <= g1; ti++) {
        const t = this.outer.get(ti + ',' + tj);
        if (t) check(t);
      }
    return best;

    function check(t: Tile) {
      const d = t.data;
      for (let k = 0; k < t.count; k++) {
        const o = k * 8;
        const dx = x - d[o], dz = z - d[o + 2];
        if (Math.abs(dx) > reach || Math.abs(dz) > reach) continue;
        const sp = d[o + 6];
        if (sp === TREE.SAGEBRUSH || sp === TREE.SHADSCALE || sp === TREE.RABBITBRUSH || sp === TREE.EPHEDRA || sp === TREE.CHOLLA) continue;
        const trunk = sp === TREE.POPLAR ? d[o + 5] * 0.025 : Math.min(0.7, Math.max(0.25, d[o + 4] * 0.08));
        const dist = Math.hypot(dx, dz);
        const depth = radius + trunk - dist;
        if (depth > 0 && (!best || depth > best.depth)) {
          const l = dist || 1;
          best = { nx: dx / l, nz: dz / l, depth };
        }
      }
    }
  }

  /** Registers the near plant LODs as shadow casters. */
  addShadowCasters(shadow: ShadowMap) {
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: treeVertex,
      fragmentShader: treeFragment,
      uniforms: this.material.uniforms,
      defines: { SHADOW_PASS: '' },
      side: THREE.DoubleSide,
    });
    for (const vs of this.kinds.values())
      for (const lods of vs) {
        shadow.addCaster(lods[0].geo, mat);
        shadow.addCaster(lods[1].geo, mat);
      }
  }

  private decode(buf: ArrayBuffer, zone: number, hf: Heightfield) {
    // Tiles cover the imagery zone, widened to take any hand-planted plants outside it.
    let grid = zone;
    for (const t of this.planted) grid = Math.max(grid, 2 * Math.max(Math.abs(t.x), Math.abs(t.z)) + 2 * TILE);
    grid = Math.ceil(grid / (2 * TILE)) * 2 * TILE;
    this.zone = grid;
    const v = new DataView(buf);
    const n = buf.byteLength / 6;
    const tilesN = Math.ceil(grid / TILE);
    const lists: number[][] = Array.from({ length: tilesN * tilesN }, () => []);
    const add = (x: number, z: number, sp: number, seed: number, r?: number, h?: number) => {
      const ti = Math.floor((x + grid / 2) / TILE);
      const tj = Math.floor((z + grid / 2) / TILE);
      if (ti < 0 || tj < 0 || ti >= tilesN || tj >= tilesN) return;
      const l = lists[tj * tilesN + ti];
      this.push(l, x, z, sp, seed);
      if (r !== undefined && h !== undefined) {
        l[l.length - 4] = r;
        l[l.length - 3] = h;
      }
    };
    for (let k = 0; k < n; k++) {
      const x = (v.getUint16(k * 6, true) / 65535 - 0.5) * zone;
      const z = (v.getUint16(k * 6 + 2, true) / 65535 - 0.5) * zone;
      const dark = v.getUint8(k * 6 + 5) / 255;
      const seed = hash(k * 0.61803 + x * 0.001);
      const lc = hf.landcover(x, z);
      if (lc === LC.WATER) continue;
      if (this.water && this.water.depthAt(x, z) > 0.15) continue;
      const sp = speciesFor(lc, dark, hash(seed * 29.3));
      // Imagery blobs over a road put the plant on the asphalt; step it onto the shoulder.
      let tx = x, tz = z;
      const road = this.roads?.nearest(x, z, 16);
      if (road) {
        const clear = road.halfWidth + 1.3 + (sp === TREE.SAGEBRUSH || sp === TREE.SHADSCALE ? 0.3 : 0.8);
        if (road.dist < clear) {
          let nx = x - road.x, nz = z - road.z;
          const l = Math.hypot(nx, nz);
          if (l > 0.01) (nx /= l), (nz /= l);
          else (nx = -road.dz), (nz = road.dx);
          tx = road.x + nx * clear;
          tz = road.z + nz * clear;
        }
      }
      if (this.clear?.(tx, tz)) continue;
      add(tx, tz, sp, seed);
    }
    this.planted.forEach((t, k) => !this.clear?.(t.x, t.z) && add(t.x, t.z, t.sp, hash(k * 3.17 + 0.5), t.r, t.h));
    for (let tj = 0; tj < tilesN; tj++) {
      for (let ti = 0; ti < tilesN; ti++) {
        const l = lists[tj * tilesN + ti];
        if (!l.length) continue;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < l.length; i += 8) {
          minY = Math.min(minY, l[i + 1]);
          maxY = Math.max(maxY, l[i + 1] + l[i + 5]);
        }
        const tile: Tile = {
          data: new Float32Array(l),
          count: l.length / 8,
          cx: -grid / 2 + (ti + 0.5) * TILE,
          cz: -grid / 2 + (tj + 0.5) * TILE,
          minY,
          maxY,
        };
        this.tiles.push(tile);
        this.tileMap.set(tj * tilesN + ti, tile);
        this.total += l.length / 8;
      }
    }
  }

  /** Seasonal foliage: leaf-out, colour and blooms for the given month (0 = Jan 1). */
  setSeason(month: number) {
    const u = this.material.uniforms;
    const amount = u.uLeafAmount.value as number[];
    const bloom = u.uBloom.value as number[];
    const cols = u.uLeafColor.value as THREE.Color[];
    // Weights for winter / spring / summer / fall colour keys.
    const w = [
      kf([1, 0.8, 0.2, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.8], month),
      kf([0, 0.2, 0.8, 1, 0.7, 0.2, 0, 0, 0, 0, 0, 0], month),
      kf([0, 0, 0, 0, 0.3, 0.8, 1, 1, 0.7, 0.2, 0, 0], month),
      kf([0, 0, 0, 0, 0, 0, 0, 0, 0.3, 0.8, 0.8, 0.2], month),
    ];
    const sum = w.reduce((a, b) => a + b, 0) || 1;
    const c = new THREE.Color();
    for (let s = 0; s < SPECIES_COUNT; s++) {
      amount[s] = kf(LEAF_KF[s], month);
      cols[s].setRGB(0, 0, 0);
      for (let k = 0; k < 4; k++) {
        c.set(LEAF_COL[s][k]);
        cols[s].r += (c.r * w[k]) / sum;
        cols[s].g += (c.g * w[k]) / sum;
        cols[s].b += (c.b * w[k]) / sum;
      }
      const b = BLOOM[s];
      bloom[s] = b ? Math.max(0, Math.min(1, (1 - Math.abs(month - b.peak) / b.width) * 1.6)) : 0;
    }
    (u.uFallTint.value as THREE.Color).set(w[3] / sum > 0.3 ? '#c49a34' : '#5d6a3a');
  }

  update(camera: THREE.PerspectiveCamera) {
    const grew = this.growOuter(camera.position.x, camera.position.z);
    const moved = camera.position.distanceTo(this.lastPos);
    const turned = 1 - Math.abs(camera.quaternion.dot(this.lastQuat));
    if (moved < 25 && turned < 0.002 && !grew) return;
    this.lastPos.copy(camera.position);
    this.lastQuat.copy(camera.quaternion);
    this.projView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projView);
    const cx = camera.position.x;
    const cy = camera.position.y;
    const cz = camera.position.z;
    for (const k of this.allKinds) k.n = 0;
    const half = TILE / 2 + 12;
    // Visible tiles nearest-first, so instance caps only ever drop the farthest plants.
    const vis: [number, Tile][] = [];
    for (const t of this.tiles) {
      const dx = Math.max(Math.abs(t.cx - cx) - half, 0);
      const dz = Math.max(Math.abs(t.cz - cz) - half, 0);
      const dy = Math.max(t.minY - cy, cy - t.maxY, 0);
      const tileDist = Math.sqrt(dx * dx + dz * dz + dy * dy);
      if (tileDist > LOD2) continue;
      this.box.min.set(t.cx - half, t.minY - 2, t.cz - half);
      this.box.max.set(t.cx + half, t.maxY + 2, t.cz + half);
      if (!this.frustum.intersectsBox(this.box)) continue;
      vis.push([tileDist, t]);
    }
    vis.sort((a, b) => a[0] - b[0]);
    const counts = [0, 0, 0];
    for (const [, t] of vis) {
      const d = t.data;
      for (let i = 0; i < t.count; i++) {
        const o = i * 8;
        const ex = d[o] - cx;
        const ey = d[o + 1] - cy;
        const ez = d[o + 2] - cz;
        const dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
        const sp = d[o + 6];
        if (dist > MAX_DIST[sp]) continue;
        let lod = dist < LOD0 ? 0 : dist < LOD1 ? 1 : 2;
        let scale = 1;
        if (lod === 2) {
          // Thin small plants with distance; survivors grow slightly to keep cover.
          const keep = Math.min(1, (sp === TREE.PINYON || sp === TREE.JUNIPER ? 1.45 : 1.25) - dist / LOD2);
          if (d[o + 7] > keep) continue;
          scale = 1 + (1 - keep) * 0.35;
        }
        const form = FORM[sp];
        const lods = this.kinds.get(form)![Math.floor(d[o + 7] * 997) % VARIANTS[form]];
        let kind = lods[lod];
        if (kind.n >= kind.cap) {
          if (lod === 2) continue;
          lod++;
          kind = lods[lod];
          if (kind.n >= kind.cap) continue;
        }
        const k = kind.n++ * 4;
        counts[lod]++;
        const a0 = kind.a0.array as Float32Array;
        const a1 = kind.a1.array as Float32Array;
        a0[k] = d[o];
        a0[k + 1] = d[o + 1];
        a0[k + 2] = d[o + 2];
        a0[k + 3] = d[o + 3];
        a1[k] = d[o + 4] * scale;
        a1[k + 1] = d[o + 5] * scale;
        a1[k + 2] = sp;
        a1[k + 3] = d[o + 7];
      }
    }
    for (const kind of this.allKinds) {
      kind.geo.instanceCount = kind.n;
      kind.a0.clearUpdateRanges();
      kind.a0.addUpdateRange(0, kind.n * 4);
      kind.a0.needsUpdate = true;
      kind.a1.clearUpdateRanges();
      kind.a1.addUpdateRange(0, kind.n * 4);
      kind.a1.needsUpdate = true;
    }
    this.counts = counts;
  }
}
