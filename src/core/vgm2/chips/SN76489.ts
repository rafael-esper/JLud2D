// Sega Master System SN76489 PSG sound chip emulator
// 1:1 port of java/audio/gme/SmsApu.java (Shay Green, LGPL 2.1)
// http://www.slack.net/~ant/

import { BlipBuffer } from '../BlipBuffer';

const MASTER_VOLUME = Math.floor((0.4 * 65536) / 128);

class SmsOsc {
  output: BlipBuffer | null = null;
  outputSelect = 3;
  readonly outputs: (BlipBuffer | null)[] = [null, null, null, null];
  delay = 0;
  lastAmp = 0;
  volume = 0;

  reset(): void {
    this.delay = 0;
    this.lastAmp = 0;
    this.volume = 0;
    this.outputSelect = 3;
    this.output = this.outputs[this.outputSelect];
  }
}

class SmsSquare extends SmsOsc {
  period = 0;
  phase = 0;

  reset(): void {
    this.period = 0;
    this.phase = 0;
    super.reset();
  }

  run(time: number, endTime: number): void {
    const period = this.period;

    let amp = this.volume;
    if (period > 128) amp = (amp * 2) & -this.phase;

    {
      const delta = amp - this.lastAmp;
      if (delta !== 0) {
        this.lastAmp = amp;
        this.output!.addDelta(time, delta * MASTER_VOLUME);
      }
    }

    time += this.delay;
    this.delay = 0;
    if (period !== 0) {
      if (time < endTime) {
        if (this.volume === 0 || period <= 128) {
          // ignore 16kHz and higher; keep calculating phase
          const count = Math.floor((endTime - time + period - 1) / period);
          this.phase = (this.phase + count) & 1;
          time += count * period;
        } else {
          const output = this.output!;
          let delta = (amp - this.volume) * (2 * MASTER_VOLUME);
          do {
            output.addDelta(time, (delta = -delta));
          } while ((time += period) < endTime);

          this.phase = delta >= 0 ? 1 : 0;
          this.lastAmp = this.volume * (this.phase << 1);
        }
      }
      this.delay = time - endTime;
    }
  }
}

class SmsNoise extends SmsOsc {
  shifter = 0x8000;
  feedback = 0x9000;
  select = 0;

  reset(): void {
    this.select = 0;
    this.shifter = 0x8000;
    this.feedback = 0x9000;
    super.reset();
  }

  run(time: number, endTime: number, period: number): void {
    const output = this.output!;

    let amp = this.volume;
    if ((this.shifter & 1) !== 0) amp = -amp;

    {
      const delta = amp - this.lastAmp;
      if (delta !== 0) {
        this.lastAmp = amp;
        output.addDelta(time, delta * MASTER_VOLUME);
      }
    }

    time += this.delay;
    if (this.volume === 0) time = endTime;

    if (time < endTime) {
      const feedback = this.feedback;
      let shifter = this.shifter;
      let delta = amp * (2 * MASTER_VOLUME);
      if ((period *= 2) === 0) period = 16;

      do {
        const changed = shifter + 1;
        shifter = (feedback & -(shifter & 1)) ^ (shifter >> 1);
        if ((changed & 2) !== 0) {
          // true if bits 0 and 1 differ
          output.addDelta(time, (delta = -delta));
        }
      } while ((time += period) < endTime);

      this.shifter = shifter;
      this.lastAmp = delta < 0 ? -this.volume : this.volume;
    }
    this.delay = time - endTime;
  }
}

const OSC_COUNT = 4;
const NOISE_PERIODS = [0x100, 0x200, 0x400];
const VOLUMES = [64, 50, 39, 31, 24, 19, 15, 12, 9, 7, 5, 4, 3, 2, 1, 0];

export class SN76489 {
  lastTime = 0;
  latch = 0;
  noiseFeedback = 0;
  loopedFeedback = 0;

  readonly squares: SmsSquare[] = [new SmsSquare(), new SmsSquare(), new SmsSquare()];
  readonly noise = new SmsNoise();
  readonly oscs: SmsOsc[] = [this.squares[0], this.squares[1], this.squares[2], this.noise];

  private runUntil(endTime: number): void {
    if (endTime > this.lastTime) {
      // run oscillators
      for (let i = OSC_COUNT; --i >= 0; ) {
        const osc = this.oscs[i];
        if (osc.output !== null) {
          if (i < 3) {
            this.squares[i].run(this.lastTime, endTime);
          } else {
            let period = this.squares[2].period;
            if (this.noise.select < 3) period = NOISE_PERIODS[this.noise.select];
            this.noise.run(this.lastTime, endTime, period);
          }
        }
      }

      this.lastTime = endTime;
    }
  }

  setOutput(center: BlipBuffer, left: BlipBuffer, right: BlipBuffer): void {
    for (let i = 0; i < OSC_COUNT; i++) {
      const osc = this.oscs[i];
      osc.outputs[1] = right;
      osc.outputs[2] = left;
      osc.outputs[3] = center;
      osc.output = osc.outputs[osc.outputSelect];
    }
  }

  reset(feedback: number = 0x0009, noiseWidth: number = 16): void {
    this.lastTime = 0;
    this.latch = 0;

    // convert to "Galios configuration"
    this.loopedFeedback = 1 << (noiseWidth - 1);
    this.noiseFeedback = 0;
    while (--noiseWidth >= 0) {
      this.noiseFeedback = (this.noiseFeedback << 1) | (feedback & 1);
      feedback >>= 1;
    }

    this.squares[0].reset();
    this.squares[1].reset();
    this.squares[2].reset();
    this.noise.reset();
  }

  writeGG(time: number, data: number): void {
    this.runUntil(time);

    for (let i = 0; i < OSC_COUNT; i++) {
      const osc = this.oscs[i];
      const flags = data >> i;
      const oldOutput = osc.output;
      osc.outputSelect = ((flags >> 3) & 2) | (flags & 1);
      osc.output = osc.outputs[osc.outputSelect];
      if (osc.output !== oldOutput && osc.lastAmp !== 0) {
        if (oldOutput !== null) oldOutput.addDelta(time, -osc.lastAmp * MASTER_VOLUME);
        osc.lastAmp = 0;
      }
    }
  }

  writeData(time: number, data: number): void {
    this.runUntil(time);

    if ((data & 0x80) !== 0) this.latch = data;

    const index = (this.latch >> 5) & 3;
    if ((this.latch & 0x10) !== 0) {
      this.oscs[index].volume = VOLUMES[data & 15];
    } else if (index < 3) {
      const sq = this.squares[index];
      if ((data & 0x80) !== 0) sq.period = (sq.period & 0xff00) | ((data << 4) & 0x00ff);
      else sq.period = (sq.period & 0x00ff) | ((data << 8) & 0x3f00);
    } else {
      this.noise.select = data & 3;
      this.noise.feedback = (data & 0x04) !== 0 ? this.noiseFeedback : this.loopedFeedback;
      this.noise.shifter = 0x8000;
    }
  }

  endFrame(endTime: number): void {
    if (endTime > this.lastTime) this.runUntil(endTime);

    this.lastTime -= endTime;
  }
}
