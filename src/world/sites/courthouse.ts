import * as THREE from 'three';
import { type Frame, FX } from '../builders';

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
