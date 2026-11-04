import * as THREE from 'three';
import { G } from '../render/globals';
import { landmarkFragment, landmarkVertex } from '../render/shaders/landmarkShader';
import type { ShadowMap } from '../render/shadows';
import { Frame, FX } from './builders';
import type { Heightfield } from './heightfield';
import { Kit } from './kit';
import type { OsmData } from './meta';
import { buildSignAtlas } from './signAtlas';
import { clownCollection, clownLobby, clownOffice, clownPole, clownRooms, clownWing } from './sites/clownMotel';
import { clownHorror } from './sites/clownHorror';
import { stationDining, stationFloor, stationHotel, stationPylon, stationShell } from './sites/station';
import { courthouseOffices, courthouseShell } from './sites/courthouse';
import { mines } from './sites/mines';
import { mizpah502, mizpahCore, mizpahDempsey, mizpahFacade, mizpahFloors, mizpahLobby, mizpahRooms, mizpahShell } from './sites/mizpah';

const LAMPS = 48;

/**
 * Tonopah, hand-built: the Mizpah, the Belvada, the Clown Motel, Tonopah
 * Station, the courthouse on its hill and the headframes of the mining park,
 * with full interiors you can fly into. Signs glow after dark.
 */
export class Landmarks {
  readonly group = new THREE.Group();
  readonly k: Kit;
  /** The Mizpah's frame at lobby-floor level, for the things that haunt it. */
  readonly mizpah: Frame;
  /** The Clown Motel's office and room block frames. */
  readonly clownOffice: Frame;
  readonly clownWing: Frame;
  /** Tonopah Station's casino frame. */
  readonly station: Frame;
  /** Hoist house frames, one per headframe. */
  readonly hoists: Frame[];
  /** The courthouse frame on its lobby floor. */
  readonly courthouse: Frame;
  private solidMat: THREE.ShaderMaterial;
  private shadowMat: THREE.ShaderMaterial;
  private solidGeo: THREE.BufferGeometry;
  private lampPos = Array.from({ length: LAMPS }, () => new THREE.Vector4());
  private lampCol = Array.from({ length: LAMPS }, () => new THREE.Vector4());
  private lampOrder: number[] = [];
  private lastPick = new THREE.Vector3(Infinity, 0, 0);

