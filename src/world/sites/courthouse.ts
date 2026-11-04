import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// The Nye County Courthouse of 1905, at the head of Brougher Avenue: built when
// the county seat moved here from Belmont at the height of the boom. Two storeys
// of dressed stone, a columned portico, and a silver dome you can see from the
// mining park. County offices downstairs, the district courtroom upstairs.

const STONE = '#cbbd9e';
const STONE_DARK = '#a89a7c';
const PLASTER = '#e8e0cc';
const TRIM = '#efe8d8';
const W = 19;
const D = 24;
const L1 = 4.6;
const L2 = 9.4;
const TOP = 10.2;

/** Courthouse frame on the lobby floor: x across the front, z out toward Brougher Avenue. */
export function courthouseShell(k: Kit): Frame {
  k.seed = 60;
  const fr = k.footprint(46.8, -64.3, 24.4, 19.2, 2.83, 2, 26);
  const [lo, hi] = k.footRange(fr, -W / 2 - 1, W / 2 + 1, -D - 1, 4);
  const base = Math.max(1.2, hi + 0.2);
  const b = fr.sub(0, base, 0);
  k.block(b, -W / 2 - 1, W / 2 + 1, -D - 1, 4.5);

  k.box(b, 0, lo - base - 0.4, -D / 2 + 1.5, W + 0.6, base - lo + 0.4, D + 3.4, STONE_DARK, { rough: 1 });
  const steps = Math.max(2, Math.round(base / 0.17));
  k.stairs(b, 0, -base, 3 + steps * 0.3, 6, base, steps, STONE, STONE_DARK, 0.3);

  // Front: the doorway in the portico, tall windows either side, a pair above.
  const front: Hole[] = [{ x: 0, y: 0, w: 2.2, h: 3.4, trim: TRIM, arch: 0.5 }];
  for (const x of [-7, -3.4, 3.4, 7]) {
    front.push({ x, y: 0.9, w: 1.3, h: 2.6, glass: true, trim: TRIM });
    front.push({ x, y: L1 + 0.9, w: 1.3, h: 3.0, glass: true, trim: TRIM, arch: 0.4 });
  }
  front.push({ x: 0, y: L1 + 0.9, w: 1.6, h: 3.0, glass: true, trim: TRIM, arch: 0.5 });
  k.wall(b, -W / 2, W / 2, 0, -0.1, TOP, 0.4, STONE, PLASTER, front, { rough: 0.95 });
  k.wall(b.sub(0, 0, -D, Math.PI), -W / 2, W / 2, 0, -0.1, TOP, 0.4, STONE, PLASTER, [-6, -2, 2, 6].flatMap((x) => [
    { x, y: 0.9, w: 1.3, h: 2.6, glass: true, trim: TRIM },
    { x, y: L1 + 0.9, w: 1.3, h: 3.0, glass: true, trim: TRIM, arch: 0.4 },
  ]), { rough: 0.95 });
  for (const o of [-1, 1] as const) {
    const holes: Hole[] = [];
    for (const x of [-9, -5, -1, 3, 7, 10]) {
      holes.push({ x, y: 0.9, w: 1.3, h: 2.6, glass: true, trim: TRIM });
      holes.push({ x, y: L1 + 0.9, w: 1.3, h: 3.0, glass: true, trim: TRIM, arch: 0.4 });
    }
    k.wall(k.side(b, (o * W) / 2, -D / 2, o), -D / 2, D / 2, 0, -0.1, TOP, 0.4, STONE, PLASTER, holes, { rough: 0.95 });
  }

  // Rusticated ground floor, a belt course, quoins, the cornice and parapet.
  const ring = (y: number, h: number, out: number, color: string) => {
    k.box(b, 0, y, out / 2, W + out, h, 0.01 + out, color, { rough: 0.9 });
    k.box(b, 0, y, -D - out / 2, W + out, h, 0.01 + out, color, { rough: 0.9 });
    for (const s of [-1, 1]) k.box(b, (s * (W + out)) / 2, y, -D / 2, 0.01 + out, h, D + out * 2, color, { rough: 0.9 });
  };
  for (let y = 0.6; y < L1 - 0.2; y += 0.6) ring(y, 0.05, 0.05, STONE_DARK);
  ring(L1 - 0.1, 0.3, 0.25, TRIM);
  ring(L2 - 0.1, 0.5, 0.5, TRIM);
  ring(L2 + 0.4, 0.15, 0.7, TRIM);
  for (const sx of [-1, 1]) for (const sz of [0, -D]) for (let y = L1 + 0.2; y < L2 - 0.4; y += 0.9) k.box(b, sx * (W / 2 - 0.4), y, sz + (sz ? -0.06 : 0.06), 1.0, 0.45, 0.9, TRIM, { rough: 0.9 });
  k.box(b, 0, L2 - 0.1, -D / 2, W - 0.2, 0.02, D - 0.2, PLASTER, k.in(0.8));
  k.box(b, 0, TOP - 0.3, -D / 2, W - 0.1, 0.3, D - 0.1, '#6a6458', { rough: 0.9 });

  portico(k, b);
  dome(k, b);
  // Flagpole on the lawn and the lamp standards by the steps.
  const pole = b.sub(-W / 2 - 3, -base, 6);
  k.cyl(pole, 0, 0, 0, 0.09, 0.05, 14, '#d8d8d0', { fx: FX.METAL }, 8);
  k.sphere(pole, 0, 14.05, 0, 0.14, BRASS_GOLD, { fx: FX.METAL });
  for (let i = 0; i < 7; i++) k.box(pole, 1.05, 12.6 + i * 0.2, 0, 1.9, 0.1, 0.02, i % 2 ? '#f0f0ec' : '#b0222a', { rough: 0.6 });
  for (let i = 0; i < 6; i++) k.box(pole, 1.05, 11.4 + i * 0.2, 0, 1.9, 0.1, 0.02, i % 2 ? '#b0222a' : '#f0f0ec', { rough: 0.6 });
  k.box(pole, 0.55, 12.6, 0, 0.9, 0.75, 0.03, '#2a3a6a', { rough: 0.6 });
  for (const s of [-1, 1]) {
    const p = b.p(s * 3.6, -base, 3 + steps * 0.3 + 0.4);
    const lamp = b.sub(s * 3.6, -base, 3 + steps * 0.3 + 0.4);
    k.cyl(lamp, 0, 0, 0, 0.12, 0.07, 3.6, '#1a1a18', { fx: FX.METAL }, 8);
    k.sphere(lamp, 0, 3.85, 0, 0.3, '#fff2d0', { glow: 2.4 });
    k.light(p.clone().setY(p.y + 3.85), 1, 0.92, 0.75, 3);
  }
  k.lot(b, W / 2 + 14, -D / 2, 18, D, 0.4);
  return b;
}

