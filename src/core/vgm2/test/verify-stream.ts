// Verifies VgmStream's streaming + int16→float32 conversion path reproduces
// the golden PCM. Drives fill() in small, irregular blocks (like an
// AudioWorklet's 128-frame process() callback) and reconstructs interleaved
// int16 by reversing the float scaling, then diffs against the Java dump.

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { VgmStream } from '../VgmStream';

const goldenDir = process.argv[2];
if (!goldenDir) {
  console.error('Usage: node verify-stream.mjs <golden-dir>');
  process.exit(2);
}

const repoRoot = process.env.REPO_ROOT || process.cwd();

const CASES = [
  { name: 'title', vgm: 'public/ps/music/Title.vgz', seconds: 10 },
  { name: 'emerald', vgm: 'src/demos/demo3/emerald.vgm', seconds: 10 },
];

const RATE = 44100;

function loadVgm(file: string): Uint8Array {
  let data: Buffer = fs.readFileSync(file);
  if (data[0] === 0x1f && data[1] === 0x8b) data = zlib.gunzipSync(data);
  return new Uint8Array(data);
}

let failures = 0;

for (const c of CASES) {
  const vgmPath = path.resolve(repoRoot, c.vgm);
  const golden = fs.readFileSync(path.join(goldenDir, `${c.name}.pcm`));
  const goldenFrames = golden.length / 4;

  const stream = new VgmStream(loadVgm(vgmPath), RATE, true);

  const totalFrames = RATE * c.seconds;
  const left = new Float32Array(128);
  const right = new Float32Array(128);

  let mismatches = 0;
  let firstMismatch = -1;
  let frame = 0;
  // Vary block size to mimic the worklet's fixed 128 but exercise partial pulls
  const blockSizes = [128, 128, 128, 96, 128, 200, 37];
  let bi = 0;

  while (frame < totalFrames && frame < goldenFrames) {
    let n = blockSizes[bi++ % blockSizes.length];
    if (n > left.length) n = left.length;
    if (frame + n > Math.min(totalFrames, goldenFrames)) n = Math.min(totalFrames, goldenFrames) - frame;
    stream.fill(left, right, n);

    for (let i = 0; i < n; i++) {
      // Reverse the /32768 scaling; golden is the source of truth
      const gl = golden.readInt16BE((frame + i) * 4);
      const gr = golden.readInt16BE((frame + i) * 4 + 2);
      const sl = Math.round(left[i] * 32768);
      const sr = Math.round(right[i] * 32768);
      if (sl !== gl || sr !== gr) {
        if (firstMismatch < 0) firstMismatch = frame + i;
        mismatches++;
      }
    }
    frame += n;
  }

  const status = mismatches === 0 ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failures++;
  console.log(
    `${status} ${c.name}: ${frame} frames checked, ${mismatches} sample mismatches` +
      (firstMismatch >= 0 ? ` (first at frame ${firstMismatch})` : '')
  );
}

process.exit(failures > 0 ? 1 : 0);
