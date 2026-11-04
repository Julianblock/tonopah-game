import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// The Belvada: the State Bank & Trust building of 1906, four storeys of red brick
// over a granite banking hall, empty for decades and reopened as a hotel. The
// old vault still stands open at the back of the lobby bar.

const GRANITE = '#9a968c';
const BRICK = '#8a3e2c';
const TRIM = '#d8ccb0';
const PLASTER = '#e8dcc4';
const W = 16.8;
const D = 31.8;
const LV = [0, 4.8, 8.4, 12.0];
const TOP = 15.6;

/** Belvada frame on the banking-hall floor: x across the Main Street front, z out toward the street. */
export function belvadaShell(k: Kit): Frame {
  k.seed = 80;
  const fr = k.footprint(-95.8, 12.6, 31.8, 16.8, 2.84, 3, 20);
  const [lo, hi] = k.footRange(fr, -W / 2, W / 2, -D, 0);
  const base = Math.max(0.2, hi + 0.15);
  const b = fr.sub(0, base, 0);
  k.block(b, -W / 2 - 0.5, W / 2 + 0.5, -D - 0.5, 3);
  k.box(b, 0, lo - base - 0.4, -D / 2, W + 0.3, base - lo + 0.4, D + 0.3, GRANITE, { rough: 1 });
  const steps = Math.max(1, Math.round(base / 0.17));
  k.stairs(b, 0, -base, steps * 0.3, 2.6, base, steps, GRANITE, GRANITE, 0.3);

  // Granite banking-hall storey under three of brick, cut by the same openings.
  const wall = (f: Frame, x0: number, x1: number, holes: Hole[]) => {
    k.wall(f, x0, x1, 0, -0.1, LV[1], 0.4, GRANITE, PLASTER, holes, { rough: 0.95 });
    k.wall(f, x0, x1, 0, LV[1], TOP, 0.4, BRICK, PLASTER, holes, { rough: 0.95 });
  };
  const upper = (holes: Hole[], xs: number[]) => {
    for (let fl = 1; fl < 4; fl++) for (const x of xs) holes.push({ x, y: LV[fl] + 0.8, w: 1.15, h: 2.0, glass: true, trim: TRIM, arch: fl === 3 ? 0.5 : 0 });
    return holes;
  };
  const front = upper([
    { x: 0, y: 0, w: 2.0, h: 3.4, trim: TRIM, arch: 0.6 },
    { x: -5, y: 0.6, w: 3.6, h: 3.4, glass: true, trim: TRIM, arch: 1.0 },
    { x: 5, y: 0.6, w: 3.6, h: 3.4, glass: true, trim: TRIM, arch: 1.0 },
  ], [-6.2, -3.8, -1.2, 1.2, 3.8, 6.2]);
  wall(b, -W / 2, W / 2, front);
  wall(b.sub(0, 0, -D, Math.PI), -W / 2, W / 2, upper([{ x: 4, y: 0, w: 1.2, h: 2.4, trim: TRIM }], [-5, 0, 5]));
  for (const o of [-1, 1] as const) {
    const holes: Hole[] = [];
    for (const x of [-11.5, -5.5, 0.5]) holes.push({ x, y: 0.6, w: 3.0, h: 3.4, glass: true, trim: TRIM, arch: 0.9 });
    upper(holes, [-13.5, -10.5, -6.0, -3.0, 1.5, 4.5, 9, 12]);
    wall(k.side(b, (o * W) / 2, -D / 2, o), -D / 2, D / 2, holes);
  }
  // Rusticated joints, belt courses, the corbelled cornice and parapet.
  const ring = (y: number, h: number, out: number, color: string) => {
    k.box(b, 0, y, out / 2, W + out, h, out + 0.01, color, { rough: 0.9 });
    k.box(b, 0, y, -D - out / 2, W + out, h, out + 0.01, color, { rough: 0.9 });
    for (const s of [-1, 1]) k.box(b, (s * (W + out)) / 2, y, -D / 2, out + 0.01, h, D + out * 2, color, { rough: 0.9 });
  };
  for (const y of [0.3, 3.9]) ring(y, 0.05, 0.05, '#7a766c');
  ring(LV[1] - 0.3, 0.3, 0.3, TRIM);
  ring(LV[3] - 0.05, 0.15, 0.12, TRIM);
  ring(TOP - 0.6, 0.6, 0.35, TRIM);
  for (let i = 0; i < 4; i++) ring(TOP - 0.9 - i * 0.12, 0.1, 0.06 + i * 0.07, BRICK);
  ring(TOP, 0.9, 0.06, BRICK);
  ring(TOP + 0.9, 0.12, 0.2, TRIM);
  k.sign(b, 'belvadaBand', 0, LV[1] - 0.75, 0.08, 0.45, 0.8);
  k.box(b, 0, TOP - 0.25, -D / 2, W - 0.2, 0.25, D - 0.2, '#5a544c', { rough: 0.9 });
  k.box(b, 0, TOP - 0.3, -D / 2, W - 0.8, 0.05, D - 0.8, PLASTER, k.in(0.8));

  // The blade sign on the corner, iron brackets and a lamp either side of the door.
  const blade = b.sub(W / 2 - 0.4, 0, 0.9, Math.PI / 2);
  k.box(b, W / 2 - 0.4, LV[1] + 0.2, 0.2, 0.1, 0.1, 1.6, '#1a1a18', { fx: FX.METAL });
  k.box(b, W / 2 - 0.4, LV[1] + 4.2, 0.2, 0.1, 0.1, 1.6, '#1a1a18', { fx: FX.METAL });
  k.sign(blade, 'belvadaBlade', 0, LV[1] + 2.25, 0, 4.2, 1.6, FX.NEON, 0, true);
  for (const s of [-1, 1]) {
    k.sphere(b, s * 1.5, 2.9, 0.35, 0.18, '#fff0d0', { glow: 2.2 });
    k.light(b.p(s * 1.5, 2.9, 0.4), 1, 0.9, 0.7, 2);
  }
  return b;
}

