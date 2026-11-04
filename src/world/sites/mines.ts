import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import type { Hole, Kit } from '../kit';

// The headframes over Tonopah's silver shafts, on the hills above Main Street
// where Jim Butler staked the Mizpah claim in 1900. Timber gallows frames on
// the small shafts, riveted steel on the big producers, each with its sheave
// wheel, its hoist house and the cable running between them.

const TIMBER = '#5a4430';
const TIMBER_LIGHT = '#7a5e42';
const STEEL = '#5a3a2a';
const TIN = '#8a8478';
const RUST = '#6a4a36';
const ROOF = '#6e665c';

type Style = 'timber' | 'steel';

interface Shaft {
  name: string;
  x: number;
  z: number;
  /** Direction from the shaft to its hoist house. */
  yaw: number;
  h: number;
  style: Style;
}

// Mapped shafts, plus the Mizpah and Silver Top in the mining park.
const SHAFTS: Shaft[] = [
  { name: 'desertQueen', x: 578, z: -219, yaw: 2.6, h: 14, style: 'timber' },
  { name: 'mizpahShaft', x: 492, z: -262, yaw: 0.4, h: 18, style: 'steel' },
  { name: 'silverTop', x: 445, z: -318, yaw: -0.8, h: 24, style: 'steel' },
  { name: 'redPlume', x: 157, z: -245, yaw: 1.2, h: 12, style: 'timber' },
  { name: 'belmont', x: 1083, z: -400, yaw: 3.6, h: 28, style: 'steel' },
  { name: 'montana', x: 372, z: -425, yaw: 2.0, h: 16, style: 'steel' },
  { name: 'northStar', x: 554, z: -470, yaw: -2.2, h: 11, style: 'timber' },
  { name: 'gypsyQueen', x: 303, z: -461, yaw: 0.9, h: 10, style: 'timber' },
  { name: 'sieber', x: 208, z: -295, yaw: -1.4, h: 10, style: 'timber' },
  { name: 'midway', x: -38, z: -461, yaw: 1.7, h: 13, style: 'timber' },
  { name: 'acenith', x: 1034, z: -585, yaw: 0.3, h: 12, style: 'timber' },
  { name: 'mizpahExt', x: 1098, z: -788, yaw: -0.5, h: 15, style: 'steel' },
  { name: 'tonopahExt', x: -599, z: -554, yaw: 2.4, h: 20, style: 'steel' },
  { name: 'goldenAnchor', x: -534, z: -807, yaw: -2.8, h: 12, style: 'timber' },
  { name: 'westEnd', x: -841, z: -226, yaw: 1.1, h: 11, style: 'timber' },
];

/** The headframes, hoist houses and ore bins on the mine shafts around town; returns the hoist house frames. */
export function mines(k: Kit): Frame[] {
  return SHAFTS.map((s, i) => {
    k.seed = 70 + i;
    const fr = k.frame(s.x, s.z, Math.sin(s.yaw), Math.cos(s.yaw), s.h + 10);
    const lo = Math.min(...[-3, 3].flatMap((x) => [-3, 3].map((z) => k.footRange(fr, x, x, z, z)[0])));
    const top = s.style === 'steel' ? steelFrame(k, fr, s.h, lo) : timberFrame(k, fr, s.h, lo);
    collar(k, fr, lo, top);
    const back = -(s.h * 0.8 + 7);
    const house = hoistHouse(k, fr, back, top, s.h > 15 ? 1.4 : 1);
    oreBin(k, fr, s.h, lo);
    k.block(fr, -4, 4, back - 10, 4);
    return house;
  });
}

/** Timber gallows frame with back braces; returns the sheave hub height. */
function timberFrame(k: Kit, fr: Frame, h: number, lo: number) {
  const w0 = 2.2, w1 = 1.0, d = 1.4;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) k.beam(fr, V(sx * w0, lo - 0.3, sz * d), V(sx * w1, h, sz * d * 0.7), 0.32, TIMBER, { rough: 1 });
    // Back brace down toward the hoist house takes the cable pull.
    k.beam(fr, V(sx * w1, h * 0.9, -d * 0.7), V(sx * w0 * 1.1, lo - 0.3, -h * 0.75), 0.3, TIMBER, { rough: 1 });
    k.beam(fr, V(sx * w1 * 1.04, h * 0.5, -d * 0.85), V(sx * w0 * 1.06, lo, -h * 0.4), 0.18, TIMBER_LIGHT, { rough: 1 });
  }
  for (let y = 2.5; y < h - 0.5; y += 2.6) {
    const t = y / h, w = w0 + (w1 - w0) * t, dd = d + (d * 0.7 - d) * t;
    k.box(fr, 0, y, dd, w * 2 + 0.3, 0.22, 0.22, TIMBER_LIGHT, { rough: 1 });
    k.box(fr, 0, y, -dd, w * 2 + 0.3, 0.22, 0.22, TIMBER_LIGHT, { rough: 1 });
    for (const sx of [-1, 1]) k.box(fr, sx * w, y, 0, 0.22, 0.22, dd * 2 + 0.3, TIMBER_LIGHT, { rough: 1 });
    const y2 = Math.min(h, y + 2.6), t2 = y2 / h, w2 = w0 + (w1 - w0) * t2, d2 = d + (d * 0.7 - d) * t2;
    for (const sx of [-1, 1]) k.beam(fr, V(sx * w, y, -dd), V(sx * w2, y2, d2), 0.12, TIMBER_LIGHT, { rough: 1 });
  }
  k.box(fr, 0, h, 0, w1 * 2 + 0.6, 0.4, d * 1.6, TIMBER, { rough: 1 });
  sheave(k, fr, h + 1.3, 1.2);
  return h + 1.3;
}

