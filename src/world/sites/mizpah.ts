import * as THREE from 'three';
import { type Frame, FX, UP } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// The Mizpah Hotel, 1907: five storeys of red brick with sandstone trim at the
// corner of Main and Brougher, for twenty years the tallest building in Nevada.
// Frame: x across the 16 m Main Street front (+x toward Brougher Avenue),
// z out toward Main Street, y up from the lobby floor.

export const BRICK = '#7e3426';
const BRICK_DARK = '#5e2418';
export const STONE = '#d8c8a6';
const PLASTER = '#e6dcc4';
const BRASS_DARK = '#8a6a30';
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

/**
 * The lobby: black-and-white mosaic, mahogany wainscot, a pressed-tin ceiling
 * hung with crystal chandeliers, the front desk and its key cubbies, a parlour
 * of velvet furniture round a piano, and a nook of slot machines.
 */
export function mizpahLobby(k: Kit, b: Frame) {
  k.seed = 22;
  const back = -20.4;
  // Mosaic: a white field of small black tiles in a checker, with a border band.
  for (let x = -7.2; x < 7.3; x += 0.5) {
    for (let z = -0.8; z > back + 0.3; z -= 0.5) {
      const i = Math.round((x + 7.2) / 0.5), j = Math.round((-0.8 - z) / 0.5);
      const edge = i === 0 || j === 0 || x > 7.0 || z < back + 0.6;
      if (edge || (i + j) % 2 === 0) k.ibox(b, x + 0.25, 0, z - 0.25, 0.47, 0.012, 0.47, edge ? '#5a1e18' : '#1a1a1a', 0.25);
    }
  }
  k.ibox(b, 0, 0, -0.5 + 0.02 - 0.25, 15, 0.006, 0.5, '#e8e4da', 0.3);
  // Mahogany wainscot round the room, under the window sills.
  const wain = '#4a1e14';
  k.ibox(b, 0, 0, -0.56, 15, 0.5, 0.06, wain, 0.4);
  k.ibox(b, -7.44, 0, (back - 0.5) / 2, 0.06, 1.3, -back - 0.5, wain, 0.4);
  k.ibox(b, 7.44, 0, (back - 0.5) / 2, 0.06, 0.55, -back - 0.5, wain, 0.4);
  k.ibox(b, -7.4, 1.3, (back - 0.5) / 2, 0.1, 0.08, -back - 0.5, '#2a100a', 0.4);
  // Partition to the Jack Dempsey Room, an arched opening in the middle.
  k.wall(b, -7.5, 7.5, back + 0.12, 0, G0 - 0.3, 0.24, PLASTER, PLASTER, [{ x: 0.5, y: 0, w: 3.6, h: 3.1, trim: wain, arch: 0.4 }], k.in());
  k.ibox(b, 0, 0, back + 0.14, 15, 1.3, 0.04, wain, 0.4);

  // Pressed-tin ceiling, left open over the stairwell.
  const cy = G0 - 0.31;
  F.tinCeiling(k, b, 1.9, cy, (back - 0.5) / 2, 11.2, -back - 0.5, '#d4cab0', 0.9);
  F.tinCeiling(k, b, -5.65, cy, (-0.5 + STAIR.z1) / 2, 3.7, STAIR.z1 + 0.5, '#d4cab0', 0.9);
  F.tinCeiling(k, b, -5.65, cy, (STAIR.z0 + back) / 2, 3.7, STAIR.z0 - back, '#d4cab0', 0.9);
  F.chandelier(k, b, 1.2, cy, -4, 0.8, 10, 10, 1.6);
  F.chandelier(k, b, 3.2, cy, -11.5, 0.7, 8, 9, 1.4);
  F.chandelier(k, b, 1.0, cy, -17.4, 0.6, 8, 8, 1.2);

  // Cast-iron columns with fluted shafts and Corinthian-ish caps.
  for (const z of [-7.2, -14]) {
    k.cyl(b, 1.0, 0, z, 0.3, 0.3, 0.3, '#2a2420', k.in(0.4), 8);
    k.cyl(b, 1.0, 0.3, z, 0.17, 0.15, G0 - 1.1, '#3a3430', k.in(0.35), 12);
    k.cyl(b, 1.0, G0 - 0.8, z, 0.17, 0.32, 0.5, BRASS_DARK, k.in(0.35), 12);
  }

  // Front desk: a marble-topped mahogany counter, brass bell and register,
  // and behind it the pigeonholes and hooks for every room key.
  const desk = b.sub(-5.4, 0, -4.2, Math.PI / 2);
  k.ibox(desk, 0, 0, 0, 5.0, 1.1, 0.7, F.WOOD.mahogany, 0.45);
  for (let x = -2.2; x <= 2.2; x += 0.88) k.ibox(desk, x, 0.15, 0.36, 0.7, 0.8, 0.02, '#5a2a1a', 0.45);
  k.ibox(desk, 0, 1.1, 0.04, 5.2, 0.06, 0.86, '#e8e4dc', 0.15);
  k.sphere(desk, 1.2, 1.2, 0.1, 0.06, F.BRASS, k.in(0.2), 8);
  k.ibox(desk, -0.8, 1.16, 0.0, 0.5, 0.05, 0.36, '#3a1a10', 0.6);
  k.ibox(desk, -0.8, 1.21, 0.0, 0.46, 0.01, 0.32, '#f0e8d4', 0.8);
  k.ibox(desk, 2.0, 1.16, -0.1, 0.36, 0.28, 0.3, F.BRASS, 0.25);
  const cub = b.sub(-7.36, 0, -4.2, Math.PI / 2);
  k.ibox(cub, 0, 1.2, 0, 4.4, 1.9, 0.3, F.WOOD.mahogany, 0.45);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
      k.ibox(cub, -1.98 + c * 0.44, 1.3 + r * 0.29, 0.1, 0.38, 0.24, 0.12, '#1e0c06', 0.6);
      if ((r * 10 + c) % 3 !== 0) k.ibox(cub, -1.98 + c * 0.44, 1.38 + r * 0.29, 0.16, 0.04, 0.12, 0.02, F.BRASS, 0.25);
    }
  }
  k.sign(cub, 'mizpahDesk', 0, 3.45, 0.18, 0.42, 0.3);
  k.lamp(desk, 0, 2.2, 0.6, 4.5, 0.7);
  F.chair(k, desk, 0.6, 0, -0.9, 0, F.WOOD.mahogany, '#5a1a1a');

  // Parlour: velvet sofa and armchairs round a Persian rug, a piano by the window.
  F.rug(k, b, 4.4, 0, -7.6, 4.6, 6.0, '#5a1418', '#c8a050');
  F.sofa(k, b, 6.6, 0, -7.6, -Math.PI / 2, 2.4, '#6a1820');
  F.armchair(k, b, 2.5, 0, -6.3, Math.PI / 2 + 0.3, '#6a1820');
  F.armchair(k, b, 2.5, 0, -8.9, Math.PI / 2 - 0.3, '#6a1820');
  F.table(k, b, 4.6, 0, -7.6, 0.9, 1.4, F.WOOD.walnut, F.WOOD.walnut, 0.45);
  F.armchair(k, b, 4.4, 0, -4.4, Math.PI, '#2a3a2a');
  F.roundTable(k, b, 5.8, 0, -3.0, 0.4, F.WOOD.walnut, 0.7);
  F.nightstand(k, b, 6.9, 0, -10.6, -Math.PI / 2, F.WOOD.walnut, '#f0d090');
  F.piano(k, b, 6.9, 0, -13.2, -Math.PI / 2);
  F.stool(k, b, 5.9, 0, -13.2, '#2a1010', F.WOOD.walnut);
  F.plant(k, b, 6.8, 0, -1.2, 1.7);
  F.plant(k, b, -2.4, 0, -1.2, 1.7);
  F.plant(k, b, 6.8, 0, -15.2, 1.5);
  // Grandfather clock by the stairs.
  k.ibox(b, -3.4, 0, -14.4, 0.55, 2.1, 0.4, F.WOOD.walnut, 0.4);
  k.cyl(b, -3.4, 1.65, -14.18, 0.2, 0.2, 0.02, '#f0e8d0', k.in(0.4), 14);
  k.ibox(b, -3.4, 0.5, -14.18, 0.08, 0.8, 0.01, F.BRASS, 0.25);
  // Portraits of the camp's founders over the wainscot.
  for (let i = 0; i < 4; i++) F.picture(k, b, -7.38, 2.6, -15 - i * 1.3, 0.8, 1.0, Math.PI / 2, 40 + i, '#9a7a3a');
  for (const z of [-5.5, -10, -14.6]) F.sconce(k, b, 7.4, 2.4, z, -Math.PI / 2, 4, 0.5);
  F.sconce(k, b, -7.4, 2.4, -16.5, Math.PI / 2, 4, 0.5);

  // The slot nook toward the back.
  F.slotBank(k, b, 4.6, 0, -17.6, 4, Math.PI / 2, 7);
  F.slotBank(k, b, 1.6, 0, -18.4, 3, Math.PI / 2, 19);
}

