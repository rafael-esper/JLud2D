// Band-limited sound synthesis buffer
// 1:1 port of java/audio/gme/BlipBuffer.java (Shay Green, LGPL 2.1)
// http://www.slack.net/~ant/

const TIME_BITS = 16;
const PHASE_BITS = 5;
const PHASE_COUNT = 1 << PHASE_BITS;
const HALF_WIDTH = 8;
const STEP_WIDTH = HALF_WIDTH * 2;

// prettier-ignore
const BASE_KERNEL = new Int32Array([
  10,  -61,  284, -615, 1359,-1753, 5911,22498,
  14,  -71,  295, -616, 1314,-1615, 5259,22472,
  17,  -80,  304, -611, 1260,-1468, 4626,22402,
  21,  -88,  309, -603, 1200,-1313, 4015,22285,
  23,  -94,  313, -589, 1134,-1151, 3426,22122,
  26, -100,  313, -572, 1063, -986, 2861,21915,
  28, -104,  312, -550,  986, -818, 2322,21663,
  30, -108,  308, -525,  906, -648, 1810,21369,
  31, -110,  302, -497,  823, -478, 1326,21034,
  33, -112,  295, -466,  737, -309,  871,20657,
  34, -112,  285, -433,  649, -143,  446,20242,
  34, -111,  274, -397,  561,   19,   51,19790,
  34, -110,  261, -359,  472,  176, -313,19302,
  35, -108,  247, -320,  383,  327, -646,18781,
  34, -105,  232, -280,  296,  472, -948,18230,
  34, -101,  216, -240,  210,  608,-1219,17651,
  33,  -97,  199, -199,  126,  736,-1459,17045,
  32,  -92,  182, -158,   45,  855,-1668,16413,
  31,  -86,  164, -117,  -33,  964,-1847,15761,
  30,  -80,  145,  -77, -107, 1063,-1996,15091,
  28,  -74,  127,  -38, -177, 1151,-2117,14405,
  26,  -67,  108,    0, -243, 1228,-2211,13706,
  24,  -60,   90,   37, -304, 1294,-2277,12996,
  22,  -53,   72,   72, -360, 1349,-2318,12278,
  20,  -46,   54,  105, -410, 1392,-2334,11556,
  18,  -39,   37,  136, -455, 1425,-2327,10831,
  15,  -31,   21,  164, -495, 1446,-2298,10107,
  13,  -24,    5,  191, -529, 1456,-2249, 9385,
  10,  -17,  -10,  215, -557, 1456,-2182, 8669,
   8,  -10,  -24,  236, -580, 1446,-2096, 7962,
   5,   -3,  -37,  255, -597, 1426,-1996, 7265,
   3,    4,  -50,  271, -608, 1397,-1881, 6580,
   0,   10,  -61,  284, -615, 1359,-1753, 5911,
]);

export class BlipBuffer {
  factor = 0;
  offset = 0;
  kernel: Int32Array[] = [];
  accum = 0;
  buf = new Int32Array(0);
  sampleRate = 0;
  clockRate_ = 0;
  volume = 0;

  constructor() {
    this.setVolume(1.0);
  }

  // Sets sample rate of output and changes buffer length to msec
  setSampleRate(rate: number, msec: number): void {
    this.sampleRate = rate;
    this.buf = new Int32Array(Math.floor((msec * rate) / 1000) + 1024);
  }

  // Sets input clock rate. Must be set after sample rate.
  setClockRate(rate: number): void {
    this.clockRate_ = rate;
    // Java computes this in 32-bit float: sampleRate / (float) clockRate_ * (1 << timeBits) + 0.5
    this.factor = Math.trunc(Math.fround(Math.fround(this.sampleRate / rate) * (1 << TIME_BITS)) + 0.5);
  }

  clockRate(): number {
    return this.clockRate_;
  }

  // Removes all samples from buffer
  clear(): void {
    this.offset = 0;
    this.accum = 0;
    this.buf.fill(0);
  }

  // Sets overall volume, where 1.0 is normal
  setVolume(v: number): void {
    const shift = 15;
    const round = 1 << (shift - 1);

    this.volume = (Math.floor((1 << shift) * v + 0.5) | 0) & ~1;

    // build new set of kernels
    const nk: Int32Array[] = [];
    for (let i = 0; i <= PHASE_COUNT; i++) nk.push(new Int32Array(HALF_WIDTH));

    // must be even since center kernel uses same half twice
    const mul = this.volume;
    const pc = PHASE_COUNT;
    for (let p = 17; --p >= 0; ) {
      let remain = mul;
      for (let i = 8; --i >= 0; ) {
        remain -= nk[p][i] = (Math.imul(BASE_KERNEL[p * HALF_WIDTH + i], mul) + round) >> shift;
        remain -= nk[pc - p][i] = (Math.imul(BASE_KERNEL[(pc - p) * HALF_WIDTH + i], mul) + round) >> shift;
      }
      nk[p][7] += remain; // each pair of kernel halves must total mul
    }

    this.kernel = nk;
  }