const BRASS_GOLD = '#d8b060';

/** Four columns, an entablature carved with the county's name, and a pediment. */
function portico(k: Kit, b: Frame) {
  const PW = 10.4, PD = 3;
  k.box(b, 0, -0.05, PD / 2, PW, 0.05, PD, STONE, { rough: 0.9 });
  for (const x of [-4.6, -1.6, 1.6, 4.6]) {
    k.box(b, x, 0, PD - 0.4, 0.9, 0.35, 0.9, STONE_DARK, { rough: 0.9 });
    k.cyl(b, x, 0.35, PD - 0.4, 0.36, 0.3, L2 - 0.9, TRIM, { rough: 0.7 }, 16);
    k.box(b, x, L2 - 0.55, PD - 0.4, 0.85, 0.3, 0.85, TRIM, { rough: 0.8 });
    k.lamp(b, x * 0.5, L1 - 0.6, PD - 1, 3, 0.4);
  }
  for (const x of [-4.6, 4.6]) k.box(b, x, 0, 0.2, 0.7, L2 - 0.25, 0.4, TRIM, { rough: 0.8 });
  k.box(b, 0, L2 - 0.25, PD / 2, PW + 0.4, 1.0, PD + 0.4, TRIM, { rough: 0.8 });
  k.sign(b, 'courtFrieze', 0, L2 + 0.27, PD + 0.21, 0.55, 0.85);
  k.box(b, 0, L2 + 0.75, PD / 2 + 0.05, PW + 0.8, 0.2, PD + 0.6, TRIM, { rough: 0.8 });
  const tri = new THREE.Shape();
  tri.moveTo(-PW / 2 - 0.4, 0);
  tri.lineTo(PW / 2 + 0.4, 0);
  tri.lineTo(0, 2.0);
  tri.closePath();
  k.geo(b, new THREE.ExtrudeGeometry(tri, { depth: PD + 0.6, bevelEnabled: false }), 0, L2 + 0.95, -0.2, TRIM, { rough: 0.8 });
  // A clock in the tympanum.
  k.cyl(b.sub(0, L2 + 1.65, PD + 0.42, 0), 0, 0, 0, 0.45, 0.45, 0.04, '#1a1a18', { rough: 0.5 }, 18);
  k.geo(b, new THREE.CircleGeometry(0.4, 24), 0, L2 + 1.67, PD + 0.42, '#f4eedc', { glow: 1.3 });
  k.box(b, 0.1, L2 + 1.65, PD + 0.425, 0.24, 0.03, 0.01, '#1a1a18', {});
  k.box(b, 0, L2 + 1.65, PD + 0.425, 0.03, 0.32, 0.01, '#1a1a18', {});
}

