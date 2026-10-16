import * as THREE from "three";
import type { BodyId } from "./solar-data";

function hash(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function fade(t: number): number {
  return t * t * (3 - 2 * t);
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = fade(fx);
  const uy = fade(fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return value;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, n | 0));
}

function makeCanvas(size: number, paint: (data: Uint8ClampedArray, w: number, h: number) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  const image = ctx.createImageData(size, size);
  paint(image.data, size, size);
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function paintMercury(data: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = fbm(u * 8, v * 4, 5);
      const crater = fbm(u * 18 + 4, v * 10, 3);
      const shade = 92 + n * 70 + crater * 18;
      const i = (y * w + x) * 4;
      data[i] = clampByte(shade);
      data[i + 1] = clampByte(shade * 0.93);
      data[i + 2] = clampByte(shade * 0.86);
      data[i + 3] = 255;
    }
  }
}

function paintVenus(data: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const warp = fbm(u * 3, v * 2, 4);
      const swirl = fbm(u * 6 + warp * 1.4, v * 3.2, 5);
      const i = (y * w + x) * 4;
      data[i] = clampByte(210 + swirl * 30);
      data[i + 1] = clampByte(180 + swirl * 28);
      data[i + 2] = clampByte(120 + swirl * 20);
      data[i + 3] = 255;
    }
  }
}

function paintEarth(data: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const lat = v * 2 - 1;
      const n = fbm(u * 7, v * 4, 5);
      const n2 = fbm(u * 14 + 2.2, v * 8, 3);
      const i = (y * w + x) * 4;

      let r = 18;
      let g = 52;
      let b = 96;

      const land = n > 0.5 || (n2 > 0.58 && n > 0.44);
      if (land) {
        r = 52 + n * 46;
        g = 86 + n * 28;
        b = 40;
        if (Math.abs(lat) < 0.32 && n2 > 0.48) {
          r = 142;
          g = 124;
          b = 72;
        }
      }

      if (Math.abs(lat) > 0.78 - n * 0.08) {
        r = 232;
        g = 236;
        b = 242;
      }

      data[i] = clampByte(r);
      data[i + 1] = clampByte(g);
      data[i + 2] = clampByte(b);
      data[i + 3] = 255;
    }
  }
}

function paintMars(data: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const lat = v * 2 - 1;
      const n = fbm(u * 8, v * 4, 5);
      const i = (y * w + x) * 4;
      let r = 150 + n * 50;
      let g = 78 + n * 28;
      let b = 48 + n * 16;
      if (n < 0.38) {
        r *= 0.72;
        g *= 0.7;
        b *= 0.68;
      }
      if (lat < -0.78 || lat > 0.82) {
        r = 236;
        g = 232;
        b = 224;
      }
      data[i] = clampByte(r);
      data[i + 1] = clampByte(g);
      data[i + 2] = clampByte(b);
      data[i + 3] = 255;
    }
  }
}

function paintBands(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  palette: [number, number, number][],
  warp = 1,
  spot?: { u: number; v: number; ru: number; rv: number; color: [number, number, number] },
): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = fbm(u * 4 * warp, v * 2, 4);
      const band = (v + n * 0.08) * palette.length;
      const idx = Math.min(palette.length - 1, Math.max(0, band | 0));
      const next = Math.min(palette.length - 1, idx + 1);
      const t = band - idx;
      const a = palette[idx]!;
      const bcol = palette[next]!;
      let r = mix(a[0], bcol[0], t);
      let g = mix(a[1], bcol[1], t);
      let bl = mix(a[2], bcol[2], t);

      if (spot) {
        const du = Math.min(Math.abs(u - spot.u), 1 - Math.abs(u - spot.u)) / spot.ru;
        const dv = (v - spot.v) / spot.rv;
        const d = du * du + dv * dv;
        if (d < 1) {
          const k = 1 - d;
          r = mix(r, spot.color[0], k);
          g = mix(g, spot.color[1], k);
          bl = mix(bl, spot.color[2], k);
        }
      }

      const i = (y * w + x) * 4;
      data[i] = clampByte(r);
      data[i + 1] = clampByte(g);
      data[i + 2] = clampByte(bl);
      data[i + 3] = 255;
    }
  }
}

