import * as THREE from 'three';
import type { Frame } from './builders';
import type { Kit } from './kit';

// Furniture and fittings for the landmark interiors. Each piece stands on
// (x, y, z) in the frame, turned `yaw` (0 faces local +z).

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export const WOOD = { mahogany: '#4a1e14', oak: '#7a5230', walnut: '#3e2818', pine: '#9a7448', painted: '#e8e0d0', black: '#1a1614' };
export const BRASS = '#c49a4a';

export function chair(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, wood = WOOD.oak, seat = '#7a2a22') {
  const f = fr.sub(x, y, z, yaw);
  for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) k.ibox(f, sx, 0, sz, 0.04, 0.45, 0.04, wood, 0.6);
  k.ibox(f, 0, 0.45, 0, 0.46, 0.06, 0.46, seat, 0.9);
  k.ibox(f, 0, 0.5, -0.21, 0.44, 0.5, 0.04, wood, 0.6);
  for (const sx of [-0.2, 0.2]) k.ibox(f, sx, 0.45, -0.21, 0.04, 0.55, 0.04, wood, 0.6);
}

export function table(k: Kit, fr: Frame, x: number, y: number, z: number, w: number, d: number, top = WOOD.oak, leg = WOOD.oak, h = 0.76, yaw = 0, cloth?: string) {
  const f = fr.sub(x, y, z, yaw);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.ibox(f, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), 0.06, h - 0.04, 0.06, leg, 0.6);
  k.ibox(f, 0, h - 0.04, 0, w, 0.04, d, top, 0.4);
  if (cloth) k.ibox(f, 0, h - 0.25, 0, w + 0.06, 0.25, d + 0.06, cloth, 0.95);
}

export function roundTable(k: Kit, fr: Frame, x: number, y: number, z: number, r: number, top = WOOD.walnut, h = 0.76, felt?: string) {
  k.cyl(fr, x, y, z, 0.25, 0.06, 0.08, '#2a2420', k.in(0.4), 10);
  k.cyl(fr, x, y + 0.08, z, 0.06, 0.06, h - 0.12, '#2a2420', k.in(0.4), 8);
  k.cyl(fr, x, y + h - 0.04, z, r, r, 0.04, top, k.in(0.4), 18);
  if (felt) k.cyl(fr, x, y + h, z, r * 0.82, r * 0.82, 0.01, felt, k.in(0.95), 18);
}

export function stool(k: Kit, fr: Frame, x: number, y: number, z: number, seat = '#6a1a18', metal = BRASS) {
  k.cyl(fr, x, y, z, 0.2, 0.2, 0.03, metal, k.in(0.3), 10);
  k.cyl(fr, x, y, z, 0.035, 0.035, 0.74, metal, k.in(0.3), 6);
  k.cyl(fr, x, y + 0.3, z, 0.17, 0.17, 0.02, metal, k.in(0.3), 10);
  k.cyl(fr, x, y + 0.72, z, 0.2, 0.2, 0.08, seat, k.in(0.7), 12);
}

/**
 * Saloon bar along local x: panelled front with a brass foot rail, a polished
 * top, beer taps; behind it a back bar with an arched mirror and lit bottle shelves.
 */
