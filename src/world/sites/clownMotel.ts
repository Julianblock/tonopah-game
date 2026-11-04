import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Hole, Kit } from '../kit';

// The Clown Motel, 1985: built by Leona and Leroy David beside the Old Tonopah
// Cemetery, where their father Clarence lies, and named for his collection of
// clowns. The office doubles as a museum of more than two thousand of them.

const STUCCO = '#f2ece0';
const RED = '#d81a1a';
const PANEL = '#f4e8b8';
const DOORS = ['#d81a1a', '#2a5ad0', '#f0c828', '#2aa84a', '#e86ab8', '#ff8a1a'];
const RAIL = '#2a5ad0';

/** Room block: 14 rooms a floor, two floors, doors facing east off the cemetery fence. */
export const RL = 56;
export const RD = 10;
export const RH = 2.9;
export const ROOMS = 14;
export const RW = RL / ROOMS;
/** Rooms whose doors stand open: the horror-themed ones and a couple of others. */
export const OPEN = new Set([102, 104, 106, 108, 110, 112, 201, 204, 207, 209, 210, 213]);
/** Centre of room i (0 = south end) along the block. */
export const roomX = (i: number) => -RL / 2 + RW * (i + 0.5);

/** Office frame: x across the highway face, z out toward US-95, y up from the floor. */
export const OW = 12.1;
export const OD = 12.9;
const OH = 3.4;

export function clownOffice(k: Kit): Frame {
  k.seed = 40;
  const fr = k.footprint(-700, -455.8, OW, OD, 0.5, 1, 14);
  const [lo, hi] = k.footRange(fr, -OW / 2, OW / 2, -OD, 0);
  const base = Math.max(0.2, hi + 0.15);
  const b = fr.sub(0, base, 0);
  k.box(b, 0, lo - base - 0.4, -OD / 2, OW + 0.2, base - lo + 0.4, OD + 0.2, '#b8b0a4', { rough: 0.95 });
  k.stairs(b, -3, -base, Math.max(1, Math.round(base / 0.17)) * 0.3, 1.8, base, Math.max(1, Math.round(base / 0.17)), '#b8b0a4', '#b8b0a4');

  const top = OH + 0.9;
  const front: Hole[] = [
    { x: -3, y: 0, w: 1.1, h: 2.3, trim: RED },
    { x: 2.4, y: 0.7, w: 5.6, h: 1.9, glass: true, trim: RED },
    { x: -5.0, y: 0.9, w: 1.0, h: 1.4, glass: true, trim: RED },
  ];
  k.wall(b, -OW / 2, OW / 2, 0, -0.1, top, 0.3, STUCCO, PANEL, front, { rough: 0.9 });
  k.wall(b, -OW / 2, OW / 2, -OD + 0.3, -0.1, top, 0.3, PANEL, null, [], k.in(0.8));
  k.box(b, 0, -0.1, -OD - 0.02, OW, top + 0.1, 0.04, STUCCO, { rough: 0.9 });
  for (const s of [-1, 1] as const) {
    const side = k.side(b, (s * OW) / 2, -OD / 2, s);
    const holes: Hole[] = [{ x: s * -3.2, y: 0.9, w: 1.4, h: 1.4, glass: true, trim: RED }];
    k.wall(side, -OD / 2 + 0.3, OD / 2 - 0.3, 0, -0.1, top, 0.3, STUCCO, PANEL, holes, { rough: 0.9 });
  }
  // Flat roof behind a parapet with a red-and-white circus fascia.
  k.slab(b, 0, OH + 0.3, -OD / 2, OW - 0.3, OD - 0.3, '#3a3a3a', '#e8e4d8');
  for (let x = -OW / 2; x < OW / 2 - 0.01; x += 0.6) {
    k.box(b, x + 0.3, OH + 0.35, 0.02, 0.6, 0.55, 0.06, Math.round((x + OW / 2) / 0.6) % 2 ? RED : '#f8f8f4', { rough: 0.7 });
  }
  k.box(b, 0, top - 0.06, -OD / 2, OW + 0.1, 0.1, OD + 0.1, RED, { rough: 0.6 });
  // Striped awning over the big window.
  for (let i = 0; i < 10; i++) {
    const g = new THREE.BoxGeometry(0.6, 0.03, 1.3).translate(0, 0, 0.65);
    k.s.add(g, b.at(-0.3 + i * 0.6, 2.95, 0.05).multiply(new THREE.Matrix4().makeRotationX(0.45)), i % 2 ? RED : '#f8f8f4', { rough: 0.8 }, k.seed);
  }
  k.sign(b, 'clownOffice', -3, 2.75, 0.05, 0.42, 0.3);
  k.light(b.p(-3, 2.5, 0.4), 1, 0.85, 0.6, 1.2);
  k.lamp(b, -3, 2.4, 0.6, 5, 0.6);
  k.box(b, 0, -0.2, 2.2, OW + 2, 0.22, 4.4, '#b0aaa0', { rough: 0.95 });
  return b;
}

