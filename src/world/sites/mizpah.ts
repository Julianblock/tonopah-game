import * as THREE from 'three';
import type { Frame } from '../builders';
import type { Hole, Kit } from '../kit';

// The Mizpah Hotel, 1907: five storeys of red brick with sandstone trim at the
// corner of Main and Brougher, for twenty years the tallest building in Nevada.
// Frame: x across the 16 m Main Street front (+x toward Brougher Avenue),
// z out toward Main Street, y up from the lobby floor.

export const BRICK = '#7e3426';
const BRICK_DARK = '#5e2418';
export const STONE = '#d8c8a6';
const PLASTER = '#e6dcc4';
export const W = 16;
export const D = 33.7;
/** Lobby storey, then four guest floors. */
export const G0 = 4.6;
export const FH = 3.4;
export const TOP = G0 + FH * 4;
const T = 0.5;
/** Guest-room slots along the corridor, front to back. */
export const SLOTS = 5;
export const SLOT = (D - 1) / SLOTS;
/** Stairwell and elevator in the second slot on the north side. */
export const STAIR = { x0: -7.5, x1: -3.8, z0: -0.5 - SLOT * 2 + 0.2, z1: -0.5 - SLOT - 0.2 };
export const LIFT = { x: -2.6, z: (STAIR.z0 + STAIR.z1) / 2 };

/** Floor level of storey i (0 = lobby). */
export const level = (i: number) => (i === 0 ? 0 : G0 + (i - 1) * FH);

/** Builds the hotel and returns its frame at lobby-floor level. */
export function mizpahShell(k: Kit): Frame {
  k.seed = 21;
  const fr = k.footprint(-40.6, -39.7, D, W, -0.3, 3, 22);
  const [lo, hi] = k.footRange(fr, -W / 2, W / 2, -D, 0);
  const base = Math.max(0.25, hi + 0.15);
  const b = fr.sub(0, base, 0);

  // Sandstone foundation down to the lowest ground, and steps up from the sidewalk.
  k.box(b, 0, lo - base - 0.5, -D / 2, W + 0.3, base - lo + 0.5, D + 0.3, STONE, { rough: 0.95 });
  const steps = Math.max(1, Math.round(base / 0.17));
  k.stairs(b, 0, -base, steps * 0.3, 3.4, base, steps, STONE, STONE, 0.3);

  const top = TOP + 1.4;
  // Front on Main Street.
  const front: Hole[] = [
    { x: 0, y: 0, w: 2.2, h: 3.3, trim: STONE, arch: 0.5 },
    { x: -4.7, y: 0.55, w: 3.6, h: 3.0, glass: true, trim: STONE, arch: 0.5 },
    { x: 4.7, y: 0.55, w: 3.6, h: 3.0, glass: true, trim: STONE, arch: 0.5 },
  ];
  for (let fl = 1; fl < 5; fl++) {
    for (const x of [-5.6, -2.6, 2.6, 5.6]) front.push({ x, y: level(fl) + 0.8, w: 1.1, h: 1.95, glass: true, trim: STONE, arch: fl === 4 ? 0.45 : 0 });
  }
  k.wall(b, -W / 2, W / 2, 0, -0.1, top, T, BRICK, PLASTER, front, { rough: 0.95 });

  // Brougher Avenue side: two windows per room, tall lobby and bar windows below.
  const south = k.side(b, W / 2, -D / 2, 1);
  const zx = (z: number) => -z - D / 2;
  const sHoles: Hole[] = [];
  for (const z of [-3, -7.5, -12, -23, -28.5]) sHoles.push({ x: zx(z), y: 0.6, w: 2.0, h: 3.0, glass: true, trim: STONE, arch: 0.4 });
  sHoles.push({ x: zx(-17.2), y: 0, w: 1.6, h: 2.8, trim: STONE });
  for (let fl = 1; fl < 5; fl++) {
    for (let s = 0; s < SLOTS; s++) {
      const zc = -0.5 - SLOT * (s + 0.5);
      for (const o of [-1.6, 1.6]) sHoles.push({ x: zx(zc + o), y: level(fl) + 0.8, w: 1.1, h: 1.95, glass: true, trim: STONE, arch: fl === 4 ? 0.45 : 0 });
    }
  }
  k.wall(south, -D / 2, D / 2, 0, -0.1, top, T, BRICK, PLASTER, sHoles, { rough: 0.95 });

  // North side: the two-storey annex hides the lower floors.
  const north = k.side(b, -W / 2, -D / 2, -1);
  const nx = (z: number) => z + D / 2;
  const nHoles: Hole[] = [];
  for (let fl = 3; fl < 5; fl++) {
    for (let s = 0; s < SLOTS; s++) {
      if (s === 1) continue;
      const zc = -0.5 - SLOT * (s + 0.5);
      for (const o of [-1.6, 1.6]) nHoles.push({ x: nx(zc + o), y: level(fl) + 0.8, w: 1.1, h: 1.95, glass: true, trim: STONE });
    }
  }
  k.wall(north, -D / 2, D / 2, 0, -0.1, top, T, BRICK_DARK, PLASTER, nHoles, { rough: 0.95 });

  // Back: the corridor window on every floor and the alley door.
  const back = b.sub(0, 0, -D, Math.PI);
  const bHoles: Hole[] = [{ x: 0, y: 0, w: 1.2, h: 2.4, trim: STONE }];
  for (let fl = 1; fl < 5; fl++) bHoles.push({ x: 0, y: level(fl) + 0.8, w: 1.3, h: 1.95, glass: true, trim: STONE });
  k.wall(back, -W / 2, W / 2, 0, -0.1, top, T, BRICK_DARK, PLASTER, bHoles, { rough: 0.95 });

  // Floors, each cut open over the stairwell and the elevator shaft; the roof on top.
  const iw = W - 2 * T, id = D - 2 * T;
  for (let fl = 0; fl <= 5; fl++) {
    const y = fl === 5 ? TOP : level(fl);
    if (fl === 0) {
      k.slab(b, 0, y, -D / 2, iw, id, '#c8c0b0', null, 0.4);
      continue;
    }
    holedSlab(k, b, y, fl === 5 ? '#5a5048' : '#6a4a34', PLASTER, fl === 5);
  }
  // Tar roof, parapet cap, the bulkhead over the stairs and a water tank.
  k.box(b, 0, TOP, -D / 2, W - 0.1, 0.12, D - 0.1, '#3a3632', { rough: 1 });
  k.box(b, (STAIR.x0 + STAIR.x1) / 2, TOP, (STAIR.z0 + STAIR.z1) / 2, 4.6, 2.8, 7, BRICK_DARK, { rough: 0.95 });
  k.cyl(b, 4, TOP + 0.1, -26, 1.4, 1.4, 2.6, '#6a5a48', { rough: 0.9 }, 12);
  k.geo(b, coneRoof(1.5, 0.8), 4, TOP + 2.7, -26, '#4a3e34', { rough: 0.9 });
  cornice(k, b);
  return b;
}

