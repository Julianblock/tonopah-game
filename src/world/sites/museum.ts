import { type Frame, FX } from '../builders';
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
