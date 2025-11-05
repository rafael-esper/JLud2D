/**
 * VGM Player Core Module
 * Extracted from Demo3Scene for reusability
 */

// VGM classes (JavaScript globals loaded from HTML)
declare class VGM {
  constructor(data: string);
  length: number;
  time: string;
  version: string;
  clocks: {
    sn76489: number;
    ym2413: number;
    ym2612: number;
    ym2151: number;
    ay8910: number;
    ym2203: number;
    ym2608: number;
    ym2610: number;
    ym3812: number;
    ym3526: number;
    y8950: number;
    ymf262: number;
    ymf278b: number;
    ymf271: number;
    ymz280b: number;
    rf5c164: number;
    pwm: number;
    pcm: number;
    rf5c68: number;
    huc6280?: number;
  };
}

declare class AY8910 {
  constructor(clock: number);
  setRegister(num: number, value: number): void;
  getTick(): number;
  fillBuffer(buffer: Float32Array, offset: number, length: number, sampleRate: number): Float32Array;
}

declare class YM2612 {
  constructor();
  init(clock: number, rate: number): void;
  config(dacBits: number): void;
  reset(): void;
  write(address: number, data: number): void;
  update(length: number): number[][];
}

declare class YM2413 {
  constructor();
  init(clock: number, rate: number): void;
  reset(): void;
  write(address: number, data: number): void;
  update(length: number): number[][];
}

declare class SN76489 {
  constructor();
  init(clock: number, rate: number): void;
  reset(): void;
  write(data: number): void;
  config(mute: number, boost: boolean, volume: number, feedback: number, nsw: number): void;
  update(length: number): number[][];
}

declare class C6280 {
  constructor();
  reset(clock: number): void;
  write(address: number, data: number): void;
  update(buffer: Float32Array, length: number): void;
}

// Gzip decompression (pako library)
declare const pako: {
  inflate: (data: Uint8Array) => Uint8Array;
};

export interface VGMPlayerOptions {
  sampleRate?: number;
  enableLooping?: boolean;
}

export interface VGMInfo {
  totalSamples: number;
  loopOffset: number;
  loopSamples: number;
  duration: string;
  chips: string[];
}

export class VGMPlayer {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentVgm: VGM | null = null;
  private currentChips: any[] = [];
  private currentVgmData: Uint8Array | null = null;
  private dataBlocks: Map<number, Uint8Array> = new Map();
  private pcmData: Uint8Array = new Uint8Array(0);
  private pcmPos: number = 0;
  private dacStreams: Map<number, {
    chipType: number;
    port: number;
    command: number;
    dataBankId: number;
    stepSize: number;
    stepBase: number;
    frequency: number;
    active: boolean;
    position: number;
    startOffset: number;
    length: number;
    lengthMode: number;
    loop: boolean;
    reverse: boolean;
  }> = new Map();

  private options: VGMPlayerOptions;
  private initialized: boolean = false;

  constructor(options: VGMPlayerOptions = {}) {
    this.options = {
      sampleRate: 44100,
      enableLooping: true,
      ...options
    };
  }

