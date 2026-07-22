// Sega Master System / Mega Drive VGM music file emulator
// 1:1 port of java/audio/gme/VgmEmu.java (Shay Green, LGPL 2.1)

import { ClassicEmu } from './ClassicEmu';
import { MusicEmu } from './MusicEmu';
import { SN76489 } from './chips/SN76489';
import { YM2612 } from './chips/YM2612';
import { YM2413 } from './chips/YM2413';
import { AY8910 } from './chips/AY8910';

const VGM_RATE = 44100;
const PSG_TIME_BITS = 12;
const PSG_TIME_UNIT = 1 << PSG_TIME_BITS;

const CMD_GG_STEREO = 0x4f;
const CMD_PSG = 0x50;
const CMD_YM2413 = 0x51;
const CMD_YM2612_PORT0 = 0x52;
const CMD_YM2612_PORT1 = 0x53;
const CMD_AY8910 = 0xa0;
const CMD_DELAY = 0x61;
const CMD_DELAY_735 = 0x62;
const CMD_DELAY_882 = 0x63;
const CMD_END = 0x66;
const CMD_DATA_BLOCK = 0x67;
const CMD_SHORT_DELAY = 0x70;
const CMD_PCM_DELAY = 0x80;
const CMD_PCM_SEEK = 0xe0;
const YM2612_DAC_PORT = 0x2a;
const PCM_BLOCK_TYPE = 0x00;

export class VgmEmu extends ClassicEmu {
  readonly apu = new SN76489();
  fm: YM2612 | null = null;
  fm_clock_rate = 0;
  pos = 0;
  data: Uint8Array = new Uint8Array(0);
  delay = 0;
  psgFactor = 0;
  loopBegin = 0;
  // Absolute offset of the VGM command stream. 0x40 for old files (what the
  // Java engine assumed), but v1.50+ files declare it via the 0x34 field —
  // e.g. AY8910 tracks start at 0x80.
  dataStart = 0x40;
  readonly fm_buf_lr = new Int32Array((48000 / 10) * 2);
  fm_pos = 0;
  dac_disabled = 0; // -1 if disabled
  pcm_data = 0;
  pcm_pos = 0;
  dac_amp = 0;

  // Extra chips with no Java gme equivalent, mixed as additional linear layers
  // alongside the YM2612 (see mixSamples). opll is the vendored OPLL core, so
  // it is loosely typed.
  opll: any = null;
  ay: AY8910 | null = null;
  readonly opll_buf = new Int32Array((48000 / 10) * 2);
  opll_pos = 0;
  readonly ay_buf = new Int32Array((48000 / 10) * 2);
  ay_pos = 0;

  protected loadFile_(data: Uint8Array): number {
    if (!MusicEmu.isHeader(data, 'Vgm ')) this.error('Not a VGM file');

    // TODO: use custom noise taps if present

    // Data and loop
    // Note: the Java original resizes only its local variable here when the
    // file lacks a trailing end command — the appended CMD_END never reaches
    // this.data, and playback relies on the pos < data.length guard instead.
    // Replicated as-is for bit-exactness.
    this.data = data;
    this.loopBegin = MusicEmu.getLE32(data, 28) + 28;
    if (this.loopBegin <= 28) {
      this.loopBegin = data.length;
    }

    // PSG clock rate
    let clockRate = MusicEmu.getLE32(data, 0x0c);
    if (clockRate === 0) clockRate = 3579545;
    // Java computes this in 32-bit float: (float) psgTimeUnit / vgmRate * clockRate + 0.5
    this.psgFactor = Math.trunc(Math.fround(Math.fround(PSG_TIME_UNIT / VGM_RATE) * clockRate) + 0.5);

    // FM clock rate
    this.fm_clock_rate = MusicEmu.getLE32(data, 0x2c);
    this.fm = null;
    if (this.fm_clock_rate !== 0) {
      this.fm = new YM2612();
      this.buf.setVolume(0.7);
      this.fm.init(this.fm_clock_rate, this.sampleRate());
    } else {
      this.buf.setVolume(1.0);
    }

    // Extra chips (not in the Java engine). A clock field is only valid if it
    // lies inside the header (before the VGM data), else it would read music
    // bytes — guard against that for the later-added fields.
    const relDataOffset = MusicEmu.getLE32(data, 0x34);
    this.dataStart = relDataOffset === 0 ? 0x40 : 0x34 + relDataOffset;
    const clockAt = (off: number): number => (off + 4 <= this.dataStart ? MusicEmu.getLE32(data, off) : 0);

    const ym2413Clock = clockAt(0x10);
    this.opll = null;
    if (ym2413Clock !== 0) {
      this.opll = new (YM2413 as any)();
      this.opll.init(ym2413Clock, this.sampleRate());
    }

    const ay8910Clock = clockAt(0x74);
    this.ay = null;
    if (ay8910Clock !== 0) {
      this.ay = new AY8910(ay8910Clock);
    }

    this.setClockRate(clockRate);
    this.apu.setOutput(this.buf.center(), this.buf.left(), this.buf.right());

    return 1;
  }

