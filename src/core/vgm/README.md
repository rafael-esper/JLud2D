# VGM Core Module

A TypeScript VGM (Video Game Music) player supporting multiple sound chips with stereo output and dual chip support.

## Features

- **Multiple Sound Chips**: YM2612, YM2413, SN76489, AY8910
- **Dual Chip Support**: Automatic stereo panning for dual chip configurations
- **PCM DAC Support**: High-quality drum samples using Java VgmEmu pattern
- **Compressed Files**: Supports both .vgm and .vgz (gzipped) files
- **Stereo Output**: True stereo mixing with proper chip separation
- **Looping**: Automatic loop detection and playback

## Usage

```typescript
import { VGMPlayer, VGMPlayerOptions, loadVGMScripts } from '../../core/vgm';

// Load VGM dependencies first
await loadVGMScripts();

// Initialize
const audioCtx = new AudioContext();
const options: VGMPlayerOptions = {
  sampleRate: 44100,
  enableLooping: true
};
const player = new VGMPlayer(audioCtx, options);

// Load and play
const response = await fetch('path/to/music.vgm');
const vgmData = new Uint8Array(await response.arrayBuffer());

const info = await player.loadVGM(vgmData);
console.log('Loaded:', info.chips.join(', '), info.duration);

await player.playMusic();

// Control playback
player.stopMusic();
const isPlaying = player.isPlaying();
```

## API Reference

### VGMPlayer

#### Constructor
- `new VGMPlayer(audioContext: AudioContext, options?: VGMPlayerOptions)`

#### Methods
- `loadVGMScripts(): Promise<void>` - Load required JavaScript dependencies
- `loadVGM(data: Uint8Array): Promise<VGMInfo>` - Load VGM file
- `playMusic(): Promise<void>` - Start playback
- `stopMusic(): void` - Stop playback
- `isPlaying(): boolean` - Check playback status
- `getActiveChips(): string[]` - Get list of active chips

#### Options
```typescript
interface VGMPlayerOptions {
  sampleRate?: number;      // Default: 44100
  enableLooping?: boolean;  // Default: true
}
```

#### VGM Info
```typescript
interface VGMInfo {
  totalSamples: number;
  loopOffset: number;
  loopSamples: number;
  duration: string;
  chips: string[];
}
```

## Supported Chips

### YM2612 (Sega Genesis/Mega Drive)
- 6-channel FM synthesis
- DAC channel for PCM drums
- Dual chip support for stereo

### SN76489 (Sega Master System/Game Gear)
- 3 tone channels + 1 noise channel
- Game Gear stereo support

### AY8910 (Various systems)
- 3-channel PSG
- Dual chip support

### YM2413 (OPLL - Various systems)
- 9-channel FM synthesis

## File Support

- **VGM**: Uncompressed Video Game Music files
- **VGZ**: Gzip-compressed VGM files (automatically detected and decompressed)

## Implementation Notes

- Uses Java VgmEmu pattern for PCM DAC handling
- Implements proper dual chip stereo separation
- Optimized mixing prevents audio artifacts
- Supports VGM 1.70 specification

## Files

### Core Implementation
- `VGMPlayer.ts` - Main TypeScript player implementation
- `index.ts` - Module exports and TypeScript interfaces

### JavaScript Libraries (Required for browser)
- `pako.js` - Gzip decompression for .vgz files
- `vgm.js` - VGM file parser
- `vgm_reader.js` - VGM data reader utilities

### Sound Chip Emulators
- `ym2612.js` - YM2612 (Sega Genesis/Mega Drive FM + DAC)
- `ym2413.js` - YM2413 (OPLL FM synthesis)
- `sn76489.js` - SN76489 (SMS/Game Gear PSG)
- `ay8910.js` - AY8910 (General PSG)
- `c6280.js` - C6280 (PC Engine/TurboGrafx-16)

### Reference Materials
- `*.c` - Reference C implementations
- `vgmspec170.txt` - VGM format specification v1.70

#### External Links
- [YM2612 Reference Implementation](https://github.com/vgmrips/vgmplay-legacy/blob/master/VGMPlay/chips/ym2612.c) - Official YM2612 sound chip emulator C implementation
- [Sonic the Hedgehog 2 VGM Pack](https://vgmrips.net/packs/pack/sonic-the-hedgehog-2-mega-drive-genesis) - Complete VGM soundtrack from Sonic 2 (Mega Drive/Genesis)
- [WebVGM Online Player](https://www.wothke.ch/webVGM/) - Browser-based VGM player for testing and reference
- [Phantasy Star IV VGM Pack](https://vgmrips.net/packs/pack/phantasy-star-iv-mega-drive-genesis) - Complete VGM soundtrack from Phantasy Star IV (Mega Drive/Genesis)


## HTML Setup

No manual script loading required! The VGM module automatically loads its dependencies using the `loadVGMScripts()` function.

Simply ensure your VGM JavaScript files are in the correct location:
```
src/core/vgm/
├── pako.js
├── vgm.js
├── vgm_reader.js
├── ay8910.js
├── ym2612.js
├── ym2413.js
├── sn76489.js
├── c6280.js
├── VGMPlayer.ts
├── index.ts
└── README.md
```

The module will automatically load these files when `loadVGMScripts()` is called.