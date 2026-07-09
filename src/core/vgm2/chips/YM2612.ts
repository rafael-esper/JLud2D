// YM2612 FM sound chip emulator (Gens core)
// 1:1 port of java/audio/gme/YM2612.java (Stephan Dittrich's Java port of
// Stéphane Dallongeville's Gens YM2612 core)

const ATTACK = 0;
const DECAY = 1;
const SUSTAIN = 2;
const RELEASE = 3;

const SIN_HBITS = 12;
const SIN_LBITS = 26 - SIN_HBITS <= 16 ? 26 - SIN_HBITS : 16;

const ENV_HBITS = 12;
const ENV_LBITS = 28 - ENV_HBITS;

const LFO_HBITS = 10;
const LFO_LBITS = 28 - LFO_HBITS;

const SINLEN = 1 << SIN_HBITS;
const ENVLEN = 1 << ENV_HBITS;
const LFOLEN = 1 << LFO_HBITS;

const TLLEN = ENVLEN * 3;

const SIN_MSK = SINLEN - 1;
const ENV_MSK = ENVLEN - 1;
const LFO_MSK = LFOLEN - 1;

const ENV_STEP = 96.0 / ENVLEN;

const ENV_ATTACK = (ENVLEN * 0) << ENV_LBITS;
const ENV_DECAY = (ENVLEN * 1) << ENV_LBITS;
const ENV_END = (ENVLEN * 2) << ENV_LBITS;

const MAX_OUT_BITS = SIN_HBITS + SIN_LBITS + 2;
const MAX_OUT = (1 << MAX_OUT_BITS) - 1;

const OUTP_BITS = 16;
const OUT_BITS = OUTP_BITS - 2;
const FINAL_SHFT = MAX_OUT_BITS - OUT_BITS + 1;
const LIMIT_CH_OUT = Math.trunc((1 << OUT_BITS) * 1.5) - 1;

const PG_CUT_OFF = Math.trunc(78.0 / ENV_STEP);

const AR_RATE = 399128;
const DR_RATE = 5514396;

const LFO_FMS_LBITS = 9;
const LFO_FMS_BASE = Math.trunc(0.05946309436 * 0.0338 * (1 << LFO_FMS_LBITS));

const S0 = 0;
const S1 = 2;
const S2 = 1;
const S3 = 3;

const UPD_SIZE = 4000;
const NULL_RATE_SIZE = 32;
const AR_NULL_RATE = 128;
const DR_NULL_RATE = 96;

const MAIN_SHIFT = FINAL_SHFT;

// prettier-ignore
const DT_DEF_TAB = [
  // FD = 0
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // FD = 1
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
  2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8, 8, 8, 8,
  // FD = 2
  1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5,
  5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 16, 16, 16, 16,
  // FD = 3
  2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7,
  8, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 22, 22, 22, 22,
];

// prettier-ignore
const FKEY_TAB = [
  0, 0, 0, 0,
  0, 0, 0, 1,
  2, 3, 3, 3,
  3, 3, 3, 3,
];

const LFO_AMS_TAB = [31, 4, 1, 0];

const LFO_FMS_TAB = [
  LFO_FMS_BASE * 0, LFO_FMS_BASE * 1,
  LFO_FMS_BASE * 2, LFO_FMS_BASE * 3,
  LFO_FMS_BASE * 4, LFO_FMS_BASE * 6,
  LFO_FMS_BASE * 12, LFO_FMS_BASE * 24,
];

class Slot {
  DT: Int32Array = new Int32Array(32);
  MUL = 0;
  TL = 0;
  TLL = 0;
  SLL = 0;
  KSR_S = 0;
  KSR = 0;
  SEG = 0;
  AR = 0;
  DR = 0;
  SR = 0;
  RR = 0;
  Fcnt = 0;
  Finc = 0;
  Ecurp = 0;
  Ecnt = 0;
  Einc = 0;
  Ecmp = 0;
  EincA = 0;
  EincD = 0;
  EincS = 0;
  EincR = 0;
  INd = 0;
  ChgEnM = 0;
  AMS = 0;
  AMSon = 0;
}

class Channel {
  readonly S0_OUT = new Int32Array(4);
  Old_OUTd = 0;
  OUTd = 0;
  LEFT = 0;
  RIGHT = 0;
  ALGO = 0;
  FB = 0;
  FMS = 0;
  AMS = 0;
  readonly FNUM = new Int32Array(4);
  readonly FOCT = new Int32Array(4);
  readonly KC = new Int32Array(4);
  readonly SLOT: Slot[] = [new Slot(), new Slot(), new Slot(), new Slot()];
  FFlag = 0;
}

export class YM2612 {
  // Tables
  private readonly SIN_TAB = new Int32Array(SINLEN);
  private readonly TL_TAB = new Int32Array(TLLEN * 2);
  private readonly ENV_TAB = new Int32Array(2 * ENVLEN + 8);
  private readonly DECAY_TO_ATTACK = new Int32Array(ENVLEN);
  private readonly FINC_TAB = new Int32Array(2048);
  private readonly AR_TAB = new Int32Array(AR_NULL_RATE + NULL_RATE_SIZE);
  private readonly DR_TAB = new Int32Array(DR_NULL_RATE + NULL_RATE_SIZE);
  private readonly DT_TAB: Int32Array[] = [];
  private readonly SL_TAB = new Int32Array(16);
  private readonly LFO_ENV_TAB = new Int32Array(LFOLEN);
  private readonly LFO_FREQ_TAB = new Int32Array(LFOLEN);
  private readonly LFO_ENV_UP = new Int32Array(UPD_SIZE);
  private readonly LFO_FREQ_UP = new Int32Array(UPD_SIZE);
  private readonly LFO_INC_TAB = new Int32Array(8);

  private in0 = 0;
  private in1 = 0;
  private in2 = 0;
  private in3 = 0;
  private en0 = 0;
  private en1 = 0;
  private en2 = 0;
  private en3 = 0;
  private int_cnt = 0;

  private EnableSSGEG = false;

