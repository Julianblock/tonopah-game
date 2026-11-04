import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// Tonopah Brewing Co. on Main Street: a steel-sided brewpub with the brewhouse
// behind glass, long tables, a bar of taps, and the barbecue smoker going on
// the patio.

const STEEL = '#5a5e60';
const CORTEN = '#7a4a2e';
const PLASTER = '#d8ccb4';
const W = 34;
const D = 16;
const H = 6;

/** Brewpub frame on its floor: x along Main Street, z out toward the street. */
export function brewingShell(k: Kit): Frame {
  k.seed = 100;
  const fr = k.footprint(126.4, 219.6, 37.3, 18.3, 0.67, 1, 24);
  const [lo, hi] = k.footRange(fr, -W / 2, W / 2, -D, 0);
  const base = Math.max(0.2, hi + 0.15);
  const b = fr.sub(0, base, 0);
  k.block(b, -W / 2 - 1, W / 2 + 6, -D - 1, 3);
  k.box(b, 0, lo - base - 0.3, -D / 2, W + 0.4, base - lo + 0.3, D + 0.4, '#6a6660', { rough: 1 });

  const front: Hole[] = [{ x: -6, y: 0, w: 2.2, h: 2.6, glass: true, trim: '#1a1a1a' }];
  for (const x of [-13, -9.5, -2.5, 1]) front.push({ x, y: 0.5, w: 3.0, h: 3.0, glass: true, trim: '#1a1a1a' });
  front.push({ x: 9.5, y: 0.3, w: 11, h: 4.8, glass: true, trim: '#1a1a1a' });
  k.wall(b, -W / 2, W / 2, 0, -0.1, H, 0.3, STEEL, PLASTER, front, { fx: FX.METAL, rough: 0.8 });
  k.wall(b.sub(0, 0, -D, Math.PI), -W / 2, W / 2, 0, -0.1, H, 0.3, STEEL, PLASTER, [{ x: -10, y: 0, w: 3.6, h: 3.6, trim: '#1a1a1a' }], { fx: FX.METAL, rough: 0.8 });
  for (const o of [-1, 1] as const) {
    const holes: Hole[] = o > 0 ? [{ x: 0, y: 0, w: 2.2, h: 2.6, glass: true, trim: '#1a1a1a' }] : [];
    k.wall(k.side(b, (o * W) / 2, -D / 2, o), -D / 2, D / 2, 0, -0.1, H, 0.3, STEEL, PLASTER, holes, { fx: FX.METAL, rough: 0.8 });
  }
  // Ribbed siding, a corten band at the base, the shed roof and its parapet.
  for (let x = -W / 2; x <= W / 2; x += 0.3) k.box(b, x, 0.9, 0.01, 0.05, H - 0.9, 0.03, '#4a4e50', { fx: FX.METAL });
  k.box(b, 0, -0.1, 0.03, W, 0.6, 0.04, CORTEN, { fx: FX.METAL });
  k.box(b, 0, H, -D / 2, W + 0.6, 0.3, D + 0.6, '#3a3c3e', { fx: FX.METAL });
  k.box(b, 0, H - 0.1, -D / 2, W - 0.4, 0.06, D - 0.4, '#8a6a4a', k.in(0.8));
  k.sign(b, 'brewingSign', -6, H - 1.0, 0.2, 1.6, 1.5, FX.NEON);
  for (const x of [-14, -8, 2, 12]) {
    k.box(b, x, 3.4, 0.25, 0.4, 0.12, 0.5, '#1a1a1a', { fx: FX.METAL });
    k.light(b.p(x, 3.3, 0.45), 1, 0.8, 0.5, 1.8);
  }
  // Patio with string lights, picnic tables and the smoker.
  const patio = b.sub(W / 2 + 3.5, 0, -D / 2);
  k.box(patio, 0, -0.05, 0, 6.5, 0.05, D, '#8a8478', { rough: 1 });
  for (const z of [-D / 2 + 0.3, D / 2 - 0.3]) k.box(patio, 0, 0, z, 6.5, 1.1, 0.1, CORTEN, { fx: FX.METAL });
  for (const z of [-5, -1, 3]) {
    k.box(patio, 0, 0.72, z, 2.2, 0.06, 0.8, F.WOOD.pine, { rough: 0.9 });
    for (const s of [-0.65, 0.65]) k.box(patio, 0, 0.42, z + s, 2.2, 0.05, 0.3, F.WOOD.pine, { rough: 0.9 });
    for (const sx of [-0.9, 0.9]) k.box(patio, sx, 0, z, 0.08, 0.72, 1.6, F.WOOD.pine, { rough: 0.9 });
  }
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const z = -D / 2 + t * D;
    const y = 3.2 - Math.sin(t * Math.PI) * 0.5;
    k.sphere(patio, 3.0, y, z, 0.06, '#ffe0a0', { glow: 2.6 });
    k.sphere(patio, -3.0, y, z, 0.06, '#ffe0a0', { glow: 2.6 });
  }
  for (const z of [-D / 2, D / 2]) k.cyl(patio, 3.0, 0, z, 0.06, 0.06, 3.3, '#2a2a2a', { fx: FX.METAL }, 6);
  k.light(patio.p(0, 3, 0), 1, 0.85, 0.6, 3);
  const smoker = patio.sub(1.5, 0, 6.2);
  k.geo(smoker, new THREE.CylinderGeometry(0.55, 0.55, 2.4, 16).rotateZ(Math.PI / 2), 0, 1.15, 0, '#1a1a18', { fx: FX.METAL });
  k.cyl(smoker, 1.4, 0.6, 0, 0.45, 0.45, 1.1, '#1a1a18', { fx: FX.METAL }, 12);
  k.cyl(smoker, -1.0, 1.5, 0, 0.1, 0.1, 1.4, '#1a1a18', { fx: FX.METAL }, 8);
  for (const x of [-0.9, 0.9]) k.box(smoker, x, 0, 0, 0.08, 0.7, 0.9, '#2a2a28', { fx: FX.METAL });
  return b;
}