/**
 * The office interior: black-and-white linoleum, pale panelling, the front
 * desk with its bell and register, a sofa for the ghost hunters, a popcorn
 * cart, fluorescent panels, and Clarence David's photograph by the door.
 */
export function clownLobby(k: Kit, b: Frame) {
  k.seed = 41;
  const x0 = -OW / 2 + 0.3, x1 = OW / 2 - 0.3, z0 = -OD + 0.3;
  const iw = x1 - x0, id = -0.3 - z0;
  const tile = 0.6;
  for (let i = 0; i < Math.floor(iw / tile); i++) {
    for (let j = 0; j < Math.floor(id / tile); j++) {
      k.ibox(b, x0 + (i + 0.5) * tile, 0, z0 + (j + 0.5) * tile, tile, 0.01, tile, (i + j) % 2 ? '#1a1a1a' : '#f0ece4', 0.3);
    }
  }
  // Acoustic-tile ceiling and four fluorescent panels.
  k.ibox(b, 0, OH - 0.04, -OD / 2, iw, 0.04, id, '#ece8de', 0.95);
  for (const [px, pz] of [[-2.8, -3.6], [2.8, -3.6], [-2.8, -8.6], [2.8, -8.6]]) {
    k.box(b, px, OH - 0.07, pz, 0.6, 0.03, 1.2, '#f4f8ff', k.lit(3));
    k.lamp(b, px, OH - 0.3, pz, 7, 0.9, '#eef2ff');
  }
  // Front desk across the back right corner, a clown keeping watch on the counter.
  const desk = b.sub(2.6, 0, -8.6);
  k.ibox(desk, 0, 0, 0, 4.2, 1.05, 0.7, '#7a4a28', 0.5);
  k.ibox(desk, 0, 1.05, 0, 4.4, 0.05, 0.85, '#d8c8a8', 0.3);
  for (let i = 0; i < 5; i++) k.ibox(desk, -1.7 + i * 0.85, 0.12, 0.36, 0.6, 0.8, 0.02, '#8a5a32', 0.5);
  k.ibox(desk, 1.2, 1.1, -0.1, 0.4, 0.25, 0.35, '#2a2a2a', 0.4);
  k.ibox(desk, 1.2, 1.35, -0.05, 0.32, 0.12, 0.02, '#4aff8a', 0.2);
  k.cyl(desk, -0.6, 1.1, 0.15, 0.05, 0.05, 0.02, '#c8c8c8', k.in(0.2), 10);
  k.sphere(desk, -0.6, 1.13, 0.15, 0.045, '#d8d8d8', k.in(0.15), 8);
  k.ibox(desk, 0.2, 1.1, 0.2, 0.35, 0.03, 0.25, '#f0e8d0', 0.9);
  F.clown(k, desk, -1.5, 1.1, 0, 2.2, 7, 0);
  F.chair(k, desk, 0.4, 0, -1.0, 0, F.WOOD.black, '#2a2a2a');
  // Sofa and coffee table in the front corner.
  F.sofa(k, b, -4.4, 0, -4.2, Math.PI / 2, 2.2, '#8a1a22');
  F.table(k, b, -3.2, 0, -4.2, 0.7, 1.2, F.WOOD.walnut, F.WOOD.walnut, 0.42);
  for (let i = 0; i < 4; i++) k.ibox(b, -3.25 + (i % 2) * 0.12, 0.42 + i * 0.012, -4.5 + i * 0.18, 0.28, 0.01, 0.2, ['#d81a1a', '#2a6ad8', '#f0c828', '#2aa84a'][i], 0.8, i * 0.4);
  // Popcorn cart, lit and glassed.
  const pc = b.sub(0.8, 0, -0.9, Math.PI);
  k.ibox(pc, 0, 0.1, 0, 0.7, 0.75, 0.5, RED, 0.5);
  for (const sx of [-0.3, 0.3]) k.cyl(pc, sx, 0, 0.3, 0.1, 0.1, 0.06, '#1a1a1a', k.in(0.6), 10);
  k.box(pc, 0, 0.85, 0, 0.66, 0.6, 0.46, '#fff4c8', k.lit(1.8));
  k.ibox(pc, 0, 1.45, 0, 0.74, 0.12, 0.54, RED, 0.5);
  k.lamp(pc, 0, 1.2, 0.2, 2.5, 0.4, '#ffd88a');
  // Clarence David: a framed photograph, a plaque and a vase of plastic flowers.
  const mem = k.side(b, -OW / 2 + 0.3, -OD / 2, -1);
  k.ibox(mem, 0.2, 1.4, -0.02, 0.6, 0.75, 0.04, '#3a2a1a', 0.4, Math.PI);
  k.ibox(mem, 0.2, 1.47, -0.05, 0.46, 0.6, 0.01, '#8a8478', 0.9, Math.PI);
  k.sphere(mem, 0.2, 1.85, -0.06, 0.1, '#5a564e', k.in(0.9), 8);
  k.ibox(mem, 0.2, 1.15, -0.05, 0.4, 0.14, 0.01, '#c8a050', 0.25, Math.PI);
  // Coat stand and a bin of balloons by the door.
  k.cyl(b, -4.6, 0, -0.9, 0.04, 0.04, 1.8, F.WOOD.walnut, k.in(0.5), 6);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    k.cyl(b, -2.1 + Math.cos(a) * 0.12, 0, -0.9 + Math.sin(a) * 0.12, 0.004, 0.004, 1.6 + (i % 3) * 0.15, '#e8e8e8', k.in(0.5), 3);
    k.sphere(b, -2.1 + Math.cos(a) * 0.22, 1.75 + (i % 3) * 0.15, -0.9 + Math.sin(a) * 0.22, 0.17, ['#d81a1a', '#2a6ad8', '#f0c828', '#2aa84a', '#e86ab8'][i], k.in(0.2), 10);
  }
  // Clown portraits high on the front wall, either side of the window.
  const inFront = b.sub(0, 0, -0.32, Math.PI);
  for (const [i, x] of [[0, 4.9], [5, -1.4], [3, 0.4]] as const) k.sign(inFront, `clownArt${i}`, x, 2.95, -0.01, 0.6, 0.5, FX.INTERIOR);
  k.spot(b, -1, -5, 3, 2);
}