export function bar(k: Kit, fr: Frame, x: number, y: number, z: number, len: number, yaw = 0, wood = WOOD.mahogany, depthToBack = 1.6, stools = true) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, len, 1.05, 0.6, wood, 0.5);
  for (let px = -len / 2 + 0.4; px < len / 2 - 0.2; px += 0.8) k.ibox(f, px, 0.15, 0.31, 0.6, 0.75, 0.02, '#5a2a1a', 0.45);
  k.ibox(f, 0, 1.05, 0.03, len + 0.1, 0.06, 0.72, '#2a120c', 0.15);
  k.box(f, 0, 0.18, 0.42, len, 0.05, 0.05, BRASS, k.in(0.25));
  for (let px = -len / 2 + 0.3; px < len / 2; px += 1.2) k.ibox(f, px, 0, 0.4, 0.04, 0.18, 0.04, BRASS, 0.25);
  // Taps.
  for (let i = 0; i < 6; i++) {
    const tx = -0.9 + i * 0.36;
    k.cyl(f, tx, 1.11, -0.1, 0.02, 0.02, 0.32, '#d8d8d8', k.in(0.2), 6);
    k.ibox(f, tx, 1.43, -0.1, 0.05, 0.14, 0.05, ['#1a1a1a', '#c8a040', '#8a2020', '#203a8a', '#e8e0d0', '#2a6a2a'][i], 0.4);
  }
  // Back bar.
  const bz = -depthToBack;
  k.ibox(f, 0, 0, bz, len, 0.95, 0.5, wood, 0.5);
  k.ibox(f, 0, 0.95, bz - 0.05, len, 2.2, 0.15, wood, 0.5);
  k.box(f, 0, 1.25, bz + 0.03, len - 0.6, 1.3, 0.02, '#b8c4c8', k.in(0.05, 0.5));
  for (let i = 0; i < 3; i++) {
    const sy = 1.0 + i * 0.42;
    k.ibox(f, 0, sy, bz + 0.12, len - 0.4, 0.03, 0.24, wood, 0.4);
    for (let b = 0; b < (len - 0.6) / 0.11; b++) {
      const h = hash(b * 7.1 + i * 31 + k.seed);
      const bx = -len / 2 + 0.35 + b * 0.11;
      const col = ['#3a5a1a', '#6a3a10', '#c8a050', '#e8e0d0', '#1a3a2a', '#8a1a1a', '#d4c890'][Math.floor(h * 7)];
      k.cyl(f, bx, sy + 0.03, bz + 0.12, 0.035, 0.035, 0.22 + h * 0.1, col, k.lit(1.7 + h), 6);
    }
  }
  k.box(f, 0, 3.0, bz + 0.05, len + 0.2, 0.3, 0.3, wood, k.in(0.5));
  if (stools) for (let px = -len / 2 + 0.5; px < len / 2; px += 0.75) stool(k, f, px, 0, 0.85);
}

/** Slot machine: cabinet, glowing reels and topper, a lit button deck. */
export function slot(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, seed: number) {
  const f = fr.sub(x, y, z, yaw);
  const h = hash(seed);
  const body = ['#1a1a2a', '#3a0a0a', '#0a2a3a', '#2a2a2a', '#4a3a0a'][Math.floor(h * 5)];
  const glow = ['#ff3a6a', '#3ac8ff', '#ffd040', '#8aff6a', '#c86aff'][Math.floor(hash(seed + 1) * 5)];
  k.ibox(f, 0, 0, 0, 0.62, 0.75, 0.6, body, 0.4);
  k.ibox(f, 0, 0.75, 0.1, 0.62, 0.12, 0.42, '#202020', 0.4);
  k.box(f, 0, 0.88, 0.16, 0.5, 0.03, 0.2, glow, k.lit(2.4));
  k.ibox(f, 0, 0.75, -0.12, 0.62, 1.05, 0.36, body, 0.4);
  k.box(f, 0, 1.0, 0.07, 0.5, 0.42, 0.02, '#e8f0ff', k.lit(3.2));
  k.box(f, 0, 1.48, 0.07, 0.5, 0.26, 0.02, glow, k.lit(3.5));
  k.box(f, 0, 1.8, -0.12, 0.62, 0.28, 0.36, glow, k.lit(4));
  k.cyl(f, 0, 2.08, -0.12, 0.06, 0.06, 0.12, glow, k.lit(5), 8);
}

/** Bank of slots back to back. */
export function slotBank(k: Kit, fr: Frame, x: number, y: number, z: number, n: number, yaw: number, seed: number) {
  const f = fr.sub(x, y, z, yaw);
  for (let i = 0; i < n; i++) {
    const sx = (i - (n - 1) / 2) * 0.68;
    slot(k, f, sx, 0, 0.32, 0, seed + i * 3.1);
    slot(k, f, sx, 0, -0.32, Math.PI, seed + i * 3.1 + 50);
    stool(k, f, sx, 0, 1.0, '#5a0a1a', '#8a8a8a');
    stool(k, f, sx, 0, -1.0, '#5a0a1a', '#8a8a8a');
  }
  k.box(f, 0, 2.2, 0, n * 0.68 + 0.2, 0.3, 0.3, '#1a1a1a', k.in(0.4));
  k.box(f, 0, 2.24, 0.16, n * 0.68, 0.22, 0.02, '#ffd040', k.lit(4.5));
  k.box(f, 0, 2.24, -0.16, n * 0.68, 0.22, 0.02, '#ff4060', k.lit(4.5));
}

