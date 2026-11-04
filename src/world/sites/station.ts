import * as THREE from 'three';
import { type Frame, FX } from '../builders';
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