/** Riveted steel headframe: lattice legs and a sheave deck; returns the hub height. */
function steelFrame(k: Kit, fr: Frame, h: number, lo: number) {
  const w0 = 2.6, w1 = 1.2, d = 1.8;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const metal = { fx: FX.METAL, rough: 0.8 };
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) k.beam(fr, V(sx * w0, lo - 0.3, sz * d), V(sx * w1, h, sz * d * 0.8), 0.38, STEEL, metal);
    k.beam(fr, V(sx * w1, h * 0.95, -d * 0.8), V(sx * w0 * 1.2, lo - 0.3, -h * 0.8), 0.42, STEEL, metal);
    k.beam(fr, V(sx * w1, h * 0.95, -d * 0.8 + 0.5), V(sx * w0 * 1.2, lo - 0.3, -h * 0.8 + 0.5), 0.42, STEEL, metal);
  }
  for (let y = 2.4; y < h; y += 2.4) {
    const t = y / h, w = w0 + (w1 - w0) * t, dd = d * (1 - 0.2 * t);
    for (const sz of [-1, 1]) k.box(fr, 0, y, sz * dd, w * 2 + 0.2, 0.18, 0.18, STEEL, metal);
    for (const sx of [-1, 1]) k.box(fr, sx * w, y, 0, 0.18, 0.18, dd * 2 + 0.2, STEEL, metal);
    const y0 = y - 2.4, t0 = y0 / h, wa = w0 + (w1 - w0) * t0, da = d * (1 - 0.2 * t0);
    for (const sx of [-1, 1]) {
      k.beam(fr, V(sx * wa, Math.max(lo, y0), -da), V(sx * w, y, dd), 0.1, STEEL, metal);
      k.beam(fr, V(sx * wa, Math.max(lo, y0), da), V(sx * w, y, -dd), 0.1, STEEL, metal);
    }
    for (const sz of [-1, 1]) {
      k.beam(fr, V(-wa, Math.max(lo, y0), sz * da), V(w, y, sz * dd), 0.1, STEEL, metal);
      k.beam(fr, V(wa, Math.max(lo, y0), sz * da), V(-w, y, sz * dd), 0.1, STEEL, metal);
    }
  }
  // Sheave deck with a handrail, and a little tin roof over the wheels.
  k.box(fr, 0, h, 0, w1 * 2 + 1.4, 0.25, d * 2, '#4a4a48', metal);
  for (const sx of [-1, 1]) k.box(fr, sx * (w1 + 0.65), h + 0.25, 0, 0.06, 1.0, d * 2, STEEL, metal);
  sheave(k, fr, h + 1.6, 1.5, -0.7);
  sheave(k, fr, h + 1.6, 1.5, 0.7);
  k.box(fr, 0, h + 3.3, 0, w1 * 2 + 1.6, 0.1, d * 2.2, RUST, metal);
  return h + 1.6;
}

/** Sheave wheel turning in the frame's yz plane, at (x, y, 0). */
function sheave(k: Kit, fr: Frame, y: number, r: number, x = 0) {
  const metal = { fx: FX.METAL, rough: 0.6 };
  const rim = new THREE.TorusGeometry(r, 0.09, 6, 24).rotateY(Math.PI / 2);
  k.geo(fr, rim, x, y, 0, '#2a2622', metal);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    const s = new THREE.Vector3(x, y + Math.sin(a) * r, Math.cos(a) * r);
    const e = new THREE.Vector3(x, y - Math.sin(a) * r, -Math.cos(a) * r);
    k.beam(fr, s, e, 0.06, '#2a2622', metal);
  }
  k.geo(fr, new THREE.CylinderGeometry(0.14, 0.14, 0.5, 10).rotateZ(Math.PI / 2), x, y, 0, '#3a3632', metal);
  // Bearings and the axle across the frame.
  k.geo(fr, new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6).rotateZ(Math.PI / 2), 0, y, 0, '#3a3632', metal);
}

