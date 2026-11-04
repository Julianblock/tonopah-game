import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import { FILL, type Kit } from '../kit';
import { DARK, RH, RW, roomFrame } from './clownMotel';

// The Clown Motel's horror rooms, each dressed after a film, behind the
// doors that stand ajar along the walkway.

/** A standing figure (doll, child, puppet): legs, torso, arms, head and hair. Scale 1 = 1 m tall. */
function figure(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, s: number, top: string, legs: string, skin: string, hair: string, dress = false) {
  const f = fr.sub(x, y, z, yaw);
  if (dress) k.geo(f, new THREE.ConeGeometry(0.22 * s, 0.55 * s, 10).translate(0, 0.275 * s, 0), 0, 0.05 * s, 0, top, k.in(0.8));
  else for (const sx of [-0.06, 0.06]) k.ibox(f, sx * s, 0, 0, 0.1 * s, 0.45 * s, 0.11 * s, legs, 0.8);
  k.ibox(f, 0, 0.45 * s, 0, 0.28 * s, 0.3 * s, 0.15 * s, top, 0.8);
  for (const sx of [-0.17, 0.17]) k.ibox(f, sx * s, 0.43 * s, 0, 0.07 * s, 0.3 * s, 0.08 * s, top, 0.8);
  k.sphere(f, 0, 0.86 * s, 0, 0.1 * s, skin, k.in(0.6), 10);
  k.sphere(f, 0, 0.9 * s, -0.02 * s, 0.105 * s, hair, k.in(0.95), 10);
  if (dress) k.ibox(f, 0, 0.66 * s, -0.07 * s, 0.2 * s, 0.24 * s, 0.05 * s, hair, 0.95);
  for (const sx of [-0.035, 0.035]) k.sphere(f, sx * s, 0.88 * s, 0.09 * s, 0.012 * s, '#0a0a0a', k.in(0.3), 4);
}

/** A balloon bobbing on its string, tied to (x, 0, z) and floating at height y. */
function balloon(k: Kit, fr: Frame, x: number, y: number, z: number, color: string) {
  k.cyl(fr, x, 0, z, 0.004, 0.004, y - 0.15, '#f0f0f0', k.in(0.5), 3);
  k.geo(fr, new THREE.SphereGeometry(0.17, 12, 8).scale(1, 1.2, 1), x, y, z, color, k.in(0.15));
}

/**
 * 104, the balloon room: red balloons crowding the ceiling, a storm drain in
 * the floor, a little yellow raincoat on the hook, a paper boat on the bed,
 * and the words over the headboard.
 */
function balloonRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 104);
  for (let i = 0; i < 16; i++) {
    const h = (n: number) => Math.abs(Math.sin(i * 41.3 + n * 7.7) * 1000) % 1;
    balloon(k, rf, -1.6 + h(1) * 3.2, RH - 0.55 - h(2) * 0.25, -0.8 - h(3) * 6.4, '#c80a14');
  }
  // Storm drain: a dark slot under an iron grate, and a pale glow down there.
  const dr = rf.sub(0.9, 0, -3.0);
  k.ibox(dr, 0, 0.0, 0, 0.9, 0.025, 0.5, '#1a1a1a', 0.6);
  for (let i = 0; i < 7; i++) k.ibox(dr, -0.39 + i * 0.13, 0.025, 0, 0.05, 0.015, 0.48, '#3a3a38', 0.4);
  k.box(dr, 0, 0.005, 0, 0.8, 0.01, 0.4, '#ffe8a8', k.lit(1.8));
  k.lamp(dr, 0, 0.3, 0, 1.6, 0.25, '#ffdd88');
  // Yellow raincoat on a hook by the door.
  const rc = rf.sub(-1.8, 1.0, -0.6, Math.PI / 2);
  k.geo(rc, new THREE.ConeGeometry(0.25, 0.85, 8).translate(0, 0.42, 0), 0, 0, 0.12, '#f0d020', k.in(0.4));
  k.geo(rc, new THREE.SphereGeometry(0.11, 8, 6), 0, 0.85, 0.1, '#f0d020', k.in(0.4));
  // Paper boat on the counterpane.
  const boat = rf.sub(-0.5, 0.62, -4.3, 0.4);
  k.geo(boat, new THREE.ConeGeometry(0.1, 0.12, 3).rotateZ(Math.PI).translate(0, 0.06, 0).scale(1.6, 1, 0.6), 0, 0, 0, '#f4f0e0', k.in(0.9));
  k.geo(boat, new THREE.ConeGeometry(0.06, 0.12, 3).translate(0, 0.06, 0), 0, 0.06, 0, '#f4f0e0', k.in(0.9));
  const wallL = rf.sub(-RW / 2 + 0.1, 0, -4.3, Math.PI / 2);
  k.sign(wallL, 'floatWall', 0, 2.25, 0.01, 0.42, 0.3, FX.INTERIOR);
  // And in the corner, a clown taller than a man, watching the door.
  F.clown(k, rf, 1.5, 0, -6.6, 6.2, 104, Math.PI * 0.8);
  k.lamp(rf, 0, 2.2, -2, 4, 0.5, '#ff6060');
}

