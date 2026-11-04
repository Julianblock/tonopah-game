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

/** Dresses the horror rooms. */
export function clownHorror(k: Kit, b: Frame) {
  k.seed = 46;
  k.fill = DARK;
  balloonRoom(k, b);
  overlookRoom(k, b);
  halloweenRoom(k, b);
  k.fill = FILL;
}