/**
 * The collection: floor-to-ceiling shelves round three walls, two glass cases
 * in the middle of the room and the life-size clown that greets you at the door.
 */
export function clownCollection(k: Kit, b: Frame) {
  k.seed = 42;
  let n = 0;
  const shelves = (fr: Frame, len: number) => {
    k.ibox(fr, 0, 0, 0.1, len, 3.1, 0.04, '#5a3a20', 0.6);
    for (const sx of [-len / 2, len / 2]) k.ibox(fr, sx, 0, 0.26, 0.04, 3.1, 0.34, '#6a4a28', 0.6);
    for (let r = 0; r < 7; r++) {
      const y = 0.22 + r * 0.42;
      k.ibox(fr, 0, y - 0.025, 0.26, len, 0.025, 0.34, '#6a4a28', 0.6);
      for (let x = -len / 2 + 0.12; x < len / 2 - 0.08; x += 0.15) {
        const s = 0.75 + ((n * 0.618) % 1) * 0.35;
        F.shelfClown(k, fr, x + (r % 2) * 0.06, y, 0.22 + ((n * 0.37) % 1) * 0.08, s, n++);
      }
    }
  };
  // Back wall, both side walls clear of the windows, the wall behind the desk.
  shelves(b.sub(0, 0, -OD + 0.3), OW - 1.2);
  const left = k.side(b, -OW / 2 + 0.3, -OD / 2, -1);
  shelves(left.sub(-3.3, 0, 0, Math.PI), 4.6);
  const right = k.side(b, OW / 2 - 0.3, -OD / 2, 1);
  shelves(right.sub(-0.6, 0, 0, Math.PI), 3.0);
  shelves(right.sub(3.9, 0, 0, Math.PI), 2.4);
  // Glass display cases, lit inside, clowns on three tiers.
  for (const cx of [-2.5, 1.6]) {
    const c = b.sub(cx, 0, -6.4);
    k.ibox(c, 0, 0, 0, 1.6, 0.8, 0.7, '#3a2a1a', 0.5);
    for (let t = 0; t < 3; t++) {
      k.ibox(c, 0, 0.8 + t * 0.32, 0, 1.5, 0.02, 0.6, '#e8eef0', 0.1);
      for (let i = 0; i < 9; i++) for (const z of [-0.15, 0.15]) F.shelfClown(k, c, -0.66 + i * 0.165, 0.82 + t * 0.32, z, 0.8, n++, z > 0 ? 0 : Math.PI);
    }
    k.pane(c, 0, 1.3, 0.35, 1.6, 1.0);
    k.pane(c, 0, 1.3, -0.35, 1.6, 1.0);
    k.ibox(c, 0, 1.8, 0, 1.6, 0.06, 0.7, '#3a2a1a', 0.5);
    k.box(c, 0, 1.76, 0, 1.4, 0.02, 0.5, '#f8f4e8', k.lit(2));
    k.lamp(c, 0, 1.5, 0, 2, 0.4, '#fff0d8');
  }
  // A clown sat on the sofa arm, one in the rocking chair, the big one by the door.
  F.clown(k, b, -4.4, 0.65, -3.0, 2.0, 11, Math.PI / 2);
  F.clown(k, b, -1.7, 0, -2.2, 5.6, 3, Math.PI * 0.85);
  return n;
}

