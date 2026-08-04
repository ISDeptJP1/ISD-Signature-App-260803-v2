/**
 * ISD motion logo → animated GIF for email.
 * Transparent background (inherits email client surface).
 * Frame 0 settled. Continuous 180° orbit → spin-in.
 */

export type GifBar = {
  color: string;
  final: { x: number; y: number; w: number; h: number };
  phase: number;
  spinDir: number;
};

const VIEW_W = 184;
const VIEW_H = 100;
const CX = 92;
const CY = 50;
const ORBIT_R = 62;
const ORBIT_ARC = Math.PI;

export const LOGO_BARS: GifBar[] = [
  {
    color: "#fbfa1c",
    final: { x: 4, y: 2, w: 50, h: 22 },
    phase: Math.PI * 1.15,
    spinDir: -1,
  },
  {
    color: "#151c94",
    final: { x: 78, y: 24, w: 52, h: 26 },
    phase: Math.PI * 0.35,
    spinDir: 1,
  },
  {
    color: "#ae0708",
    final: { x: 130, y: 50, w: 50, h: 22 },
    phase: Math.PI * 1.75,
    spinDir: -1,
  },
  {
    color: "#151c94",
    final: { x: 52, y: 72, w: 52, h: 26 },
    phase: Math.PI * 0.9,
    spinDir: 1,
  },
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function yieldToMain() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export function barPoseAt(bar: GifBar, t: number) {
  const fcX = bar.final.x + bar.final.w / 2;
  const fcY = bar.final.y + bar.final.h / 2;

  let ox: number;
  let oy: number;
  let rot: number;
  let scale: number;
  let opacity: number;

  if (t < 0.12) {
    ox = fcX;
    oy = fcY;
    rot = 0;
    scale = 1;
    opacity = 1;
  } else if (t < 0.2) {
    const u = easeInOutCubic((t - 0.12) / 0.08);
    const ang = bar.phase;
    ox = lerp(fcX, CX + Math.cos(ang) * ORBIT_R, u);
    oy = lerp(fcY, CY + Math.sin(ang) * ORBIT_R, u);
    rot = bar.spinDir * 90 * u;
    scale = lerp(1, 0.9, u);
    opacity = lerp(1, 0.88, u);
  } else if (t < 0.72) {
    const u = (t - 0.2) / 0.52;
    const orbitEnd = 0.7;
    if (u < orbitEnd) {
      const ou = u / orbitEnd;
      const ang = bar.phase + ou * ORBIT_ARC;
      ox = CX + Math.cos(ang) * ORBIT_R;
      oy = CY + Math.sin(ang) * ORBIT_R;
      rot = bar.spinDir * (90 + ou * 180);
      scale = 0.9;
      opacity = 0.88;
    } else {
      const su = (u - orbitEnd) / (1 - orbitEnd);
      const endAng = bar.phase + ORBIT_ARC;
      ox = lerp(CX + Math.cos(endAng) * ORBIT_R, fcX, su);
      oy = lerp(CY + Math.sin(endAng) * ORBIT_R, fcY, su);
      rot = lerp(bar.spinDir * 270, bar.spinDir * 360, su);
      scale = lerp(0.9, 1, su);
      opacity = lerp(0.88, 1, su);
    }
  } else {
    ox = fcX;
    oy = fcY;
    rot = 0;
    scale = 1;
    opacity = 1;
  }

  return {
    x: ox - bar.final.w / 2,
    y: oy - bar.final.h / 2,
    w: bar.final.w,
    h: bar.final.h,
    rot,
    scale,
    opacity,
    color: bar.color,
  };
}

export function drawLogoFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  opts: { showLetters?: boolean; bg?: string | null } = {},
) {
  const { showLetters = false, bg = null } = opts;
  const padBottom = showLetters ? 22 : 0;
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const scaleX = ctx.canvas.width / VIEW_W;
  const scaleY = (ctx.canvas.height - padBottom) / VIEW_H;
  const s = Math.min(scaleX, scaleY);
  const ox = (ctx.canvas.width - VIEW_W * s) / 2;
  const oy = ((ctx.canvas.height - padBottom) - VIEW_H * s) / 2;

  for (const bar of LOGO_BARS) {
    const p = barPoseAt(bar, t);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
    const cx = ox + (p.x + p.w / 2) * s;
    const cy = oy + (p.y + p.h / 2) * s;
    ctx.translate(cx, cy);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.scale(p.scale, p.scale);
    const w = p.w * s;
    const h = p.h * s;
    const x = -w / 2;
    const y = -h / 2;
    ctx.fillStyle = p.color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(1, s * 0.9);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.restore();
  }

  ctx.restore();
}

