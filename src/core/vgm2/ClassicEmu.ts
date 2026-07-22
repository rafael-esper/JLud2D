// Common aspects of emulators which use BlipBuffer for sound output
// 1:1 port of java/audio/gme/ClassicEmu.java (Shay Green, LGPL 2.1)

import { MusicEmu } from './MusicEmu';
import { StereoBuffer } from './BlipBuffer';

const BUF_LENGTH = 32;

export class ClassicEmu extends MusicEmu {
  protected buf = new StereoBuffer();

  protected setSampleRate_(rate: number): number {
    this.buf.setSampleRate(rate, Math.trunc(1000 / BUF_LENGTH));
    return rate;
  }

  startTrack(track: number): void {
    super.startTrack(track);
    this.buf.clear();
  }

  protected play_(out: Int16Array, count: number): number {
    let pos = 0;
    while (true) {
      const n = this.buf.readSamples(out, pos, count);
      this.mixSamples(out, pos, n);

      pos += n;
      count -= n;
      if (count <= 0) break;

      if (this.trackEnded_) {
        out.fill(0, pos, pos + count);
        break;
      }

      const clocks = this.runMsec(BUF_LENGTH);
      this.buf.endFrame(clocks);
    }
    return pos;
  }

  protected countSamples(time: number): number {
    return this.buf.countSamples(time);
  }

  protected mixSamples(_out: Int16Array, _offset: number, _count: number): void {
    // derived class can override and mix its own samples here
  }

  protected setClockRate(rate: number): void {
    this.buf.setClockRate(rate);
  }

  // Subclass should run here for at most clockCount and return actual
  // number of clocks emulated (can be less)
  protected runClocks(_clockCount: number): number {
    return 0;
  }

  // Subclass can also get number of msec to run, and return number of clocks emulated
  protected runMsec(_msec: number): number {
    return this.runClocks(this.buf.clockRate() >> 5);
  }
}