/**
 * The room block along the cemetery fence: white stucco, a door of every
 * circus colour, a blue-railed walkway upstairs with stairs at both ends, a
 * brown shingle mansard, and the giant clown painted on the end wall.
 * Frame: x along the block (+x toward the highway), z out the room doors.
 */
export function clownWing(k: Kit): Frame {
  k.seed = 43;
  const fx = 0.892, fz = 0.452;
  const fr = k.frame(-720.2 + fx * (RD / 2), -420.8 + fz * (RD / 2), fx, fz, 34);
  const [lo, hi] = k.footRange(fr, -RL / 2 - 2, RL / 2 + 2, -RD, 13);
  const base = Math.max(0.2, hi + 0.15);
  const b = fr.sub(0, base, 0);
  k.box(b, 0, lo - base - 0.4, -RD / 2 + 1, RL + 0.4, base - lo + 0.4, RD + 2.2, '#b8b0a4', { rough: 0.95 });
  const top = RH * 2 + 0.6;

  for (let fl = 0; fl < 2; fl++) {
    const y = fl * RH;
    const holes: Hole[] = [];
    for (let i = 0; i < ROOMS; i++) {
      const x = roomX(i);
      holes.push({ x: x - 1.05, y: y, w: 0.95, h: 2.1, trim: '#f8f8f4' });
      holes.push({ x: x + 0.75, y: y + 0.9, w: 1.5, h: 1.1, glass: true, trim: '#f8f8f4' });
    }
    k.wall(b, -RL / 2, RL / 2, 0, y - (fl ? 0 : 0.1), y + RH, 0.3, STUCCO, PANEL, holes, { rough: 0.9 });
    // High bathroom windows on the cemetery side.
    const back: Hole[] = [];
    for (let i = 0; i < ROOMS; i++) back.push({ x: -roomX(i) + 0.9, y: y + 1.7, w: 0.6, h: 0.5, glass: true });
    const bk = b.sub(0, 0, -RD, Math.PI);
    k.wall(bk, -RL / 2, RL / 2, 0, y - (fl ? 0 : 0.1), y + RH, 0.3, STUCCO, '#e8f0f0', back, { rough: 0.9 });
  }
  k.box(b, 0, RH * 2, -RD / 2, RL, top - RH * 2, 0.3, STUCCO, { rough: 0.9 });
  for (const s of [-1, 1] as const) {
    const end = k.side(b, (s * RL) / 2, -RD / 2, s);
    k.wall(end, -RD / 2 + 0.3, RD / 2 - 0.3, 0, -0.1, top, 0.3, STUCCO, PANEL, [], { rough: 0.9 });
  }
  // Floors and the roof.
  k.slab(b, 0, 0.02, -RD / 2, RL - 0.4, RD - 0.6, '#8a5a3a', null, 0.1);
  k.slab(b, 0, RH, -RD / 2, RL - 0.4, RD - 0.6, '#8a5a3a', '#ece8de', 0.3);
  k.slab(b, 0, RH * 2 + 0.3, -RD / 2, RL + 0.6, RD + 0.6, '#5a5450', '#ece8de', 0.3);
  // Brown shingle mansard round the roof edge, deep over the walkway.
  for (const [cx, cz, w, d, tilt] of [[0, 2.0, RL + 3, 1.4, 0.55], [0, -RD - 0.2, RL + 0.6, 0.9, -0.55]] as const) {
    const g = new THREE.BoxGeometry(w, 0.08, d).translate(0, 0, (Math.sign(tilt) * d) / 2);
    k.s.add(g, b.at(cx, RH * 2 + 0.35, cz - (Math.sign(tilt) * d) / 2).multiply(new THREE.Matrix4().makeRotationX(tilt)), '#5a3a26', { rough: 0.95 }, k.seed);
  }
  for (let x = -RL / 2 - 1.5; x < RL / 2 + 1.5; x += 0.5) k.box(b, x, RH * 2 + 0.36, 2.2, 0.48, 0.02, 0.05, '#4a2e1e', { rough: 1 });

  // Upstairs walkway on posts, blue rails, landings at the ends for the stairs.
  k.box(b, 0, RH - 0.25, 1.0, RL + 4.2, 0.25, 2.0, '#c8c0b4', { rough: 0.9 });
  k.box(b, 0, RH - 0.01, 1.0, RL + 4.2, 0.02, 2.0, '#9a3a2a', { rough: 0.95 });
  for (let x = -RL / 2 - 2; x <= RL / 2 + 2.01; x += RW) {
    k.box(b, x, 0, 1.9, 0.18, RH - 0.25, 0.18, '#f8f8f4', { rough: 0.8 });
    k.box(b, x, RH, 1.9, 0.12, RH + 0.35, 0.12, '#f8f8f4', { rough: 0.8 });
  }
  for (let x = -RL / 2 - 2; x < RL / 2 + 2; x += 0.14) k.box(b, x, RH, 1.96, 0.03, 0.95, 0.03, RAIL, { rough: 0.4, fx: FX.METAL });
  for (const y of [RH + 0.95, RH + 0.1]) k.box(b, 0, y, 1.96, RL + 4.1, 0.06, 0.08, RAIL, { rough: 0.4, fx: FX.METAL });
  for (const s of [-1, 1]) {
    const steps = Math.round(RH / 0.18);
    k.stairs(b, s * (RL / 2 + 1.2), 0, 2.0 + steps * 0.28, 1.2, RH, steps, '#b8b0a4', '#c8c0b4', 0.28, 0, RAIL);
  }
  // A door of every colour, a few left ajar; a walkway light over each.
  for (let fl = 0; fl < 2; fl++) {
    for (let i = 0; i < ROOMS; i++) {
      const x = roomX(i) - 1.05;
      const num = (fl + 1) * 100 + i + 1;
      const col = DOORS[(i + fl * 3) % DOORS.length];
      if (OPEN.has(num)) {
        const a = 1.15;
        k.box(b, x - 0.465 + Math.cos(a) * 0.46, fl * RH, -0.15 - Math.sin(a) * 0.46, 0.92, 2.08, 0.05, col, { rough: 0.5 }, a);
      } else {
        k.box(b, x, fl * RH, -0.15, 0.92, 2.08, 0.05, col, { rough: 0.5 });
        k.sphere(b, x + 0.34, fl * RH + 1.0, -0.1, 0.035, '#c8c8c8', { fx: FX.METAL }, 6);
      }
      k.box(b, x, fl * RH + 1.65, 0.02, 0.22, 0.09, 0.02, '#c49a4a', { fx: FX.METAL });
      k.box(b, x + 0.75, fl * RH + 2.35, 0.08, 0.2, 0.25, 0.12, '#fff4d8', { glow: 1.8 });
      k.light(b.p(x + 0.75, fl * RH + 2.35, 0.3), 1, 0.85, 0.6, 0.5);
    }
  }
  // The giant clown on the highway end wall.
  const mural = k.side(b, RL / 2 + 0.01, -RD / 2, 1);
  k.sign(mural, 'clownMural', 0, top / 2, 0.02, top - 0.3, 0.15);
  k.light(mural.p(0, 0.3, 3), 1, 0.85, 0.6, 1.4);
  // Parking along the doors.
  k.box(b, 0, lo - base - 0.3, 7.5, RL + 6, base - lo + 0.1, 11, '#b8b0a4', { rough: 0.95 });
  k.box(b, 0, -0.2, 7.5, RL + 6, 0.2, 11, '#3a3a3c', { rough: 0.95 });
  for (let i = 0; i <= ROOMS; i++) k.box(b, -RL / 2 + i * RW, -0.0, 9, 0.12, 0.01, 5, '#e8e8e0', { rough: 0.9 });
  k.lotLight(b, -RL / 4, 12.5);
  k.lotLight(b, RL / 4, 12.5);
  k.spot(b, 0, 4, 20, 3);
  return b;
}