/**
 * 106, the hotel room: hexagon carpet in orange and oxblood, a tennis ball
 * rolled to the door, a typewriter with one line typed over and over, the
 * twins at the end of the room, and the word on the bathroom wall.
 */
function overlookRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 106);
  const hex = new THREE.CylinderGeometry(0.2, 0.2, 0.012, 6);
  const cols = ['#c8501a', '#6a1a10', '#3a1a0e'];
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 10; c++) {
      const x = -1.75 + c * 0.36 + (r % 2) * 0.18;
      const z = -0.5 - r * 0.33;
      if (x > 1.85 || z < -7.5) continue;
      k.geo(rf, hex, x, 0.03, z, cols[(c + r * 2) % 3], k.in(0.95));
    }
  }
  k.sphere(rf, -0.6, 0.065, -1.0, 0.035, '#d8e840', k.in(0.6), 8);
  // Typewriter on the table, a page in it, a stack beside.
  const tw = rf.sub(0.8, 0.72, -1.3);
  k.ibox(tw, 0, 0, 0, 0.4, 0.1, 0.32, '#2a2a2a', 0.3);
  k.ibox(tw, 0, 0.1, -0.06, 0.44, 0.06, 0.08, '#1a1a1a', 0.3);
  k.ibox(tw, 0, 0.12, -0.1, 0.26, 0.24, 0.005, '#f8f8f0', 0.9);
  for (let i = 0; i < 8; i++) k.ibox(tw, 0.3, i * 0.008, 0.05, 0.2, 0.006, 0.28, '#f4f0e4', 0.9, i * 0.05);
  // The twins, hand in hand, in pale blue.
  for (const sx of [-0.2, 0.2]) figure(k, rf, 1.1 + sx, 0, -6.9, 0.15, 1.3, '#a8c8e8', '#a8c8e8', '#f0dcd0', '#5a3a20', true);
  k.ibox(rf, 1.1, 0.5, -6.85, 0.16, 0.05, 0.05, '#f0dcd0', 0.6);
  k.sign(rf, 'redrum', -0.6, 1.45, -7.54, 0.3, 0.3, FX.INTERIOR);
  k.lamp(rf, 1.1, 1.6, -6.0, 3, 0.35, '#c8e0ff');
}

/** A carved pumpkin with a candle glowing through its face. */
function jackOLantern(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number, s = 1) {
  const f = fr.sub(x, y, z, yaw);
  k.geo(f, new THREE.SphereGeometry(0.15 * s, 12, 8).scale(1, 0.8, 1), 0, 0.12 * s, 0, '#e8761a', k.in(0.7));
  k.cyl(f, 0, 0.23 * s, 0, 0.02 * s, 0.015 * s, 0.06 * s, '#4a6a2a', k.in(0.9), 5);
  for (const ex of [-0.05, 0.05]) k.ibox(f, ex * s, 0.15 * s, 0.135 * s, 0.04 * s, 0.035 * s, 0.02 * s, '#ffd040', 0.5);
  k.box(f, 0, 0.07 * s, 0.13 * s, 0.12 * s, 0.03 * s, 0.02 * s, '#ffd040', k.lit(4));
  k.box(f, 0, 0.15 * s, 0.13 * s, 0.11 * s, 0.035 * s, 0.01 * s, '#ffd040', k.lit(4));
  k.lamp(f, 0, 0.2 * s, 0.3 * s, 2.4, 0.45, '#ff9a3a');
}

