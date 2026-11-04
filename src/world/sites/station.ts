import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// Tonopah Station, at the south end of town on Erie Street: a hotel-casino
// built like the railroad depot that stood here when the Tonopah & Goldfield
// trains ran, with slots, tables, a bar, the Station House restaurant and an
// RV park out back.

const SIDING = '#b08a5a';
const BATTEN = '#8a6a42';
const TRIM = '#4a2a16';
export const CW = 64;
export const CD = 36;
const CH = 5.2;
/** Interior ceiling height. */
export const CEIL = 4.4;

/** Casino frame: x along the Erie Street front (+x north), z out toward the street. */
export function stationShell(k: Kit): Frame {
  k.seed = 50;
  const fp = k.footprint(1025.8, 1073.8, 133.8, 72.3, 1.5, 1, 0);
  const fr = fp.sub(28, 0, 0);
  const [lo, hi] = k.footRange(fr, -CW / 2 - 2, CW / 2 + 2, -CD - 2, 4);
  const base = Math.max(0.25, hi + 0.15);
  const c = fr.sub(0, base, 0);
  const mid = c.p(0, 0, -CD / 2);
  k.sites.push({ x: mid.x, z: mid.z, radius: 44 });
  k.block(c, -CW / 2 - 2, CW / 2 + 2, -CD - 2, 4.5);
  k.box(c, 0, lo - base - 0.4, -CD / 2 + 1.5, CW + 1, base - lo + 0.4, CD + 4, '#8a7a66', { rough: 1 });
  for (let y = lo - base + 0.4; y < -0.3; y += 0.45) k.box(c, 0, y, -CD / 2 + 1.5, CW + 1.04, 0.03, CD + 4.04, '#6a5a4a', { rough: 1 });

  // Front: the entrance under the gable, the restaurant windows at the south end.
  const front: Hole[] = [{ x: 0, y: 0, w: 3.4, h: 2.7, glass: true, trim: TRIM }];
  for (let i = 0; i < 4; i++) front.push({ x: -28 + i * 3.6, y: 0.9, w: 2.4, h: 1.6, glass: true, trim: TRIM });
  for (let i = 0; i < 3; i++) front.push({ x: 20 + i * 4, y: 1.4, w: 1.4, h: 0.9, glass: true, trim: TRIM });
  k.wall(c, -CW / 2, CW / 2, 0, -0.1, CH, 0.3, SIDING, '#e8d8b8', front, { rough: 0.9 });
  k.wall(c, -CW / 2, CW / 2, -CD + 0.3, -0.1, CH, 0.3, '#e8d8b8', null, [], k.in(0.8));
  k.box(c, 0, -0.1, -CD - 0.02, CW, CH + 0.1, 0.04, SIDING, { rough: 0.9 });
  for (const s of [-1, 1] as const) {
    const side = k.side(c, (s * CW) / 2, -CD / 2, s);
    k.wall(side, -CD / 2 + 0.3, CD / 2 - 0.3, 0, -0.1, CH, 0.3, SIDING, '#e8d8b8', [], { rough: 0.9 });
    for (let x = -CD / 2 + 0.5; x < CD / 2; x += 0.6) k.box(side, x, 0, 0.03, 0.08, CH - 0.1, 0.05, BATTEN, { rough: 0.9 });
  }
  // Board and batten across the front, between the openings.
  for (let x = -CW / 2 + 0.3; x < CW / 2; x += 0.6) {
    if (front.some((h) => Math.abs(x - h.x) < h.w / 2 + 0.1)) continue;
    k.box(c, x, 0, 0.03, 0.08, CH - 0.1, 0.05, BATTEN, { rough: 0.9 });
  }
  // Flat roof behind a parapet, rooftop units.
  k.slab(c, 0, CH + 0.1, -CD / 2, CW - 0.3, CD - 0.3, '#4a4440', '#2a2624');
  k.box(c, 0, CH, 0.0, CW + 0.3, 0.8, 0.3, SIDING, { rough: 0.9 });
  k.box(c, 0, CH + 0.8, 0.05, CW + 0.4, 0.12, 0.4, TRIM, { rough: 0.7 });
  for (const [x, z] of [[-18, -12], [-4, -24], [12, -10], [22, -26]]) k.box(c, x, CH + 0.1, z, 2.4, 1.3, 1.6, '#9a9a96', { rough: 0.6, fx: FX.METAL });

  // The depot platform: a shed roof on timber posts the length of the front.
  const pd = 3.6;
  const roof = new THREE.BoxGeometry(CW + 1, 0.12, pd + 0.6).translate(0, 0, (pd + 0.6) / 2);
  k.s.add(roof, c.at(0, 3.6, 0).multiply(new THREE.Matrix4().makeRotationX(0.18)), '#5a3a22', { rough: 0.9 }, k.seed);
  for (let x = -CW / 2 + 0.5; x <= CW / 2 - 0.5; x += 4) {
    if (Math.abs(x) < 3) continue;
    k.box(c, x, 0, pd, 0.25, 3.0, 0.25, '#6a4a2a', { rough: 0.9 });
    k.beam(c, new THREE.Vector3(x, 2.4, pd), new THREE.Vector3(x, 3.0, pd - 0.7), 0.1, '#6a4a2a', { rough: 0.9 });
    k.light(c.p(x + 2, 2.95, pd - 1.2), 1, 0.8, 0.5, 0.9);
  }
  k.box(c, 0, -0.18, pd / 2 + 0.2, CW + 1, 0.2, pd + 0.4, '#8a7a62', { rough: 0.95 });
  // Steps down from the platform to the lot, at the doors and both ends.
  for (const sx of [0, -CW / 2 + 4, CW / 2 - 4]) {
    const g = c.p(sx, 0, pd + 3);
    const drop = c.o.y - k.hf.height(g.x, g.z);
    const n = Math.max(1, Math.round(drop / 0.17));
    if (drop > 0.25) k.stairs(c, sx, -drop, pd + 0.4 + n * 0.3, sx === 0 ? 5 : 2.4, drop, n, '#a8a094', '#8a7a66', 0.3, 0, sx === 0 ? '#4a2a16' : undefined);
  }
  // The lamps wash the siding after dark.
  const cuts = [-CW / 2 + 0.1, ...front.flatMap((h) => [h.x - h.w / 2 - 0.15, h.x + h.w / 2 + 0.15]).sort((p, q) => p - q), CW / 2 - 0.1];
  for (let i = 0; i + 1 < cuts.length; i += 2) {
    if (cuts[i + 1] - cuts[i] > 0.1) k.box(c, (cuts[i] + cuts[i + 1]) / 2, 0.05, 0.09, cuts[i + 1] - cuts[i], 3.2, 0.02, SIDING, { rough: 0.9, glow: 0.45, fx: FX.WASH });
  }
  for (let x = -CW / 2; x < CW / 2; x += 0.3) k.box(c, x, 0.02, pd / 2 + 0.2, 0.28, 0.02, pd + 0.4, '#9a8460', { rough: 0.95 });

  // Central gable rising over the entrance, its sign and a station clock.
  const gw = 13, gh = 3.2;
  const tri = new THREE.Shape();
  tri.moveTo(-gw / 2, 0);
  tri.lineTo(gw / 2, 0);
  tri.lineTo(0, gh);
  tri.closePath();
  k.box(c, 0, CH, 0.1, gw, 1.4, 0.5, SIDING, { rough: 0.9 });
  k.geo(c, new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: false }).translate(0, 0, -0.4), 0, CH + 1.4, 0.1, SIDING, { rough: 0.9 });
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(Math.hypot(gw / 2, gh) + 0.6, 0.18, 0.7);
    k.s.add(g, c.at(s * gw / 4, CH + 1.4 + gh / 2, 0.1).multiply(new THREE.Matrix4().makeRotationZ(-s * Math.atan2(gh, gw / 2))), TRIM, { rough: 0.7 }, k.seed);
  }
  k.sign(c, 'stationGable', 0, CH + 0.75, 0.37, 1.1, 1.2, FX.NEON);
  k.cyl(c, 0, CH + 2.3, 0.2, 0.62, 0.62, 0.1, TRIM, { rough: 0.6 }, 20);
  const clock = c.sub(0, CH + 2.3, 0.36, 0);
  k.geo(clock, new THREE.CylinderGeometry(0.52, 0.52, 0.04, 24).rotateX(Math.PI / 2), 0, 0, 0, '#f4ecd8', { glow: 1.4 });
  k.beam(clock, new THREE.Vector3(0, 0, 0.04), new THREE.Vector3(0.2, 0.3, 0.04), 0.04, '#1a1a1a');
  k.beam(clock, new THREE.Vector3(0, 0, 0.05), new THREE.Vector3(-0.22, 0.1, 0.05), 0.05, '#1a1a1a');
  k.light(c.p(0, CH + 0.1, 1.2), 1, 0.85, 0.6, 2.2);

  // Parking out front, lit poles.
  k.lot(c, 0, 20, CW - 4, 26, 0.45);
  for (const x of [-22, 0, 22]) k.lotLight(c, x, 16);
  k.spot(c, 0, pd + 2, 8, 4);
  return c;
}