/** The pole sign beside US-95 in front of the office, VACANCY buzzing beneath. */
export function clownPole(k: Kit, office: Frame) {
  k.seed = 44;
  const o = office.p(0, 0, 0);
  const h = k.nearestHighway(o.x, o.z);
  const toward = new THREE.Vector2(o.x - h.px, o.z - h.pz).normalize();
  const px = h.px + toward.x * 14, pz = h.pz + toward.y * 14;
  const fr = k.frame(px, pz, -toward.x, -toward.y);
  const sh = 3.6, sw = k.signW('clownPole', sh), y0 = 6.2;
  for (const sx of [-sw / 3, sw / 3]) k.cyl(fr, sx, -0.5, 0, 0.16, 0.14, y0 + sh + 0.7, '#e8e8e4', { rough: 0.5, fx: FX.METAL }, 10);
  k.box(fr, 0, y0 - 0.15, 0, sw + 0.4, sh + 0.3, 0.4, '#f8f8f4', { rough: 0.6 });
  k.sign(fr, 'clownPole', 0, y0 + sh / 2, 0.21, sh, 0.6, FX.NONE, 0, false);
  k.sign(fr, 'clownPole', 0, y0 + sh / 2, -0.21, sh, 0.6, FX.NONE, Math.PI, false);
  const vh = 0.8, vw = k.signW('clownVacancy', vh);
  k.box(fr, 0, y0 - 1.6, 0, vw + 0.2, vh + 0.2, 0.3, '#1a1a1a', { rough: 0.5 });
  k.sign(fr, 'clownVacancy', 0, y0 - 1.1, 0.16, vh, 1.6, FX.NEON);
  k.sign(fr, 'clownVacancy', 0, y0 - 1.1, -0.16, vh, 1.6, FX.NEON, Math.PI);
  for (const sx of [-1, 1]) {
    k.box(fr, sx * (sw / 2 - 0.4), y0 - 0.5, 1.2, 0.2, 0.2, 0.3, '#2a2a2a', { fx: FX.METAL });
    k.light(fr.p(sx * (sw / 2 - 0.4), y0 - 0.4, 1.4), 1, 0.92, 0.8, 1.6);
  }
}