/**
 * The Jack Dempsey Room behind the lobby: a long mahogany bar with a mirrored
 * back bar, pendant globes, bentwood tables, booths along the north wall and
 * fight photos of the Manassa Mauler, who once bounced drunks in this camp.
 */
export function mizpahDempsey(k: Kit, b: Frame) {
  k.seed = 23;
  const z0 = -20.4, z1 = -D + T;
  const zc = (z0 + z1) / 2, len = z0 - z1;
  // Plank floor and a darker wainscot.
  for (let x = -7.4; x < 7.4; x += 0.16) k.ibox(b, x + 0.08, 0, zc, 0.15, 0.01, len, (Math.round(x / 0.16) % 3 === 0) ? '#6a4226' : '#7a4e2c', 0.5);
  k.ibox(b, -7.44, 0, zc, 0.06, 1.2, len, '#3a160c', 0.4);
  k.ibox(b, 0, 0, z1 + 0.06, 15, 1.2, 0.06, '#3a160c', 0.4);
  F.tinCeiling(k, b, 0, G0 - 0.31, zc, 15, len, '#b8a888', 0.9);

  // The bar along the Brougher wall, its back bar against the windows' pier.
  F.bar(k, b, 4.9, 0, zc - 0.3, 9.4, -Math.PI / 2, F.WOOD.mahogany, 1.75);
  const back = b.sub(6.75, 0, zc - 0.3, -Math.PI / 2);
  k.sign(back, 'dempsey', 0, 3.6, -0.2, 0.5, 0.6);
  for (let i = 0; i < 5; i++) {
    const z = zc - 4 + i * 1.9;
    k.cyl(b, 4.6, G0 - 1.6, z, 0.01, 0.01, 1.3, '#1a1a1a', k.in(0.4), 4);
    k.sphere(b, 4.6, G0 - 1.75, z, 0.18, '#ffe0a8', k.lit(3.5), 10);
    k.lamp(b, 4.6, G0 - 1.9, z, 6.5, 1.3);
  }
  // Brass spittoons along the foot rail, as in 1907.
  for (const z of [zc - 3, zc + 1.5]) k.cyl(b, 3.95, 0, z, 0.16, 0.12, 0.22, F.BRASS, k.in(0.25), 10);

  // Bentwood tables down the middle, booths along the north wall.
  for (let i = 0; i < 3; i++) {
    const z = z0 - 2.2 - i * 3.6;
    F.roundTable(k, b, 0.3, 0, z, 0.45, F.WOOD.walnut, 0.74);
    for (let c = 0; c < 4; c++) {
      const a = (c / 4) * Math.PI * 2 + 0.4;
      F.chair(k, b, 0.3 + Math.cos(a) * 0.85, 0, z + Math.sin(a) * 0.85, Math.PI / 2 - a + Math.PI, '#5a3418', '#3a1a10');
    }
  }
  for (let i = 0; i < 4; i++) {
    const z = z0 - 1.6 - i * 2.75;
    const booth = b.sub(-6.3, 0, z, Math.PI / 2);
    k.ibox(booth, 0, 0, -0.9, 1.6, 0.45, 0.55, '#5a1418', 0.9);
    k.ibox(booth, 0, 0.45, -1.12, 1.6, 0.75, 0.12, '#5a1418', 0.9);
    k.ibox(booth, 0, 0, 0.9, 1.6, 0.45, 0.55, '#5a1418', 0.9);
    k.ibox(booth, 0, 0.45, 1.12, 1.6, 0.75, 0.12, '#5a1418', 0.9);
    F.table(k, booth, 0, 0, 0, 1.3, 0.8, '#2a120a', '#1a0a06', 0.74);
    k.sphere(booth, 0, 0.82, 0, 0.06, '#ffd890', k.lit(2.5), 6);
    k.lamp(booth, 0, 1.3, 0, 3.4, 0.8);
  }
  // Fight photos and a pair of old gloves hung on the wall.
  for (let i = 0; i < 6; i++) F.picture(k, b, -7.36, 2.2 + (i % 2) * 0.9, z0 - 1.5 - i * 1.8, 0.6, 0.75, Math.PI / 2, 60 + i, '#2a1a10');
  for (const dx of [-0.18, 0.18]) k.sphere(b, -7.2, 3.4, z1 + 2 + dx, 0.13, '#8a1010', k.in(0.6), 8);
  k.ibox(b, -7.3, 3.5, z1 + 2, 0.04, 0.4, 0.4, '#1a1a1a', 0.6);
  // A dartboard by the back door, and a jukebox glowing in the corner.
  k.cyl(b, -2.5, 1.5, z1 + 0.08, 0.23, 0.23, 0.04, '#1a1a1a', k.in(0.7), 16);
  const juke = b.sub(-6.6, 0, z1 + 0.6, 0);
  k.ibox(juke, 0, 0, 0, 0.9, 1.1, 0.6, '#4a2010', 0.4);
  k.geo(juke, new THREE.CylinderGeometry(0.45, 0.45, 0.6, 16, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2), 0, 1.1, 0, '#ffb040', k.lit(3.5));
  k.lamp(juke, 0, 1.2, 0.6, 3, 0.6, '#ffa860');
}

