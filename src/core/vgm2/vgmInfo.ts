// Lightweight VGM header parsing for UI display and the music manager.
// Operates on already-inflated VGM bytes.

export interface VGMInfo {
  totalSamples: number;
  loopOffset: number;
  loopSamples: number;
  duration: string; // "m:ss"
  chips: string[];
}

function getLE32(d: Uint8Array, pos: number): number {
  if (pos + 3 >= d.length) return 0;
  return (d[pos] | (d[pos + 1] << 8) | (d[pos + 2] << 16) | (d[pos + 3] << 24)) >>> 0;
}

// Absolute little-endian u32 clock fields in the VGM header
const CLOCK_FIELDS: { name: string; offset: number }[] = [
  { name: 'SN76489', offset: 0x0c },
  { name: 'YM2413', offset: 0x10 },
  { name: 'YM2612', offset: 0x2c },
  { name: 'YM2151', offset: 0x30 },
  { name: 'AY8910', offset: 0x74 },
];

export function parseVGMInfo(data: Uint8Array): VGMInfo {
  const totalSamples = getLE32(data, 0x18);
  const relLoopOffset = getLE32(data, 0x1c);
  const loopSamples = getLE32(data, 0x20);

  // A clock field is only valid if it lies inside the header (before the VGM
  // data); reading past that would pick up music bytes.
  const relDataOffset = getLE32(data, 0x34);
  const dataStart = relDataOffset === 0 ? 0x40 : 0x34 + relDataOffset;

  const chips: string[] = [];
  for (const f of CLOCK_FIELDS) {
    if (f.offset + 4 > dataStart) continue;
    if (getLE32(data, f.offset) > 0) chips.push(f.name);
  }

  const totalSec = Math.round(totalSamples / 44100);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;

  return {
    totalSamples,
    loopOffset: relLoopOffset > 0 ? 0x1c + relLoopOffset : 0,
    loopSamples,
    duration: `${mm}:${ss.toString().padStart(2, '0')}`,
    chips,
  };
}