  startTrack(track: number): void {
    super.startTrack(track);

    this.pos = this.dataStart;
    this.delay = 0;
    this.pcm_data = this.pos;
    this.pcm_pos = this.pos;
    this.dac_amp = -1;

    this.apu.reset();
    if (this.fm !== null) this.fm.reset();
    if (this.opll !== null) this.opll.reset();
    if (this.ay !== null) this.ay.reset();
  }

  private toPSGTime(vgmTime: number): number {
    return (Math.imul(vgmTime, this.psgFactor) + PSG_TIME_UNIT / 2) >> PSG_TIME_BITS;
  }

  private toFMTime(vgmTime: number): number {
    return this.countSamples(this.toPSGTime(vgmTime));
  }

  private runFM(vgmTime: number): void {
    const count = this.toFMTime(vgmTime) - this.fm_pos;
    if (count > 0) {
      this.fm!.update(this.fm_buf_lr, this.fm_pos, count);
      this.fm_pos += count;
    }
  }

  // Sync the extra chips up to the exact time of the next register write, the
  // same lazy-batch approach as runFM (keeps intra-frame timing accurate).
  private runOPLL(vgmTime: number): void {
    const count = this.toFMTime(vgmTime) - this.opll_pos;
    if (count > 0) {
      this.opll.updateInto(this.opll_buf, this.opll_pos, count);
      this.opll_pos += count;
    }
  }

  private runAY(vgmTime: number): void {
    const count = this.toFMTime(vgmTime) - this.ay_pos;
    if (count > 0) {
      this.ay!.updateInto(this.ay_buf, this.ay_pos, count, this.sampleRate());
      this.ay_pos += count;
    }
  }

  private write_pcm(vgmTime: number, amp: number): void {
    const blip_time = this.toPSGTime(vgmTime);
    const old = this.dac_amp;
    const delta = amp - old;
    this.dac_amp = amp;
    if (old >= 0) {
      // first write is ignored, to avoid click
      this.buf.center().addDelta(blip_time, delta * 300);
    } else {
      this.dac_amp |= this.dac_disabled;
    }
  }