export function bed(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, spread = '#7a1a22', head = WOOD.walnut, w = 1.5) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, w, 0.32, 2.0, head, 0.6);
  k.ibox(f, 0, 0.32, 0, w - 0.04, 0.22, 1.96, '#ece6da', 0.95);
  k.ibox(f, 0, 0.5, 0.15, w + 0.04, 0.08, 1.7, spread, 0.95);
  k.ibox(f, 0, 0.32, 0.1, w + 0.06, 0.25, 1.75, spread, 0.95);
  for (const px of [-w / 4, w / 4]) k.ibox(f, px, 0.54, -0.78, w * 0.42, 0.14, 0.36, '#f4f0e8', 0.95);
  k.ibox(f, 0, 0, -1.02, w + 0.1, 1.25, 0.08, head, 0.5);
  for (const px of [-w / 2 - 0.02, w / 2 + 0.02]) k.cyl(f, px, 0, -1.02, 0.05, 0.05, 1.35, head, k.in(0.5), 8);
  k.ibox(f, 0, 0, 1.0, w + 0.1, 0.6, 0.06, head, 0.5);
}

/** Bedside table with a shaded lamp that lights the room. */
export function nightstand(k: Kit, fr: Frame, x: number, y: number, z: number, yaw = 0, wood = WOOD.walnut, shade = '#f0d8a8', on = true) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, 0.5, 0.6, 0.42, wood, 0.5);
  k.ibox(f, 0, 0.42, 0.21, 0.36, 0.1, 0.01, '#2a1a10', 0.5);
  k.cyl(f, 0, 0.6, 0, 0.08, 0.05, 0.3, BRASS, k.in(0.3), 8);
  k.cyl(f, 0, 0.88, 0, 0.18, 0.11, 0.24, shade, on ? k.lit(3) : k.in(0.9), 10);
  if (on) k.lamp(f, 0, 1.0, 0, 4.5, 0.8);
}

export function dresser(k: Kit, fr: Frame, x: number, y: number, z: number, yaw = 0, wood = WOOD.walnut, mirror = true) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, 1.3, 0.85, 0.5, wood, 0.5);
  for (let i = 0; i < 3; i++) {
    k.ibox(f, 0, 0.08 + i * 0.26, 0.25, 1.2, 0.22, 0.01, '#5a3420', 0.5);
    for (const px of [-0.3, 0.3]) k.ibox(f, px, 0.17 + i * 0.26, 0.27, 0.08, 0.03, 0.03, BRASS, 0.3);
  }
  if (mirror) {
    k.ibox(f, 0, 0.85, -0.2, 0.9, 1.0, 0.05, wood, 0.5);
    k.box(f, 0, 0.92, -0.17, 0.78, 0.86, 0.01, '#b8c8cc', k.in(0.05, 0.6));
  }
}

export function wardrobe(k: Kit, fr: Frame, x: number, y: number, z: number, yaw = 0, wood = WOOD.walnut) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, 1.1, 2.1, 0.6, wood, 0.5);
  k.ibox(f, 0, 2.1, 0, 1.2, 0.12, 0.66, wood, 0.5);
  k.ibox(f, 0, 0.1, 0.3, 0.02, 1.9, 0.01, '#2a1a10', 0.5);
  for (const px of [-0.08, 0.08]) k.ibox(f, px, 1.0, 0.31, 0.03, 0.12, 0.03, BRASS, 0.3);
}

export function armchair(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, fabric = '#5a1a1a', wood = WOOD.walnut) {
  const f = fr.sub(x, y, z, yaw);
  for (const sx of [-0.32, 0.32]) for (const sz of [-0.3, 0.3]) k.ibox(f, sx, 0, sz, 0.06, 0.14, 0.06, wood, 0.5);
  k.ibox(f, 0, 0.14, 0, 0.8, 0.32, 0.75, fabric, 0.95);
  k.ibox(f, 0, 0.46, -0.3, 0.8, 0.6, 0.16, fabric, 0.95);
  for (const sx of [-0.36, 0.36]) k.ibox(f, sx, 0.46, 0.02, 0.1, 0.22, 0.7, fabric, 0.95);
}

export function sofa(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, len = 2.0, fabric = '#3a1a22', wood = WOOD.walnut) {
  const f = fr.sub(x, y, z, yaw);
  for (const sx of [-len / 2 + 0.06, len / 2 - 0.06]) for (const sz of [-0.32, 0.32]) k.ibox(f, sx, 0, sz, 0.06, 0.12, 0.06, wood, 0.5);
  k.ibox(f, 0, 0.12, 0, len, 0.34, 0.8, fabric, 0.95);
  k.ibox(f, 0, 0.46, -0.32, len, 0.5, 0.16, fabric, 0.95);
  for (const sx of [-len / 2, len / 2]) k.ibox(f, sx, 0.46, 0.04, 0.14, 0.24, 0.76, fabric, 0.95);
  for (let i = 0; i < 3; i++) k.ibox(f, (i - 1) * (len / 3.2), 0.46, 0.02, len / 3.4, 0.08, 0.62, fabric, 0.9);
}