/**
 * The casino floor: patterned carpet, a lit coffered ceiling, ten banks of
 * slots, blackjack tables, a model train circling on a shelf round the walls,
 * and the railroad mural over the cashier's cage.
 */
export function stationFloor(k: Kit, c: Frame) {
  k.seed = 51;
  const x0 = -16, x1 = CW / 2 - 0.3, z0 = -CD + 0.3, z1 = -0.3;
  const cols = ['#5a0a1a', '#1a1a4a', '#6a4a0a'];
  for (let x = x0; x < x1 - 0.01; x += 2) {
    for (let z = z0; z < z1 - 0.01; z += 2) {
      const i = Math.round((x - x0) / 2), j = Math.round((z - z0) / 2);
      k.ibox(c, x + 1, 0, z + 1, 2, 0.01, 2, cols[(i + j) % 3], 1);
      k.ibox(c, x + 1, 0.01, z + 1, 0.7, 0.004, 0.7, ['#c8a040', '#2a8a6a', '#a82a3a'][(i * 2 + j) % 3], 1, Math.PI / 4);
    }
  }
  // Ceiling: dark panels with lit coffers in a grid, a lamp in each.
  k.ibox(c, 0, CEIL, -CD / 2, CW - 0.6, 0.05, CD - 0.6, '#1a1210', 0.9);
  for (let x = -12; x <= 28; x += 8) {
    for (let z = -6; z >= -30; z -= 8) {
      k.ibox(c, x, CEIL - 0.25, z, 3.2, 0.25, 3.2, '#3a2410', 0.5);
      k.box(c, x, CEIL - 0.27, z, 2.8, 0.02, 2.8, '#ffe8b8', k.lit(2.2));
      k.lamp(c, x, CEIL - 0.6, z, 9, 0.9);
    }
  }
  // Slots in two blocks of five rows.
  for (let r = 0; r < 5; r++) {
    for (const bx of [-6, 8]) F.slotBank(k, c, bx, 0, -8 - r * 4.6, 10, 0, 500 + r * 40 + bx);
  }
  // Blackjack tables by the bar.
  for (const [tx, tz] of [[22, -9], [22, -16], [16, -12.5]]) {
    const t = c.sub(tx, 0, tz, -Math.PI / 2);
    k.geo(t, new THREE.CylinderGeometry(1.2, 1.2, 0.76, 20, 1, false, -Math.PI / 2, Math.PI).translate(0, 0.38, 0), 0, 0, 0, '#3a1a0a', k.in(0.5));
    k.geo(t, new THREE.CylinderGeometry(1.12, 1.12, 0.02, 20, 1, false, -Math.PI / 2, Math.PI), 0, 0.77, 0, '#1a6a3a', k.in(0.95));
    k.ibox(t, 0, 0.78, -0.25, 0.5, 0.12, 0.25, '#1a1a1a', 0.4);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (0.15 + i * 0.175);
      F.stool(k, t, Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55, '#5a0a1a');
      k.ibox(t, Math.cos(a) * 0.85, 0.78, Math.sin(a) * 0.85, 0.06, 0.003, 0.09, '#f4f4f0', 0.6, a);
    }
    k.ibox(t, 0, 0, -0.7, 0.4, 1.4, 0.3, '#1a1a1a', 0.8);
    k.sphere(t, 0, 1.5, -0.7, 0.11, '#e8c8a8', k.in(0.6), 8);
    k.lamp(t, 0, 2.6, 0.3, 4, 0.6, '#fff0d0');
  }
  // Model train on a shelf round the walls, freight cars and a caboose.
  const shelf = (fr: Frame, len: number) => {
    k.ibox(fr, 0, 3.55, 0.15, len, 0.05, 0.3, '#4a2a16', 0.5);
    for (let x = -len / 2 + 0.3; x < len / 2 - 0.4; x += 0.42) {
      const i = Math.round(x * 7.3);
      k.ibox(fr, x, 3.6, 0.15, 0.36, 0.16, 0.14, ['#8a2a1a', '#2a3a5a', '#3a3a3a', '#6a5a2a', '#1a4a2a'][Math.abs(i) % 5], 0.6);
    }
  };
  shelf(c.sub(8, 0, -0.32, Math.PI), CW - 18);
  shelf(c.sub(8, 0, -CD + 0.3), CW - 18);
  // The cage at the back, the mural over it.
  const cage = c.sub(2, 0, -CD + 0.3);
  k.ibox(cage, 0, 0, 1.2, 9, 1.1, 0.5, '#4a2a16', 0.5);
  k.ibox(cage, 0, 1.1, 1.2, 9.2, 0.05, 0.6, '#d8c8a8', 0.3);
  for (let x = -4.4; x <= 4.4; x += 0.14) k.ibox(cage, x, 1.15, 1.25, 0.02, 1.2, 0.02, '#c49a4a', 0.25);
  k.ibox(cage, 0, 2.35, 1.2, 9.2, 0.3, 0.5, '#4a2a16', 0.5);
  k.sign(cage, 'stationCage', 0, 2.5, 1.46, 0.28, 1.4, FX.INTERIOR);
  for (const x of [-3, 0, 3]) {
    k.ibox(cage, x, 0, 0.5, 0.35, 1.0, 0.3, '#2a3a5a', 0.8);
    k.sphere(cage, x, 1.3, 0.5, 0.11, '#e8c8a8', k.in(0.6), 8);
  }
  k.lamp(cage, 0, 2.2, 1.0, 5, 0.6);
  k.sign(cage, 'locoMural', 0, 3.6, 0.02, 1.25, 0.5, FX.INTERIOR);
  k.spot(c, 6, -20, 10, 8);
}

