import * as THREE from 'three';
import { type Frame, FX } from '../builders';
import * as F from '../furniture';
import type { Kit } from '../kit';
import { RH, RW, roomFrame } from './clownMotel';

// The Clown Motel's horror rooms, each dressed after a film, behind the
// doors that stand ajar along the walkway.

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

/** Dresses the horror rooms. */
export function clownHorror(k: Kit, b: Frame) {
  k.seed = 46;
  balloonRoom(k, b);
}