/** Crystal chandelier: brass ring and arms, candle bulbs, hanging prisms; lights the room. */
export function chandelier(k: Kit, fr: Frame, x: number, y: number, z: number, r = 0.7, arms = 8, reach = 9, power = 1.4) {
  k.cyl(fr, x, y - 0.6, z, 0.015, 0.015, 0.6, BRASS, k.in(0.3), 4);
  k.sphere(fr, x, y - 0.75, z, 0.12, BRASS, k.in(0.3), 8);
  k.cyl(fr, x, y - 0.95, z, 0.05, 0.12, 0.2, BRASS, k.in(0.3), 8);
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2;
    const ax = x + Math.cos(a) * r, az = z + Math.sin(a) * r;
    k.beam(fr, new THREE.Vector3(x, y - 0.85, z), new THREE.Vector3(ax, y - 0.95, az), 0.025, BRASS, k.in(0.3));
    k.cyl(fr, ax, y - 0.98, az, 0.04, 0.04, 0.05, BRASS, k.in(0.3), 6);
    k.cyl(fr, ax, y - 0.93, az, 0.012, 0.012, 0.1, '#f4ece0', k.in(0.6), 4);
    k.sphere(fr, ax, y - 0.8, az, 0.035, '#fff0c8', k.lit(6), 6);
    for (let j = 0; j < 3; j++) {
      const pr = r * (0.35 + j * 0.25);
      k.geo(fr, new THREE.OctahedronGeometry(0.03, 0).scale(1, 2, 1), x + Math.cos(a + 0.4) * pr, y - 1.05 - j * 0.07, z + Math.sin(a + 0.4) * pr, '#eef4ff', k.lit(1.8));
    }
  }
  k.lamp(fr, x, y - 0.9, z, reach, power);
}

/** Frosted-glass wall sconce. */
export function sconce(k: Kit, fr: Frame, x: number, y: number, z: number, yaw = 0, reach = 4, power = 0.6) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, -0.08, 0.02, 0.1, 0.16, 0.04, BRASS, 0.3);
  k.ibox(f, 0, 0, 0.08, 0.03, 0.03, 0.12, BRASS, 0.3);
  k.cyl(f, 0, 0.02, 0.16, 0.05, 0.09, 0.16, '#fff0d0', k.lit(3.5), 8);
  k.lamp(f, 0, 0.1, 0.3, reach, power);
}

/** Framed picture on a wall: a few blocks of paint suggesting a landscape or portrait. */
export function picture(k: Kit, fr: Frame, x: number, y: number, z: number, w: number, h: number, yaw: number, seed: number, frame = '#8a6a2a') {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, -h / 2 - 0.06, 0.02, w + 0.12, h + 0.12, 0.04, frame, 0.4);
  const portrait = hash(seed) < 0.4;
  const sky = ['#8aa8c8', '#d8a878', '#5a6a8a', '#c8c0a8'][Math.floor(hash(seed + 1) * 4)];
  const land = ['#8a7050', '#5a6a3a', '#a08060', '#6a5040'][Math.floor(hash(seed + 2) * 4)];
  if (portrait) {
    k.ibox(f, 0, -h / 2, 0.045, w, h, 0.01, '#2a2018', 0.9);
    k.ibox(f, 0, -h * 0.12, 0.05, w * 0.36, h * 0.3, 0.01, '#d8b8a0', 0.9);
    k.ibox(f, 0, -h / 2, 0.05, w * 0.6, h * 0.36, 0.01, ['#1a1a2a', '#4a1a1a', '#2a3a2a'][Math.floor(hash(seed + 3) * 3)], 0.9);
  } else {
    k.ibox(f, 0, -h / 2 + h * 0.45, 0.045, w, h * 0.55, 0.01, sky, 0.9);
    k.ibox(f, 0, -h / 2, 0.045, w, h * 0.45, 0.01, land, 0.9);
    k.ibox(f, w * (hash(seed + 4) - 0.5) * 0.5, -h / 2 + h * 0.3, 0.05, w * 0.4, h * 0.3, 0.01, '#5a4a3a', 0.9);
  }
}

