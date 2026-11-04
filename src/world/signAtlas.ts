import * as THREE from 'three';
import { TONOPAH_SIGNS } from './tonopahSigns';
import type { SignSpec } from './signKit';

/** Atlas rectangle in UV space plus the number of stacked animation frames. */
export interface SignRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  frames: number;
  /** Width / height of one frame. */
  aspect: number;
}

const SIZE = 2048;

let cached: { texture: THREE.Texture; rects: Record<string, SignRect> } | null = null;

/** Paints every storefront, highway and interior sign into one texture atlas (built once, shared). */
export function buildSignAtlas(): { texture: THREE.Texture; rects: Record<string, SignRect> } {
  if (cached) return cached;
  // Shelf packing with a small gutter so mip levels don't bleed between signs.
  const pad = 8;
  let x = pad;
  let y = pad;
  let shelf = 0;
  const sorted = [...TONOPAH_SIGNS].sort((a, b) => b.h * (b.frames ?? 1) - a.h * (a.frames ?? 1));
  const placed: { s: SignSpec; x: number; y: number }[] = [];
  for (const s of sorted) {
    const th = s.h * (s.frames ?? 1);
    if (x + s.w + pad > SIZE) {
      x = pad;
      y += shelf + pad;
      shelf = 0;
    }
    placed.push({ s, x, y });
    x += s.w + pad;
    shelf = Math.max(shelf, th);
  }
  const height = Math.ceil((y + shelf + pad) / 256) * 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = height;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#000';
  const rects: Record<string, SignRect> = {};
  for (const { s, x, y } of placed) {
    const frames = s.frames ?? 1;
    for (let f = 0; f < frames; f++) {
      g.save();
      g.translate(x, y + f * s.h);
      g.beginPath();
      g.rect(0, 0, s.w, s.h);
      g.clip();
      if (!s.cutout) g.fillRect(0, 0, s.w, s.h);
      s.draw(g, s.w, s.h, f);
      g.restore();
    }
    rects[s.name] = { u0: x / SIZE, v0: y / height, u1: (x + s.w) / SIZE, v1: (y + s.h * frames) / height, frames, aspect: s.w / s.h };
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  cached = { texture, rects };
  return cached;
}