/**
 * The stair core: a switchback staircase with mahogany rails climbing all five
 * floors beside Nevada's first electric elevator, its brass cage gates at every landing.
 */
export function mizpahCore(k: Kit, b: Frame) {
  k.seed = 24;
  const ax = STAIR.x0 + 0.9, bx = STAIR.x1 - 0.9;
  const z0 = STAIR.z1 - 0.05;
  for (let fl = 0; fl < 4; fl++) {
    const y = level(fl);
    const rise = (fl === 0 ? G0 : FH) / 2;
    const n = fl === 0 ? 13 : 10;
    const run = 0.28;
    const zl = z0 - n * run;
    F.stairsRun(k, b, ax, y, z0, 1.6, rise, n, run, 0);
    // Half landing across the back of the well.
    k.slab(b, (STAIR.x0 + STAIR.x1) / 2, y + rise, zl - 0.75, STAIR.x1 - STAIR.x0, 1.5, '#6a1a22', '#e6dcc4', 0.2);
    F.stairsRun(k, b, bx, y + rise, zl, 1.6, rise, n, run, Math.PI);
    // Newel posts with brass caps at the foot of each flight.
    for (const [x, z, yy] of [[ax + 0.8, z0, y], [bx - 0.8, zl, y + rise]] as [number, number, number][]) {
      k.box(b, x, yy, z, 0.18, 1.15, 0.18, F.WOOD.mahogany, k.in(0.4));
      k.sphere(b, x, yy + 1.22, z, 0.1, F.BRASS, k.in(0.25), 8);
    }
  }
  // Balustrade round the well on the upper floors.
  for (let fl = 1; fl < 5; fl++) {
    const y = level(fl);
    rail(k, b, STAIR.x0, ax + 0.8, STAIR.z0 - 0.02, y, 'x');
    rail(k, b, STAIR.z0, STAIR.z1 - 0.3, STAIR.x1 + 0.02, y, 'z');
  }
  // Runner carpet tone on the treads comes from the stairs; the well walls are plaster.
  const wellX = (STAIR.x0 + STAIR.x1) / 2;
  for (let fl = 0; fl < 5; fl++) F.sconce(k, b, wellX, level(fl) + 2.3, STAIR.z0 - 0.02 + 0.02, 0, 4, 0.5);
  F.elevator(k, b, LIFT.x, 0, LIFT.z, Math.PI / 2, [0, 1, 2, 3, 4].map(level));
  // Shaft walls behind the cage.
  for (const dz of [-0.9, 0.9]) k.ibox(b, LIFT.x, 0, LIFT.z + dz, 1.8, TOP - 0.3, 0.12, '#d8ccb0', 0.8);
  k.ibox(b, LIFT.x - 0.9, 0, LIFT.z, 0.12, TOP - 0.3, 1.9, '#d8ccb0', 0.8);
}