/** Shaft collar: timber cribbing round a black hole, with a cage waiting at the top. */
function collar(k: Kit, fr: Frame, lo: number, hub: number) {
  k.box(fr, 0, lo - 0.3, 0, 3.4, 0.8 - lo, 3.0, '#6a5a48', { rough: 1 });
  k.box(fr, 0, 0.48, 0, 2.2, 0.04, 1.8, '#050403', { rough: 1 });
  for (const sx of [-1, 1]) k.box(fr, sx * 1.4, 0.5, 0, 0.3, 0.3, 3.0, TIMBER, { rough: 1 });
  for (const sz of [-1, 1]) k.box(fr, 0, 0.5, sz * 1.25, 3.4, 0.3, 0.3, TIMBER, { rough: 1 });
  // The cage, hung on its cable, with a mine car inside.
  const metal = { fx: FX.METAL, rough: 0.7 };
  k.box(fr, 0, 0.5, 0, 1.4, 0.08, 1.2, '#3a3632', metal);
  k.box(fr, 0, 2.6, 0, 1.4, 0.08, 1.2, '#3a3632', metal);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(fr, sx * 0.66, 0.5, sz * 0.56, 0.08, 2.2, 0.08, '#3a3632', metal);
  k.box(fr, 0, 0.62, 0, 0.9, 0.6, 0.6, RUST, metal);
  k.cyl(fr, 0, 2.68, 0.4, 0.02, 0.02, hub - 2.68, '#1a1a18', metal, 4);
}

