// AY-3-8910 / YM2149 PSG emulator.
//
// Typed port of the legacy src/core/vgm/ay8910.js (there is no Java gme
// equivalent). Kept behaviourally identical to the legacy core; the only
// addition is updateInto(), which renders a batch of output-rate samples
// directly into a linear interleaved-LR int buffer (mono duplicated to both
// channels), matching how VgmEmu mixes the YM2612 — no per-sample allocation.

// Brings the chip's ~0..0.33 float output up to roughly the same level the
// legacy player used (it added the raw value into a signal clipping at 1.0).
const AY_SCALE = 32767;

export class AY8910 {
  private clock: number;
  private register = new Int32Array(16);
  private channelSignal = [0, 0, 0];
  private channelPeriod = [0, 0, 0];
  private channelCounter = [0, 0, 0];
  private noiseSignal = 0;
  private noisePeriod = 0;
  private noiseCounter = 0;
  private noisePhase = 0;
  private channelEnable = [0, 0, 0];
  private noiseEnable = [0, 0, 0];
  private randomSequence = 1;

  private static readonly volumeTable = [
    0, 0.0078125, 0.0110485, 0.015625, 0.0220971, 0.03125, 0.0441942, 0.0625,
    0.0883883, 0.125, 0.1767767, 0.25, 0.3535534, 0.5, 0.7071068, 1,
  ];

  constructor(clock: number) {
    this.clock = clock;
  }

  reset(): void {
    this.register.fill(0);
    this.channelSignal = [0, 0, 0];
    this.channelPeriod = [0, 0, 0];
    this.channelCounter = [0, 0, 0];
    this.noiseSignal = 0;
    this.noisePeriod = 0;
    this.noiseCounter = 0;
    this.noisePhase = 0;
    this.channelEnable = [0, 0, 0];
    this.noiseEnable = [0, 0, 0];
    this.randomSequence = 1;
  }

  setRegister(num: number, value: number): void {
    this.register[num] = value;

    if (num === 0 || num === 1) this.channelPeriod[0] = (this.register[1] << 8) + this.register[0];
    if (num === 2 || num === 3) this.channelPeriod[1] = (this.register[3] << 8) + this.register[2];
    if (num === 4 || num === 5) this.channelPeriod[2] = (this.register[5] << 8) + this.register[4];
    if (num === 6) this.noisePeriod = this.register[6];
    if (num === 7) {
      this.channelEnable[0] = this.register[7] & 1;
      this.channelEnable[1] = (this.register[7] >> 1) & 1;
      this.channelEnable[2] = (this.register[7] >> 2) & 1;
      this.noiseEnable[0] = (this.register[7] >> 3) & 1;
      this.noiseEnable[1] = (this.register[7] >> 4) & 1;
      this.noiseEnable[2] = (this.register[7] >> 5) & 1;
    }
  }

  private getTick(): number {
    let result = 0;

    for (let c = 0; c < 3; c++) {
      this.channelCounter[c]++;
      if (this.channelCounter[c] >= this.channelPeriod[c]) {
        this.channelSignal[c] ^= 1;
        this.channelCounter[c] = 0;
      }
    }

    this.noiseCounter++;
    if (this.noiseCounter >= this.noisePeriod) {
      this.noisePhase ^= 1;
      this.noiseCounter = 0;

      if (this.noisePhase) {
        this.randomSequence ^= ((this.randomSequence & 1) ^ ((this.randomSequence >> 3) & 1)) << 17;
        this.randomSequence >>= 1;
      }

      this.noiseSignal = this.randomSequence & 1;
    }

    for (let c = 0; c < 3; c++) {
      const signal = (this.channelSignal[c] | this.channelEnable[c]) & (this.noiseSignal | this.noiseEnable[c]);
      result += signal * AY8910.volumeTable[this.register[8 + c]];
    }

    return result / 3;
  }

  /**
   * Render `count` output-rate frames into the interleaved-LR int buffer `buf`
   * starting at frame `offset`. Output is mono, written to both channels.
   */
  updateInto(buf: Int32Array, offset: number, count: number, sampleRate: number): void {
    const ticks = this.clock / sampleRate / (16 / 2);
    let volume = 0;
    let i = 0;
    let j = 0;

    while (j < count) {
      volume += this.getTick();
      i++;
      if (i >= ticks) {
        const s = ((volume / i) * AY_SCALE) | 0;
        const o = (offset + j) << 1;
        buf[o] += s;
        buf[o + 1] += s;
        volume = 0;
        i = 0;
        j++;
      }
    }
  }
}