/** Mahogany handrail on turned balusters along x or z. */
function rail(k: Kit, b: Frame, a0: number, a1: number, at: number, y: number, along: 'x' | 'z') {
  const len = Math.abs(a1 - a0), mid = (a0 + a1) / 2;
  if (along === 'x') k.ibox(b, mid, y + 0.95, at, len, 0.07, 0.09, F.WOOD.mahogany, 0.4);
  else k.ibox(b, at, y + 0.95, mid, 0.09, 0.07, len, F.WOOD.mahogany, 0.4);
  for (let t = 0; t <= len; t += 0.16) {
    const p = Math.min(a0, a1) + t;
    if (along === 'x') k.cyl(b, p, y, at, 0.025, 0.02, 0.95, F.WOOD.mahogany, k.in(0.4), 5);
    else k.cyl(b, at, y, p, 0.025, 0.02, 0.95, F.WOOD.mahogany, k.in(0.4), 5);
  }
}

/** Centre z of guest-room slot s. */
export const slotZ = (s: number) => -0.5 - SLOT * (s + 0.5);

/**
 * The guest floors: a long corridor down the middle with a red-and-gold runner,
 * frosted sconces and numbered doors, rooms either side behind plaster partitions.
 */
export function mizpahFloors(k: Kit, b: Frame) {
  k.seed = 25;
  const ceil = FH - 0.3;
  for (let fl = 1; fl < 5; fl++) {
    const y = level(fl);
    const fb = b.sub(0, y, 0);
    // Corridor walls with a door into every room.
    const sw = k.side(fb, 1, -D / 2, 1);
    const sDoors: Hole[] = [];
    for (let s = 0; s < SLOTS; s++) sDoors.push({ x: -(slotZ(s) + 1.8) - D / 2, y: 0, w: 1.0, h: 2.25, trim: F.WOOD.walnut });
    k.wall(sw, -D / 2 + T, D / 2 - T, 0, 0, ceil, 0.14, '#d8c8a0', '#d8c8a0', sDoors, k.in());
    const nw = k.side(fb, -1, -D / 2, -1);
    const nDoors: Hole[] = [];
    for (let s = 0; s < SLOTS; s++) {
      if (s === 1) nDoors.push({ x: slotZ(s) + D / 2, y: 0, w: SLOT - 0.2, h: ceil - 0.01 });
      else nDoors.push({ x: slotZ(s) + 1.8 + D / 2, y: 0, w: 1.0, h: 2.25, trim: F.WOOD.walnut });
    }
    k.wall(nw, -D / 2 + T, D / 2 - T, 0, 0, ceil, 0.14, '#d8c8a0', '#d8c8a0', nDoors, k.in());
    // Partitions between rooms.
    for (let s = 1; s < SLOTS; s++) {
      const z = -0.5 - SLOT * s + 0.07;
      k.wall(fb, 1, W / 2 - T, z, 0, ceil, 0.14, '#e0d4b8', '#e0d4b8', [], k.in());
      if (s !== 1 && s !== 2) k.wall(fb, -W / 2 + T, -1, z, 0, ceil, 0.14, '#e0d4b8', '#e0d4b8', [], k.in());
    }
    // Stairwell side walls toward the neighbouring rooms.
    k.wall(fb, -W / 2 + T, -1, STAIR.z1 + 0.27, 0, ceil, 0.14, '#e0d4b8', '#e0d4b8', [], k.in());
    k.wall(fb, -W / 2 + T, -1, STAIR.z0 - 0.06, 0, ceil, 0.14, '#e0d4b8', '#e0d4b8', [], k.in());

    // Runner down the corridor with a gold border, picture rail and dado.
    k.ibox(fb, 0, 0, -D / 2, 1.5, 0.012, D - 1.4, '#7a1a22', 0.95);
    for (const x of [-0.7, 0.7]) k.ibox(fb, x, 0, -D / 2, 0.08, 0.014, D - 1.4, '#c8a050', 0.9);
    for (const x of [-0.92, 0.92]) {
      k.ibox(fb, x, 0.9, -D / 2, 0.04, 0.06, D - 1.2, F.WOOD.walnut, 0.5);
      k.ibox(fb, x, 2.5, -D / 2, 0.04, 0.05, D - 1.2, F.WOOD.walnut, 0.5);
      k.ibox(fb, x, 0, -D / 2, 0.03, 0.9, D - 1.2, '#8a5a3a', 0.6);
    }
    for (let s = 0; s < SLOTS; s++) {
      const z = slotZ(s);
      F.sconce(k, fb, s % 2 ? 0.92 : -0.92, 2.1, z - 0.6, s % 2 ? -Math.PI / 2 : Math.PI / 2, 4.5, 0.55);
      // Brass room numbers beside each door.
      k.ibox(fb, 0.9, 1.65, z + 1.8 - 0.75, 0.02, 0.1, 0.24, F.BRASS, 0.25);
      if (s !== 1) k.ibox(fb, -0.9, 1.65, z + 1.8 - 0.75, 0.02, 0.1, 0.24, F.BRASS, 0.25);
      F.picture(k, fb, s % 2 ? -0.9 : 0.9, 1.75, z - 1.6, 0.7, 0.5, s % 2 ? Math.PI / 2 : -Math.PI / 2, 80 + fl * 7 + s, '#6a4a20');
    }
    // An old fire-hose cabinet and a radiator at the far end of each hall.
    k.ibox(fb, 0.86, 0.9, -D + 1.6, 0.12, 0.9, 0.7, '#8a1a10', 0.5);
    k.ibox(fb, 0, 0.1, -D + T + 0.12, 1.0, 0.7, 0.14, '#9a9a96', 0.4);
  }
}