/**
 * 108, the Halloween room: carved pumpkins guttering on every surface,
 * orange and black streamers, a kitchen knife on the counterpane, and a man
 * in a white mask and mechanic's coveralls standing by the bathroom door.
 */
function halloweenRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 108);
  jackOLantern(k, rf, 1.6, 0.85, -3.9, -Math.PI / 2);
  jackOLantern(k, rf, 0.8, 0.72, -1.3, Math.PI, 0.8);
  jackOLantern(k, rf, -1.65, 0.6, -5.75, Math.PI / 2, 0.7);
  jackOLantern(k, rf, -1.4, 0, -1.0, Math.PI * 0.8, 1.3);
  jackOLantern(k, rf, 0.3, 0, -6.6, 0.3, 1.1);
  for (let i = 0; i < 12; i++) {
    const g = new THREE.BoxGeometry(0.03, 0.01, 0.36);
    k.s.add(g, rf.at(-1.8 + i * 0.32, RH - 0.45 - (i % 2) * 0.15, -3.5, Math.PI / 2).multiply(new THREE.Matrix4().makeRotationX(i % 2 ? 0.5 : -0.5)), i % 2 ? '#1a1a1a' : '#f07a1a', k.in(0.9), k.seed);
  }
  const knife = rf.sub(-0.6, 0.63, -4.1, 0.6);
  k.ibox(knife, 0, 0, 0.12, 0.04, 0.006, 0.24, '#d8dce0', 0.1);
  k.ibox(knife, 0, 0, -0.06, 0.035, 0.02, 0.12, '#1a1210', 0.6);
  figure(k, rf, 1.35, 0, -7.1, 0.25, 1.88, '#3a4a5a', '#3a4a5a', '#ecebe4', '#3a2a1a');
  k.lamp(rf, 0, 1.0, -3, 3, 0.25, '#ff8a3a');
}

/**
 * 110, the TV room: the set left on a dead channel, its snow the only light,
 * a little girl in a white nightgown sat cross-legged a foot from the screen,
 * and every chair in the room stacked into a tower on the table.
 */
function staticRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 110);
  const scr = rf.sub(RW / 2 - 0.4, 0.85, -4.3, -Math.PI / 2);
  k.sign(scr, 'tvStatic', 0, 0.28, 0.045, 0.47, 2.6, FX.INTERIOR);
  k.lamp(scr, 0, 0.3, 1.2, 4.5, 0.7, '#b8c8ff');
  const girl = rf.sub(0.95, 0, -4.3, Math.PI / 2);
  k.geo(girl, new THREE.CylinderGeometry(0.16, 0.22, 0.12, 10).translate(0, 0.06, 0), 0, 0, 0, '#f4f4f0', k.in(0.8));
  k.geo(girl, new THREE.CylinderGeometry(0.1, 0.15, 0.38, 10).translate(0, 0.19, 0), 0, 0.1, 0, '#f4f4f0', k.in(0.8));
  k.sphere(girl, 0, 0.6, 0, 0.09, '#f0dcd0', k.in(0.6), 10);
  k.sphere(girl, 0, 0.63, -0.02, 0.095, '#e8d8a0', k.in(0.95), 10);
  k.ibox(girl, 0, 0.36, -0.07, 0.18, 0.28, 0.04, '#e8d8a0', 0.95);
  for (const sx of [-0.08, 0.08]) k.ibox(girl, sx, 0.2, 0.12, 0.05, 0.05, 0.25, '#f0dcd0', 0.6, 0);
  // Chairs stacked in a leaning tower on the table.
  for (let i = 0; i < 4; i++) F.chair(k, rf, 0.8 + (i % 2) * 0.06, 0.72 + i * 0.5, -1.3, i * 1.3, F.WOOD.oak, '#c8a040');
}

/**
 * 112, the doll room: a talking doll in a striped sweater and dungarees sat
 * up against the pillows with a kitchen knife, his empty box on the dresser,
 * and his little footprints across the carpet to the door.
 */
function dollRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 112);
  const doll = rf.sub(-1.3, 0.6, -4.3, Math.PI / 2);
  for (const sx of [-0.06, 0.06]) k.ibox(doll, sx, 0, 0.12, 0.09, 0.08, 0.32, '#3a5a9a', 0.8);
  k.ibox(doll, 0, 0, 0, 0.26, 0.35, 0.14, '#3a5a9a', 0.8);
  for (let i = 0; i < 5; i++) k.ibox(doll, 0, 0.12 + i * 0.05, 0.002, 0.27, 0.025, 0.145, ['#d81a1a', '#2a6ad8', '#2aa84a', '#f0c828', '#d81a1a'][i], 0.8);
  for (const sx of [-0.16, 0.16]) k.ibox(doll, sx, 0.12, 0.04, 0.06, 0.24, 0.07, '#d81a1a', 0.8);
  k.sphere(doll, 0, 0.47, 0.01, 0.11, '#f4d8c0', k.in(0.6), 10);
  k.sphere(doll, 0, 0.51, -0.02, 0.112, '#e8501a', k.in(0.95), 10);
  for (const sx of [-0.04, 0.04]) k.sphere(doll, sx, 0.49, 0.1, 0.016, '#2a6ad8', k.in(0.2), 6);
  for (const [sx, sy] of [[-0.05, 0.43], [0.04, 0.4], [0.0, 0.53]]) k.ibox(doll, sx, sy, 0.105, 0.06, 0.006, 0.006, '#8a1a1a', 0.6, 0.5);
  k.ibox(doll, 0.16, 0.0, 0.18, 0.025, 0.004, 0.22, '#d8dce0', 0.1);
  const box = rf.sub(RW / 2 - 0.3, 0, -3.25, -Math.PI / 2 - 0.3);
  k.ibox(box, 0, 0, -0.05, 0.36, 0.55, 0.12, '#1a4ad0', 0.6);
  k.sign(box, 'goodGuys', 0, 0.27, 0.012, 0.54, 0.3, FX.INTERIOR);
  for (let i = 0; i < 9; i++) k.ibox(rf, -0.6 + i * 0.12 + (i % 2) * 0.06, 0.02, -3.2 + i * 0.32, 0.05, 0.003, 0.09, '#5a0a10', 0.9, 0.3);
  k.lamp(rf, -1.6, 1.0, -5.4, 2.5, 0.35, '#ffd0a0');
  k.sphere(rf, -1.65, 0.95, -5.45, 0.05, '#ffd0a0', k.lit(3), 6);
}

/** A slasher's white hockey mask hung on a nail: an oval with eye holes, vents and red chevrons. */
function hockeyMask(k: Kit, fr: Frame, x: number, y: number, z: number, yaw: number) {
  const f = fr.sub(x, y, z, yaw);
  k.geo(f, new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1.35, 0.5), 0, 0, 0, '#f0eee4', k.in(0.4));
  for (const sx of [-0.045, 0.045]) k.ibox(f, sx, 0.03, 0.055, 0.035, 0.022, 0.01, '#0a0a0a', 0.5);
  for (let i = 0; i < 9; i++) k.sphere(f, ((i % 3) - 1) * 0.03, -0.04 - Math.floor(i / 3) * 0.028, 0.055, 0.007, '#0a0a0a', k.in(0.5), 4);
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 2; i++) k.ibox(f, sx * 0.075, 0.07 - i * 0.03, 0.05, 0.03, 0.006, 0.01, '#c81a1a', 0.5, sx * 0.6);
  }
}

/**
 * 201, the summer-camp room: the mask on the wall, a machete stuck in the
 * headboard, the camp's sign, a canoe paddle and a lantern by the bed.
 */
function campRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 201);
  const wallR = rf.sub(RW / 2 - 0.1, 0, -4.3, -Math.PI / 2);
  hockeyMask(k, wallR, -1.05, 1.45, 0.02, 0);
  k.sign(wallR, 'crystalLake', 0.15, 2.3, 0.01, 0.3, 0.3, FX.INTERIOR);
  const mach = rf.sub(-1.85, 1.0, -4.0, Math.PI / 2);
  k.ibox(mach, 0, 0, 0.1, 0.012, 0.1, 0.5, '#9aa0a4', 0.15, 0);
  k.ibox(mach, 0, 0.01, 0.42, 0.035, 0.06, 0.16, '#3a2a1a', 0.7);
  k.ibox(rf, -1.88, 0, -6.6, 0.04, 1.4, 0.16, '#8a6a3a', 0.6);
  k.ibox(rf, -1.88, 1.3, -6.6, 0.03, 0.3, 0.2, '#8a6a3a', 0.6);
  const lan = rf.sub(-1.65, 0.6, -5.45);
  k.cyl(lan, 0, 0, 0, 0.07, 0.07, 0.03, '#2a4a2a', k.in(0.4), 8);
  k.cyl(lan, 0, 0.03, 0, 0.05, 0.05, 0.14, '#ffc870', k.lit(3), 8);
  k.cyl(lan, 0, 0.17, 0, 0.06, 0.03, 0.05, '#2a4a2a', k.in(0.4), 8);
  k.lamp(lan, 0, 0.3, 0.2, 3.5, 0.5, '#ffb060');
}

/**
 * 204, the roadside-motel room: a shower curtain pulled across the tub, a
 * knife on the bathroom floor, stuffed birds glaring from every shelf, and
 * Mother's rocking chair in the corner.
 */
function showerRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 204);
  for (let i = 0; i < 9; i++) k.ibox(rf, -1.85 + i * 0.17, 0.58, -8.85, 0.17, 1.4, 0.015, i % 2 ? '#f0f0ec' : '#e4e8e8', 0.6, 0.15 * ((i % 2) * 2 - 1));
  k.ibox(rf, -1.15, 2.0, -8.88, 1.6, 0.03, 0.03, '#c8c8c8', 0.2);
  const kn = rf.sub(-0.2, 0.012, -8.4, 2.2);
  k.ibox(kn, 0, 0, 0.12, 0.04, 0.006, 0.24, '#d8dce0', 0.1);
  k.ibox(kn, 0, 0, -0.06, 0.035, 0.02, 0.12, '#1a1210', 0.6);
  const bird = (x: number, y: number, z: number, yaw: number, s: number) => {
    const f = rf.sub(x, y, z, yaw);
    k.geo(f, new THREE.SphereGeometry(0.08 * s, 8, 6).scale(0.8, 1, 1.3), 0, 0.08 * s, 0, '#2a2420', k.in(0.8));
    k.sphere(f, 0, 0.19 * s, 0.07 * s, 0.045 * s, '#2a2420', k.in(0.8), 6);
    k.geo(f, new THREE.ConeGeometry(0.015 * s, 0.06 * s, 4).rotateX(Math.PI / 2), 0, 0.19 * s, 0.13 * s, '#c8a040', k.in(0.4));
    for (const sx of [-0.02, 0.02]) k.sphere(f, sx * s, 0.2 * s, 0.105 * s, 0.008 * s, '#ffd040', k.lit(2), 4);
    for (const sx of [-1, 1]) k.geo(f, new THREE.BoxGeometry(0.01, 0.06 * s, 0.22 * s).rotateZ(sx * 0.9), sx * 0.08 * s, 0.14 * s, -0.02 * s, '#1a1612', k.in(0.8));
  };
  for (let i = 0; i < 4; i++) bird(RW / 2 - 0.2, 1.78, -4.85 + i * 0.35, -Math.PI / 2 + (i - 1.5) * 0.3, 1.4);
  bird(1.6, 0.85, -3.8, -Math.PI / 2 - 0.4, 2.2);
  bird(-1.65, 0.6, -5.45, Math.PI / 3, 1.6);
  const rock = rf.sub(1.2, 0, -6.6, Math.PI * 0.85);
  for (const sx of [-0.25, 0.25]) k.geo(rock, new THREE.TorusGeometry(0.5, 0.02, 4, 12, Math.PI / 2).rotateY(Math.PI / 2).rotateX(Math.PI), sx, 0.5, 0.1, F.WOOD.walnut, k.in(0.5));
  k.ibox(rock, 0, 0.42, 0, 0.5, 0.04, 0.45, F.WOOD.walnut, 0.5);
  k.ibox(rock, 0, 0.45, -0.22, 0.5, 0.75, 0.04, F.WOOD.walnut, 0.5);
  k.geo(rock, new THREE.ConeGeometry(0.2, 0.55, 8).translate(0, 0.27, 0), 0, 0.45, -0.05, '#3a3a40', k.in(0.9));
  k.sphere(rock, 0, 1.06, -0.05, 0.1, '#6a5a48', k.in(0.9), 8);
  k.sphere(rock, 0, 1.1, -0.08, 0.1, '#b8b4a8', k.in(0.95), 8);
  k.lamp(rf, -1.0, 1.9, -8.5, 3, 0.5, '#e8f0ff');
  k.box(rf, -1.0, 2.25, -8.6, 0.3, 0.05, 0.3, '#f0f4ff', k.lit(2.5));
}

