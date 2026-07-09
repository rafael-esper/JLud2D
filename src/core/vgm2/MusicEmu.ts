// Music emulator interface
// 1:1 port of java/audio/gme/MusicEmu.java (Shay Green, LGPL 2.1)
// Output is interleaved stereo Int16 samples instead of big-endian byte pairs;
// all integer math is otherwise identical to the Java original.

const FADE_BLOCK_SIZE = 512;
const FADE_SHIFT = 8; // fade ends with gain at 1.0 / (1 << FADE_SHIFT)
const GAIN_SHIFT = 14;
const GAIN_UNIT = 1 << GAIN_SHIFT;

// unit / pow( 2.0, (double) x / step )
function intLog(x: number, step: number, unit: number): number {
  const shift = Math.trunc(x / step);
  const fraction = Math.trunc(((x - shift * step) * unit) / step);
  return (unit - fraction + (fraction >> 1)) >> shift;
}

// Scales count 16-bit samples in io starting at pos by gain/GAIN_UNIT
function scaleSamples(io: Int16Array, pos: number, count: number, gain: number): void {
  const end = pos + count;
  do {
    io[pos] = Math.imul(io[pos], gain) >> GAIN_SHIFT;
  } while (++pos < end);
}

export class MusicEmu {
  protected trackCount_ = 0;
  protected trackEnded_ = true;
  protected currentTrack_ = 0;
  protected currentTime_ = 0;
  protected fadeStart = 0;
  protected fadeStep = 1;
  private sampleRate_ = 0;

  // Requests change of sample rate and returns sample rate used, which might be different
  setSampleRate(rate: number): number {
    return (this.sampleRate_ = this.setSampleRate_(rate));
  }

  sampleRate(): number {
    return this.sampleRate_;
  }

  // Loads music file into emulator. Might keep reference to data.
  loadFile(data: Uint8Array): void {
    this.trackEnded_ = true;
    this.currentTrack_ = 0;
    this.currentTime_ = 0;
    this.trackCount_ = this.loadFile_(data);
  }

  trackCount(): number {
    return this.trackCount_;
  }

  // Starts track, where 0 is first track
  startTrack(track: number): void {
    if (track < 0 || track > this.trackCount_) this.error('Invalid track');

    this.trackEnded_ = false;
    this.currentTrack_ = track;
    this.currentTime_ = 0;
    this.fadeStart = 0x40000000; // far into the future
    this.fadeStep = 1;
  }

  currentTrack(): number {
    return this.currentTrack_;
  }

  // Generates at most count 16-bit samples (stereo interleaved) into out and
  // returns number of samples written. If track has ended, fills with silence.
  play(out: Int16Array, count: number): number {
    if (!this.trackEnded_) {
      count = this.play_(out, count);
      if ((this.currentTime_ += count >> 1) > this.fadeStart) this.applyFade(out, count);
    } else {
      out.fill(0, 0, count);
    }
    return count;
  }

  // Sets fade start and length, in seconds. Must be set after call to startTrack().
  setFade(start: number, length: number): void {
    this.fadeStart = Math.imul(this.sampleRate_, start);
    this.fadeStep = Math.trunc((this.sampleRate_ * length) / (FADE_BLOCK_SIZE * FADE_SHIFT));
    if (this.fadeStep < 1) this.fadeStep = 1;
  }

  // Number of seconds current track has been played
  currentTime(): number {
    return Math.trunc(this.currentTime_ / this.sampleRate_);
  }

  // True if track has reached end or setFade()'s fade has finished
  trackEnded(): boolean {
    return this.trackEnded_;
  }

  // protected — must be defined in derived class
  protected setSampleRate_(rate: number): number {
    return rate;
  }
  protected loadFile_(_data: Uint8Array): number {
    return 0;
  }
  protected play_(_out: Int16Array, _count: number): number {
    return 0;
  }

  // Reports error string as exception
  protected error(str: string): never {
    throw new Error(str);
  }

  // Sets end of track flag and stops emulating file
  protected setTrackEnded(): void {
    this.trackEnded_ = true;
  }

  // Stops track and notes emulation error
  protected logError(): void {
    if (!this.trackEnded_) {
      this.trackEnded_ = true;
      console.log('emulation error');
    }
  }

  // Reads 16 bit little endian int starting at data[pos]
  protected static getLE16(data: Uint8Array, pos: number): number {
    return data[pos] | (data[pos + 1] << 8);
  }

  // Reads 32 bit little endian int starting at data[pos] (signed, like Java)
  protected static getLE32(data: Uint8Array, pos: number): number {
    return data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24);
  }

  // True if first bytes of file match expected string
  protected static isHeader(header: Uint8Array, expected: string): boolean {
    for (let i = expected.length; --i >= 0; ) {
      if (expected.charCodeAt(i) !== header[i]) return false;
    }
    return true;
  }

  private applyFade(io: Int16Array, count: number): void {
    // Apply successively smaller gains based on time since fade start
    for (let i = 0; i < count; i += FADE_BLOCK_SIZE) {
      // logarithmic progression
      const gain = intLog(Math.trunc((this.currentTime_ + i - this.fadeStart) / FADE_BLOCK_SIZE), this.fadeStep, GAIN_UNIT);
      if (gain < GAIN_UNIT >> FADE_SHIFT) this.setTrackEnded();

      let n = count - i;
      if (n > FADE_BLOCK_SIZE) n = FADE_BLOCK_SIZE;
      scaleSamples(io, i, n, gain);
    }
  }
}
