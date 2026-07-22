// Measures output level (peak / RMS / % clipped) of vgm2 for the extra-chip
// tracks, to sanity-check the YM2413 / AY8910 mix scaling. Not a parity test —
// there is no Java reference for these chips.

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { VgmEmu } from '../VgmEmu';

const repoRoot = process.env.REPO_ROOT || process.cwd();

const CASES = [
  { name: 'battle (YM2413)', vgm: 'src/demos/demo3/battle.vgm', seconds: 20 },
  { name: 'swim (SN+YM2413+YM2612)', vgm: 'src/demos/demo3/swim.vgm', seconds: 20 },
  { name: 'emerald (SN+YM2612)', vgm: 'src/demos/demo3/emerald.vgm', seconds: 20 },
];

const RATE = 44100;

function loadVgm(file: string): Uint8Array {
  let data: Buffer = fs.readFileSync(file);
  if (data[0] === 0x1f && data[1] === 0x8b) data = zlib.gunzipSync(data);
  return new Uint8Array(data);
}

for (const c of CASES) {
  const emu = new VgmEmu();
  emu.setSampleRate(RATE);
  emu.loadFile(loadVgm(path.resolve(repoRoot, c.vgm)));
  emu.startTrack(0);

  const total = RATE * c.seconds * 2;
  const chunk = new Int16Array(4096);
  let peak = 0;
  let sumSq = 0;
  let clipped = 0;
  let n = 0;
  while (n < total && !emu.trackEnded()) {
    const got = emu.play(chunk, 4096);
    const take = Math.min(got, total - n);
    for (let i = 0; i < take; i++) {
      const v = chunk[i];
      const a = Math.abs(v);
      if (a > peak) peak = a;
      if (a >= 32767) clipped++;
      sumSq += v * v;
    }
    n += take;
  }
  const rms = Math.sqrt(sumSq / n);
  console.log(
    `${c.name}: peak=${peak} rms=${rms.toFixed(0)} clipped=${((100 * clipped) / n).toFixed(3)}% (${n} samples)`
  );
}
