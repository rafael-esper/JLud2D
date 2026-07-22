// Bundles the VGM AudioWorklet processor and its emulator dependencies into a
// single self-contained classic script at public/vgm-worklet.js.
//
// AudioWorklet's addModule() does not reliably support ES-module imports, so
// the worklet cannot be loaded straight from source. esbuild inlines the whole
// vgm2 emulator (VgmEmu, YM2612, SmsApu, BlipBuffer, ...) into one IIFE with no
// external references except the AudioWorkletGlobalScope globals (sampleRate,
// AudioWorkletProcessor, registerProcessor), which the audio thread provides.
//
// Run automatically before `dev` and `build` (see package.json).

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await build({
  entryPoints: [resolve(root, 'src/core/vgm2/vgm-worklet.ts')],
  outfile: resolve(root, 'public/vgm-worklet.js'),
  bundle: true,
  format: 'iife',
  target: 'es2020',
  platform: 'browser',
  legalComments: 'none',
});

console.log('built public/vgm-worklet.js');