  constructor(osm: OsmData, hf: Heightfield) {
    const atlas = buildSignAtlas();
    const hwy: number[][] = [];
    for (const r of osm.roads) if (r.kind === 'trunk') hwy.push(r.pts);
    const k = (this.k = new Kit(hf, atlas.rects, hwy));

    this.welcome(-1700, -1100, -1);
    this.welcome(1300, 1900, 1);
    const mizpah = (this.mizpah = mizpahShell(k));
    mizpahLobby(k, mizpah);
    mizpahDempsey(k, mizpah);
    mizpahCore(k, mizpah);
    mizpahFloors(k, mizpah);
    mizpahRooms(k, mizpah);
    mizpah502(k, mizpah);
    mizpahFacade(k, mizpah);
    const office = (this.clownOffice = clownOffice(k));
    clownLobby(k, office);
    clownCollection(k, office);
    clownPole(k, office);
    const wing = (this.clownWing = clownWing(k));
    clownRooms(k, wing);
    clownHorror(k, wing);
    const station = (this.station = stationShell(k));
    stationFloor(k, station);
    stationDining(k, station);
    stationPylon(k, station);
    stationHotel(k, station);
    this.hoists = mines(k);
    const court = (this.courthouse = courthouseShell(k));
    courthouseOffices(k, court);

    const lampUniforms = { uLamps: { value: this.lampPos }, uLampCol: { value: this.lampCol } };
    this.solidMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: landmarkVertex,
      fragmentShader: landmarkFragment,
      uniforms: { ...G, ...lampUniforms },
      side: THREE.DoubleSide,
    });
    const signMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: landmarkVertex,
      fragmentShader: landmarkFragment,
      uniforms: { ...G, ...lampUniforms, uMap: { value: atlas.texture } },
      defines: { USE_MAP: '' },
    });
    const glassMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: landmarkVertex,
      fragmentShader: landmarkFragment,
      uniforms: { ...G, ...lampUniforms },
      defines: { GLASS_PASS: '' },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    });
    this.shadowMat = this.solidMat.clone();
    this.shadowMat.uniforms = this.solidMat.uniforms;
    this.shadowMat.defines = { SHADOW_PASS: '' };
    this.solidGeo = k.s.build();
    const glass = new THREE.Mesh(k.glass.build(), glassMat);
    glass.renderOrder = 3;
    this.group.add(new THREE.Mesh(this.solidGeo, this.solidMat), new THREE.Mesh(k.sg.build(), signMat), glass);
  }

  get lights() {
    return this.k.lights;
  }
  get lots() {
    return this.k.lots;
  }
  get spots() {
    return this.k.spots;
  }
  get farSpots() {
    return this.k.farSpots;
  }

  /** True where a hand-built landmark already stands (OSM buildings skip these lots). */
  occupies(x: number, z: number) {
    return this.k.sites.some((s) => Math.hypot(x - s.x, z - s.z) < s.radius);
  }

  /** True inside a landmark's exact footprint. */
  covers(x: number, z: number) {
    return this.k.blocks.some(({ fr, x0, x1, z0, z1 }) => {
      const dx = x - fr.o.x, dz = z - fr.o.z;
      const lx = dx * fr.r.x + dz * fr.r.z, lz = dx * fr.f.x + dz * fr.f.z;
      return lx > x0 && lx < x1 && lz > z0 && lz < z1;
    });
  }

  addShadowCasters(shadow: ShadowMap) {
    shadow.addCaster(this.solidGeo, this.shadowMat);
  }

  /** Hands the shader the room lamps nearest the camera. */
  update(cam: THREE.Vector3) {
    if (cam.distanceToSquared(this.lastPick) < 4) return;
    this.lastPick.copy(cam);
    const L = this.k.lamps;
    const n = L.length / 8;
    if (this.lampOrder.length !== n) this.lampOrder = Array.from({ length: n }, (_, i) => i);
    const d2 = (i: number) => (L[i * 8] - cam.x) ** 2 + (L[i * 8 + 1] - cam.y) ** 2 + (L[i * 8 + 2] - cam.z) ** 2;
    const dist = new Float32Array(n);
    for (let i = 0; i < n; i++) dist[i] = d2(i);
    this.lampOrder.sort((a, b) => dist[a] - dist[b]);
    for (let j = 0; j < LAMPS; j++) {
      const i = this.lampOrder[j];
      if (i === undefined || dist[i] > 400 * 400) {
        this.lampPos[j].set(0, 0, 0, 0);
        continue;
      }
      this.lampPos[j].set(L[i * 8], L[i * 8 + 1], L[i * 8 + 2], L[i * 8 + 3]);
      this.lampCol[j].set(L[i * 8 + 4], L[i * 8 + 5], L[i * 8 + 6], L[i * 8 + 7]);
    }
  }

  // --- landmarks --------------------------------------------------------------------

  /** The welcome sign beside US-95: a brown routed-wood board on log posts, on a rock mound. */
  private welcome(x: number, z: number, dir: number) {
    const k = this.k;
    k.seed = 16;
    const h = k.nearestHighway(x, z);
    const side = new THREE.Vector3(-h.tz, 0, h.tx).multiplyScalar(dir);
    const px = h.px + side.x * 15;
    const pz = h.pz + side.z * 15;
    // Face oncoming traffic: southbound drivers see the north sign, and vice versa.
    const fr = new Frame(px, k.hf.height(px, pz), pz, -h.tx * dir, -h.tz * dir);
    const w = k.signW('welcome', 2.6);
    for (const sx of [-w / 2 + 0.3, w / 2 - 0.3]) k.cyl(fr, sx, -0.5, -0.1, 0.17, 0.15, 4.4, '#6a4a2c', { rough: 1 }, 7);
    k.box(fr, 0, 1.0, -0.18, w + 0.3, 2.9, 0.16, '#4a301c', { rough: 0.9 });
    k.sign(fr, 'welcome', 0, 2.45, -0.08, 2.6, 0.4);
    // Rubble mound the posts are bedded in.
    const stone = new THREE.DodecahedronGeometry(0.6, 0);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = (i % 2 ? 2.8 : 2.1) + Math.sin(i * 3.7) * 0.4;
      const m = fr.at(Math.cos(a) * r, i % 2 ? -0.1 : 0.25, Math.sin(a) * r * 0.5, i).multiply(new THREE.Matrix4().makeScale(1 + (i % 3) * 0.25, 0.75, 1));
      k.s.add(stone, m, ['#8a7a6a', '#9a8a7a', '#6a5a4c'][i % 3], { rough: 1 }, k.seed);
    }
    k.box(fr, 0, 4.0, 0.3, 0.6, 0.35, 0.4, '#2a2a2a', { fx: FX.METAL });
    k.light(fr.p(0, 3.95, 0.8), 1, 0.85, 0.6, 1.2);
  }
}