/**
 * 207, the possession room: a crucifix on the wall above a bed gone grey,
 * candles round the bed, scratches gouged across the headboard wall, a
 * bishop's purple stole on the chair and the little demon statuette.
 */
function exorcistRoom(k: Kit, b: Frame) {
  const rf = roomFrame(b, 207);
  const wallL = rf.sub(-RW / 2 + 0.11, 0, -4.3, Math.PI / 2);
  k.ibox(wallL, -0.95, 1.4, 0.01, 0.05, 0.6, 0.03, '#3a2a1a', 0.5);
  k.ibox(wallL, -0.95, 1.8, 0.01, 0.3, 0.05, 0.03, '#3a2a1a', 0.5);
  const wallR = rf.sub(RW / 2 - 0.1, 0, -5.8, -Math.PI / 2);
  for (let i = 0; i < 7; i++) k.ibox(wallR, -0.6 + i * 0.18, 0.7 + (i % 3) * 0.12, 0.012, 0.02, 0.7, 0.004, '#3a1a10', 0.9, 0.2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = -0.9 + Math.cos(a) * 1.25, z = -4.3 + Math.sin(a) * 1.05;
    if (x < -1.85) continue;
    k.cyl(rf, x, 0, z, 0.03, 0.03, 0.18 + (i % 3) * 0.06, '#f4ecd8', k.in(0.6), 6);
    k.sphere(rf, x, 0.22 + (i % 3) * 0.06, z, 0.015, '#ffb24a', k.lit(6), 4);
  }
  k.lamp(rf, -0.9, 0.6, -4.3, 3.5, 0.6, '#ff9a4a');
  k.ibox(rf, -0.9, 0.62, -4.3, 1.4, 0.012, 1.4, '#c8c8b8', 0.95);
  for (let i = 0; i < 5; i++) k.ibox(rf, -1.3 + i * 0.18, 0.635, -4.6 + (i % 2) * 0.3, 0.15, 0.003, 0.11, '#6a7a2a', 0.3, i);
  k.ibox(rf, 0.2, 0.47, -1.4, 0.1, 0.02, 0.45, '#5a1a6a', 0.9, 1.57);
  const st = rf.sub(1.6, 0.85, -3.8, -Math.PI / 2);
  k.ibox(st, 0, 0, 0, 0.08, 0.05, 0.08, '#2a2a2a', 0.6);
  k.geo(st, new THREE.CylinderGeometry(0.03, 0.04, 0.16, 6).translate(0, 0.08, 0), 0, 0.05, 0, '#4a4a3a', k.in(0.7));
  k.sphere(st, 0, 0.25, 0, 0.035, '#4a4a3a', k.in(0.7), 6);
  for (const sx of [-1, 1]) k.geo(st, new THREE.BoxGeometry(0.01, 0.1, 0.06).rotateZ(sx * 0.7), sx * 0.05, 0.18, -0.02, '#4a4a3a', k.in(0.7));
}

/** Dresses the horror rooms. */
export function clownHorror(k: Kit, b: Frame) {
  k.seed = 46;
  k.fill = DARK;
  balloonRoom(k, b);
  overlookRoom(k, b);
  halloweenRoom(k, b);
  staticRoom(k, b);
  dollRoom(k, b);
  campRoom(k, b);
  showerRoom(k, b);
  exorcistRoom(k, b);
  k.fill = FILL;
}