const SPREADS = ['#6a1a22', '#2a3a5a', '#3a4a2a', '#7a5a2a', '#5a2a4a', '#e8e0d0'];
const PAPERS = ['#d8c8a0', '#c8b890', '#d0c0b0', '#b8c0a8', '#d8b8a8'];

/**
 * Every guest room furnished as the restoration left them: a brass or walnut
 * bed under a landscape, nightstand lamp, dresser and mirror, wardrobe, a
 * wingback by the lace-curtained windows, steam radiators ticking underneath.
 */
export function mizpahRooms(k: Kit, b: Frame) {
  k.seed = 26;
  for (let fl = 1; fl < 5; fl++) {
    for (let s = 0; s < SLOTS; s++) {
      room(k, b, fl, 1, s, (fl + 1) * 100 + s + 1);
      if (s !== 1) room(k, b, fl, -1, s, (fl + 1) * 100 + 6 + (s > 1 ? s - 1 : s));
    }
  }
}

/** One guest room; side 1 is the Brougher side, -1 the north side. Returns its frame. */
function room(k: Kit, b: Frame, fl: number, side: 1 | -1, s: number, num: number) {
  const y = level(fl);
  const rf = b.sub(side * 4.25, y, slotZ(s), (side * Math.PI) / 2);
  const m = side;
  const h = (n: number) => Math.abs(Math.sin(num * 12.9898 + n * 78.233) * 43758.5453) % 1;
  const wood = h(1) < 0.3 ? F.BRASS : h(1) < 0.65 ? F.WOOD.walnut : F.WOOD.oak;
  const paper = PAPERS[Math.floor(h(2) * PAPERS.length)];
  // Wallpaper skin on the side walls with a picture rail; floorboards and a rug.
  for (const x of [-3.12, 3.12]) {
    k.ibox(rf, x, 0, 0, 0.02, FH - 0.3, 6.3, paper, 0.9);
    k.ibox(rf, x - Math.sign(x) * 0.02, 2.45, 0, 0.03, 0.05, 6.3, F.WOOD.walnut, 0.5);
  }
  k.ibox(rf, 0, 0, 0, 6.3, 0.01, 6.3, '#7a5234', 0.5);
  F.rug(k, rf, 0.2 * m, 0.01, 0.6, 2.8, 3.2, ['#5a1a1a', '#1a2a4a', '#3a2a1a', '#4a3a2a'][Math.floor(h(3) * 4)], '#c8a060');
  // Bed against the side wall away from the door.
  const bedYaw = m > 0 ? -Math.PI / 2 : Math.PI / 2;
  F.bed(k, rf, 2.0 * m, 0, 0.4, bedYaw, SPREADS[Math.floor(h(4) * SPREADS.length)], wood === F.BRASS ? '#b8903a' : wood, h(5) < 0.5 ? 1.5 : 1.35);
  F.nightstand(k, rf, 2.85 * m, 0, 1.75, bedYaw, F.WOOD.walnut, '#f0d8a8', true);
  F.nightstand(k, rf, 2.85 * m, 0, -0.95, bedYaw, F.WOOD.walnut, '#f0d8a8', false);
  F.picture(k, rf, 3.1 * m, 2.2, 0.4, 1.0, 0.7, bedYaw, num, '#8a6a2a');
  F.dresser(k, rf, -2.85 * m, 0, 0.9, -bedYaw);
  F.wardrobe(k, rf, 0.9 * m, 0, -2.75, 0);
  F.armchair(k, rf, -1.9 * m, 0, 2.4, Math.PI - m * 0.6, ['#5a1a1a', '#2a3a2a', '#3a2a4a'][Math.floor(h(6) * 3)]);
  F.roundTable(k, rf, -0.9 * m, 0, 2.6, 0.32, F.WOOD.walnut, 0.65);
  // Radiators and lace curtains at both windows.
  for (const wx of [-1.6, 1.6]) {
    const rad = rf.sub(wx, 0, 2.95, Math.PI);
    for (let i = 0; i < 9; i++) k.ibox(rad, -0.36 + i * 0.09, 0.08, 0, 0.06, 0.62, 0.16, '#a8a6a0', 0.4);
    for (const cx of [-0.68, 0.68]) k.ibox(rf, wx + cx, 0.7, 3.0, 0.32, 2.1, 0.04, '#f0ece0', 0.95);
    k.ibox(rf, wx, 2.85, 3.0, 1.7, 0.06, 0.06, F.BRASS, 0.3);
  }
  // Ceiling rose and a glass shade.
  k.cyl(rf, 0, FH - 0.36, 0.3, 0.22, 0.22, 0.04, '#e8e0cc', k.in(0.6), 12);
  k.sphere(rf, 0, FH - 0.6, 0.3, 0.16, '#fff4dc', k.lit(2.6), 10);
  k.lamp(rf, 0, FH - 0.75, 0.3, 6, 0.9);
  // Number on the inside of the door.
  k.ibox(rf, -1.8 * m, 1.6, -3.1, 0.2, 0.1, 0.02, F.BRASS, 0.25);
  return rf;
}

