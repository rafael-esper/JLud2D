// Verifies the TypeScript VgmEmu port is bit-identical to the Java original.
// Renders VGM files and compares against golden PCM dumps produced by the
// Java harness (audio.gme.DumpPcm): raw 16-bit big-endian interleaved stereo.
//
// Usage: node compare-golden.mjs <golden-dir>

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { VgmEmu } from '../VgmEmu';

const goldenDir = process.argv[2];
if (!goldenDir) {
  console.error('Usage: node compare-golden.mjs <golden-dir>');
  process.exit(2);
}

const repoRoot = process.env.REPO_ROOT || process.cwd();

// Parity gate: only tracks whose chips the Java engine actually supports
// (SN76489 + YM2612). Files that also use YM2413/AY8910 now legitimately
// diverge from the Java golden, since vgm2 plays those layers and Java skips
// them — so they are not part of this bit-exact gate.
const CASES = [
  { name: 'title', vgm: 'public/ps/music/Title.vgz', seconds: 10 },
  { name: 'emerald', vgm: 'src/demos/demo3/emerald.vgm', seconds: 10 },
  // 60s exercises the loop path (Title loops well within 60s)
  { name: 'title60', vgm: 'public/ps/music/Title.vgz', seconds: 60 },
  { name: 'dungeon', vgm: 'public/ps/music/Dungeon.vgz', seconds: 30 },
];

const RATE = 44100;
// Java harness: byte buf[8192] → play(buf, 4096) → 4096 16-bit samples per call
const CHUNK_SAMPLES = 4096;

function loadVgm(file: string): Uint8Array {
  let data: Buffer = fs.readFileSync(file);
  if (data[0] === 0x1f && data[1] === 0x8b) data = zlib.gunzipSync(data);
  return new Uint8Array(data);
}

let failures = 0;

for (const c of CASES) {
  const vgmPath = path.resolve(repoRoot, c.vgm);
  const goldenPath = path.join(goldenDir, `${c.name}.pcm`);
  const golden = fs.readFileSync(goldenPath);

  const emu = new VgmEmu();
  const actualRate = emu.setSampleRate(RATE);
  emu.loadFile(loadVgm(vgmPath));
  emu.startTrack(0);

  const totalSamples = actualRate * c.seconds * 2;
  const out = new Int16Array(totalSamples);
  const chunk = new Int16Array(CHUNK_SAMPLES);
  let written = 0;
  const t0 = Date.now();
  while (written < totalSamples && !emu.trackEnded()) {
    const n = emu.play(chunk, CHUNK_SAMPLES);
    const take = Math.min(n, totalSamples - written);
    out.set(chunk.subarray(0, take), written);
    written += take;
  }
  const renderMs = Date.now() - t0;

  // Compare against big-endian golden dump
  const goldenSamples = golden.length / 2;
  const compareCount = Math.min(goldenSamples, written);
  let mismatches = 0;
  let firstMismatch = -1;
  for (let i = 0; i < compareCount; i++) {
    const g = golden.readInt16BE(i * 2);
    if (g !== out[i]) {
      if (firstMismatch < 0) firstMismatch = i;
      mismatches++;
    }
  }

  const status = mismatches === 0 && written === goldenSamples ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failures++;
  console.log(
    `${status} ${c.name}: ${written}/${goldenSamples} samples, ${mismatches} mismatches` +
      (firstMismatch >= 0
        ? ` (first at sample ${firstMismatch}, frame ${firstMismatch >> 1}, ` +
          `t=${(firstMismatch / 2 / RATE).toFixed(3)}s: golden=${golden.readInt16BE(firstMismatch * 2)} got=${out[firstMismatch]})`
        : '') +
      ` — rendered ${c.seconds}s in ${renderMs}ms`
  );
}

process.exit(failures > 0 ? 1 : 0);
