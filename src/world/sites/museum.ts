import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// The Central Nevada Museum on Logan Field Road: a low building full of the
// camp's photographs, its gambling tables and the story of the Tonopah Army Air
// Field, and a yard outside crowded with ore cars, a stamp mill, hoists and a
// rebuilt miner's cabin.

const STUCCO = '#c8b090';
const TRIM = '#6a4a2a';
const PLASTER = '#ece4d4';
const W = 40;
const D = 18;
const H = 4.6;

/** Museum frame on its floor: x along the front, z out toward the yard and road. */
export function museumShell(k: Kit): Frame {
  k.seed = 90;
  const fr = k.footprint(809.9, 891.5, 47.7, 22.4, 0.34, 0, 40);
  const [lo, hi] = k.footRange(fr, -W / 2, W / 2, -D, 0);
  const base = Math.max(0.2, hi + 0.15);
  const b = fr.sub(0, base, 0);
  k.block(b, -W / 2 - 1, W / 2 + 1, -D - 1, 1.5);
  k.box(b, 0, lo - base - 0.3, -D / 2, W + 0.4, base - lo + 0.3, D + 0.4, '#8a7a66', { rough: 1 });

  const front: Hole[] = [{ x: 0, y: 0, w: 2.6, h: 2.6, glass: true, trim: TRIM }];
  for (const x of [-15, -10, -5, 5, 10, 15]) front.push({ x, y: 0.9, w: 2.4, h: 1.5, glass: true, trim: TRIM });
  k.wall(b, -W / 2, W / 2, 0, -0.1, H, 0.3, STUCCO, PLASTER, front, { rough: 0.95 });
  k.wall(b.sub(0, 0, -D, Math.PI), -W / 2, W / 2, 0, -0.1, H, 0.3, STUCCO, PLASTER, [{ x: 12, y: 0, w: 3.6, h: 3.4, trim: TRIM }], { rough: 0.95 });
  for (const o of [-1, 1] as const) k.wall(k.side(b, (o * W) / 2, -D / 2, o), -D / 2, D / 2, 0, -0.1, H, 0.3, STUCCO, PLASTER, [{ x: 0, y: 0.9, w: 2.4, h: 1.5, glass: true, trim: TRIM }], { rough: 0.95 });
  // Standing-seam roof, low hip, and a timber porch over the entrance.
  k.box(b, 0, H, -D / 2, W + 1.2, 0.25, D + 1.2, '#6a4a32', { fx: FX.METAL });
  for (let x = -W / 2; x <= W / 2; x += 0.6) k.box(b, x, H + 0.25, -D / 2, 0.04, 0.05, D + 1.2, '#5a3a26', { fx: FX.METAL });
  k.box(b, 0, H - 0.1, -D / 2, W - 0.4, 0.08, D - 0.4, '#d8ccb0', k.in(0.8));
  k.box(b, 0, H - 0.6, 2.0, 8, 0.2, 4, '#5a3a22', { rough: 0.9 });
  for (const x of [-3.8, 3.8]) k.box(b, x, 0, 3.8, 0.3, H - 0.6, 0.3, TRIM, { rough: 0.9 });
  k.sign(b, 'museumSign', 0, H - 1.1, 4.02, 0.9, 0.9);
  k.lot(b, -W / 2 + 10, 14, 20, 12, 0.4);
  return b;
}

