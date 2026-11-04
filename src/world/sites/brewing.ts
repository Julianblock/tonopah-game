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

/**
 * Inside: the bar and its tap wall, long tables under Edison bulbs, and the
 * brewhouse behind the glass: mash tun, kettle and a row of conical fermenters.
 */
export function brewingHall(k: Kit, b: Frame) {
  k.seed = 101;
  for (let x = -W / 2 + 0.3; x < W / 2 - 0.3; x += 2) k.box(b, x + 1, 0, -D / 2, 1.98, 0.02, D - 0.6, (Math.round(x) % 4 === 0) ? '#7a7672' : '#726e6a', k.in(0.4));
  // Bar along the back wall with the tap tower and the chalkboard.
  const bar = b.sub(-9, 0, -D + 0.3, 0);
  F.bar(k, bar, 0, 0, 2.2, 10, 0, '#3a2a1e', 1.8);
  for (let i = 0; i < 12; i++) {
    const x = -3.3 + i * 0.6;
    k.cyl(bar, x, 1.15, 2.0, 0.025, 0.025, 0.35, '#c8c8c8', k.in(0.2), 6);
    k.ibox(bar, x, 1.45, 2.06, 0.06, 0.18, 0.06, ['#d88a2a', '#1a1a1a', '#e8c860', '#8a2a1a', '#c84a6a', '#3a2a1a'][i % 6], 0.5);
  }
  k.ibox(bar, 0.3, 1.1, 2.0, 7.6, 0.1, 0.2, '#c8c8c8', 0.2);
  k.sign(bar, 'tapBoard', 0, 2.9, 0.05, 1.6, 1.0, FX.INTERIOR);
  // Long tables and benches.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const t = b.sub(-14 + i * 4.4, 0, -4 - j * 4.5);
      k.ibox(t, 0, 0.74, 0, 0.9, 0.06, 3.2, F.WOOD.oak, 0.7);
      for (const z of [-1.3, 1.3]) k.ibox(t, 0, 0, z, 0.08, 0.74, 0.7, '#1a1a1a', 0.4);
      for (const s of [-0.7, 0.7]) k.ibox(t, s, 0.44, 0, 0.32, 0.05, 3.0, F.WOOD.oak, 0.7);
      for (let n = 0; n < 3; n++) {
        k.cyl(t, 0, H - 1.2 - n * 0.02, -1 + n, 0.06, 0.06, 0.1, '#ffd890', k.lit(2.6), 8);
        k.cyl(t, 0, H - 1.1, -1 + n, 0.005, 0.005, 1.1, '#1a1a1a', k.in(0.5), 3);
      }
      k.lamp(t, 0, H - 1.4, 0, 6, 1.5, '#ffb870');
    }
  }
  // Glass wall to the brewhouse.
  const glassX = 4.2;
  for (const z of [-0.3, -4, -8, -12, -15.7]) k.ibox(b, glassX, 0, z, 0.12, H - 0.2, 0.12, '#1a1a1a', 0.4);
  k.ibox(b, glassX, H - 1.3, -D / 2, 0.12, 0.12, D - 0.6, '#1a1a1a', 0.4);
  for (const z of [-2, -6, -10, -14]) k.pane(b.sub(glassX, 0, z, Math.PI / 2), 0, 2.35, 0, 3.7, 4.7);
  k.box(b, glassX, 0, -D / 2, 0.12, 0.3, D - 0.6, '#1a1a1a', k.in(0.4));
  // Brewhouse: kettles on a platform, fermenters in a row along the window.
  const bh = b.sub(10.5, 0, -D / 2);
  for (let x = -6; x <= 6; x += 2) for (let z = -7; z <= 7; z += 2) k.box(bh, x, 0, z, 1.98, 0.02, 1.98, '#9aa0a2', k.in(0.3));
  k.ibox(bh, -3.5, 0, -4.5, 4.8, 0.9, 3.2, '#4a4e50', 0.4);
  for (const x of [-4.8, -2.2]) {
    k.cyl(bh, x, 0.9, -4.5, 0.9, 0.9, 1.8, '#c8ccd0', k.in(0.15), 18);
    k.geo(bh, new THREE.SphereGeometry(0.9, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), x, 2.7, -4.5, '#c8ccd0', k.in(0.15));
    k.cyl(bh, x, 3.5, -4.5, 0.12, 0.12, 1.2, '#c8ccd0', k.in(0.15), 8);
  }
  for (let i = 0; i < 5; i++) {
    const x = -4.4 + i * 2.2, z = 3.6;
    k.geo(bh, new THREE.ConeGeometry(0.7, 0.9, 16).rotateX(Math.PI), x, 1.05, z, '#d0d4d8', k.in(0.12));
    k.cyl(bh, x, 1.5, z, 0.7, 0.7, 2.6, '#d0d4d8', k.in(0.12), 16);
    k.geo(bh, new THREE.SphereGeometry(0.7, 16, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1), x, 4.1, z, '#d0d4d8', k.in(0.12));
    for (let a = 0; a < 3; a++) {
      const ang = (a / 3) * Math.PI * 2;
      k.cyl(bh, x + Math.cos(ang) * 0.6, 0, z + Math.sin(ang) * 0.6, 0.04, 0.04, 1.5, '#a0a4a8', k.in(0.2), 6);
    }
    k.ibox(bh, x, 1.8, z + 0.71, 0.4, 0.3, 0.02, '#e8e4d8', 0.6);
  }
  k.ibox(bh, 4.6, 0, -5.5, 1.2, 1.2, 1.2, '#2a5a8a', 0.5);
  for (let i = 0; i < 10; i++) k.cyl(bh, 3.6 + (i % 5) * 0.55, 0 + Math.floor(i / 5) * 0.62, -2.5, 0.27, 0.27, 0.6, '#b8bcc0', k.in(0.2), 12);
  for (const z of [-4, 2]) {
    k.lamp(bh, 0, H - 0.8, z, 7, 1.2, '#e8f0ff');
    k.box(bh, 0, H - 0.3, z, 4, 0.06, 0.3, '#f4f8ff', k.lit(2.4));
  }
}