/**
 * The north end: the Whistle Stop Bar, a long back bar under TVs and video
 * poker set into the bar top. The south end: the Station House restaurant,
 * plank floor, booths along the windows, a counter with stools and pie case.
 */
export function stationDining(k: Kit, c: Frame) {
  k.seed = 52;
  // Bar along the north wall, facing the floor.
  const bar = k.side(c, CW / 2 - 0.3, -CD / 2, 1).sub(0, 0, -0.1, Math.PI);
  F.bar(k, bar, -2, 0, 2.0, 14, 0, F.WOOD.mahogany, 1.6);
  for (let x = -8; x <= 4; x += 1.6) {
    const vp = bar.sub(x, 1.08, 2.15);
    k.ibox(vp, 0, 0, 0, 0.42, 0.06, 0.3, '#1a1a1a', 0.3);
    k.box(vp, 0, 0.06, -0.02, 0.36, 0.01, 0.22, '#5ab8ff', k.lit(2.6));
  }
  for (const x of [-7, -2, 3]) F.tv(k, bar, x, 2.9, 0.15, 0, true);
  k.sign(bar, 'stationBar', -2, 3.75, 0.2, 0.42, 1.4, FX.INTERIOR);
  for (const x of [-7, -2, 3]) k.lamp(bar, x, 2.6, 1.6, 4.5, 0.6, '#ffc890');

  // Restaurant behind a half wall at the south end.
  const rx = -16;
  k.ibox(c, rx, 0, -24, 0.2, 1.1, 22, '#4a2a16', 0.5);
  k.ibox(c, rx, 1.1, -24, 0.3, 0.06, 22.2, '#6a4a2a', 0.4);
  for (let z = -13; z > -35; z -= 2.2) k.ibox(c, rx, 1.16, z, 0.06, 1.2, 0.06, '#6a4a2a', 0.4);
  const inside = c.sub(rx - 0.15, 0, -6.8, -Math.PI / 2);
  k.sign(inside, 'stationHouse', 0, 3.2, -0.02, 0.5, 1.3, FX.INTERIOR, Math.PI);
  for (let x = -CW / 2 + 0.3; x < rx - 0.1; x += 0.2) k.ibox(c, x + 0.1, 0, -CD / 2, 0.19, 0.012, CD - 0.6, ['#7a5230', '#6a4628', '#82583a'][Math.round(x * 5) % 3 < 0 ? 0 : Math.round(x * 5) % 3], 0.6);
  // Booths under the front windows.
  for (let i = 0; i < 4; i++) {
    const bx = -28 + i * 3.6;
    const bf = c.sub(bx, 0, -1.6);
    for (const sz of [-0.75, 0.75]) {
      k.ibox(bf, 0, 0, sz, 1.5, 0.45, 0.5, '#8a1a1a', 0.8);
      k.ibox(bf, 0, 0.45, sz + Math.sign(sz) * 0.2, 1.5, 0.65, 0.12, '#8a1a1a', 0.8);
    }
    F.table(k, bf, 0, 0, 0, 1.3, 0.8, '#d8c8a8', F.WOOD.black, 0.74);
    k.cyl(bf, 0.3, 0.74, 0, 0.04, 0.04, 0.12, '#d8d8d8', k.in(0.3), 6);
    k.lamp(bf, 0, 2.2, 0, 3, 0.45);
    k.cyl(bf, 0, CEIL - 1.0, 0, 0.18, 0.08, 0.2, '#c87a2a', k.lit(2.4), 10);
    k.cyl(bf, 0, CEIL - 0.8, 0, 0.005, 0.005, 0.8, '#1a1a1a', k.in(0.5), 3);
  }
  // Tables down the middle, the counter and pie case at the back.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const tx = -27 + i * 4, tz = -9 - j * 4;
      F.table(k, c, tx, 0, tz, 1.0, 1.0, '#d8c8a8', F.WOOD.black, 0.74, 0, '#f4f0e8');
      for (const [sx, sz, a] of [[0, 0.8, Math.PI], [0, -0.8, 0], [0.8, 0, -Math.PI / 2], [-0.8, 0, Math.PI / 2]] as const) F.chair(k, c, tx + sx, 0, tz + sz, a, F.WOOD.oak, '#8a1a1a');
      k.lamp(c, tx, 2.6, tz, 4, 0.5);
    }
  }
  const counter = c.sub(-24, 0, -31);
  k.ibox(counter, 0, 0, 0, 12, 1.0, 0.7, '#8a5a32', 0.5);
  k.ibox(counter, 0, 1.0, 0, 12.2, 0.05, 0.85, '#e8e0d0', 0.3);
  for (let x = -5.4; x <= 5.4; x += 0.9) F.stool(k, counter, x, 0, 0.8, '#8a1a1a', '#c8c8c8');
  const pie = counter.sub(4, 1.05, -0.05);
  k.ibox(pie, 0, 0, 0, 1.2, 0.04, 0.5, '#c8c8c8', 0.3);
  for (let t = 0; t < 2; t++) {
    for (let i = 0; i < 3; i++) k.cyl(pie, -0.4 + i * 0.4, 0.05 + t * 0.25, 0, 0.15, 0.15, 0.06, ['#c8803a', '#8a1a2a', '#e8d8a0'][i], k.in(0.8), 12);
    k.ibox(pie, 0, 0.2 + t * 0.25, 0, 1.2, 0.02, 0.5, '#e8f0f0', 0.1);
  }
  k.pane(pie, 0, 0.27, 0.25, 1.2, 0.5);
  k.ibox(counter, 0, 0, -1.5, 12, 2.4, 0.6, '#6a4a2a', 0.5);
  k.box(counter, -3, 1.2, -1.18, 1.6, 0.9, 0.02, '#b8c4c8', k.in(0.05, 0.5));
  k.lamp(counter, 0, 2.6, 0, 6, 0.7);
}