export function rug(k: Kit, fr: Frame, x: number, y: number, z: number, w: number, d: number, field = '#6a1a1a', border = '#c8a050', yaw = 0) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0.001, 0, w, 0.012, d, border, 0.98);
  k.ibox(f, 0, 0.002, 0, w - 0.3, 0.012, d - 0.3, field, 0.98);
  k.ibox(f, 0, 0.003, 0, w * 0.35, 0.012, d * 0.35, border, 0.98);
}

export function plant(k: Kit, fr: Frame, x: number, y: number, z: number, h = 1.4) {
  k.cyl(fr, x, y, z, 0.18, 0.24, 0.4, '#8a4a2a', k.in(0.8), 10);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    k.geo(fr, new THREE.ConeGeometry(0.16, h * 0.6, 5).translate(0, h * 0.3, 0).rotateZ(0.3).rotateY(a), x, y + 0.35, z, '#3a5a2a', k.in(0.9));
  }
}

export function door(k: Kit, fr: Frame, x: number, y: number, z: number, w: number, h: number, yaw = 0, color = WOOD.walnut, number?: string, panel = '#2a1a10') {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, w, h, 0.05, color, 0.5);
  for (const py of [0.25, 1.15]) k.ibox(f, 0, py, 0.03, w - 0.25, h * 0.36, 0.01, panel, 0.5);
  k.sphere(f, w / 2 - 0.12, 1.0, 0.06, 0.035, BRASS, k.in(0.25), 6);
  if (number) k.ibox(f, 0, 1.6, 0.04, 0.16, 0.08, 0.01, BRASS, 0.25);
}

/** Clown figurine: body, ruff, round head, red nose, pointed hat. Scale 1 = 30 cm. */
export function clown(k: Kit, fr: Frame, x: number, y: number, z: number, s: number, seed: number, yaw = 0) {
  const h = (n: number) => hash(seed * 3.7 + n);
  const suit = ['#d82a2a', '#2a6ad8', '#e8c82a', '#2aa84a', '#e86ab8', '#8a3ad8', '#f0f0f0', '#ff8a1a'][Math.floor(h(1) * 8)];
  const hat = ['#2a6ad8', '#d82a2a', '#e8c82a', '#f0f0f0', '#1a1a1a'][Math.floor(h(2) * 5)];
  const f = fr.sub(x, y, z, yaw + (h(3) - 0.5) * 0.8);
  const sit = h(4) < 0.35;
  if (sit) {
    k.geo(f, new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.13 * s, 6).translate(0, 0.065 * s, 0), 0, 0, 0, suit, k.in(0.6));
    k.geo(f, new THREE.BoxGeometry(0.06 * s, 0.05 * s, 0.14 * s).translate(0, 0.025 * s, 0.07 * s), 0.04 * s, 0, 0, suit, k.in(0.6));
    k.geo(f, new THREE.BoxGeometry(0.06 * s, 0.05 * s, 0.14 * s).translate(0, 0.025 * s, 0.07 * s), -0.04 * s, 0, 0, suit, k.in(0.6));
  } else {
    k.geo(f, new THREE.CylinderGeometry(0.06 * s, 0.1 * s, 0.2 * s, 6).translate(0, 0.1 * s, 0), 0, 0, 0, suit, k.in(0.6));
  }
  const top = sit ? 0.13 * s : 0.2 * s;
  k.geo(f, new THREE.CylinderGeometry(0.085 * s, 0.085 * s, 0.025 * s, 8), 0, top, 0, '#f4f4f0', k.in(0.7));
  const face = h(5) < 0.85 ? '#f4ece4' : '#e8c8a8';
  k.geo(f, new THREE.IcosahedronGeometry(0.06 * s, 0), 0, top + 0.07 * s, 0, face, k.in(0.6));
  k.geo(f, new THREE.IcosahedronGeometry(0.018 * s, 0), 0, top + 0.065 * s, 0.058 * s, '#e01010', k.in(0.4));
  if (h(6) < 0.6) {
    k.geo(f, new THREE.ConeGeometry(0.045 * s, 0.12 * s, 5).translate(0, 0.06 * s, 0), 0, top + 0.115 * s, 0, hat, k.in(0.6));
    k.geo(f, new THREE.IcosahedronGeometry(0.015 * s, 0), 0, top + 0.24 * s, 0, '#f4f4f0', k.in(0.7));
  } else {
    // A shock of orange or green wig either side.
    const wig = h(7) < 0.5 ? '#ff6a1a' : '#3ad84a';
    k.geo(f, new THREE.IcosahedronGeometry(0.035 * s, 0), 0.05 * s, top + 0.08 * s, -0.01 * s, wig, k.in(0.9));
    k.geo(f, new THREE.IcosahedronGeometry(0.035 * s, 0), -0.05 * s, top + 0.08 * s, -0.01 * s, wig, k.in(0.9));
  }
}