  /**
   * Initialize the VGM player with audio context and scripts
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load VGM scripts first
    const { loadVGMScripts } = await import('./index');
    await loadVGMScripts();

    // Initialize audio context
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.initialized = true;
  }

  /**
   * Resume audio context (call this on user interaction)
   */
  resumeAudio(): void {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Load and analyze a VGM file
   */
  async loadVGM(vgmData: Uint8Array): Promise<VGMInfo> {
    // Check if this is a compressed file (VGZ)
    const isCompressed = vgmData[0] === 0x1f && vgmData[1] === 0x8b;
    if (isCompressed) {
      vgmData = pako.inflate(vgmData);
    }

    // Store VGM data
    this.currentVgmData = vgmData;

    // Convert to string for VGM parser
    let vgmString = '';
    for (let i = 0; i < vgmData.length; i++) {
      vgmString += String.fromCharCode(vgmData[i]);
    }

    // Parse VGM
    this.currentVgm = new VGM(vgmString);
    this.currentChips = [];
    this.dataBlocks.clear();
    this.pcmData = new Uint8Array(0);
    this.pcmPos = 0;
    this.dacStreams.clear();

    // Initialize chips based on clocks found in VGM
    let chipCount = 0;

    if (this.currentVgm.clocks.ay8910 > 0) {
      const chip = new AY8910(this.currentVgm.clocks.ay8910);
      this.currentChips.push({ type: 'AY8910', chip, clock: this.currentVgm.clocks.ay8910 });
      chipCount++;
    }

    if (this.currentVgm.clocks.ym2612 > 0) {
      try {
        const chip = new YM2612();
        chip.init(this.currentVgm.clocks.ym2612, this.options.sampleRate!);
        chip.config(9); // 9-bit DAC precision
        chip.reset();
        chip.write(0x28, 0x00); // Turn off all channels
        this.currentChips.push({ type: 'YM2612', chip, clock: this.currentVgm.clocks.ym2612 });
        chipCount++;
      } catch (error) {
        console.warn('YM2612 initialization failed:', error);
      }
    }

    if (this.currentVgm.clocks.ym2413 > 0) {
      try {
        const chip = new YM2413();
        chip.init(this.currentVgm.clocks.ym2413, this.options.sampleRate!);
        chip.reset();
        this.currentChips.push({ type: 'YM2413', chip, clock: this.currentVgm.clocks.ym2413 });
        chipCount++;
      } catch (error) {
        console.warn('YM2413 initialization failed:', error);
      }
    }

    if (this.currentVgm.clocks.sn76489 > 0) {
      try {
        const chip = new SN76489();
        chip.init(this.currentVgm.clocks.sn76489, this.options.sampleRate!);
        chip.reset();

        // Read SN76489-specific parameters from VGM header
        const feedback = vgmData[0x28] | (vgmData[0x29] << 8);
        const shiftWidth = vgmData[0x2A] || 16;
        const actualFeedback = feedback || 0x0009;

        // Configure with proper parameters
        chip.config(0x0F, false, 1, actualFeedback, shiftWidth);
        this.currentChips.push({ type: 'SN76489', chip, clock: this.currentVgm.clocks.sn76489 });
        chipCount++;
      } catch (error) {
        console.warn('SN76489 initialization failed:', error);
      }
    }

    if (chipCount === 0) {
      throw new Error('No supported chips found in VGM file');
    }

    // Get VGM info
    const vgmInfo = this.getVGMInfo(vgmData);

    return {
      ...vgmInfo,
      duration: this.currentVgm.time || 'Unknown',
      chips: this.currentChips.map(c => c.type)
    };
  }

  /**
   * Play the loaded VGM file
   */
  async playMusic(): Promise<void> {
    if (!this.initialized || !this.audioCtx) {
      throw new Error('VGM player not initialized. Call initialize() first.');
    }

    if (!this.currentVgm || !this.currentVgmData) {
      throw new Error('No VGM file loaded');
    }

    // Stop any currently playing music
    this.stopMusic();

    // Check if we have any supported chips
    const ay8910Chip = this.currentChips.find(c => c.type === 'AY8910');
    const ym2413Chip = this.currentChips.find(c => c.type === 'YM2413');
    const ym2612Chip = this.currentChips.find(c => c.type === 'YM2612');
    const sn76489Chip = this.currentChips.find(c => c.type === 'SN76489');

    if (!ay8910Chip && !ym2413Chip && !ym2612Chip && !sn76489Chip) {
      throw new Error('No supported chip found for playback');
    }

    const sampleRate = this.options.sampleRate!;
    const vgmInfo = this.getVGMInfo(this.currentVgmData);

    // Calculate buffer size
    let bufferSamples: number;
    if (vgmInfo.loopSamples > 0 && this.options.enableLooping) {
      bufferSamples = vgmInfo.totalSamples;
    } else {
      bufferSamples = vgmInfo.totalSamples;
    }

    // Create audio buffer
    const channels = 1;
    this.currentSource = this.audioCtx.createBufferSource();
    const buffer = this.audioCtx.createBuffer(channels, bufferSamples, sampleRate);
    const bufferData = buffer.getChannelData(0);

    // Generate audio
    this.generateVGMAudio(bufferData, sampleRate, vgmInfo);

    // Set up playback
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.audioCtx.destination);

    // Enable looping if VGM has loop data
    this.currentSource.loop = (vgmInfo.loopSamples > 0 && this.options.enableLooping);

    // Set loop points if available
    if (vgmInfo.loopSamples > 0 && vgmInfo.totalSamples > vgmInfo.loopSamples) {
      const introSamples = vgmInfo.totalSamples - vgmInfo.loopSamples;
      this.currentSource.loopStart = introSamples / sampleRate;
      this.currentSource.loopEnd = vgmInfo.totalSamples / sampleRate;
    }

    // Start playback
    this.currentSource.start();
    await this.audioCtx.resume();
  }