function paintSun(data: Uint8ClampedArray, w: number, h: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = fbm(u * 6, v * 4, 5);
      const i = (y * w + x) * 4;
      data[i] = clampByte(230 + n * 25);
      data[i + 1] = clampByte(150 + n * 50);
      data[i + 2] = clampByte(60 + n * 30);
      data[i + 3] = 255;
    }
  }
}

export function makePlanetTexture(id: BodyId): THREE.CanvasTexture {
  const size = id === "jupiter" || id === "earth" || id === "sun" ? 512 : 256;

  if (id === "sun") return makeCanvas(size, paintSun);
  if (id === "mercury") return makeCanvas(size, paintMercury);
  if (id === "venus") return makeCanvas(size, paintVenus);
  if (id === "earth") return makeCanvas(size, paintEarth);
  if (id === "mars") return makeCanvas(size, paintMars);

  if (id === "jupiter") {
    return makeCanvas(size, (data, w, h) =>
      paintBands(
        data,
        w,
        h,
        [
          [176, 132, 90],
          [214, 176, 128],
          [168, 118, 82],
          [228, 198, 150],
          [186, 140, 96],
          [210, 168, 118],
        ],
        1.2,
        { u: 0.72, v: 0.62, ru: 0.07, rv: 0.055, color: [176, 78, 52] },
      ),
    );
  }

  if (id === "saturn") {
    return makeCanvas(size, (data, w, h) =>
      paintBands(data, w, h, [
        [210, 186, 132],
        [228, 206, 154],
        [198, 172, 118],
        [236, 218, 170],
        [204, 180, 128],
      ]),
    );
  }

  if (id === "uranus") {
    return makeCanvas(size, (data, w, h) =>
      paintBands(data, w, h, [
        [148, 196, 198],
        [168, 214, 212],
        [132, 184, 188],
        [186, 222, 220],
      ]),
    );
  }

  return makeCanvas(size, (data, w, h) =>
    paintBands(
      data,
      w,
      h,
      [
        [46, 78, 168],
        [72, 110, 196],
        [38, 64, 148],
        [90, 132, 210],
      ],
      1,
      { u: 0.38, v: 0.58, ru: 0.08, rv: 0.05, color: [28, 42, 96] },
    ),
  );
}

export function makeCloudTexture(): THREE.CanvasTexture {
  return makeCanvas(512, (data, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const n = fbm(u * 8, v * 4, 5);
        const alpha = n > 0.58 ? (n - 0.58) * 3.2 : 0;
        const i = (y * w + x) * 4;
        data[i] = 245;
        data[i + 1] = 248;
        data[i + 2] = 252;
        data[i + 3] = clampByte(alpha * 180);
      }
    }
  });
}

export function makeRingTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  const image = ctx.createImageData(w, h);
  const data = image.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const radial = y / h;
      const around = x / w;
      const n = fbm(around * 12, radial * 6, 4);
      let alpha = 0.18 + n * 0.55;
      if (radial < 0.04 || radial > 0.96) alpha *= 0.15;
      if (radial > 0.46 && radial < 0.54) alpha *= 0.05;
      if (radial > 0.72 && radial < 0.76) alpha *= 0.25;
      const i = (y * w + x) * 4;
      data[i] = clampByte(210 + n * 30);
      data[i + 1] = clampByte(190 + n * 24);
      data[i + 2] = clampByte(150 + n * 18);
      data[i + 3] = clampByte(alpha * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export type TextureAtlas = {
  bodies: Record<BodyId, THREE.CanvasTexture>;
  clouds: THREE.CanvasTexture;
  rings: THREE.CanvasTexture;
};

export function createTextureAtlas(): TextureAtlas {
  const ids: BodyId[] = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];
  const bodies = {} as Record<BodyId, THREE.CanvasTexture>;
  for (const id of ids) bodies[id] = makePlanetTexture(id);
  return {
    bodies,
    clouds: makeCloudTexture(),
    rings: makeRingTexture(),
  };
}

export function disposeTextureAtlas(atlas: TextureAtlas): void {
  for (const tex of Object.values(atlas.bodies)) tex.dispose();
  atlas.clouds.dispose();
  atlas.rings.dispose();
}