export async function exportIsdGif(options: {
  durationSec?: number;
  fps?: number;
  width?: number;
  height?: number;
  showLetters?: boolean;
  onProgress?: (p: number) => void;
}): Promise<Blob> {
  const {
    durationSec = 5,
    fps = 12,
    width = 160,
    height = 88,
    onProgress,
  } = options;

  if (typeof document === "undefined") {
    throw new Error("GIF export only runs in the browser");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const frameCount = Math.max(2, Math.round(durationSec * fps));
  const delayCs = Math.max(2, Math.round(100 / fps));
  const frames: Uint8ClampedArray[] = [];

  for (let i = 0; i < frameCount; i++) {
    drawLogoFrame(ctx, i / frameCount, { showLetters: false, bg: null });
    frames.push(ctx.getImageData(0, 0, width, height).data);
    onProgress?.(i / frameCount);
    if (i % 2 === 0) await yieldToMain();
  }

  const gif = encodeGif(frames, width, height, delayCs);
  onProgress?.(1);
  const copy = new Uint8Array(gif.byteLength);
  copy.set(gif);
  return new Blob([copy], { type: "image/gif" });
}

function quantizeFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { index: Uint8Array; palette: number[] } {
  // index 0 = transparent
  const palette: number[] = [
    0x000000, 0x000000, 0xfbfa1c, 0x151c94, 0xae0708, 0xf5f4a0, 0x3a42a8,
    0xc04040,
  ];
  const index = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < width * height; i++, p += 4) {
    const r = data[p]!,
      g = data[p + 1]!,
      b = data[p + 2]!,
      a = data[p + 3]!;
    if (a < 128) {
      index[i] = 0; // transparent
      continue;
    }
    let best = 1,
      bestD = Infinity;
    for (let k = 1; k < palette.length; k++) {
      const c = palette[k]!;
      const d =
        (r - ((c >> 16) & 255)) ** 2 +
        (g - ((c >> 8) & 255)) ** 2 +
        (b - (c & 255)) ** 2;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    index[i] = best;
  }
  return { index, palette };
}

function encodeGif(
  frames: Uint8ClampedArray[],
  width: number,
  height: number,
  delayCs: number,
): Uint8Array {
  const parts: number[] = [];
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) parts.push(s.charCodeAt(i));
  };
  const writeByte = (b: number) => parts.push(b & 255);
  const writeWord = (w: number) => {
    parts.push(w & 255, (w >> 8) & 255);
  };

  writeStr("GIF89a");
  writeWord(width);
  writeWord(height);
  writeByte(0x80 | 0x70 | 0x02);
  writeByte(0);
  writeByte(0);
  const first = quantizeFrame(frames[0]!, width, height);
  for (let i = 0; i < 8; i++) {
    const c = first.palette[i] ?? 0;
    writeByte((c >> 16) & 255);
    writeByte((c >> 8) & 255);
    writeByte(c & 255);
  }
  writeByte(0x21);
  writeByte(0xff);
  writeByte(11);
  writeStr("NETSCAPE2.0");
  writeByte(3);
  writeByte(1);
  writeWord(0);
  writeByte(0);

  for (const frame of frames) {
    const { index, palette } = quantizeFrame(frame, width, height);
    writeByte(0x21);
    writeByte(0xf9);
    writeByte(4);
    // disposal 2 + transparent color flag; transparent index 0
    writeByte(0x09);
    writeWord(delayCs);
    writeByte(0); // transparent color index
    writeByte(0);
    writeByte(0x2c);
    writeWord(0);
    writeWord(0);
    writeWord(width);
    writeWord(height);
    writeByte(0x80 | 0x02);
    for (let i = 0; i < 8; i++) {
      const c = palette[i] ?? 0;
      writeByte((c >> 16) & 255);
      writeByte((c >> 8) & 255);
      writeByte(c & 255);
    }
    const minCodeSize = 3;
    writeByte(minCodeSize);
    const lzw = lzwEncode(index, minCodeSize);
    let offset = 0;
    while (offset < lzw.length) {
      const size = Math.min(255, lzw.length - offset);
      writeByte(size);
      for (let j = 0; j < size; j++) writeByte(lzw[offset + j]!);
      offset += size;
    }
    writeByte(0);
  }
  writeByte(0x3b);
  return new Uint8Array(parts);
}

function lzwEncode(indexStream: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  const out: number[] = [];
  let cur = 0,
    curBits = 0;
  const writeCode = (code: number) => {
    cur |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      out.push(cur & 255);
      cur >>= 8;
      curBits -= 8;
    }
  };
  let dict = new Map<string, number>();
  const resetDict = () => {
    dict = new Map();
    for (let i = 0; i < clearCode; i++) dict.set(String(i), i);
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };
  resetDict();
  writeCode(clearCode);
  let w = String(indexStream[0]!);
  for (let i = 1; i < indexStream.length; i++) {
    const k = String(indexStream[i]!);
    const wk = w + "," + k;
    if (dict.has(wk)) w = wk;
    else {
      writeCode(dict.get(w)!);
      if (nextCode < 4096) {
        dict.set(wk, nextCode++);
        if (nextCode === 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        writeCode(clearCode);
        resetDict();
      }
      w = k;
    }
  }
  writeCode(dict.get(w)!);
  writeCode(endCode);
  if (curBits > 0) out.push(cur & 255);
  return new Uint8Array(out);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