  /**
   * Stop music playback
   */
  stopMusic(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
      this.currentSource = null;
    }
  }

  /**
   * Check if music is currently playing
   */
  isPlaying(): boolean {
    return this.currentSource !== null;
  }

  /**
   * Get information about active chips
   */
  getActiveChips(): string[] {
    return this.currentChips.map(chip => chip.type);
  }

  private getVGMInfo(vgmData: Uint8Array) {
    const totalSamples = vgmData[0x18] | (vgmData[0x19] << 8) | (vgmData[0x1A] << 16) | (vgmData[0x1B] << 24);
    const loopOffset = vgmData[0x1C] | (vgmData[0x1D] << 8) | (vgmData[0x1E] << 16) | (vgmData[0x1F] << 24);
    const loopSamples = vgmData[0x20] | (vgmData[0x21] << 8) | (vgmData[0x22] << 16) | (vgmData[0x23] << 24);

    return {
      totalSamples,
      loopOffset: loopOffset > 0 ? 0x1C + loopOffset : 0,
      loopSamples
    };
  }

  private generateVGMAudio(buffer: Float32Array, sampleRate: number, vgmInfo: any) {
    if (!this.currentVgmData) return;

    const vgmData = this.currentVgmData;
    const dataOffset = this.getDataOffset(vgmData);
    let dataIndex = dataOffset;
    let sampleIndex = 0;
    let waitSamples = 0;

    const chips = this.currentChips;

    while (dataIndex < vgmData.length && sampleIndex < buffer.length) {
      // Handle waiting
      if (waitSamples > 0) {
        const samplesToProcess = Math.min(waitSamples, buffer.length - sampleIndex);

        // Generate audio for current state
        const ay8910 = chips.find(c => c.type === 'AY8910');
        const ym2413 = chips.find(c => c.type === 'YM2413');
        const ym2612 = chips.find(c => c.type === 'YM2612');
        const sn76489 = chips.find(c => c.type === 'SN76489');

        // Generate samples from all active chips and mix them
        for (let i = 0; i < samplesToProcess; i++) {
          let mixedSample = 0;

          // Add SN76489 if present
          if (sn76489) {
            const chipOutput = sn76489.chip.update(1);
            mixedSample = (mixedSample / 4) + (chipOutput[0][0] * 0.00015);
          }

          // Add YM2612 if present (includes DAC drums)
          if (ym2612) {
            const chipOutput = ym2612.chip.update(1);
            mixedSample = (mixedSample / 4) + (chipOutput[0][0] * 0.00008);
          }

          // Add YM2413 if present
          if (ym2413) {
            const chipOutput = ym2413.chip.update(1);
            mixedSample = (mixedSample / 4) + (chipOutput[0][0] * 0.00015);
          }

          // Add AY8910 if present
          if (ay8910) {
            const tempBuffer = new Float32Array(1);
            ay8910.chip.fillBuffer(tempBuffer, 0, 1, sampleRate);
            mixedSample = (mixedSample / 4) + tempBuffer[0];
          }

          // Saturation limiting
          if (mixedSample > 1.0) mixedSample = 1.0;
          else if (mixedSample < -1.0) mixedSample = -1.0;

          buffer[sampleIndex++] = mixedSample;
        }

        waitSamples -= samplesToProcess;
        continue;
      }

      // Parse VGM command
      const command = vgmData[dataIndex];

      if (command === 0x66) {
        break; // End of data
      }

      // Process VGM commands
      const result = this.processVGMCommand(command, vgmData, dataIndex, chips);
      dataIndex = result.newIndex;
      waitSamples = result.waitSamples;
    }

    // Fill remainder with silence
    while (sampleIndex < buffer.length) {
      buffer[sampleIndex++] = 0;
    }
  }

  private processVGMCommand(command: number, vgmData: Uint8Array, dataIndex: number, chips: any[]): { newIndex: number, waitSamples: number } {
    let newIndex = dataIndex;
    let waitSamples = 0;

    if (command === 0x4f) {
      // Game Gear PSG stereo write
      const data = vgmData[dataIndex + 1];
      const sn76489 = chips.find(c => c.type === 'SN76489');
      if (sn76489) {
        sn76489.chip.write(data);
      }
      newIndex += 2;
    } else if (command === 0x50) {
      // SN76489 PSG write
      const data = vgmData[dataIndex + 1];
      const sn76489 = chips.find(c => c.type === 'SN76489');
      if (sn76489) {
        sn76489.chip.write(data);
      }
      newIndex += 2;
    } else if (command === 0x51) {
      // YM2413 register write
      const reg = vgmData[dataIndex + 1];
      const data = vgmData[dataIndex + 2];
      const ym2413 = chips.find(c => c.type === 'YM2413');
      if (ym2413) {
        ym2413.chip.write(reg, data);
      }
      newIndex += 3;
    } else if (command === 0x52) {
      // YM2612 port 0 write
      const reg = vgmData[dataIndex + 1];
      const data = vgmData[dataIndex + 2];
      const ym2612 = chips.find(c => c.type === 'YM2612');
      if (ym2612) {
        ym2612.chip.write(reg, data);
      }
      newIndex += 3;
    } else if (command === 0x53) {
      // YM2612 port 1 write
      const reg = vgmData[dataIndex + 1];
      const data = vgmData[dataIndex + 2];
      const ym2612 = chips.find(c => c.type === 'YM2612');
      if (ym2612) {
        ym2612.chip.write(reg + 0x100, data);
      }
      newIndex += 3;
    } else if (command === 0x61) {
      // Wait n samples
      waitSamples = vgmData[dataIndex + 1] | (vgmData[dataIndex + 2] << 8);
      newIndex += 3;
    } else if (command === 0x62) {
      // Wait 735 samples (60th of a second)
      waitSamples = 735;
      newIndex += 1;
    } else if (command === 0x63) {
      // Wait 882 samples (50th of a second)
      waitSamples = 882;
      newIndex += 1;
    } else if (command === 0x67) {
      // Data block command
      if (dataIndex + 6 < vgmData.length && vgmData[dataIndex + 1] === 0x66) {
        const dataType = vgmData[dataIndex + 2];
        const dataSize = vgmData[dataIndex + 3] | (vgmData[dataIndex + 4] << 8) |
                        (vgmData[dataIndex + 5] << 16) | (vgmData[dataIndex + 6] << 24);

        if (dataSize > 0 && dataSize < 1000000 && dataIndex + 7 + dataSize <= vgmData.length) {
          const blockData = vgmData.slice(dataIndex + 7, dataIndex + 7 + dataSize);
          this.dataBlocks.set(dataType, blockData);

          // For PCM data blocks (type 0x00), set as PCM data
          if (dataType === 0x00) {
            this.pcmData = blockData;
            this.pcmPos = 0;
          }

          newIndex += 7 + dataSize;
        } else {
          newIndex += 7;
        }
      } else {
        newIndex += 7;
      }
    } else if (command >= 0x70 && command <= 0x7F) {
      // Wait n+1 samples
      waitSamples = (command & 0x0F) + 1;
      newIndex += 1;
    } else if (command >= 0x80 && command <= 0x8F) {
      // YM2612 DAC write from data bank, then wait n samples
      const waitCount = command & 0x0F;
      const ym2612 = chips.find(c => c.type === 'YM2612');
      if (ym2612) {
        let dacValue = 0x80; // Default silence

        // Read from PCM data if available (Java VgmEmu pattern)
        if (this.pcmData.length > 0 && this.pcmPos < this.pcmData.length) {
          dacValue = this.pcmData[this.pcmPos] & 0xFF;
          this.pcmPos++;
        }

        ym2612.chip.write(0x2A, dacValue);
      }
      waitSamples = waitCount;
      newIndex += 1;
    } else if (command === 0xA0) {
      // AY8910 write
      const reg = vgmData[dataIndex + 1];
      const data = vgmData[dataIndex + 2];
      const ay8910 = chips.find(c => c.type === 'AY8910');
      if (ay8910) {
        ay8910.chip.setRegister(reg, data);
      }
      newIndex += 3;
    } else if (command === 0xE0) {
      // PCM seek command
      const seekOffset = vgmData[dataIndex + 1] | (vgmData[dataIndex + 2] << 8) |
                        (vgmData[dataIndex + 3] << 16) | (vgmData[dataIndex + 4] << 24);
      this.pcmPos = seekOffset;
      newIndex += 5;
    } else if (command >= 0x90 && command <= 0x95) {
      // DAC Stream Control commands - skip for now
      if (command === 0x90) newIndex += 5;
      else if (command === 0x91) newIndex += 5;
      else if (command === 0x92) newIndex += 6;
      else if (command === 0x93) newIndex += 11;
      else if (command === 0x94) newIndex += 2;
      else if (command === 0x95) newIndex += 5;
    } else {
      // Skip unknown commands
      newIndex += 1;
    }

    return { newIndex, waitSamples };
  }

  private getDataOffset(vgmData: Uint8Array): number {
    const relativeOffset = vgmData[0x34] | (vgmData[0x35] << 8) | (vgmData[0x36] << 16) | (vgmData[0x37] << 24);
    if (relativeOffset === 0) {
      return 0x40;
    }
    return 0x34 + relativeOffset;
  }
}