  protected runMsec(msec: number): number {
    const duration = Math.trunc((Math.trunc(VGM_RATE / 100) * msec) / 10);

    {
      const sampleCount = this.toFMTime(duration);
      if (this.fm) this.fm_buf_lr.fill(0, 0, sampleCount * 2);
      if (this.opll) this.opll_buf.fill(0, 0, sampleCount * 2);
      if (this.ay) this.ay_buf.fill(0, 0, sampleCount * 2);
    }
    this.fm_pos = 0;
    this.opll_pos = 0;
    this.ay_pos = 0;

    const data = this.data;
    let time = this.delay;
    while (time < duration) {
      let cmd = CMD_END;
      if (this.pos < data.length) cmd = data[this.pos++];
      switch (cmd) {
        case CMD_END:
          this.pos = this.loopBegin;
          break;

        case CMD_DELAY_735:
          time += 735;
          break;

        case CMD_DELAY_882:
          time += 882;
          break;

        case CMD_GG_STEREO:
          this.apu.writeGG(this.toPSGTime(time), data[this.pos++]);
          break;

        case CMD_PSG:
          this.apu.writeData(this.toPSGTime(time), data[this.pos++]);
          break;

        case CMD_YM2413: {
          const reg = data[this.pos++];
          const val = data[this.pos++];
          if (this.opll !== null) {
            this.runOPLL(time);
            this.opll.write(reg, val);
          }
          break;
        }

        case CMD_AY8910: {
          const reg = data[this.pos++];
          const val = data[this.pos++];
          if (this.ay !== null) {
            this.runAY(time);
            this.ay.setRegister(reg, val);
          }
          break;
        }

        case CMD_YM2612_PORT0:
          if (this.fm !== null) {
            const port = data[this.pos++];
            const val = data[this.pos++];
            if (port === YM2612_DAC_PORT) {
              this.write_pcm(time, val);
            } else {
              if (port === 0x2b) {
                this.dac_disabled = ((val >> 7) & 1) - 1;
                this.dac_amp |= this.dac_disabled;
              }
              this.runFM(time);
              this.fm.write0(port, val);
            }
          }
          break;

        case CMD_YM2612_PORT1:
          if (this.fm !== null) {
            this.runFM(time);
            const port = data[this.pos++];
            this.fm.write1(port, data[this.pos++]);
          }
          break;

        case CMD_DELAY:
          time += data[this.pos + 1] * 0x100 + data[this.pos];
          this.pos += 2;
          break;

        case CMD_DATA_BLOCK: {
          if (data[this.pos++] !== CMD_END) this.logError();
          const type = data[this.pos++];
          const size = MusicEmu.getLE32(data, this.pos);
          this.pos += 4;
          if (type === PCM_BLOCK_TYPE) this.pcm_data = this.pos;
          this.pos += size;
          break;
        }

        case CMD_PCM_SEEK:
          this.pcm_pos = this.pcm_data + MusicEmu.getLE32(data, this.pos);
          this.pos += 4;
          break;

        default:
          switch (cmd & 0xf0) {
            case CMD_PCM_DELAY:
              this.write_pcm(time, data[this.pcm_pos++]);
              time += cmd & 0x0f;
              break;

            case CMD_SHORT_DELAY:
              time += (cmd & 0x0f) + 1;
              break;

            case 0x50:
              this.pos += 2;
              break;

            default:
              this.logError();
              break;
          }
      }
    }

    if (this.fm !== null) this.runFM(duration);
    if (this.opll !== null) this.runOPLL(duration);
    if (this.ay !== null) this.runAY(duration);

    const endTime = this.toPSGTime(duration);
    this.delay = time - duration;
    this.apu.endFrame(endTime);
    if (this.pos >= this.data.length) {
      this.setTrackEnded();
      if (this.pos > this.data.length) {
        this.pos = this.data.length;
        this.logError(); // went past end
      }
    }

    this.fm_pos = 0;

    return endTime;
  }

  protected mixSamples(out: Int16Array, out_off: number, count: number): void {
    // Sum every linear-buffer chip on top of the PSG (already in `out`).
    // When only SN76489 + YM2612 are present this is identical, sample for
    // sample, to the Java engine (opll/ay null) — preserving the golden gate.
    const fm = this.fm ? this.fm_buf_lr : null;
    const opll = this.opll ? this.opll_buf : null;
    const ay = this.ay ? this.ay_buf : null;
    if (!fm && !opll && !ay) return;

    let in_off = this.fm_pos;

    while (--count >= 0) {
      // PSG is attenuated (>>2) when mixed with a louder FM/PSG-plus chip,
      // matching the Java core's headroom handling.
      let s = out[out_off] >> 2;
      if (fm) s += fm[in_off];
      if (opll) s += opll[in_off];
      if (ay) s += ay[in_off];
      in_off++;
      if (((s << 16) >> 16) !== s) s = (s >> 31) ^ 0x7fff;
      out[out_off] = s;
      out_off++;
    }

    this.fm_pos = in_off;
  }
}