/** Room 502's frame: fifth floor, Brougher side, second from the front. */
export const room502 = (b: Frame) => b.sub(4.25, level(4), slotZ(1), Math.PI / 2);

/**
 * Room 502, the Lady in Red's room. A working girl strangled by a jealous lover
 * in the fifth-floor hall; guests still find pearls on their pillows. The hotel
 * keeps it as a shrine: red velvet, roses, candles and her portrait.
 */
export function mizpah502(k: Kit, b: Frame) {
  k.seed = 28;
  const rf = room502(b);
  const RED = '#8a0e16';
  const DEEP = '#4a060c';
  // Red silk wallpaper over the side walls.
  for (const x of [-3.1, 3.1]) k.ibox(rf, x, 0, 0, 0.02, FH - 0.95, 6.3, '#6a0c14', 0.6);
  F.rug(k, rf, 0.2, 0.012, 0.6, 2.9, 3.3, '#5a0810', '#c8a060');
  // Red velvet counterpane and bolsters over the bed.
  const bed = rf.sub(2.0, 0, 0.4, -Math.PI / 2);
  k.ibox(bed, 0, 0.49, 0.12, 1.62, 0.12, 1.76, RED, 0.85);
  k.ibox(bed, 0, 0.3, 0.12, 1.64, 0.3, 1.78, RED, 0.85);
  for (const px of [-0.38, 0.38]) k.ibox(bed, px, 0.6, -0.76, 0.66, 0.16, 0.38, DEEP, 0.7);
  // A string of pearls left on the pillow.
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    k.sphere(bed, 0.32 + Math.cos(a) * 0.12, 0.77, -0.74 + Math.sin(a) * 0.08, 0.012, '#f6f0e4', k.in(0.15, 0.9), 5);
  }
  // Rose petals scattered over the counterpane and the floor.
  for (let i = 0; i < 40; i++) {
    const h = (n: number) => Math.abs(Math.sin(i * 91.7 + n * 13.1) * 4375.5) % 1;
    const onBed = i < 18;
    const px = onBed ? 2.0 + (h(1) - 0.5) * 1.4 : (h(1) - 0.5) * 4.5;
    const pz = onBed ? 0.6 + (h(2) - 0.5) * 1.4 : (h(2) - 0.5) * 4.5;
    k.ibox(rf, px, onBed ? 0.62 : 0.015, pz, 0.04, 0.005, 0.03, h(3) < 0.5 ? '#a8101c' : '#7a0a12', 0.7, h(4) * 6);
  }
  // Heavy red drapes tied back at both windows.
  for (const wx of [-1.6, 1.6]) {
    for (const cx of [-0.85, 0.85]) k.ibox(rf, wx + cx, 0.02, 2.9, 0.3, 2.85, 0.08, RED, 0.9);
    k.ibox(rf, wx, 2.55, 2.9, 1.95, 0.4, 0.1, DEEP, 0.9);
  }
  // Candles and a vase of red roses on the dresser.
  const dr = rf.sub(-2.85, 0.85, 0.9, Math.PI / 2);
  for (const [cx, ch] of [[-0.45, 0.22], [-0.33, 0.15], [0.4, 0.26]]) {
    k.cyl(dr, cx, 0, 0.05, 0.025, 0.025, ch, '#f4ecd8', k.in(0.6), 8);
    k.sphere(dr, cx, ch + 0.02, 0.05, 0.012, '#ffb24a', k.lit(6), 5);
  }
  k.lamp(dr, 0, 0.5, 0.1, 4, 0.6, '#ff8a4a');
  k.cyl(dr, 0.05, 0, 0.05, 0.05, 0.07, 0.24, '#c8d4d8', k.in(0.1), 10);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    k.sphere(dr, 0.05 + Math.cos(a) * 0.07, 0.3 + (i % 3) * 0.03, 0.05 + Math.sin(a) * 0.07, 0.03, '#a00e1a', k.in(0.8), 6);
  }
  // Her portrait over the bed: a gilt frame, a woman in red against the dark.
  const pf = rf.sub(3.06, 1.55, 0.4, -Math.PI / 2);
  k.ibox(pf, 0, 0, 0, 0.92, 1.22, 0.05, '#b08a3a', 0.3);
  k.ibox(pf, 0, 0.06, 0.03, 0.78, 1.08, 0.01, '#1a1012', 0.9);
  k.ibox(pf, 0, 0.1, 0.04, 0.42, 0.55, 0.01, '#9a0e18', 0.7);
  k.ibox(pf, 0, 0.62, 0.04, 0.22, 0.12, 0.01, '#9a0e18', 0.7);
  k.sphere(pf, 0, 0.82, 0.04, 0.08, '#e8d0c0', k.in(0.6), 8);
  k.ibox(pf, 0, 0.86, 0.035, 0.22, 0.16, 0.01, '#2a1410', 0.9);
  for (let i = 0; i < 9; i++) k.sphere(pf, -0.08 + i * 0.02, 0.7 - Math.sin((i / 8) * Math.PI) * 0.04, 0.05, 0.008, '#f6f0e4', k.in(0.2), 4);
  // A red glass shade turns the ceiling lamp to a blush.
  k.sphere(rf, 0, FH - 0.6, 0.3, 0.17, '#c0202a', k.lit(2.2), 10);
  k.lamp(rf, 0, FH - 0.9, 0.3, 6, 0.8, '#ff4a4a');
}