/** Octagonal drum with round windows, a silver dome and a lantern on top. */
function dome(k: Kit, b: Frame) {
  const c = b.sub(0, TOP, -D / 2);
  const R = 3.6;
  k.cyl(c, 0, -0.3, 0, R + 0.6, R + 0.6, 0.6, TRIM, { rough: 0.8 }, 8);
  k.cyl(c, 0, 0.3, 0, R, R, 3.0, STONE, { rough: 0.9 }, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const face = c.sub(Math.sin(a) * R * 0.93, 0, Math.cos(a) * R * 0.93, a);
    k.box(face, 0, 0.8, 0, 1.1, 1.9, 0.12, '#2a3036', { rough: 0.3 });
    k.box(face, 0, 0.7, 0, 1.4, 0.12, 0.25, TRIM, { rough: 0.8 });
    k.box(face, 0, 2.75, 0, 1.4, 0.2, 0.25, TRIM, { rough: 0.8 });
    const pa = (i / 8) * Math.PI * 2;
    k.box(c, Math.sin(pa) * (R + 0.05), 0.3, Math.cos(pa) * (R + 0.05), 0.4, 3.0, 0.4, TRIM, { rough: 0.8 });
  }
  k.cyl(c, 0, 3.3, 0, R + 0.35, R + 0.35, 0.35, TRIM, { rough: 0.8 }, 8);
  const shell = new THREE.SphereGeometry(R, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  k.geo(c, shell, 0, 3.65, 0, '#b8bcc0', { fx: FX.METAL, rough: 0.5 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rib = new THREE.TorusGeometry(R + 0.02, 0.05, 4, 16, Math.PI / 2).rotateY(a);
    k.geo(c, rib.rotateX(0), 0, 3.65, 0, '#8a8e92', { fx: FX.METAL });
  }
  k.cyl(c, 0, 3.65 + R - 0.1, 0, 0.75, 0.75, 1.5, TRIM, { rough: 0.8 }, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    k.box(c.sub(Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72, a), 0, 3.65 + R + 0.2, 0, 0.3, 0.9, 0.06, '#2a3036', { rough: 0.3 });
  }
  k.geo(c, new THREE.SphereGeometry(0.85, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, 3.65 + R + 1.4, 0, '#b8bcc0', { fx: FX.METAL });
  k.cyl(c, 0, 3.65 + R + 2.2, 0, 0.05, 0.02, 1.4, BRASS_GOLD, { fx: FX.METAL }, 6);
  k.sphere(c, 0, 3.65 + R + 3.6, 0, 0.14, BRASS_GOLD, { fx: FX.METAL });
}

/**
 * Downstairs: a terrazzo hall from the doors to the grand stair, the Clerk and
 * Recorder's counter on one side, the Assessor and Treasurer on the other.
 */
export function courthouseOffices(k: Kit, b: Frame) {
  k.seed = 61;
  const HW = 2.4;
  for (let x = -W / 2 + 0.4; x < W / 2 - 0.4; x += 1.2) {
    for (let z = -0.4; z > -D + 0.4; z -= 1.2) {
      const odd = (Math.round(x / 1.2) + Math.round(z / 1.2)) % 2 !== 0;
      k.box(b, x + 0.6, 0, z - 0.6, 1.19, 0.02, 1.19, odd ? '#d8d0bc' : '#a8382a', k.in(0.35));
    }
  }
  // Hall walls with office doors and transoms.
  for (const s of [-1, 1] as const) {
    const wf = k.side(b, s * HW, -D / 2, -s as 1 | -1);
    const holes: Hole[] = [-6, 2].map((x) => ({ x, y: 0, w: 1.1, h: 2.4 }));
    k.wall(wf, -D / 2 + 0.4, D / 2 - 0.4, 0.1, 0, L1, 0.15, PLASTER, PLASTER, holes, k.in(0.8));
    for (const x of [-6, 2]) {
      F.door(k, wf, x - 0.5, 0, 0.15, 1.0, 2.35, 1.1, F.WOOD.oak);
      k.box(wf, x, 2.5, 0.13, 1.0, 0.5, 0.02, '#e8e4c8', k.lit(1.6));
    }
    for (let x = -D / 2 + 1; x < D / 2 - 1; x += 0.5) k.box(wf, x, 0, 0.12, 0.5, 1.0, 0.02, F.WOOD.oak, k.in(0.6));
    k.box(wf, 0, 1.0, 0.13, D - 0.8, 0.06, 0.04, F.WOOD.walnut, k.in(0.5));
  }
  for (let z = -2; z > -14; z -= 4) {
    F.chandelier(k, b, 0, L1 - 0.5, z, 0.5, 6, 6, 1.0);
  }
  // Clerk and Recorder: a long counter with a brass grille, ledgers and files.
  const clerk = b.sub(-W / 4 - 1.2, 0, -D / 2 + 1);
  k.ibox(clerk, 0, 0, 0, 0.7, 1.1, 9, F.WOOD.oak, 0.5);
  k.ibox(clerk, 0, 1.1, 0, 0.8, 0.05, 9.1, F.WOOD.walnut, 0.4);
  for (let z = -4.2; z <= 4.2; z += 0.12) k.box(clerk, 0, 1.15, z, 0.02, 0.9, 0.02, F.BRASS, k.in(0.3));
  for (const z of [-2.5, 0, 2.5]) k.ibox(clerk, 0, 1.15, z, 0.1, 0.9, 0.7, F.WOOD.walnut, 0.5);
  for (let i = 0; i < 6; i++) {
    const fz = -4 + i * 1.6;
    k.ibox(clerk, -2.5, 0, fz, 0.6, 1.4, 1.4, '#5a5a52', 0.6);
    for (let r = 0; r < 4; r++) k.box(clerk, -2.18, 0.1 + r * 0.34, fz, 0.01, 0.04, 0.2, F.BRASS, k.in(0.3));
    k.ibox(clerk, -1.3, 0, fz, 1.2, 0.76, 0.8, F.WOOD.oak, 0.6);
    for (let l = 0; l < 3; l++) k.ibox(clerk, -1.3, 0.76 + l * 0.08, fz - 0.15, 0.4, 0.07, 0.3, ['#4a1a14', '#1a2a4a', '#2a3a1a'][l], 0.7);
    F.chair(k, clerk, -1.3, 0, fz + 0.6, Math.PI, F.WOOD.oak);
  }
  k.lamp(clerk, -1.4, 3.6, -2.5, 6, 1.0);
  k.lamp(clerk, -1.4, 3.6, 2.5, 6, 1.0);
  // Assessor and Treasurer: desks with green lamps, a big safe, the county map.
  const tre = b.sub(W / 4 + 1.2, 0, -D / 2 + 1);
  for (let i = 0; i < 3; i++) {
    const tz = -3.5 + i * 3.2;
    F.table(k, tre, 0.6, 0, tz, 1.6, 0.9, F.WOOD.walnut, F.WOOD.walnut, 0.78);
    k.cyl(tre, 0.4, 0.78, tz, 0.08, 0.08, 0.3, F.BRASS, k.in(0.3), 6);
    k.geo(tre, new THREE.CylinderGeometry(0.08, 0.2, 0.14, 10, 1, true), 0.4, 1.12, tz, '#1a6a3a', k.lit(1.8));
    k.lamp(tre, 0.4, 1.0, tz, 2.0, 0.5, '#d8f0c0');
    F.chair(k, tre, 0.6, 0, tz - 0.8, 0, F.WOOD.walnut, '#3a2a1a');
  }
  const safe = tre.sub(2.6, 0, 4);
  k.ibox(safe, 0, 0, 0, 1.0, 1.9, 1.0, '#2a3a2a', 0.4);
  k.box(safe, -0.51, 0.3, 0, 0.02, 1.3, 0.8, '#3a4a3a', k.in(0.3));
  k.cyl(safe.sub(-0.53, 1.1, 0, -Math.PI / 2), 0, 0, 0, 0.12, 0.12, 0.04, F.BRASS, k.in(0.3), 12);
  k.box(safe, -0.52, 1.6, 0, 0.01, 0.15, 0.6, F.BRASS, k.in(0.3));
  F.picture(k, b, W / 2 - 0.45, 1.8, -D / 2 - 6, 2.4, 1.6, -Math.PI / 2, 61, F.WOOD.walnut);
  k.lamp(tre, 0.6, 3.6, -1, 6, 1.0);
  k.lamp(tre, 0.6, 3.6, 3, 6, 1.0);
  // The grand stair up the back of the hall.
  k.stairs(b, 0, 0, -14.6, 2.2, L1, 27, '#8a5a32', '#6a4428', 0.28, 0, F.WOOD.walnut);
  for (const s of [-1, 1]) k.cyl(b, s * 1.2, 0, -14.4, 0.09, 0.09, 1.2, F.WOOD.walnut, k.in(0.5), 8);
  F.picture(k, b, 0, 2.6, -D + 0.45, 1.4, 1.8, 0, 62);
}

/**
 * Upstairs: the district courtroom across the front of the building, under a
 * coffered ceiling, with the judge's bench, the jury box, the witness stand and
 * the public gallery behind the bar.
 */
export function courtroom(k: Kit, b: Frame) {
  k.seed = 62;
  const y = L1;
  // Floor slab with the stair well cut out.
  const sx1 = 1.3, sz0 = -22.2, sz1 = -14.4, x1 = W / 2 - 0.2;
  k.slab(b, 0, y, (sz1 - 0.2) / 2, 2 * x1, -0.2 - sz1, '#6a4a30', PLASTER);
  k.slab(b, 0, y, (sz0 - D + 0.2) / 2, 2 * x1, sz0 + D - 0.2, '#6a4a30', PLASTER);
  for (const s of [-1, 1]) k.slab(b, (s * (x1 + sx1)) / 2, y, (sz0 + sz1) / 2, x1 - sx1, sz1 - sz0, '#6a4a30', PLASTER);
  for (const s of [-1, 1]) k.box(b, s * sx1, y, (sz0 + sz1) / 2, 0.06, 1.0, sz1 - sz0, F.WOOD.walnut, k.in(0.5));

  const ct = b.sub(0, y, 0);
  const CD2 = 14;
  // Partition behind the bench, with doors to chambers.
  k.wall(ct.sub(0, 0, -CD2), -W / 2 + 0.4, W / 2 - 0.4, 0, 0, L2 - L1, 0.2, '#d8ccb0', '#d8ccb0', [{ x: -6, y: 0, w: 1.1, h: 2.4 }, { x: 6, y: 0, w: 1.1, h: 2.4 }], k.in(0.8));
  for (let x = -W / 2 + 0.6; x < W / 2 - 0.4; x += 0.6) k.box(ct, x, 0, -0.45, 0.58, 1.2, 0.02, F.WOOD.oak, k.in(0.6));
  // Wainscot round the room.
  for (const s of [-1, 1]) k.box(ct, s * (W / 2 - 0.42), 0, -CD2 / 2, 0.03, 1.2, CD2, F.WOOD.oak, k.in(0.6));
  k.box(ct, 0, 0, -CD2 + 0.12, W - 0.8, 1.2, 0.03, F.WOOD.oak, k.in(0.6));

  // The bench: a raised dais and a panelled desk, the seal and flags behind.
  const bench = ct.sub(0, 0, -CD2 + 0.2);
  k.ibox(bench, 0, 0, 1.5, 6, 0.45, 3, F.WOOD.walnut, 0.6);
  k.ibox(bench, 0, 0.45, 2.6, 4.4, 1.15, 0.6, F.WOOD.mahogany, 0.4);
  k.ibox(bench, 0, 1.6, 2.6, 4.6, 0.06, 0.8, F.WOOD.walnut, 0.4);
  for (let x = -1.9; x <= 1.9; x += 0.95) k.box(bench, x, 0.6, 2.91, 0.7, 0.85, 0.02, F.WOOD.walnut, k.in(0.5));
  F.armchair(k, bench, 0, 0.45, 1.4, 0, '#2a1410', F.WOOD.walnut);
  k.ibox(bench, 0, 0.45, 1.3, 0.8, 1.6, 0.12, '#2a1410', 0.6);
  k.sign(bench, 'nyeSeal', 0, 3.1, 0.06, 1.3, 0.7, FX.INTERIOR);
  k.cyl(bench, 0.5, 1.66, 2.5, 0.05, 0.05, 0.05, F.WOOD.walnut, k.in(0.5), 8);
  k.ibox(bench, 0.5, 1.71, 2.5, 0.08, 0.06, 0.2, F.WOOD.walnut, 0.5);
  for (const s of [-1, 1]) {
    const pf = bench.sub(s * 2.6, 0.45, 0.4);
    k.cyl(pf, 0, 0, 0, 0.03, 0.03, 2.4, F.BRASS, k.in(0.3), 6);
    k.sphere(pf, 0, 2.45, 0, 0.06, F.BRASS, k.in(0.3));
    for (let i = 0; i < 5; i++) k.box(pf, 0.45, 1.5 + i * 0.16, 0, 0.8, 0.16, 0.02, s < 0 ? (i % 2 ? '#f0f0ec' : '#b0222a') : '#1a2a5a', k.in(0.7));
  }
  // Witness stand to the judge's right, clerk's desk below.
  const wit = bench.sub(3.6, 0, 2.4);
  k.ibox(wit, 0, 0, 0, 1.4, 0.3, 1.4, F.WOOD.walnut, 0.6);
  k.ibox(wit, 0, 0.3, 0.65, 1.4, 0.8, 0.1, F.WOOD.mahogany, 0.4);
  F.chair(k, wit, 0, 0.3, -0.1, 0, F.WOOD.walnut, '#2a1410');
  F.table(k, bench, -3.8, 0, 3.6, 1.6, 0.8, F.WOOD.walnut, F.WOOD.walnut, 0.78);
  F.chair(k, bench, -3.8, 0, 3.0, 0, F.WOOD.walnut);
  // Jury box along the east wall: two rows of six behind a rail.
  const jury = ct.sub(W / 2 - 2.0, 0, -7.5, -Math.PI / 2);
  k.ibox(jury, 0, 0, -0.3, 5.6, 0.3, 1.2, F.WOOD.walnut, 0.6);
  k.ibox(jury, 0, 0, 1.0, 5.6, 0.95, 0.1, F.WOOD.mahogany, 0.4);
  for (const x of [-5.6 / 2, 5.6 / 2]) k.ibox(jury, x, 0, 0, 0.1, 0.95, 2.0, F.WOOD.mahogany, 0.4);
  for (let i = 0; i < 6; i++) {
    F.chair(k, jury, -2.3 + i * 0.92, 0, 0.4, Math.PI, F.WOOD.oak, '#3a2a1a');
    F.chair(k, jury, -2.3 + i * 0.92, 0.3, -0.5, Math.PI, F.WOOD.oak, '#3a2a1a');
  }
  // Counsel tables, the bar rail with its gate, and the gallery pews.
  for (const s of [-1, 1]) {
    F.table(k, ct, s * 2.6, 0, -7.6, 2.4, 1.0, F.WOOD.oak, F.WOOD.oak, 0.78);
    for (const dx of [-0.6, 0.6]) F.chair(k, ct, s * 2.6 + dx, 0, -6.9, Math.PI, F.WOOD.oak, '#3a2a1a');
    k.ibox(ct, s * 2.6 - 0.5, 0.78, -7.7, 0.3, 0.04, 0.4, '#f4f0e0', 0.7);
  }
  for (const s of [-1, 1]) {
    k.ibox(ct, s * 4.9, 0, -5.4, W / 2 - 0.4 - 1.0, 0.95, 0.08, F.WOOD.mahogany, 0.4);
    for (let x = 1.2; x < W / 2 - 0.4; x += 0.25) k.box(ct, s * x, 0, -5.4, 0.04, 0.95, 0.04, F.WOOD.walnut, k.in(0.5));
  }
  for (let r = 0; r < 4; r++) {
    for (const s of [-1, 1]) {
      const pz = -4.2 + r * 1.0;
      k.ibox(ct, s * 4.6, 0, pz, 6.2, 0.45, 0.45, F.WOOD.oak, 0.6);
      k.ibox(ct, s * 4.6, 0.45, pz + 0.22, 6.2, 0.55, 0.06, F.WOOD.oak, 0.6);
      for (const e of [-3.1, 3.1]) k.ibox(ct, s * 4.6 + e, 0, pz, 0.08, 0.95, 0.5, F.WOOD.walnut, 0.5);
    }
  }
  // Coffered ceiling, chandeliers, tall windows' light, portraits of the judges.
  const ch = L2 - L1;
  for (let x = -W / 2 + 0.4; x <= W / 2 - 0.4; x += 2.4) k.box(ct, x, ch - 0.35, -CD2 / 2, 0.25, 0.35, CD2, '#e8e0cc', k.in(0.8));
  for (let z = -0.4; z >= -CD2; z -= 2.4) k.box(ct, 0, ch - 0.35, z, W - 0.8, 0.35, 0.25, '#e8e0cc', k.in(0.8));
  for (const z of [-3.5, -9.5]) F.chandelier(k, ct, 0, ch - 1.2, z, 0.8, 8, 9, 1.6);
  for (const s of [-1, 1]) for (const z of [-2.5, -5.5, -11]) F.picture(k, ct, s * (W / 2 - 0.45), 2.4, z, 0.8, 1.1, (-s * Math.PI) / 2, 63 + z, '#c49a4a');

  // Chambers behind: the judge's desk and law books.
  const cham = ct.sub(-5, 0, -CD2 - 2.5);
  F.table(k, cham, 0, 0, 0, 1.8, 0.9, F.WOOD.walnut, F.WOOD.walnut, 0.78);
  F.armchair(k, cham, 0, 0, -0.9, 0, '#2a1410');
  for (let r = 0; r < 5; r++) for (let i = 0; i < 16; i++) k.ibox(cham, -2.2 + i * 0.14, 0.2 + r * 0.42, -4.6, 0.12, 0.32, 0.25, ['#5a1a14', '#1a2a4a', '#3a2a14', '#2a3a1a'][(i + r) % 4], 0.7);
  k.ibox(cham, -1.1, 0, -4.8, 2.4, 2.3, 0.1, F.WOOD.walnut, 0.6);
  k.lamp(cham, 0, 3.4, -2, 6, 1.0);
}