/** The highway pylon: the steam-engine sign over an amber LED message board. */
export function stationPylon(k: Kit, c: Frame) {
  k.seed = 53;
  const o = c.p(10, 0, 10);
  const h = k.nearestHighway(o.x, o.z);
  const toward = new THREE.Vector2(o.x - h.px, o.z - h.pz).normalize();
  const px = h.px + toward.x * 12, pz = h.pz + toward.y * 12;
  const fr = k.frame(px, pz, h.tz, -h.tx);
  const sh = 5.4, sw = k.signW('stationPylon', sh), y0 = 9;
  for (const sx of [-sw / 3, sw / 3]) {
    k.box(fr, sx, -0.6, 0, 0.7, y0 + sh + 1, 0.7, '#6a4a2a', { rough: 0.9 });
    k.box(fr, sx, -0.6, 0, 1.1, 1.2, 1.1, '#8a7a66', { rough: 1 });
  }
  k.box(fr, 0, y0 - 0.2, 0, sw + 0.5, sh + 0.4, 0.6, '#2a1408', { rough: 0.6 });
  k.sign(fr, 'stationPylon', 0, y0 + sh / 2, 0.31, sh, 1.4, FX.CHASE, 0, true);
  k.sign(fr, 'stationPylon', 0, y0 + sh / 2, -0.31, sh, 1.4, FX.CHASE, Math.PI, true);
  const bh = 1.4, bw = k.signW('stationBoard', bh);
  k.box(fr, 0, y0 - 2.2, 0, bw + 0.3, bh + 0.3, 0.5, '#1a1a1a', { rough: 0.5 });
  k.sign(fr, 'stationBoard', 0, y0 - 1.35, 0.26, bh, 1.8, FX.BLINK);
  k.sign(fr, 'stationBoard', 0, y0 - 1.35, -0.26, bh, 1.8, FX.BLINK, Math.PI);
  // A little gable roof on top, like the depot's.
  const tri = new THREE.Shape();
  tri.moveTo(-sw / 2 - 0.4, 0);
  tri.lineTo(sw / 2 + 0.4, 0);
  tri.lineTo(0, 1.4);
  tri.closePath();
  k.geo(fr, new THREE.ExtrudeGeometry(tri, { depth: 0.8, bevelEnabled: false }).translate(0, 0, -0.4), 0, y0 + sh + 0.2, 0, '#5a3a22', { rough: 0.9 });
}