/**
 * The Mizpah's street face: the vertical neon blade at the Brougher corner with
 * bulbs chasing round it, the bulb-lit marquee over the doors, the faded painted
 * sign high on the side wall, gooseneck lamps and the sidewalk out front.
 */
export function mizpahFacade(k: Kit, b: Frame) {
  k.seed = 27;
  // Blade sign on iron brackets, readable up and down Main Street.
  const bx = W / 2 - 1.0, bz = 1.25, by = 6.2, bh = 9.6;
  const bw = k.signW('mizpahBlade', bh);
  k.box(b, bx, by - 0.25, bz, 0.34, bh + 0.5, bw + 0.4, '#1a0c0a', { rough: 0.5, fx: FX.METAL });
  for (const sx of [-1, 1]) {
    const p = b.p(bx + sx * 0.18, by + bh / 2, bz);
    k.sg.quad(p, b.f.clone().multiplyScalar(-sx), UP, bw, bh, k.rects.mizpahBlade, 1.4, FX.CHASE, k.seed, false);
  }
  for (const y of [by + 0.6, by + bh - 1.2]) k.box(b, bx, y, bz / 2, 0.12, 0.12, bz + 0.2, '#1a1a1a', { fx: FX.METAL });
  k.light(b.p(bx, by + bh + 0.3, bz), 1, 0.3, 0.2, 2.2);

  // Marquee canopy over the doors, hung on chains, bulbs underneath.
  const mw = 6.4, md = 2.6, my = 3.6;
  k.box(b, 0, my, md / 2, mw, 0.18, md, '#2a1410', { rough: 0.5 });
  k.box(b, 0, my + 0.18, md / 2, mw, 0.9, md, '#1a0a08', { rough: 0.5 });
  k.sign(b, 'mizpahMarquee', 0, my + 0.63, md + 0.01, 0.9, 1.2, FX.CHASE);
  for (const sx of [-1, 1]) {
    const side = b.sub(sx * (mw / 2 + 0.01), 0, md / 2, (sx * Math.PI) / 2);
    k.sign(side, 'mizpahMarquee', 0, my + 0.63, 0, 0.9 * (md / k.signW('mizpahMarquee', 0.9)), 1.0, FX.CHASE);
    k.beam(b, new THREE.Vector3(sx * (mw / 2 - 0.3), my + 1.08, md - 0.2), new THREE.Vector3(sx * (mw / 2 - 0.3), my + 3.4, 0), 0.05, '#1a1a1a', { fx: FX.METAL });
  }
  for (let x = -mw / 2 + 0.3; x < mw / 2; x += 0.5) {
    for (const z of [0.5, md - 0.3]) k.box(b, x, my - 0.06, z, 0.09, 0.06, 0.09, '#fff2c8', { glow: 2.2, fx: FX.CHASE });
  }
  k.light(b.p(0, my - 0.2, md / 2), 1, 0.85, 0.55, 3);

  // Painted ghost sign in the brick band between the top two rows of windows.
  const south = k.side(b, W / 2, -D / 2, 1);
  k.sign(south, 'mizpahWall', 0, level(4) - 0.05, 0.03, 1.4, 0);
  // Gooseneck lamps washing the brick between the ground-floor windows.
  for (const x of [-6.9, -2.6, 2.6, 6.9]) {
    k.box(b, x, G0 + 0.2, 0.1, 0.08, 0.08, 0.6, '#1a1a1a', { fx: FX.METAL });
    k.box(b, x, G0 + 0.05, 0.6, 0.3, 0.18, 0.3, '#1a1a1a', { fx: FX.METAL });
    k.light(b.p(x, G0 - 0.05, 0.6), 1, 0.78, 0.5, 1.3);
  }
  for (const z of [-4, -12, -20, -28]) {
    k.box(south, -z - D / 2, G0 + 0.05, 0.4, 0.3, 0.18, 0.5, '#1a1a1a', { fx: FX.METAL });
    k.light(south.p(-z - D / 2, G0 - 0.05, 0.6), 1, 0.78, 0.5, 1.3);
  }
  // Night wash: the brick glows in the lamplight.
  k.box(b, 0, 0.05, 0.02, W - 0.1, G0 - 0.4, 0.02, BRICK, { rough: 0.95, glow: 0.5, fx: FX.WASH });
  k.box(south, 0, 0.05, 0.02, D - 0.1, G0 - 0.4, 0.02, BRICK, { rough: 0.95, glow: 0.5, fx: FX.WASH });

  // Sidewalk, curb, a bench and the old iron hitching posts.
  k.box(b, 0, -0.2, 3.2, W + 6, 0.22, 6.4, '#a8a29a', { rough: 0.95 });
  k.box(b, 0, -0.2, 6.4, W + 6, 0.24, 0.25, '#d0ccc4', { rough: 0.9 });
  F.sofa(k, b, -5.2, 0, 4.6, Math.PI, 1.6, '#3a2a1a', '#1a1a1a');
  for (const x of [-7.5, 7.5]) {
    k.cyl(b, x, 0, 5.8, 0.06, 0.05, 1.1, '#1a1a1a', { fx: FX.METAL }, 8);
    k.sphere(b, x, 1.12, 5.8, 0.08, '#1a1a1a', { fx: FX.METAL }, 6);
  }
  k.spot(b, 0, 4, 6, 5);
}
