// Sweeps YM2413 mix scale to pick a level: pure-YM2413 (battle) should sit near
// a typical mixed track (emerald rms~2250, peak~14520) without clipping busy
// mixed tracks (swim).

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { VgmEmu } from '../VgmEmu';

const repoRoot = process.env.REPO_ROOT || process.cwd();
const RATE = 44100;

function loadVgm(file: string): Uint8Array {
  let d: Buffer = fs.readFileSync(path.resolve(repoRoot, file));
  if (d[0] === 0x1f && d[1] === 0x8b) d = zlib.gunzipSync(d);
  return new Uint8Array(d);
}

function measure(vgm: string, seconds: number, scale: number) {
  const emu = new VgmEmu();
  emu.setSampleRate(RATE);
  emu.loadFile(loadVgm(vgm));
  emu.startTrack(0);
  if ((emu as any).opll) (emu as any).opll.setScale(scale);

  const total = RATE * seconds * 2;
  const chunk = new Int16Array(4096);
  let peak = 0, sumSq = 0, clipped = 0, n = 0;
  while (n < total && !emu.trackEnded()) {
    const got = emu.play(chunk, 4096);
    const take = Math.min(got, total - n);
    for (let i = 0; i < take; i++) {
      const a = Math.abs(chunk[i]);
      if (a > peak) peak = a;
      if (a >= 32767) clipped++;
      sumSq += chunk[i] * chunk[i];
    }
    n += take;
  }
  return { peak, rms: Math.sqrt(sumSq / n), clipPct: (100 * clipped) / n };
}

for (const scale of [0.3, 0.5, 0.7, 0.85, 1.0]) {
  const b = measure('src/demos/demo3/battle.vgm', 20, scale);
  const s = measure('src/demos/demo3/swim.vgm', 20, scale);
  console.log(
    `scale=${scale.toFixed(2)}  battle peak=${b.peak} rms=${b.rms.toFixed(0)} clip=${b.clipPct.toFixed(3)}%  ` +
      `swim peak=${s.peak} rms=${s.rms.toFixed(0)} clip=${s.clipPct.toFixed(3)}%`
  );
}