  // Adds delta at given time
  addDelta(time: number, delta: number): void {
    const buf = this.buf;
    time = (Math.imul(time, this.factor) + this.offset) | 0;
    const phase = (time >> (TIME_BITS - PHASE_BITS)) & (PHASE_COUNT - 1);

    // left half
    let k = this.kernel[phase];
    time >>= TIME_BITS;
    buf[time] += Math.imul(k[0], delta);
    buf[time + 1] += Math.imul(k[1], delta);
    buf[time + 2] += Math.imul(k[2], delta);
    buf[time + 3] += Math.imul(k[3], delta);
    buf[time + 4] += Math.imul(k[4], delta);
    buf[time + 5] += Math.imul(k[5], delta);
    buf[time + 6] += Math.imul(k[6], delta);
    buf[time + 7] += Math.imul(k[7], delta);

    // right half (mirrored version of a left half)
    k = this.kernel[PHASE_COUNT - phase];
    time += 8;
    buf[time] += Math.imul(k[7], delta);
    buf[time + 1] += Math.imul(k[6], delta);
    buf[time + 2] += Math.imul(k[5], delta);
    buf[time + 3] += Math.imul(k[4], delta);
    buf[time + 4] += Math.imul(k[3], delta);
    buf[time + 5] += Math.imul(k[2], delta);
    buf[time + 6] += Math.imul(k[1], delta);
    buf[time + 7] += Math.imul(k[0], delta);
  }

  // Number of samples that would be available at time
  countSamples(time: number): number {
    const lastSample = (Math.imul(time, this.factor) + this.offset) >> TIME_BITS;
    const firstSample = this.offset >> TIME_BITS;
    return lastSample - firstSample;
  }

  // Ends current time frame and makes samples available for reading
  endFrame(time: number): void {
    this.offset = (this.offset + Math.imul(time, this.factor)) | 0;
  }

  // Number of samples available to be read
  samplesAvail(): number {
    return this.offset >> TIME_BITS;
  }

  // Reads at most count samples into out starting at sample index pos
  // and returns number of samples actually read.
  readSamples(out: Int16Array, pos: number, count: number): number {
    const avail = this.samplesAvail();
    if (count > avail) count = avail;

    if (count > 0) {
      // Integrate
      const buf = this.buf;
      let accum = this.accum;
      let i = 0;
      do {
        accum = (accum + buf[i] - (accum >> 9)) | 0;
        let s = accum >> 15;

        // clamp to 16 bits
        if (((s << 16) >> 16) !== s) s = (s >> 24) ^ 0x7fff;

        out[pos] = s;
        pos++;
      } while (++i < count);
      this.accum = accum;

      this.removeSamples(count);
    }
    return count;
  }

  removeSilence(count: number): void {
    this.offset = (this.offset - (count << TIME_BITS)) | 0;
  }

  removeSamples(count: number): void {
    const remain = this.samplesAvail() - count + STEP_WIDTH;
    this.buf.copyWithin(0, count, count + remain);
    this.buf.fill(0, remain, remain + count);
    this.removeSilence(count);
  }
}

// Stereo sound buffer with center channel

export class StereoBuffer {
  private bufs: BlipBuffer[] = [new BlipBuffer(), new BlipBuffer(), new BlipBuffer()];

  setSampleRate(rate: number, msec: number): void {
    for (const b of this.bufs) b.setSampleRate(rate, msec);
  }

  setClockRate(rate: number): void {
    for (const b of this.bufs) b.setClockRate(rate);
  }

  clockRate(): number {
    return this.bufs[0].clockRate();
  }

  countSamples(time: number): number {
    return this.bufs[0].countSamples(time);
  }

  clear(): void {
    for (const b of this.bufs) b.clear();
  }

  setVolume(v: number): void {
    for (const b of this.bufs) b.setVolume(v);
  }

  // The three channels that are mixed together
  // left output  = left  + center
  // right output = right + center
  center(): BlipBuffer {
    return this.bufs[2];
  }
  left(): BlipBuffer {
    return this.bufs[0];
  }
  right(): BlipBuffer {
    return this.bufs[1];
  }

  endFrame(time: number): void {
    for (const b of this.bufs) b.endFrame(time);
  }

  samplesAvail(): number {
    return this.bufs[2].samplesAvail() << 1;
  }

  // Output is in stereo, so count must always be a multiple of 2.
  // out is interleaved stereo Int16, start is in 16-bit sample units.
  readSamples(out: Int16Array, start: number, count: number): number {
    const avail = this.samplesAvail();
    if (count > avail) count = avail;

    if ((count >>= 1) > 0) {
      // calculate center in place
      const mono = this.bufs[2].buf;
      {
        let accum = this.bufs[2].accum;
        let i = 0;
        do {
          mono[i] = accum = (accum + mono[i] - (accum >> 9)) | 0;
        } while (++i < count);
        this.bufs[2].accum = accum;
      }

      // calculate left and right
      for (let ch = 2; --ch >= 0; ) {
        const buf = this.bufs[ch].buf;
        let accum = this.bufs[ch].accum;
        let pos = start + ch;
        let i = 0;
        do {
          accum = (accum + buf[i] - (accum >> 9)) | 0;
          let s = ((accum + mono[i]) | 0) >> 15;

          // clamp to 16 bits
          if (((s << 16) >> 16) !== s) s = (s >> 24) ^ 0x7fff;

          out[pos] = s;
          pos += 2;
        } while (++i < count);
        this.bufs[ch].accum = accum;
      }

      for (const b of this.bufs) b.removeSamples(count);
    }
    return count << 1;
  }
}