/** Pressed-tin ceiling: a grid of raised, beaded panels with a cornice. */
export function tinCeiling(k: Kit, fr: Frame, x: number, y: number, z: number, w: number, d: number, color = '#d8d0b8', tile = 0.61) {
  k.ibox(fr, x, y, z, w, 0.03, d, color, 0.4);
  const nx = Math.floor(w / tile), nz = Math.floor(d / tile);
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const px = x - (nx * tile) / 2 + (i + 0.5) * tile;
      const pz = z - (nz * tile) / 2 + (j + 0.5) * tile;
      k.ibox(fr, px, y - 0.025, pz, tile * 0.78, 0.025, tile * 0.78, color, 0.35);
      k.ibox(fr, px, y - 0.045, pz, tile * 0.3, 0.02, tile * 0.3, color, 0.35);
    }
  }
}

/** Old cage elevator: brass lattice gates at each landing, a car with a lit dome on the ground floor. */
export function elevator(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, landings: number[]) {
  const f = fr.sub(x, y, z, yaw);
  const w = 1.6, d = 1.6;
  for (const fy of landings) {
    for (let i = 0; i <= 10; i++) k.ibox(f, -w / 2 + (i * w) / 10, fy, d / 2, 0.025, 2.3, 0.025, BRASS, 0.25);
    for (let i = 0; i < 5; i++) k.beam(f, new THREE.Vector3(-w / 2, fy + 0.2 + i * 0.45, d / 2), new THREE.Vector3(w / 2, fy + 0.65 + i * 0.45, d / 2), 0.02, BRASS, k.in(0.25));
    k.ibox(f, 0, fy + 2.3, d / 2, w + 0.2, 0.35, 0.08, BRASS, 0.25);
    // Floor indicator dial above the gate.
    k.cyl(f, 0, fy + 2.75, d / 2 + 0.02, 0.22, 0.22, 0.02, '#f0e0b0', k.lit(1.8), 14);
  }
  k.ibox(f, 0, 0, 0, w - 0.1, 0.1, d - 0.1, '#5a3a20', 0.5);
  for (const sx of [-1, 1]) k.ibox(f, sx * (w / 2 - 0.05), 0, 0, 0.04, 2.3, d - 0.1, '#5a3a20', 0.5);
  k.ibox(f, 0, 0, -d / 2 + 0.05, w - 0.1, 2.3, 0.04, '#5a3a20', 0.5);
  k.ibox(f, 0, 2.3, 0, w - 0.1, 0.06, d - 0.1, '#5a3a20', 0.5);
  k.sphere(f, 0, 2.25, 0, 0.12, '#fff0c8', k.lit(4), 8);
  k.lamp(f, 0, 2.1, 0, 3, 0.5);
}

/** Upright piano against a wall. */
export function piano(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, 1.5, 1.3, 0.6, '#1a0e0a', 0.25);
  k.ibox(f, 0, 0.7, 0.32, 1.4, 0.06, 0.25, '#1a0e0a', 0.25);
  k.ibox(f, 0, 0.76, 0.36, 1.3, 0.02, 0.15, '#f4f0e4', 0.4);
  for (let i = 0; i < 36; i++) if (i % 7 !== 2 && i % 7 !== 6) k.ibox(f, -0.63 + i * 0.036, 0.78, 0.33, 0.018, 0.02, 0.09, '#0a0a0a', 0.3);
  k.ibox(f, 0, 0, 0.75, 0.9, 0.5, 0.35, '#1a0e0a', 0.3);
}

export function tv(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, on = false) {
  const f = fr.sub(x, y, z, yaw);
  k.ibox(f, 0, 0, 0, 0.9, 0.55, 0.06, '#121212', 0.3);
  k.box(f, 0, 0.03, 0.035, 0.84, 0.49, 0.005, on ? '#8ab0ff' : '#0a0c10', on ? k.lit(2.2) : k.in(0.1));
}