/**
 * The hotel out back: two storeys of rooms off an open walkway, depot siding
 * and green doors, with the RV park's hookups beyond.
 */
export function stationHotel(k: Kit, c: Frame) {
  k.seed = 54;
  const L = 52, D2 = 12, H = 2.9;
  const hf = c.sub(4, 0, -CD - 20, Math.PI);
  const [lo] = k.footRange(hf, -L / 2, L / 2, -D2, 3);
  k.block(hf, -L / 2 - 2, L / 2 + 2, -D2 - 1, 3);
  k.box(hf, 0, lo - 0.4, -D2 / 2 + 1, L + 4, 0.4 - lo, D2 + 2, '#8a7a66', { rough: 1 });
  for (let fl = 0; fl < 2; fl++) {
    const holes: Hole[] = [];
    for (let i = 0; i < 13; i++) {
      const x = -L / 2 + 4 * (i + 0.5);
      holes.push({ x: x - 1.0, y: fl * H, w: 0.95, h: 2.1, trim: TRIM });
      holes.push({ x: x + 0.8, y: fl * H + 0.9, w: 1.4, h: 1.1, glass: true, trim: TRIM });
      k.box(hf, x - 1.0, fl * H, -0.15, 0.92, 2.08, 0.05, '#2a5a3a', { rough: 0.5 });
      k.box(hf, x - 0.2, fl * H + 2.3, 0.1, 0.2, 0.2, 0.12, '#fff0d0', { glow: 1.6 });
    }
    k.wall(hf, -L / 2, L / 2, 0, fl * H - (fl ? 0 : 0.1), (fl + 1) * H, 0.3, SIDING, '#e8d8b8', holes, { rough: 0.9 });
  }
  k.box(hf, 0, -0.1, -D2 / 2, L, H * 2 + 0.7, D2 - 0.6, '#d8c8a8', k.in(0.9));
  k.box(hf, 0, -0.1, -D2 + 0.15, L, H * 2 + 0.7, 0.3, SIDING, { rough: 0.9 });
  for (const s of [-1, 1]) k.box(hf, (s * L) / 2, -0.1, -D2 / 2, 0.3, H * 2 + 0.7, D2, SIDING, { rough: 0.9 });
  for (let x = -L / 2; x <= L / 2; x += 0.6) k.box(hf, x, -0.1, -D2 + 0.0, 0.08, H * 2 + 0.6, 0.05, BATTEN, { rough: 0.9 });
  k.box(hf, 0, H * 2 + 0.5, -D2 / 2 + 1, L + 1.4, 0.2, D2 + 2.6, '#5a3a22', { rough: 0.9 });
  // Walkway, rails, posts and a stair at each end.
  k.box(hf, 0, H - 0.22, 1.0, L + 4, 0.22, 2.0, '#9a8a72', { rough: 0.9 });
  for (let x = -L / 2 - 2; x <= L / 2 + 2.01; x += 4) k.box(hf, x, 0, 1.95, 0.2, H * 2 + 0.5, 0.2, '#6a4a2a', { rough: 0.9 });
  for (const y of [H + 0.95, H + 0.45]) k.box(hf, 0, y, 1.97, L + 4, 0.08, 0.08, '#6a4a2a', { rough: 0.9 });
  for (const s of [-1, 1]) k.stairs(hf, s * (L / 2 + 1.2), 0, 2.0 + 16 * 0.28, 1.2, H, 16, '#9a8a72', '#8a7a66', 0.28, 0, '#6a4a2a');
  k.lot(hf, 0, 9, L, 10, 0.5);
  // RV hookups in a row beyond the hotel.
  const rv = hf.sub(0, 0, 26);
  for (let i = 0; i < 10; i++) {
    const x = -L / 2 + 3 + i * 5.2;
    const g = rv.p(x, 0, 0);
    const y = k.hf.height(g.x, g.z) - rv.o.y;
    k.box(rv, x, y, 0, 0.3, 1.0, 0.2, '#6a6a68', { fx: FX.METAL });
    k.box(rv, x, y + 1.0, 0, 0.4, 0.3, 0.3, '#3a3a38', { fx: FX.METAL });
  }
}