/** Corrugated-tin hoist house behind the frame, with the hoist drum inside. */
function hoistHouse(k: Kit, fr: Frame, z: number, hub: number, s: number): Frame {
  const W = 9 * s, D = 8 * s, H = 4.6 * s;
  const hf = fr.sub(0, 0, z);
  const [lo, hi] = k.footRange(hf, -W / 2, W / 2, -D, 0);
  const base = Math.max(0.2, hi + 0.15);
  const b = hf.sub(0, base, 0);
  const tin = { fx: FX.METAL, rough: 0.9 };
  k.box(b, 0, lo - base - 0.3, -D / 2, W + 0.6, base - lo + 0.3, D + 0.6, '#7a6a58', { rough: 1 });
  const front: Hole[] = [
    { x: -W / 4, y: 0, w: 2.4, h: 2.8, trim: TIMBER },
    { x: W / 4, y: 1.4, w: 1.6, h: 1.2, glass: true, trim: TIMBER },
    { x: 0, y: H - 1.4, w: 0.8, h: 0.8, trim: TIMBER },
  ];
  k.wall(b, -W / 2, W / 2, 0, 0, H, 0.2, TIN, '#b8a888', front, tin);
  k.wall(b.sub(0, 0, -D, Math.PI), -W / 2, W / 2, 0, 0, H, 0.2, TIN, '#b8a888', [], tin);
  for (const o of [-1, 1] as const) {
    const holes: Hole[] = [{ x: -D / 4, y: 1.4, w: 1.4, h: 1.2, glass: true, trim: TIMBER }, { x: D / 4, y: 1.4, w: 1.4, h: 1.2, glass: true, trim: TIMBER }];
    k.wall(k.side(b, (o * W) / 2, -D / 2, o), -D / 2, D / 2, 0, 0, H, 0.2, TIN, '#b8a888', holes, tin);
  }
  // Corrugations, rust streaks and a pitched roof.
  for (let x = -W / 2; x <= W / 2; x += 0.25) k.box(b, x, 0, 0.01, 0.06, H, 0.02, '#7a7468', tin);
  for (let i = 0; i < 5; i++) k.box(b, -W / 2 + 0.6 + i * (W / 5), H - 2.2, 0.04, 0.4, 2.2, 0.01, RUST, tin);
  const tri = new THREE.Shape();
  tri.moveTo(-W / 2 - 0.4, 0);
  tri.lineTo(W / 2 + 0.4, 0);
  tri.lineTo(0, 1.6 * s);
  tri.closePath();
  k.geo(b, new THREE.ExtrudeGeometry(tri, { depth: D + 0.8, bevelEnabled: false }), 0, H, -D - 0.4, ROOF, tin);
  k.box(b, 0, H - 0.05, -D / 2, W, 0.05, D, '#3a3028', k.in(0.9));
  k.cyl(b, W / 2 - 1.2, H, -D + 1.2, 0.3, 0.3, 3, '#3a3632', tin, 8);

  // Inside: plank floor, the drum on its bedplate, the engine and the depth dial.
  k.box(b, 0, 0, -D / 2, W - 0.4, 0.04, D - 0.4, '#6a5038', k.in(0.9));
  const dx = 0.8, dy = 1.4 * s, dz = -D * 0.55;
  k.box(b, dx, 0, dz, 3.2 * s, 0.6, 2.2 * s, '#5a5a58', k.in(0.5));
  k.geo(b, new THREE.CylinderGeometry(0.9 * s, 0.9 * s, 2.4 * s, 18).rotateZ(Math.PI / 2), dx, dy, dz, '#4a4440', k.in(0.4));
  for (const sx of [-1.25 * s, 1.25 * s]) k.geo(b, new THREE.CylinderGeometry(1.05 * s, 1.05 * s, 0.1, 18).rotateZ(Math.PI / 2), dx + sx, dy, dz, '#5a2a1a', k.in(0.6));
  for (let i = 0; i < 9; i++) k.geo(b, new THREE.TorusGeometry(0.92 * s, 0.025, 4, 18).rotateY(Math.PI / 2), dx - 1.0 * s + i * 0.25 * s, dy, dz, '#1a1a18', k.in(0.4));
  k.box(b, dx - 2.6 * s, 0, dz, 1.6, 1.6, 1.2, '#2a3a2a', k.in(0.6));
  k.cyl(b, dx - 2.6 * s, 1.6, dz, 0.25, 0.25, 0.6, '#3a3632', k.in(0.5), 8);
  for (let i = 0; i < 3; i++) k.box(b, -W / 4 + 0.6 + i * 0.35, 0, -1.6, 0.06, 1.3, 0.06, '#8a2a1a', k.in(0.5), 0);
  k.box(b, -W / 4 + 0.3, 1.0, -1.65, 1.2, 0.06, 0.4, '#3a3632', k.in(0.6));
  k.cyl(b, W / 2 - 1.0, 1.6, -0.25, 0.4, 0.4, 0.04, '#f0e8d0', k.lit(1.8), 16);
  k.box(b, W / 2 - 1.0, 1.6, -0.24, 0.02, 0.36, 0.02, '#1a1a18', k.lit(1.8));
  for (const lx of [-W / 4, W / 4]) {
    k.lamp(b, lx, H - 0.7, -D / 2 + 1, 7 * s, 2.2);
    k.cyl(b, lx, H - 0.7, -D / 2 + 1, 0.15, 0.15, 0.2, '#ffd890', k.lit(2.4), 8);
    k.cyl(b, lx, H - 0.5, -D / 2 + 1, 0.01, 0.01, 0.5, '#1a1a18', k.in(0.5), 3);
  }
  // Cable from the drum up through the gable vent to the sheave.
  const from = new THREE.Vector3(dx, dy + 0.9 * s, dz);
  const vent = new THREE.Vector3(0, H - 1.0, 0.2);
  k.beam(b, from, vent, 0.04, '#1a1a18', { fx: FX.METAL });
  k.beam(fr, new THREE.Vector3(0, vent.y + base, vent.z + z), new THREE.Vector3(0, hub + 1.2, -0.4), 0.04, '#1a1a18', { fx: FX.METAL });
  return b;
}

/** Timber ore bin beside the frame with a chute and a rail car under it. */
function oreBin(k: Kit, fr: Frame, h: number, lo: number) {
  const ob = fr.sub(4.6, 0, 0.8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(ob, sx * 1.1, lo - 0.3, sz * 1.1, 0.25, 3.3 - lo, 0.25, TIMBER, { rough: 1 });
  k.box(ob, 0, 3.0, 0, 2.8, 2.4, 2.8, TIMBER_LIGHT, { rough: 1 });
  for (let y = 3.2; y < 5.4; y += 0.3) k.box(ob, 0, y, 1.41, 2.8, 0.03, 0.02, TIMBER, { rough: 1 });
  k.beam(ob, new THREE.Vector3(0, 3.1, 1.4), new THREE.Vector3(0, 1.9, 2.4), 0.6, RUST, { fx: FX.METAL });
  k.box(ob, 0, 0.1, 2.4, 1.0, 0.7, 0.7, RUST, { fx: FX.METAL });
  for (const sx of [-0.35, 0.35]) k.box(ob, sx, 0, -1, 0.06, 0.08, 6, '#3a3632', { fx: FX.METAL });
  // A trestle from the collar to the bin, for cars trammed off the cage.
  k.box(ob, -2.4, 2.9, 0, 3.0, 0.15, 1.2, TIMBER, { rough: 1 });
  if (h > 20) k.box(ob, -2.4, 0, 0, 0.2, 2.9, 0.2, TIMBER, { rough: 1 });
}
