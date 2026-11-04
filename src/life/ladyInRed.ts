import * as THREE from 'three';
import { G } from '../render/globals';
import { noiseCommon } from '../render/shaders/noise';
import type { Frame } from '../world/builders';
import { D, level, room502, slotZ } from '../world/sites/mizpah';

const vertexShader = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform float uTime;
out vec3 vLocal;
out vec3 vN;
out vec3 vView;

void main() {
  vec3 p = position;
  // The gown's train drags and billows behind her as she drifts.
  float loose = 1.0 - smoothstep(0.0, 1.0, p.y);
  p.x -= loose * loose * 0.25 + sin(p.y * 4.0 + uTime * 1.6) * 0.04 * loose;
  p.z += sin(p.y * 3.0 + uTime * 1.1) * 0.05 * loose;
  vLocal = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = cameraPosition - wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const fragmentShader = /* glsl */ `
${noiseCommon}
#include <logdepthbuf_pars_fragment>
uniform float uTime;
uniform float uFade;
uniform float uInvExposure;
in vec3 vLocal;
in vec3 vN;
in vec3 vView;
out vec4 outColor;

void main() {
  #include <logdepthbuf_fragment>
  vec3 V = normalize(vView);
  vec3 N = normalize(vN);
  float facing = abs(dot(N, V));
  float rim = pow(1.0 - facing, 1.5);
  float ang = atan(vLocal.z, vLocal.x);
  float mist = 0.5 + 0.5 * vnoise(vec2(ang * 3.0, vLocal.y * 5.0 - uTime * 0.5));
  // The hem dissolves before it reaches the floor.
  float hem = smoothstep(0.0, 0.45, vLocal.y + (vnoise(vec2(ang * 6.0, uTime)) - 0.5) * 0.3);
  // Crimson gown, a pale throat and face, dark hair; a bruise-blue ring at the neck.
  float skin = smoothstep(1.42, 1.48, vLocal.y) * (1.0 - smoothstep(1.66, 1.7, vLocal.y));
  float hair = smoothstep(1.66, 1.72, vLocal.y) + (vLocal.x < -0.02 ? smoothstep(1.5, 1.6, vLocal.y) : 0.0);
  float bruise = exp(-pow((vLocal.y - 1.49) / 0.02, 2.0));
  vec3 tint = mix(vec3(1.0, 0.08, 0.12), vec3(1.0, 0.86, 0.82), skin);
  tint = mix(tint, vec3(0.25, 0.05, 0.06), clamp(hair, 0.0, 1.0));
  tint = mix(tint, vec3(0.3, 0.3, 0.7), bruise * 0.6);
  vec2 e = vec2(vLocal.y - 1.6, abs(vLocal.z) - 0.035);
  float eyes = vLocal.x > 0.06 ? exp(-dot(e, e) / 0.0002) : 0.0;
  float flick = 0.85 + 0.15 * sin(uTime * 9.0) * sin(uTime * 3.1);
  vec3 col = tint * (0.1 + rim * 0.9) * mist * hem + vec3(1.0, 0.9, 0.9) * eyes;
  outColor = vec4(col * flick * uFade * uInvExposure, 1.0);
}
`;

/** A woman in a floor-length Edwardian gown with a bustle, as a lathe silhouette. */
function gown() {
  const prof = [
    [0.5, 0.0], [0.44, 0.25], [0.33, 0.7], [0.2, 0.98], [0.13, 1.05], [0.17, 1.22], [0.19, 1.32], [0.18, 1.4],
    [0.06, 1.46], [0.055, 1.5], [0.09, 1.56], [0.1, 1.64], [0.11, 1.72], [0.07, 1.8], [0.0, 1.83],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(new THREE.SplineCurve(prof).getPoints(48), 32);
  g.computeVertexNormals();
  return g;
}

interface Stop {
  p: THREE.Vector3;
  /** Seconds she lingers here. */
  wait: number;
}

/**
 * Easter egg: the Lady in Red walks the Mizpah's fifth floor after dark, from
 * the end of the hall to the door of room 502 and on to its window, where she
 * stands looking down on Main Street. Come too close and she is gone.
 */
export class LadyInRed {
  readonly mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;
  private route: Stop[];
  private leg = 0;
  private wait = 0;
  private pos = new THREE.Vector3();
  private yaw = 0;
  private fade = 0;
  private hide = 0;
  private home: THREE.Vector3;
  /** 0..1 how near she feels (for the audio). */
  presence = 0;
  onSight?: () => void;

  constructor(b: Frame) {
    const y = level(4);
    const rf = room502(b);
    const door = slotZ(1) + 1.8;
    const at = (p: THREE.Vector3, wait = 0) => ({ p, wait });
    this.route = [
      at(b.p(0, y, -1.5), 4),
      at(b.p(0, y, door)),
      at(rf.p(-1.8, 0, -2.4)),
      at(rf.p(1.6, 0, 2.45), 14),
      at(rf.p(-1.8, 0, -2.4)),
      at(b.p(0, y, door), 3),
      at(b.p(0, y, -D + 1.5), 6),
      at(b.p(0, y, door)),
      at(rf.p(-1.8, 0, -2.4)),
      at(rf.p(2.0, 0, 0.4), 8),
      at(rf.p(-1.8, 0, -2.4)),
      at(b.p(0, y, door)),
    ];
    this.home = rf.p(0, 0, 0);
    this.pos.copy(this.route[3].p);
    this.leg = 4;
    this.wait = 10;
    this.mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader,
      fragmentShader,
      uniforms: { uTime: G.uTime, uInvExposure: G.uInvExposure, uFade: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(gown(), this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 8;
    this.mesh.visible = false;
  }

  update(dt: number, cam: THREE.Camera, night: number) {
    const dark = THREE.MathUtils.smoothstep(night, 0.6, 0.9);
    const dh = cam.position.distanceTo(this.home);
    this.mesh.visible = dark > 0 && dh < 180;
    this.presence = dark * THREE.MathUtils.clamp(1 - (dh - 8) / 30, 0, 1) * this.fade;
    if (!this.mesh.visible) return;
    const t = G.uTime.value;
    if (this.wait > 0) this.wait -= dt;
    else {
      const to = this.route[this.leg].p;
      const dx = to.x - this.pos.x, dz = to.z - this.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.1) {
        this.wait = this.route[this.leg].wait;
        this.leg = (this.leg + 1) % this.route.length;
      } else {
        const step = Math.min(d, 0.55 * dt);
        this.pos.x += (dx / d) * step;
        this.pos.z += (dz / d) * step;
        this.pos.y = to.y;
        const want = Math.atan2(-dz, dx);
        this.yaw += Math.atan2(Math.sin(want - this.yaw), Math.cos(want - this.yaw)) * Math.min(1, dt * 2);
      }
    }
    // At the window she turns to look down on the street.
    if (this.wait > 0 && this.leg === 4) {
      const out = this.route[3].p.clone().sub(this.route[2].p);
      const want = Math.atan2(-out.z, out.x);
      this.yaw += Math.atan2(Math.sin(want - this.yaw), Math.cos(want - this.yaw)) * Math.min(1, dt * 1.5);
    }
    const y = this.pos.y + 0.06 + 0.04 * Math.sin(t * 0.8);
    const ex = this.pos.x - cam.position.x, ey = y + 1.3 - cam.position.y, ez = this.pos.z - cam.position.z;
    const dist = Math.hypot(ex, ey, ez);
    if (dist < 3.2 && this.fade > 0.05) this.hide = 8 + Math.random() * 8;
    if (this.hide > 0) {
      this.hide -= dt;
      this.fade = Math.max(0, this.fade - dt * 2);
      // She reappears at the window of 502, as if she never left.
      if (this.fade === 0 && this.hide <= 0) {
        this.pos.copy(this.route[3].p);
        this.leg = 4;
        this.wait = 10;
      }
    } else this.fade = Math.min(1, this.fade + dt * 0.3);
    const f = this.fade * dark;
    this.mat.uniforms.uFade.value = f;
    this.mesh.position.set(this.pos.x, y, this.pos.z);
    this.mesh.rotation.y = this.yaw;
    if (f > 0.5 && dist < 40) {
      const fwd = new THREE.Vector3();
      cam.getWorldDirection(fwd);
      if ((ex * fwd.x + ey * fwd.y + ez * fwd.z) / dist > 0.85) this.onSight?.();
    }
  }
}
