// Streaming adapter around VgmEmu for real-time playback.
//
// Owns a VgmEmu and pulls audio from it in chunks (the browser equivalent of
// the Java EmuPlayer.run() loop that fed a SourceDataLine). Exposes fill(),
// which writes deinterleaved float32 into the left/right planar buffers an
// AudioWorklet hands out. Deliberately free of any AudioWorklet globals so it
// can be unit-tested in Node against the golden PCM.

import { VgmEmu } from './VgmEmu';

// Matches the Java harness cadence: byte[8192] → play(buf, 4096).
const CHUNK_SAMPLES = 4096; // 16-bit samples per pull (stereo interleaved) = 2048 frames

export class VgmStream {
  private emu = new VgmEmu();
  private chunk = new Int16Array(CHUNK_SAMPLES);
  private chunkLen = 0; // valid samples currently in chunk
  private chunkPos = 0; // read cursor into chunk (in samples)
  private ended = false;
  private loop: boolean;

  constructor(vgmData: Uint8Array, sampleRate: number, loop: boolean = true) {
    this.loop = loop;
    this.emu.setSampleRate(sampleRate);
    this.emu.loadFile(vgmData);
    this.emu.startTrack(0);
  }

  isEnded(): boolean {
    return this.ended;
  }

  /**
   * Fill `frames` stereo frames into planar left/right float32 buffers.
   * Returns the number of frames actually produced (< frames once the track
   * has ended and looping is off). Remaining frames are zero-filled.
   */
  fill(left: Float32Array, right: Float32Array, frames: number): number {
    let produced = 0;

    while (produced < frames) {
      // Refill the interleaved chunk when drained
      if (this.chunkPos >= this.chunkLen) {
        if (this.ended) break;

        // VgmEmu loops internally (CMD_END jumps to loopBegin); trackEnded()
        // only fires for tracks with no loop point. For loop === false we
        // stop as soon as the emulator reports the track finished.
        if (this.emu.trackEnded()) {
          this.ended = true;
          break;
        }

        this.chunkLen = this.emu.play(this.chunk, CHUNK_SAMPLES);
        this.chunkPos = 0;

        if (this.chunkLen === 0) {
          // Nothing more to produce (shouldn't happen for looping tracks)
          this.ended = true;
          break;
        }

        if (!this.loop && this.emu.trackEnded()) {
          // This was the final chunk of a non-looping track; drain it then stop
        }
      }

      // Copy interleaved int16 → planar float32
      const availSamples = this.chunkLen - this.chunkPos; // interleaved samples
      const availFrames = availSamples >> 1;
      const want = frames - produced;
      const take = availFrames < want ? availFrames : want;

      let ci = this.chunkPos;
      let oi = produced;
      const chunk = this.chunk;
      for (let i = 0; i < take; i++) {
        left[oi] = chunk[ci] / 32768;
        right[oi] = chunk[ci + 1] / 32768;
        ci += 2;
        oi++;
      }
      this.chunkPos = ci;
      produced += take;
    }

    // Zero-fill the tail if we ran out
    for (let i = produced; i < frames; i++) {
      left[i] = 0;
      right[i] = 0;
    }

    return produced;
  }
}