  YM2612_Clock = 0;
  YM2612_Rate = 0;
  YM2612_TimerBase = 0;
  YM2612_Status = 0;
  YM2612_LFOcnt = 0;
  YM2612_LFOinc = 0;
  YM2612_TimerA = 0;
  YM2612_TimerAL = 0;
  YM2612_TimerAcnt = 0;
  YM2612_TimerB = 0;
  YM2612_TimerBL = 0;
  YM2612_TimerBcnt = 0;
  YM2612_Mode = 0;
  YM2612_DAC = 0;
  YM2612_Frequency = 0;
  YM2612_Inter_Cnt = 0;
  YM2612_Inter_Step = 0;
  readonly YM2612_CHANNEL: Channel[] = [];
  readonly YM2612_REG: Int32Array[] = [new Int32Array(0x100), new Int32Array(0x100)];

  constructor() {
    for (let i = 0; i < 6; i++) this.YM2612_CHANNEL.push(new Channel());
    for (let i = 0; i < 8; i++) this.DT_TAB.push(new Int32Array(32));
  }

  init(Clock: number, Rate: number): number {
    let i: number, j: number;
    let x: number;

    if (Rate === 0 || Clock === 0) return 1;

    this.YM2612_Clock = Clock;
    this.YM2612_Rate = Rate;

    this.YM2612_Frequency = this.YM2612_Clock / this.YM2612_Rate / 144.0;
    this.YM2612_TimerBase = Math.trunc(this.YM2612_Frequency * 4096.0);

    this.YM2612_Inter_Step = 0x4000;
    this.YM2612_Inter_Cnt = 0;

    // TL Table :
    // [0     -  4095] = +output  [4095  - ...] = +output overflow (fill with 0)
    // [12288 - 16383] = -output  [16384 - ...] = -output overflow (fill with 0)

    for (i = 0; i < TLLEN; i++) {
      if (i >= PG_CUT_OFF) {
        this.TL_TAB[TLLEN + i] = this.TL_TAB[i] = 0;
      } else {
        x = MAX_OUT; // Max output
        x /= Math.pow(10, (ENV_STEP * i) / 20);
        this.TL_TAB[i] = Math.trunc(x);
        this.TL_TAB[TLLEN + i] = -this.TL_TAB[i];
      }
    }

    // SIN Table :
    // SIN_TAB[x][y] = sin(x) * y;
    // x = phase and y = volume

    this.SIN_TAB[0] = PG_CUT_OFF;
    this.SIN_TAB[SINLEN / 2] = PG_CUT_OFF;

    for (i = 1; i <= SINLEN / 4; i++) {
      x = Math.sin((2.0 * Math.PI * i) / SINLEN); // Sinus
      x = 20 * Math.log10(1 / x); // convert to dB

      j = Math.trunc(x / ENV_STEP); // Get TL range

      if (j > PG_CUT_OFF) j = PG_CUT_OFF;

      this.SIN_TAB[i] = j;
      this.SIN_TAB[SINLEN / 2 - i] = j;
      this.SIN_TAB[SINLEN / 2 + i] = TLLEN + j;
      this.SIN_TAB[SINLEN - i] = TLLEN + j;
    }

    // LFO Table (LFO wav) :

    for (i = 0; i < LFOLEN; i++) {
      x = Math.sin((2.0 * Math.PI * i) / LFOLEN); // Sinus
      x += 1.0;
      x /= 2.0;
      x *= 11.8 / ENV_STEP;
      this.LFO_ENV_TAB[i] = Math.trunc(x);
      x = Math.sin((2.0 * Math.PI * i) / LFOLEN); // Sinus
      x *= (1 << (LFO_HBITS - 1)) - 1;
      this.LFO_FREQ_TAB[i] = Math.trunc(x);
    }

    for (i = 0; i < ENVLEN; i++) {
      x = Math.pow((ENVLEN - 1 - i) / ENVLEN, 8);
      x *= ENVLEN;
      this.ENV_TAB[i] = Math.trunc(x);
      x = Math.pow(i / ENVLEN, 1);
      x *= ENVLEN;
      this.ENV_TAB[ENVLEN + i] = Math.trunc(x);
    }

    this.ENV_TAB[ENV_END >> ENV_LBITS] = ENVLEN - 1;

    // Table Decay and Decay

    for (i = 0, j = ENVLEN - 1; i < ENVLEN; i++) {
      while (j !== 0 && this.ENV_TAB[j] < i) j--;
      this.DECAY_TO_ATTACK[i] = j << ENV_LBITS;
    }

    // Sustain Level Table

    for (i = 0; i < 15; i++) {
      x = (i * 3) / ENV_STEP;

      j = Math.trunc(x);
      j <<= ENV_LBITS;
      this.SL_TAB[i] = j + ENV_DECAY;
    }

    j = ENVLEN - 1; // special case : volume off
    j <<= ENV_LBITS;
    this.SL_TAB[15] = j + ENV_DECAY;

    // Frequency Step Table

    for (i = 0; i < 2048; i++) {
      x = i * this.YM2612_Frequency;

      if (SIN_LBITS + SIN_HBITS - (21 - 7) < 0) {
        x /= 1 << (21 - 7 - SIN_LBITS - SIN_HBITS);
      } else {
        x *= 1 << (SIN_LBITS + SIN_HBITS - (21 - 7));
      }
      x /= 2.0; // because MUL = value * 2
      this.FINC_TAB[i] = Math.trunc(x);
    }

    // Attack & Decay Rate Table

    for (i = 0; i < 4; i++) {
      this.AR_TAB[i] = 0;
      this.DR_TAB[i] = 0;
    }

    for (i = 0; i < 60; i++) {
      x = this.YM2612_Frequency;
      x *= 1.0 + (i & 3) * 0.25; // bits 0-1 : x1.00, x1.25, x1.50, x1.75
      x *= 1 << (i >> 2); // bits 2-5 : shift bits (x2^0 - x2^15)
      x *= ENVLEN << ENV_LBITS; // adjust for ENV_TAB

      this.AR_TAB[i + 4] = Math.trunc(x / AR_RATE);
      this.DR_TAB[i + 4] = Math.trunc(x / DR_RATE);
    }

    for (i = 64; i < 96; i++) {
      this.AR_TAB[i] = this.AR_TAB[63];
      this.DR_TAB[i] = this.DR_TAB[63];
      this.AR_TAB[i - 64 + AR_NULL_RATE] = 0;
      this.DR_TAB[i - 64 + DR_NULL_RATE] = 0;
    }

    // Detune Table
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 32; j++) {
        if (SIN_LBITS + SIN_HBITS - 21 < 0) {
          x = (DT_DEF_TAB[(i << 5) + j] * this.YM2612_Frequency) / (1 << (21 - SIN_LBITS - SIN_HBITS));
        } else {
          x = DT_DEF_TAB[(i << 5) + j] * this.YM2612_Frequency * (1 << (SIN_LBITS + SIN_HBITS - 21));
        }
        this.DT_TAB[i + 0][j] = Math.trunc(x);
        this.DT_TAB[i + 4][j] = Math.trunc(-x);
      }
    }

    // LFO Table
    j = Math.trunc((this.YM2612_Rate * this.YM2612_Inter_Step) / 0x4000);

    this.LFO_INC_TAB[0] = Math.trunc((3.98 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[1] = Math.trunc((5.56 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[2] = Math.trunc((6.02 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[3] = Math.trunc((6.37 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[4] = Math.trunc((6.88 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[5] = Math.trunc((9.63 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[6] = Math.trunc((48.1 * (1 << (LFO_HBITS + LFO_LBITS))) / j);
    this.LFO_INC_TAB[7] = Math.trunc((72.2 * (1 << (LFO_HBITS + LFO_LBITS))) / j);

    this.reset();
    return 0;
  }

  reset(): number {
    let i: number, j: number;

    this.YM2612_LFOcnt = 0;
    this.YM2612_TimerA = 0;
    this.YM2612_TimerAL = 0;
    this.YM2612_TimerAcnt = 0;
    this.YM2612_TimerB = 0;
    this.YM2612_TimerBL = 0;
    this.YM2612_TimerBcnt = 0;
    this.YM2612_DAC = 0;

    this.YM2612_Status = 0;

    this.YM2612_Inter_Cnt = 0;

    for (i = 0; i < 6; i++) {
      const CH = this.YM2612_CHANNEL[i];
      CH.Old_OUTd = 0;
      CH.OUTd = 0;
      CH.LEFT = -1; // 0xFFFFFFFF
      CH.RIGHT = -1; // 0xFFFFFFFF
      CH.ALGO = 0;
      CH.FB = 31;
      CH.FMS = 0;
      CH.AMS = 0;

      for (j = 0; j < 4; j++) {
        CH.S0_OUT[j] = 0;
        CH.FNUM[j] = 0;
        CH.FOCT[j] = 0;
        CH.KC[j] = 0;

        CH.SLOT[j].Fcnt = 0;
        CH.SLOT[j].Finc = 0;
        CH.SLOT[j].Ecnt = ENV_END; // Put it at the end of Decay phase...
        CH.SLOT[j].Einc = 0;
        CH.SLOT[j].Ecmp = 0;
        CH.SLOT[j].Ecurp = RELEASE;

        CH.SLOT[j].ChgEnM = 0;
      }
    }

    for (i = 0; i < 0x100; i++) {
      this.YM2612_REG[0][i] = -1;
      this.YM2612_REG[1][i] = -1;
    }

    for (i = 0xb6; i >= 0xb4; i--) {
      this.write0(i, 0xc0);
      this.write1(i, 0xc0);
    }

    for (i = 0xb2; i >= 0x22; i--) {
      this.write0(i, 0);
      this.write1(i, 0);
    }

    this.write0(0x2a, 0x80);

    return 0;
  }

  read(): number {
    return this.YM2612_Status;
  }

  write0(addr: number, data: number): void {
    if (addr < 0x30) {
      this.YM2612_REG[0][addr] = data;
      this.setYM(addr, data);
    } else if (this.YM2612_REG[0][addr] !== data) {
      this.YM2612_REG[0][addr] = data;

      if (addr < 0xa0) this.setSlot(addr, data);
      else this.setChannel(addr, data);
    }
  }

  write1(addr: number, data: number): void {
    if (addr >= 0x30 && this.YM2612_REG[1][addr] !== data) {
      this.YM2612_REG[1][addr] = data;

      if (addr < 0xa0) this.setSlot(addr + 0x100, data);
      else this.setChannel(addr + 0x100, data);
    }
  }

  update(buf_lr: Int32Array, offset: number, end: number): void {
    offset *= 2;
    end = end * 2 + offset;

    const CHANNEL = this.YM2612_CHANNEL;

    if (CHANNEL[0].SLOT[0].Finc === -1) this.calc_FINC_CH(CHANNEL[0]);
    if (CHANNEL[1].SLOT[0].Finc === -1) this.calc_FINC_CH(CHANNEL[1]);
    if (CHANNEL[2].SLOT[0].Finc === -1) {
      if ((this.YM2612_Mode & 0x40) !== 0) {
        this.calc_FINC_SL(CHANNEL[2].SLOT[S0], this.FINC_TAB[CHANNEL[2].FNUM[2]] >> (7 - CHANNEL[2].FOCT[2]), CHANNEL[2].KC[2]);
        this.calc_FINC_SL(CHANNEL[2].SLOT[S1], this.FINC_TAB[CHANNEL[2].FNUM[3]] >> (7 - CHANNEL[2].FOCT[3]), CHANNEL[2].KC[3]);
        this.calc_FINC_SL(CHANNEL[2].SLOT[S2], this.FINC_TAB[CHANNEL[2].FNUM[1]] >> (7 - CHANNEL[2].FOCT[1]), CHANNEL[2].KC[1]);
        this.calc_FINC_SL(CHANNEL[2].SLOT[S3], this.FINC_TAB[CHANNEL[2].FNUM[0]] >> (7 - CHANNEL[2].FOCT[0]), CHANNEL[2].KC[0]);
      } else {
        this.calc_FINC_CH(CHANNEL[2]);
      }
    }
    if (CHANNEL[3].SLOT[0].Finc === -1) this.calc_FINC_CH(CHANNEL[3]);
    if (CHANNEL[4].SLOT[0].Finc === -1) this.calc_FINC_CH(CHANNEL[4]);
    if (CHANNEL[5].SLOT[0].Finc === -1) this.calc_FINC_CH(CHANNEL[5]);

    let algo_type = 0;

    if (this.YM2612_LFOinc !== 0) {
      // Precalculate LFO wave
      for (let o = offset; o < end; o += 2) {
        const i = o >> 1;
        const j = ((this.YM2612_LFOcnt = (this.YM2612_LFOcnt + this.YM2612_LFOinc) | 0) >> LFO_LBITS) & LFO_MSK;

        this.LFO_ENV_UP[i] = this.LFO_ENV_TAB[j];
        this.LFO_FREQ_UP[i] = this.LFO_FREQ_TAB[j];
      }

      algo_type |= 8;
    }

    this.updateChannel(CHANNEL[0].ALGO + algo_type, CHANNEL[0], buf_lr, offset, end);
    this.updateChannel(CHANNEL[1].ALGO + algo_type, CHANNEL[1], buf_lr, offset, end);
    this.updateChannel(CHANNEL[2].ALGO + algo_type, CHANNEL[2], buf_lr, offset, end);
    this.updateChannel(CHANNEL[3].ALGO + algo_type, CHANNEL[3], buf_lr, offset, end);
    this.updateChannel(CHANNEL[4].ALGO + algo_type, CHANNEL[4], buf_lr, offset, end);
    if (this.YM2612_DAC === 0) this.updateChannel(CHANNEL[5].ALGO + algo_type, CHANNEL[5], buf_lr, offset, end);

    this.YM2612_Inter_Cnt = this.int_cnt;
  }

  synchronizeTimers(length: number): void {
    const i = Math.imul(this.YM2612_TimerBase, length);

    if ((this.YM2612_Mode & 1) !== 0) {
      if ((this.YM2612_TimerAcnt -= i) <= 0) {
        this.YM2612_Status |= (this.YM2612_Mode & 0x04) >> 2;
        this.YM2612_TimerAcnt += this.YM2612_TimerAL;

        if ((this.YM2612_Mode & 0x80) !== 0) this.CSM_Key_Control();
      }
    }
    if ((this.YM2612_Mode & 2) !== 0) {
      if ((this.YM2612_TimerBcnt -= i) <= 0) {
        this.YM2612_Status |= (this.YM2612_Mode & 0x08) >> 2;
        this.YM2612_TimerBcnt += this.YM2612_TimerBL;
      }
    }
  }

  /***********************************************
   *  Parameter Calculation
   ***********************************************/

  private calc_FINC_SL(SL: Slot, finc: number, kc: number): void {
    SL.Finc = Math.imul(finc + SL.DT[kc], SL.MUL);
    const ksr = kc >> SL.KSR_S;
    if (SL.KSR !== ksr) {
      SL.KSR = ksr;
      SL.EincA = this.AR_TAB[SL.AR + ksr];
      SL.EincD = this.DR_TAB[SL.DR + ksr];
      SL.EincS = this.DR_TAB[SL.SR + ksr];
      SL.EincR = this.DR_TAB[SL.RR + ksr];
      if (SL.Ecurp === ATTACK) SL.Einc = SL.EincA;
      else if (SL.Ecurp === DECAY) SL.Einc = SL.EincD;
      else if (SL.Ecnt < ENV_END) {
        if (SL.Ecurp === SUSTAIN) SL.Einc = SL.EincS;
        else if (SL.Ecurp === RELEASE) SL.Einc = SL.EincR;
      }
    }
  }

  private calc_FINC_CH(CH: Channel): void {
    const finc = this.FINC_TAB[CH.FNUM[0]] >> (7 - CH.FOCT[0]);
    const kc = CH.KC[0];
    this.calc_FINC_SL(CH.SLOT[0], finc, kc);
    this.calc_FINC_SL(CH.SLOT[1], finc, kc);
    this.calc_FINC_SL(CH.SLOT[2], finc, kc);
    this.calc_FINC_SL(CH.SLOT[3], finc, kc);
  }

  /***********************************************
   *  Settings
   ***********************************************/

  private KEY_ON(CH: Channel, nsl: number): void {
    const SL = CH.SLOT[nsl];
    if (SL.Ecurp === RELEASE) {
      SL.Fcnt = 0;
      // Fix Ecco 2 splash sound
      SL.Ecnt = (this.DECAY_TO_ATTACK[this.ENV_TAB[SL.Ecnt >> ENV_LBITS]] + ENV_ATTACK) & SL.ChgEnM;
      SL.ChgEnM = -1; // 0xFFFFFFFF
      SL.Einc = SL.EincA;
      SL.Ecmp = ENV_DECAY;
      SL.Ecurp = ATTACK;
    }
  }

  private KEY_OFF(CH: Channel, nsl: number): void {
    const SL = CH.SLOT[nsl];
    if (SL.Ecurp !== RELEASE) {
      if (SL.Ecnt < ENV_DECAY) {
        SL.Ecnt = (this.ENV_TAB[SL.Ecnt >> ENV_LBITS] << ENV_LBITS) + ENV_DECAY;
      }
      SL.Einc = SL.EincR;
      SL.Ecmp = ENV_END;
      SL.Ecurp = RELEASE;
    }
  }

  private CSM_Key_Control(): void {
    this.KEY_ON(this.YM2612_CHANNEL[2], 0);
    this.KEY_ON(this.YM2612_CHANNEL[2], 1);
    this.KEY_ON(this.YM2612_CHANNEL[2], 2);
    this.KEY_ON(this.YM2612_CHANNEL[2], 3);
  }

  private setSlot(address: number, data: number): number {
    data &= 0xff; // unsign

    let nch: number;
    if ((nch = address & 3) === 3) return 1;
    const nsl = (address >> 2) & 3;

    if ((address & 0x100) !== 0) nch += 3;

    const CH = this.YM2612_CHANNEL[nch];
    const SL = CH.SLOT[nsl];

    switch (address & 0xf0) {
      case 0x30:
        if ((SL.MUL = data & 0x0f) !== 0) SL.MUL <<= 1;
        else SL.MUL = 1;
        SL.DT = this.DT_TAB[(data >> 4) & 7];
        CH.SLOT[0].Finc = -1;
        break;
      case 0x40:
        SL.TL = data & 0x7f;
        // SOR2 do a lot of TL adjustement and this fix R.Shinobi jump sound...
        if (ENV_HBITS - 7 < 0) SL.TLL = SL.TL >> (7 - ENV_HBITS);
        else SL.TLL = SL.TL << (ENV_HBITS - 7);
        break;
      case 0x50:
        SL.KSR_S = 3 - (data >> 6);
        CH.SLOT[0].Finc = -1;
        if ((data &= 0x1f) !== 0) SL.AR = data << 1;
        else SL.AR = AR_NULL_RATE;

        SL.EincA = this.AR_TAB[SL.AR + SL.KSR];
        if (SL.Ecurp === ATTACK) SL.Einc = SL.EincA;
        break;
      case 0x60:
        if ((SL.AMSon = data & 0x80) !== 0) SL.AMS = CH.AMS;
        else SL.AMS = 31;

        if ((data &= 0x1f) !== 0) SL.DR = data << 1;
        else SL.DR = DR_NULL_RATE;

        SL.EincD = this.DR_TAB[SL.DR + SL.KSR];
        if (SL.Ecurp === DECAY) SL.Einc = SL.EincD;
        break;
      case 0x70:
        if ((data &= 0x1f) !== 0) SL.SR = data << 1;
        else SL.SR = DR_NULL_RATE;
        SL.EincS = this.DR_TAB[SL.SR + SL.KSR];
        if (SL.Ecurp === SUSTAIN && SL.Ecnt < ENV_END) SL.Einc = SL.EincS;
        break;
      case 0x80:
        SL.SLL = this.SL_TAB[data >> 4];
        SL.RR = ((data & 0xf) << 2) + 2;
        SL.EincR = this.DR_TAB[SL.RR + SL.KSR];
        if (SL.Ecurp === RELEASE && SL.Ecnt < ENV_END) SL.Einc = SL.EincR;
        break;
      case 0x90:
        if (this.EnableSSGEG) {
          if ((data & 0x08) !== 0) SL.SEG = data & 0x0f;
          else SL.SEG = 0;
        }
        break;
    }
    return 0;
  }

  private setChannel(address: number, data: number): number {
    data &= 0xff; // unsign

    let num: number;
    if ((num = address & 3) === 3) return 1;

    let CH: Channel;
    switch (address & 0xfc) {
      case 0xa0:
        if ((address & 0x100) !== 0) num += 3;
        CH = this.YM2612_CHANNEL[num];
        CH.FNUM[0] = (CH.FNUM[0] & 0x700) + data;
        CH.KC[0] = (CH.FOCT[0] << 2) | FKEY_TAB[CH.FNUM[0] >> 7];
        CH.SLOT[0].Finc = -1;
        break;
      case 0xa4:
        if ((address & 0x100) !== 0) num += 3;
        CH = this.YM2612_CHANNEL[num];
        CH.FNUM[0] = (CH.FNUM[0] & 0x0ff) + ((data & 0x07) << 8);
        CH.FOCT[0] = (data & 0x38) >> 3;
        CH.KC[0] = (CH.FOCT[0] << 2) | FKEY_TAB[CH.FNUM[0] >> 7];
        CH.SLOT[0].Finc = -1;
        break;
      case 0xa8:
        if (address < 0x100) {
          num++;
          const CH2 = this.YM2612_CHANNEL[2];
          CH2.FNUM[num] = (CH2.FNUM[num] & 0x700) + data;
          CH2.KC[num] = (CH2.FOCT[num] << 2) | FKEY_TAB[CH2.FNUM[num] >> 7];
          CH2.SLOT[0].Finc = -1;
        }
        break;
      case 0xac:
        if (address < 0x100) {
          num++;
          const CH2 = this.YM2612_CHANNEL[2];
          CH2.FNUM[num] = (CH2.FNUM[num] & 0x0ff) + ((data & 0x07) << 8);
          CH2.FOCT[num] = (data & 0x38) >> 3;
          CH2.KC[num] = (CH2.FOCT[num] << 2) | FKEY_TAB[CH2.FNUM[num] >> 7];
          CH2.SLOT[0].Finc = -1;
        }
        break;
      case 0xb0:
        if ((address & 0x100) !== 0) num += 3;
        CH = this.YM2612_CHANNEL[num];
        if (CH.ALGO !== (data & 7)) {
          CH.ALGO = data & 7;
          CH.SLOT[0].ChgEnM = 0;
          CH.SLOT[1].ChgEnM = 0;
          CH.SLOT[2].ChgEnM = 0;
          CH.SLOT[3].ChgEnM = 0;
        }
        CH.FB = 9 - ((data >> 3) & 7); // Real thing ?
        break;
      case 0xb4:
        if ((address & 0x100) !== 0) num += 3;
        CH = this.YM2612_CHANNEL[num];
        if ((data & 0x80) !== 0) CH.LEFT = -1; // 0xFFFFFFFF
        else CH.LEFT = 0;
        if ((data & 0x40) !== 0) CH.RIGHT = -1; // 0xFFFFFFFF
        else CH.RIGHT = 0;
        CH.AMS = LFO_AMS_TAB[(data >> 4) & 3];
        CH.FMS = LFO_FMS_TAB[data & 7];
        for (let s = 0; s < 4; s++) {
          if (CH.SLOT[s].AMSon !== 0) CH.SLOT[s].AMS = CH.AMS;
          else CH.SLOT[s].AMS = 31;
        }
        break;
    }
    return 0;
  }

  private setYM(address: number, data: number): number {
    let nch: number;

    switch (address) {
      case 0x22:
        if ((data & 8) !== 0) {
          // Cool Spot music 1, LFO modified severals time which
          // distorts the sound, have to check that on a real genesis...
          this.YM2612_LFOinc = this.LFO_INC_TAB[data & 7];
        } else {
          this.YM2612_LFOinc = this.YM2612_LFOcnt = 0;
        }
        break;
      case 0x24:
        this.YM2612_TimerA = (this.YM2612_TimerA & 0x003) | (data << 2);
        if (this.YM2612_TimerAL !== (1024 - this.YM2612_TimerA) << 12) {
          this.YM2612_TimerAcnt = this.YM2612_TimerAL = (1024 - this.YM2612_TimerA) << 12;
        }
        break;
      case 0x25:
        this.YM2612_TimerA = (this.YM2612_TimerA & 0x3fc) | (data & 3);
        if (this.YM2612_TimerAL !== (1024 - this.YM2612_TimerA) << 12) {
          this.YM2612_TimerAcnt = this.YM2612_TimerAL = (1024 - this.YM2612_TimerA) << 12;
        }
        break;
      case 0x26:
        this.YM2612_TimerB = data;
        if (this.YM2612_TimerBL !== (256 - this.YM2612_TimerB) << (4 + 12)) {
          this.YM2612_TimerBcnt = this.YM2612_TimerBL = (256 - this.YM2612_TimerB) << (4 + 12);
        }
        break;
      case 0x27:
        if (((data ^ this.YM2612_Mode) & 0x40) !== 0) {
          // We changed the channel 2 mode, so recalculate phase step
          // This fix the punch sound in Street of Rage 2
          this.YM2612_CHANNEL[2].SLOT[0].Finc = -1; // recalculate phase step
        }
        this.YM2612_Status &= ((~data >> 4) & (data >> 2)) | 0;
        this.YM2612_Mode = data;
        break;
      case 0x28:
        if ((nch = data & 3) === 3) return 1;
        if ((data & 4) !== 0) nch += 3;
        const CH = this.YM2612_CHANNEL[nch];
        if ((data & 0x10) !== 0) this.KEY_ON(CH, S0);
        else this.KEY_OFF(CH, S0);
        if ((data & 0x20) !== 0) this.KEY_ON(CH, S1);
        else this.KEY_OFF(CH, S1);
        if ((data & 0x40) !== 0) this.KEY_ON(CH, S2);
        else this.KEY_OFF(CH, S2);
        if ((data & 0x80) !== 0) this.KEY_ON(CH, S3);
        else this.KEY_OFF(CH, S3);
        break;
      case 0x2a:
        break;
      case 0x2b:
        this.YM2612_DAC = data & 0x80;
        break;
    }
    return 0;
  }

  /***********************************************
   *  Generation Methods
   ***********************************************/

  private Env_Attack_Next(SL: Slot): void {
    SL.Ecnt = ENV_DECAY;
    SL.Einc = SL.EincD;
    SL.Ecmp = SL.SLL;
    SL.Ecurp = DECAY;
  }

  private Env_Decay_Next(SL: Slot): void {
    SL.Ecnt = SL.SLL;
    SL.Einc = SL.EincS;
    SL.Ecmp = ENV_END;
    SL.Ecurp = SUSTAIN;
  }

  private Env_Sustain_Next(SL: Slot): void {
    if (this.EnableSSGEG) {
      if ((SL.SEG & 8) !== 0) {
        if ((SL.SEG & 1) !== 0) {
          SL.Ecnt = ENV_END;
          SL.Einc = 0;
          SL.Ecmp = ENV_END + 1;
        } else {
          SL.Ecnt = 0;
          SL.Einc = SL.EincA;
          SL.Ecmp = ENV_DECAY;
          SL.Ecurp = ATTACK;
        }
        SL.SEG ^= (SL.SEG & 2) << 1;
      } else {
        SL.Ecnt = ENV_END;
        SL.Einc = 0;
        SL.Ecmp = ENV_END + 1;
      }
    } else {
      SL.Ecnt = ENV_END;
      SL.Einc = 0;
      SL.Ecmp = ENV_END + 1;
    }
  }

  private Env_Release_Next(SL: Slot): void {
    SL.Ecnt = ENV_END;
    SL.Einc = 0;
    SL.Ecmp = ENV_END + 1;
  }

  private ENV_NEXT_EVENT(which: number, SL: Slot): void {
    switch (which) {
      case 0:
        this.Env_Attack_Next(SL);
        return;
      case 1:
        this.Env_Decay_Next(SL);
        return;
      case 2:
        this.Env_Sustain_Next(SL);
        return;
      case 3:
        this.Env_Release_Next(SL);
        return;
    }
  }

  private calcChannel(ALGO: number, CH: Channel): void {
    const TL_TAB = this.TL_TAB;
    const SIN_TAB = this.SIN_TAB;
    // DO_FEEDBACK
    this.in0 = (this.in0 + ((CH.S0_OUT[0] + CH.S0_OUT[1]) >> CH.FB)) | 0;
    CH.S0_OUT[1] = CH.S0_OUT[0];
    CH.S0_OUT[0] = TL_TAB[SIN_TAB[(this.in0 >> SIN_LBITS) & SIN_MSK] + this.en0];
    switch (ALGO) {
      case 0:
        this.in1 = (this.in1 + CH.S0_OUT[1]) | 0;
        this.in2 = (this.in2 + TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1]) | 0;
        this.in3 = (this.in3 + TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) | 0;
        CH.OUTd = TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] >> MAIN_SHIFT;
        break;
      case 1:
        this.in2 = (this.in2 + CH.S0_OUT[1] + TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1]) | 0;
        this.in3 = (this.in3 + TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) | 0;
        CH.OUTd = TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] >> MAIN_SHIFT;
        break;
      case 2:
        this.in2 = (this.in2 + TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1]) | 0;
        this.in3 = (this.in3 + CH.S0_OUT[1] + TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) | 0;
        CH.OUTd = TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] >> MAIN_SHIFT;
        break;
      case 3:
        this.in1 = (this.in1 + CH.S0_OUT[1]) | 0;
        this.in3 = (this.in3 + TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1] + TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) | 0;
        CH.OUTd = TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] >> MAIN_SHIFT;
        break;
      case 4:
        this.in1 = (this.in1 + CH.S0_OUT[1]) | 0;
        this.in3 = (this.in3 + TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) | 0;
        CH.OUTd = (TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] +
                   TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1]) >> MAIN_SHIFT;
        break;
      case 5:
        this.in1 = (this.in1 + CH.S0_OUT[1]) | 0;
        this.in2 = (this.in2 + CH.S0_OUT[1]) | 0;
        this.in3 = (this.in3 + CH.S0_OUT[1]) | 0;
        CH.OUTd = (TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] +
                   TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1] +
                   TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) >> MAIN_SHIFT;
        break;
      case 6:
        this.in1 = (this.in1 + CH.S0_OUT[1]) | 0;
        CH.OUTd = (TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] +
                   TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1] +
                   TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2]) >> MAIN_SHIFT;
        break;
      case 7:
        CH.OUTd = (TL_TAB[SIN_TAB[(this.in3 >> SIN_LBITS) & SIN_MSK] + this.en3] +
                   TL_TAB[SIN_TAB[(this.in1 >> SIN_LBITS) & SIN_MSK] + this.en1] +
                   TL_TAB[SIN_TAB[(this.in2 >> SIN_LBITS) & SIN_MSK] + this.en2] +
                   CH.S0_OUT[1]) >> MAIN_SHIFT;
        break;
    }
    // DO_LIMIT
    if (CH.OUTd > LIMIT_CH_OUT) CH.OUTd = LIMIT_CH_OUT;
    else if (CH.OUTd < -LIMIT_CH_OUT) CH.OUTd = -LIMIT_CH_OUT;
  }

  private processChannel(CH: Channel, buf_lr: Int32Array, OFFSET: number, END: number, ALGO: number): void {
    if (ALGO < 4) {
      if (CH.SLOT[S3].Ecnt === ENV_END) return;
    } else if (ALGO === 4) {
      if (CH.SLOT[S1].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    } else if (ALGO < 7) {
      if (CH.SLOT[S1].Ecnt === ENV_END && CH.SLOT[S2].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    } else {
      if (CH.SLOT[S0].Ecnt === ENV_END && CH.SLOT[S1].Ecnt === ENV_END &&
          CH.SLOT[S2].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    }

    const ENV_TAB = this.ENV_TAB;
    const sl0 = CH.SLOT[S0], sl1 = CH.SLOT[S1], sl2 = CH.SLOT[S2], sl3 = CH.SLOT[S3];

    do {
      // GET_CURRENT_PHASE
      this.in0 = sl0.Fcnt;
      this.in1 = sl1.Fcnt;
      this.in2 = sl2.Fcnt;
      this.in3 = sl3.Fcnt;
      // UPDATE_PHASE
      sl0.Fcnt = (sl0.Fcnt + sl0.Finc) | 0;
      sl1.Fcnt = (sl1.Fcnt + sl1.Finc) | 0;
      sl2.Fcnt = (sl2.Fcnt + sl2.Finc) | 0;
      sl3.Fcnt = (sl3.Fcnt + sl3.Finc) | 0;
      // GET_CURRENT_ENV
      if ((sl0.SEG & 4) !== 0) {
        if ((this.en0 = ENV_TAB[sl0.Ecnt >> ENV_LBITS] + sl0.TLL) > ENV_MSK) this.en0 = 0;
        else this.en0 ^= ENV_MSK;
      } else this.en0 = ENV_TAB[sl0.Ecnt >> ENV_LBITS] + sl0.TLL;
      if ((sl1.SEG & 4) !== 0) {
        if ((this.en1 = ENV_TAB[sl1.Ecnt >> ENV_LBITS] + sl1.TLL) > ENV_MSK) this.en1 = 0;
        else this.en1 ^= ENV_MSK;
      } else this.en1 = ENV_TAB[sl1.Ecnt >> ENV_LBITS] + sl1.TLL;
      if ((sl2.SEG & 4) !== 0) {
        if ((this.en2 = ENV_TAB[sl2.Ecnt >> ENV_LBITS] + sl2.TLL) > ENV_MSK) this.en2 = 0;
        else this.en2 ^= ENV_MSK;
      } else this.en2 = ENV_TAB[sl2.Ecnt >> ENV_LBITS] + sl2.TLL;
      if ((sl3.SEG & 4) !== 0) {
        if ((this.en3 = ENV_TAB[sl3.Ecnt >> ENV_LBITS] + sl3.TLL) > ENV_MSK) this.en3 = 0;
        else this.en3 ^= ENV_MSK;
      } else this.en3 = ENV_TAB[sl3.Ecnt >> ENV_LBITS] + sl3.TLL;
      // UPDATE_ENV
      if ((sl0.Ecnt = (sl0.Ecnt + sl0.Einc) | 0) >= sl0.Ecmp) this.ENV_NEXT_EVENT(sl0.Ecurp, sl0);
      if ((sl1.Ecnt = (sl1.Ecnt + sl1.Einc) | 0) >= sl1.Ecmp) this.ENV_NEXT_EVENT(sl1.Ecurp, sl1);
      if ((sl2.Ecnt = (sl2.Ecnt + sl2.Einc) | 0) >= sl2.Ecmp) this.ENV_NEXT_EVENT(sl2.Ecurp, sl2);
      if ((sl3.Ecnt = (sl3.Ecnt + sl3.Einc) | 0) >= sl3.Ecmp) this.ENV_NEXT_EVENT(sl3.Ecurp, sl3);

      this.calcChannel(ALGO, CH);
      // DO_OUTPUT
      buf_lr[OFFSET] += CH.OUTd & CH.LEFT;
      buf_lr[OFFSET + 1] += CH.OUTd & CH.RIGHT;
      OFFSET += 2;
    } while (OFFSET < END);
  }

  private processChannel_LFO(CH: Channel, buf_lr: Int32Array, OFFSET: number, END: number, ALGO: number): void {
    if (ALGO < 4) {
      if (CH.SLOT[S3].Ecnt === ENV_END) return;
    } else if (ALGO === 4) {
      if (CH.SLOT[S1].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    } else if (ALGO < 7) {
      if (CH.SLOT[S1].Ecnt === ENV_END && CH.SLOT[S2].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    } else {
      if (CH.SLOT[S0].Ecnt === ENV_END && CH.SLOT[S1].Ecnt === ENV_END &&
          CH.SLOT[S2].Ecnt === ENV_END && CH.SLOT[S3].Ecnt === ENV_END) return;
    }

    const ENV_TAB = this.ENV_TAB;
    const sl0 = CH.SLOT[S0], sl1 = CH.SLOT[S1], sl2 = CH.SLOT[S2], sl3 = CH.SLOT[S3];

    do {
      const i = OFFSET >> 1;

      // GET_CURRENT_PHASE
      this.in0 = sl0.Fcnt;
      this.in1 = sl1.Fcnt;
      this.in2 = sl2.Fcnt;
      this.in3 = sl3.Fcnt;
      // UPDATE_PHASE_LFO
      const freq_LFO = Math.imul(CH.FMS, this.LFO_FREQ_UP[i]) >> (LFO_HBITS - 1);
      if (freq_LFO !== 0) {
        sl0.Fcnt = (sl0.Fcnt + sl0.Finc + (Math.imul(sl0.Finc, freq_LFO) >> LFO_FMS_LBITS)) | 0;
        sl1.Fcnt = (sl1.Fcnt + sl1.Finc + (Math.imul(sl1.Finc, freq_LFO) >> LFO_FMS_LBITS)) | 0;
        sl2.Fcnt = (sl2.Fcnt + sl2.Finc + (Math.imul(sl2.Finc, freq_LFO) >> LFO_FMS_LBITS)) | 0;
        sl3.Fcnt = (sl3.Fcnt + sl3.Finc + (Math.imul(sl3.Finc, freq_LFO) >> LFO_FMS_LBITS)) | 0;
      } else {
        sl0.Fcnt = (sl0.Fcnt + sl0.Finc) | 0;
        sl1.Fcnt = (sl1.Fcnt + sl1.Finc) | 0;
        sl2.Fcnt = (sl2.Fcnt + sl2.Finc) | 0;
        sl3.Fcnt = (sl3.Fcnt + sl3.Finc) | 0;
      }
      // GET_CURRENT_ENV_LFO
      const env_LFO = this.LFO_ENV_UP[i];
      if ((sl0.SEG & 4) !== 0) {
        if ((this.en0 = ENV_TAB[sl0.Ecnt >> ENV_LBITS] + sl0.TLL) > ENV_MSK) this.en0 = 0;
        else this.en0 = (this.en0 ^ ENV_MSK) + (env_LFO >> sl0.AMS);
      } else this.en0 = ENV_TAB[sl0.Ecnt >> ENV_LBITS] + sl0.TLL + (env_LFO >> sl0.AMS);
      if ((sl1.SEG & 4) !== 0) {
        if ((this.en1 = ENV_TAB[sl1.Ecnt >> ENV_LBITS] + sl1.TLL) > ENV_MSK) this.en1 = 0;
        else this.en1 = (this.en1 ^ ENV_MSK) + (env_LFO >> sl1.AMS);
      } else this.en1 = ENV_TAB[sl1.Ecnt >> ENV_LBITS] + sl1.TLL + (env_LFO >> sl1.AMS);
      if ((sl2.SEG & 4) !== 0) {
        if ((this.en2 = ENV_TAB[sl2.Ecnt >> ENV_LBITS] + sl2.TLL) > ENV_MSK) this.en2 = 0;
        else this.en2 = (this.en2 ^ ENV_MSK) + (env_LFO >> sl2.AMS);
      } else this.en2 = ENV_TAB[sl2.Ecnt >> ENV_LBITS] + sl2.TLL + (env_LFO >> sl2.AMS);
      if ((sl3.SEG & 4) !== 0) {
        if ((this.en3 = ENV_TAB[sl3.Ecnt >> ENV_LBITS] + sl3.TLL) > ENV_MSK) this.en3 = 0;
        else this.en3 = (this.en3 ^ ENV_MSK) + (env_LFO >> sl3.AMS);
      } else this.en3 = ENV_TAB[sl3.Ecnt >> ENV_LBITS] + sl3.TLL + (env_LFO >> sl3.AMS);

      // UPDATE_ENV
      if ((sl0.Ecnt = (sl0.Ecnt + sl0.Einc) | 0) >= sl0.Ecmp) this.ENV_NEXT_EVENT(sl0.Ecurp, sl0);
      if ((sl1.Ecnt = (sl1.Ecnt + sl1.Einc) | 0) >= sl1.Ecmp) this.ENV_NEXT_EVENT(sl1.Ecurp, sl1);
      if ((sl2.Ecnt = (sl2.Ecnt + sl2.Einc) | 0) >= sl2.Ecmp) this.ENV_NEXT_EVENT(sl2.Ecurp, sl2);
      if ((sl3.Ecnt = (sl3.Ecnt + sl3.Einc) | 0) >= sl3.Ecmp) this.ENV_NEXT_EVENT(sl3.Ecurp, sl3);

      this.calcChannel(ALGO, CH);
      // DO_OUTPUT
      buf_lr[OFFSET] += CH.OUTd & CH.LEFT;
      buf_lr[OFFSET + 1] += CH.OUTd & CH.RIGHT;
      OFFSET += 2;
    } while (OFFSET < END);
  }

  private updateChannel(ALGO: number, CH: Channel, buf_lr: Int32Array, OFFSET: number, END: number): void {
    if (ALGO < 8) {
      this.processChannel(CH, buf_lr, OFFSET, END, ALGO);
    } else {
      this.processChannel_LFO(CH, buf_lr, OFFSET, END, ALGO - 8);
    }
  }
}