/** Inside: photo walls, display cases of ore and tools, the gaming tables and the airfield room. */
export function museumHall(k: Kit, b: Frame) {
  k.seed = 91;
  k.box(b, 0, 0, -D / 2, W - 0.6, 0.02, D - 0.6, '#8a6a48', k.in(0.6));
  for (let x = -16; x <= 16; x += 6) {
    k.lamp(b, x, H - 0.6, -5, 7, 0.9);
    k.lamp(b, x, H - 0.6, -13, 7, 0.9);
    k.box(b, x, H - 0.18, -5, 2.4, 0.06, 0.3, '#fff8e8', k.lit(2.2));
    k.box(b, x, H - 0.18, -13, 2.4, 0.06, 0.3, '#fff8e8', k.lit(2.2));
  }
  // Photograph walls along the back.
  const back = b.sub(0, 0, -D + 0.32, 0);
  for (const x of [-5, 4, 13]) k.sign(back, 'museumPhotos', x, 2.1, 0.01, 1.8, 0.9, FX.INTERIOR);
  // Glass cases of ore samples, assay tools, badges and bottles.
  for (let i = 0; i < 4; i++) {
    const c = b.sub(-14 + i * 4.2, 0, -8.5);
    k.ibox(c, 0, 0, 0, 2.6, 0.9, 0.9, F.WOOD.oak, 0.6);
    for (let j = 0; j < 7; j++) {
      const color = ['#8a8a8a', '#c8c0a8', '#5a4a3a', '#a89060', '#6a6a72', '#d8d0c0', '#3a3a3a'][(i + j) % 7];
      k.geo(c, new THREE.DodecahedronGeometry(0.08 + ((i * 3 + j) % 3) * 0.03, 0), -1.0 + j * 0.33, 0.98, ((j % 2) - 0.5) * 0.3, color, k.in(0.5));
    }
    k.pane(c, 0, 1.2, 0.45, 2.6, 0.6);
    k.pane(c, 0, 1.2, -0.45, 2.6, 0.6);
    k.box(c, 0, 1.5, 0, 2.6, 0.02, 0.9, '#b8c8c8', k.in(0.1));
  }
  // The old gaming room: a faro layout, a roulette wheel and a wheel of fortune.
  const g = b.sub(10, 0, -9);
  F.table(k, g, -2.5, 0, 0, 2.0, 1.1, '#1a5a2a', F.WOOD.walnut, 0.8);
  F.roundTable(k, g, 1.5, 0, 0, 0.8, F.WOOD.mahogany, 0.85, '#1a5a2a');
  k.cyl(g, 1.5, 0.85, 0, 0.42, 0.42, 0.08, '#3a1a10', k.in(0.4), 24);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    k.box(g, 1.5 + Math.cos(a) * 0.32, 0.93, Math.sin(a) * 0.32, 0.08, 0.01, 0.08, i % 2 ? '#b0222a' : '#1a1a1a', k.in(0.4), -a);
  }
  const wheel = g.sub(0, 0, 3.0);
  k.geo(wheel, new THREE.CylinderGeometry(0.9, 0.9, 0.1, 24).rotateX(Math.PI / 2), 0, 2.2, 0, '#c49a4a', k.in(0.4));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    k.box(wheel, Math.cos(a) * 0.55, 2.2 + Math.sin(a) * 0.55 - 0.04, 0.06, 0.3, 0.08, 0.01, ['#b0222a', '#1a5a2a', '#1a3a7a', '#e8d8a0'][i % 4], k.in(0.5), 0);
  }
  k.ibox(wheel, 0, 0, 0, 0.2, 1.3, 0.2, F.WOOD.walnut, 0.5);
  // The Tonopah Army Air Field room: a B-24 model hung from the ceiling, flight
  // jackets on a rack, maps of the gunnery ranges.
  const af = b.sub(-12, 0, -14);
  const plane = af.sub(0, H - 1.0, 2, 0.3);
  k.ibox(plane, 0, 0, 0, 0.35, 0.35, 2.4, '#8a9088', 0.5);
  k.ibox(plane, 0, 0.12, 0.1, 3.4, 0.05, 0.45, '#8a9088', 0.5);
  for (const x of [-1.6, 1.6]) k.ibox(plane, x, 0.1, -1.0, 0.04, 0.4, 0.3, '#8a9088', 0.5);
  for (const x of [-1.2, -0.6, 0.6, 1.2]) k.cyl(plane, x, 0.08, 0.3, 0.06, 0.06, 0.25, '#5a6058', k.in(0.5), 8);
  k.cyl(plane, 0, 0.35, 0, 0.005, 0.005, 0.6, '#2a2a2a', k.in(0.5), 3);
  for (let i = 0; i < 5; i++) {
    k.ibox(af, -2 + i * 0.5, 1.0, 1.6, 0.42, 0.75, 0.1, '#5a3a22', 0.8);
    k.ibox(af, -2 + i * 0.5, 1.72, 1.6, 0.2, 0.06, 0.12, '#d8c8a8', 0.8);
  }
  k.ibox(af, -0.5, 1.8, 1.6, 2.8, 0.04, 0.04, '#3a3a3a', 0.4);
  k.ibox(af, -4.5, 1.0, -3.5, 2.4, 1.6, 0.04, '#d8d0a8', 0.8);
}