function coneRoof(r: number, h: number) {
  return new THREE.ConeGeometry(r, h, 12).translate(0, h / 2, 0);
}

/** A floor slab with the stairwell and the elevator shaft left open. */
function holedSlab(k: Kit, b: Frame, y: number, top: string, under: string, roof: boolean) {
  const x0 = -W / 2 + T, x1 = W / 2 - T, z0 = -D + T, z1 = -T;
  const hx0 = STAIR.x0, hx1 = LIFT.x + 0.9, hz0 = STAIR.z0, hz1 = STAIR.z1;
  const rect = (a: number, c: number, e: number, g: number) => {
    if (c - a < 0.01 || g - e < 0.01) return;
    k.slab(b, (a + c) / 2, y, (e + g) / 2, c - a, g - e, top, under);
  };
  if (roof) {
    rect(x0, x1, z0, z1);
    return;
  }
  rect(x0, x1, hz1, z1);
  rect(x0, x1, z0, hz0);
  rect(x0, hx0, hz0, hz1);
  rect(hx1, x1, hz0, hz1);
}

/** Sandstone belt course over the lobby and a deep bracketed cornice with dentils. */
function cornice(k: Kit, b: Frame) {
  const m = { rough: 0.9 };
  const runs: [number, number, number, number][] = [
    [0, 0.35, W + 0.5, 0.5],
    [W / 2 + 0.17, -D / 2, 0.5, D],
    [-W / 2 - 0.17, -D / 2, 0.5, D],
  ];
  for (const [x, z, w, d] of runs) {
    k.box(b, x, G0 - 0.35, z, w, 0.35, d, STONE, m);
    k.box(b, x, TOP - 0.6, z, w + 0.2, 0.25, d + 0.2, STONE, m);
    k.box(b, x, TOP + 0.6, z, w + 0.7, 0.35, d + 0.7, STONE, m);
    k.box(b, x, TOP + 0.95, z, w + 0.3, 0.45, d + 0.3, BRICK, m);
    k.box(b, x, TOP + 1.4, z, w + 0.45, 0.14, d + 0.45, STONE, m);
  }
  // Dentils and scroll brackets under the cornice along the front and the Brougher side.
  for (let x = -W / 2 + 0.2; x <= W / 2 - 0.2; x += 0.42) k.box(b, x, TOP + 0.38, 0.45, 0.2, 0.22, 0.3, STONE, m);
  for (let x = -W / 2 + 0.6; x <= W / 2; x += 2.6) k.box(b, x, TOP - 0.1, 0.55, 0.3, 0.7, 0.55, STONE, m);
  for (let z = -0.3; z > -D; z -= 0.42) k.box(b, W / 2 + 0.45, TOP + 0.38, z, 0.3, 0.22, 0.2, STONE, m);
  for (let z = -1; z > -D; z -= 2.6) k.box(b, W / 2 + 0.55, TOP - 0.1, z, 0.55, 0.7, 0.3, STONE, m);
  // Raised central parapet with the date panel.
  k.box(b, 0, TOP + 1.54, 0.05, 5.4, 1.3, 0.5, BRICK, m);
  k.box(b, 0, TOP + 2.84, 0.05, 5.8, 0.18, 0.62, STONE, m);
  k.box(b, 0, TOP + 1.8, 0.32, 2.4, 0.7, 0.06, STONE, m);
  // Brick pilasters at the corners.
  for (const x of [-W / 2 + 0.35, W / 2 - 0.35]) k.box(b, x, 0, 0.3, 0.9, TOP - 0.6, 0.2, BRICK, m);
}
