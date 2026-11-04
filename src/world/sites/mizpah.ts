import * as THREE from 'three';
import type { Frame } from '../builders';
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