/**
 * The banking hall as the hotel lobby bar: marble floor, the tellers' cages now
 * the back bar, leather club chairs, and the walk-in vault with its round door
 * swung open.
 */
export function belvadaLobby(k: Kit, b: Frame) {
  k.seed = 81;
  for (let x = -W / 2 + 0.4; x < W / 2 - 0.4; x += 0.8) {
    for (let z = -0.4; z > -D + 0.4; z -= 0.8) {
      const odd = (Math.round(x / 0.8) + Math.round(z / 0.8)) % 2 !== 0;
      k.box(b, x + 0.4, 0, z - 0.4, 0.79, 0.02, 0.79, odd ? '#e8e4dc' : '#2a2a2a', k.in(0.25));
    }
  }
  F.tinCeiling(k, b, 0, LV[1] - 0.32, -D / 2, W - 0.6, D - 0.6, '#d8ccac');
  // Bar along the east wall behind the old brass teller grilles.
  const bar = k.side(b, W / 2 - 0.3, -D / 2, 1).sub(0, 0, -0.1, Math.PI);
  F.bar(k, bar, 2, 0, 2.0, 12, 0, F.WOOD.mahogany, 1.6);
  for (let x = -3.6; x <= 7.6; x += 0.1) k.box(bar, x, 1.2, 2.0, 0.015, 1.1, 0.015, F.BRASS, k.in(0.3));
  for (const x of [-3.6, 0.2, 4, 7.8]) k.ibox(bar, x, 1.2, 2.0, 0.2, 1.2, 0.2, F.WOOD.mahogany, 0.4);
  k.ibox(bar, 2, 2.4, 2.0, 11.6, 0.2, 0.24, F.WOOD.mahogany, 0.4);
  // Club chairs round low tables under the arched windows.
  for (const z of [-4.5, -10.5, -16.5]) {
    const t = b.sub(-W / 2 + 3, 0, z);
    F.roundTable(k, t, 0, 0, 0, 0.45, F.WOOD.walnut, 0.5);
    F.armchair(k, t, -0.9, 0, 0, Math.PI / 2, '#5a2a18');
    F.armchair(k, t, 0.9, 0, 0, -Math.PI / 2, '#5a2a18');
    F.armchair(k, t, 0, 0, 0.9, Math.PI, '#5a2a18');
    k.lamp(t, 0, 2.5, 0, 4, 0.7);
  }
  F.rug(k, b, -W / 2 + 3, 0.02, -10.5, 3.6, 15, '#4a1a14', '#c49a4a');
  for (const z of [-3, -9, -15, -21]) F.chandelier(k, b, 0, LV[1] - 1.1, z, 0.6, 8, 7, 1.2);
  F.piano(k, b, -W / 2 + 2.2, 0, -21.5, Math.PI / 2);
  // Front desk and the vault at the back.
  F.bar(k, b.sub(-2, 0, -24, 0), 0, 0, 0, 4, 0, F.WOOD.walnut, 0.8, false);
  const v = b.sub(3, 0, -D + 0.3);
  k.ibox(v, 0, 0, 1.0, 4.4, 3.2, 2.0, '#4a4a46', 0.4);
  k.ibox(v, 0, 0, 2.02, 2.0, 2.4, 0.04, '#0a0a0a', 0.9);
  k.ibox(v, 0, 2.5, 2.02, 2.6, 0.5, 0.06, F.BRASS, 0.3);
  // The round door, a foot of steel, swung back on its hinge.
  const door = v.sub(1.2, 1.2, 2.4, 1.9);
  k.geo(door, new THREE.CylinderGeometry(1.15, 1.15, 0.45, 28).rotateX(Math.PI / 2), -1.15, 0, 0, '#8a8a84', k.in(0.3));
  k.geo(door, new THREE.TorusGeometry(0.5, 0.04, 6, 20), -1.15, 0, 0.3, F.BRASS, k.in(0.3));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.box(door, -1.15 + Math.cos(a) * 0.25, Math.sin(a) * 0.25 - 0.02, 0.28, 0.04, 0.04, 0.08, F.BRASS, k.in(0.3));
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    k.cyl(door.sub(-1.15 + Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.24, 0), 0, 0, 0, 0.06, 0.06, 0.05, '#c8c8c0', k.in(0.3), 8);
  }
  k.ibox(door, 0, -1.2, -0.2, 0.25, 2.4, 0.4, '#5a5a56', 0.4);
  // Inside: safe-deposit boxes floor to ceiling.
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) k.box(v, -1.95 + c * 0.39 + 0.2, 0.2 + r * 0.36, 0.1, 0.36, 0.33, 0.02, (r + c) % 3 ? '#b8a878' : '#a89868', k.in(0.3));
  k.lamp(v, 0, 2.2, 1.8, 4, 0.6);
  k.lamp(b, 0, 3.8, -6, 8, 0.8);
}
