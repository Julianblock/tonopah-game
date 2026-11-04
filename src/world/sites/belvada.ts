import { type Frame, FX } from '../builders';
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
