/**
 * Demo 3 Scene - VGM Player Demo
 * Audio player for VGM (Video Game Music) files
 * Features: File selection, play/stop controls, chip music playback
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { DemoUI } from '../../utils/DemoUI';

// Import VGM classes (converted from JS to TS interfaces)
declare class Vgm {
  sampleRate: number;
  constructor(data: Uint8Array);
  getVersion(): string;
  getSamplesCount(): number;
  getDataOffset(): number;
  getAY8910Clock(): number;
  fillBuffer(buffer: Float32Array, chip: AY8910): void;
}

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
    huc6280?: number; // HuC6280 (C6280) - might not be in all VGM readers
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
  update(length: number): number[][]; // Returns [2][length] array
}

declare class YM2413 {
  constructor();
  init(clock: number, rate: number): void;
  reset(): void;
  write(address: number, data: number): void;
  update(length: number): number[][]; // Returns [channels][samples] array
}

declare class SN76489 {
  constructor();
  init(clock: number, rate: number): void;
  reset(): void;
  write(data: number): void;
  config(mute: number, boost: boolean, volume: number, feedback: number, nsw: number): void;
  update(length: number): number[][]; // Returns [channels][samples] array
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

interface VGMFile {
  name: string;
  supported: boolean;
  chip: string;
  description?: string;
}

export class Demo3Scene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;

  // VGM Player state
  private audioCtx: AudioContext;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentVgm: VGM | null = null;
  private currentVgmOld: Vgm | null = null; // Keep old VGM for playback
  private currentChips: any[] = [];
  private currentVgmData: Uint8Array | null = null;
  private selectedFile: number = 0;
  private isPlaying: boolean = false;

  // VGM files configuration
  private files: VGMFile[] = [
    { name: 'tune.vgm', supported: false, chip: '', description: '' },
    { name: 'battle.vgm', supported: false, chip: '', description: '' },
    { name: 'mota.vgz', supported: false, chip: '', description: '' },
    { name: 'swim.vgm', supported: false, chip: '', description: '' },
    { name: 'swim.vgz', supported: false, chip: '', description: '' }
  ];

  // UI elements
  private titleText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private instructionsText: Phaser.GameObjects.Text;
  private fileListTexts: Phaser.GameObjects.Text[] = [];
  private fileStatusTexts: Phaser.GameObjects.Text[] = [];
  private playButton: Phaser.GameObjects.Text;
  private stopButton: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Demo3Scene' });
  }

  preload() {
    // Gzip decompression library (pako.js) loaded from main HTML

    // Load VGM JavaScript files
    this.load.script('vgm', 'src/demos/demo3/vgm.js');
    this.load.script('vgm_reader', 'src/demos/demo3/vgm_reader.js');

    // Load chip implementation files
    this.load.script('ay8910', 'src/demos/demo3/ay8910.js');
    this.load.script('ym2612', 'src/demos/demo3/ym2612.js');
    this.load.script('ym2413', 'src/demos/demo3/ym2413.js');
    this.load.script('sn76489', 'src/demos/demo3/sn76489.js');
    // Note: C6280 not supported by current VGM reader

    DemoUI.createLoadingText(this, 'Loading VGM Player...');
  }

  init(data: { demoPath: string; config?: GameConfig }) {
    this.config = data.config || new GameConfig();
  }

  create() {
    this.inputManager = new InputManager(this, new ControlsConfig());

    // Initialize audio context
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.createUI();
    this.setupControls();

    // Automatically scan VGM files to detect chip types
    this.scanVGMFiles();
  }

  private async scanVGMFiles() {
    this.statusText.setText('Scanning VGM files...');

    for (let i = 0; i < this.files.length; i++) {
      try {
        const result = await this.loadVGM(this.files[i].name);
      } catch (error) {
        console.error(`Failed to scan ${this.files[i].name}:`, error);
        this.files[i].supported = false;
        this.files[i].chip = 'Error';
        this.files[i].description = 'Failed to load';
      }
    }

    this.updateFileListDisplay();
    this.statusText.setText('Select a VGM file to play');
  }

  private createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    this.titleText = this.add.text(width / 2, 30, 'Demo 3 - VGM Player', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.titleText.setOrigin(0.5);

    // Status
    this.statusText = this.add.text(width / 2, 60, 'Select a VGM file to play', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#cccccc'
    });
    this.statusText.setOrigin(0.5);

    // File list background
    const listBg = this.add.graphics();
    listBg.fillStyle(0x222222, 0.8);
    listBg.fillRect(40, 80, width - 80, 100);
    listBg.lineStyle(2, 0x666666);
    listBg.strokeRect(40, 80, width - 80, 100);

    // File list - create text objects that will be updated dynamically
    this.files.forEach((file, index) => {
      const y = 95 + (index * 20);

      const fileText = this.add.text(50, y, `${file.name}`, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff'
      });

      this.fileListTexts.push(fileText);
    });

    // Create status texts for file list
    this.updateFileListDisplay();

    // Controls
    this.playButton = this.add.text(width / 2 - 40, height - 80, 'PLAY', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#006600',
      padding: { x: 15, y: 8 }
    });
    this.playButton.setOrigin(0.5);
    this.playButton.setInteractive({ useHandCursor: true });

    this.stopButton = this.add.text(width / 2 + 40, height - 80, 'STOP', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#660000',
      padding: { x: 15, y: 8 }
    });
    this.stopButton.setOrigin(0.5);
    this.stopButton.setInteractive({ useHandCursor: true });

    // Instructions
    this.instructionsText = this.add.text(width / 2, height - 40, 'UP/DOWN: Select File | SPACE: Play | S: Stop | ESC: Back to Menu', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#888888',
      align: 'center'
    });
    this.instructionsText.setOrigin(0.5);

    this.updateFileSelection();
    this.updateButtonStates();
  }

  private updateFileListDisplay() {
    const width = this.cameras.main.width;

    // Remove old status texts
    this.fileStatusTexts.forEach(text => text.destroy());
    this.fileStatusTexts = [];

    // Create new status texts
    this.files.forEach((file, index) => {
      const y = 95 + (index * 20);

      const statusText = this.add.text(width - 50, y, file.supported ? file.chip : 'Not supported', {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: file.supported ? '#00ff00' : '#ff6666'
      });
      statusText.setOrigin(1, 0);

      this.fileStatusTexts.push(statusText);
    });
  }

  private setupControls() {
    // Button click handlers
    this.playButton.on('pointerdown', () => this.playSelected());
    this.stopButton.on('pointerdown', () => this.stopPlayback());

    // Make file list items interactive
    this.fileListTexts.forEach((text, index) => {
      text.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.selectedFile = index;
        this.updateFileSelection();
        this.updateButtonStates();
      });
    });
  }

  private updateFileSelection() {
    this.fileListTexts.forEach((text, index) => {
      if (index === this.selectedFile) {
        text.setStyle({
          color: '#ffff00',
          backgroundColor: this.isPlaying && index === this.selectedFile ? '#996600' : '#333333'
        });
      } else {
        text.setStyle({
          color: '#ffffff',
          backgroundColor: 'transparent'
        });
      }
    });

    const selectedFileData = this.files[this.selectedFile];
    this.statusText.setText(`Selected: ${selectedFileData.name} - ${selectedFileData.description}`);
  }

  private updateButtonStates() {
    const selectedFile = this.files[this.selectedFile];

    if (selectedFile.supported && !this.isPlaying) {
      this.playButton.setStyle({ backgroundColor: '#006600' });
      this.playButton.setAlpha(1);
    } else {
      this.playButton.setStyle({ backgroundColor: '#333333' });
      this.playButton.setAlpha(0.5);
    }

    if (this.isPlaying) {
      this.stopButton.setStyle({ backgroundColor: '#660000' });
      this.stopButton.setAlpha(1);
    } else {
      this.stopButton.setStyle({ backgroundColor: '#333333' });
      this.stopButton.setAlpha(0.5);
    }
  }

  private async loadVGM(filename: string): Promise<boolean> {
    try {
      this.statusText.setText(`Loading ${filename}...`);

      const response = await fetch(`src/demos/demo3/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }

      let vgmData = new Uint8Array(await response.arrayBuffer());

      // Check if this is a compressed file (VGZ or compressed VGM)
      const isCompressed = vgmData[0] === 0x1f && vgmData[1] === 0x8b; // gzip header
      if (isCompressed) {
        this.statusText.setText(`Decompressing ${filename}...`);
        vgmData = pako.inflate(vgmData);
      }

      // Store the VGM data for later use
      this.currentVgmData = vgmData;

      // Convert Uint8Array to string for VGM reader
      let vgmString = '';
      for (let i = 0; i < vgmData.length; i++) {
        vgmString += String.fromCharCode(vgmData[i]);
      }

      // Use the new VGM reader for chip detection
      this.currentVgm = new VGM(vgmString);
      this.currentChips = [];


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
          chip.init(this.currentVgm.clocks.ym2612, 44100);
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
          chip.init(this.currentVgm.clocks.ym2413, 44100);
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
          chip.init(this.currentVgm.clocks.sn76489, 44100);
          chip.reset();

          // Read SN76489-specific parameters from VGM header
          const vgmData = this.currentVgmData!;
          const feedback = vgmData[0x28] | (vgmData[0x29] << 8); // Default 0x0009 if zero
          const shiftWidth = vgmData[0x2A] || 16; // Default 16 if zero
          const flags = vgmData[0x2B] || 0; // Default 0 if not present

          const actualFeedback = feedback || 0x0009; // Default for SMS/GG/MD

          // Configure with proper parameters - use inverted mute logic (0x0F = unmuted)
          chip.config(0x0F, false, 1, actualFeedback, shiftWidth);

          this.currentChips.push({ type: 'SN76489', chip, clock: this.currentVgm.clocks.sn76489 });
          chipCount++;
        } catch (error) {
          console.warn('SN76489 initialization failed:', error);
        }
      }

      // Note: HuC6280 (C6280) not supported in this VGM reader version

      if (chipCount === 0) {
        console.warn('No supported chips found in VGM file:', filename);

        // Don't throw error - allow the file to be listed but marked as unsupported
        const fileIndex = this.files.findIndex(f => f.name === filename);
        if (fileIndex >= 0) {
          this.files[fileIndex].supported = false;
          this.files[fileIndex].chip = 'No supported chips';
          this.files[fileIndex].description = 'No playable chip types found';
        }
        return false;
      }

      // Update the file info with detected chips
      const chipNames = this.currentChips.map(c => c.type).join(', ');
      const fileIndex = this.files.findIndex(f => f.name === filename);
      if (fileIndex >= 0) {
        this.files[fileIndex].chip = chipNames;
        this.files[fileIndex].description = `${chipCount} chip${chipCount > 1 ? 's' : ''}: ${chipNames}`;

        // Update files as supported if they contain AY8910, YM2413, YM2612, or SN76489
        this.files[fileIndex].supported = this.currentChips.some(c =>
          c.type === 'AY8910' || c.type === 'YM2413' || c.type === 'YM2612' || c.type === 'SN76489');
      }

      // Update the file list display
      this.updateFileListDisplay();

      return true;

    } catch (error) {
      console.error('Error loading VGM:', error);
      this.statusText.setText(`Error loading ${filename}: ${error.message}`);
      return false;
    }
  }

  private async playSelected() {
    const file = this.files[this.selectedFile];
    if (!file.supported) return;

    this.stopPlayback();

    const loaded = await this.loadVGM(file.name);
    if (!loaded || !this.currentVgmData) return;

    try {
      this.statusText.setText(`Playing ${file.name}...`);

      // Check if we have AY8910 (use old VGM player)
      const ay8910Chip = this.currentChips.find(c => c.type === 'AY8910');
      if (ay8910Chip) {
        await this.playWithOldVGM(ay8910Chip);
        return;
      }

      // Check if we have YM2413, YM2612, or SN76489 (use new VGM player)
      const ym2413Chip = this.currentChips.find(c => c.type === 'YM2413');
      const ym2612Chip = this.currentChips.find(c => c.type === 'YM2612');
      const sn76489Chip = this.currentChips.find(c => c.type === 'SN76489');
      if (ym2413Chip || ym2612Chip || sn76489Chip) {
        await this.playWithNewVGM();
        return;
      }

      throw new Error('No supported chip found for playback');

    } catch (error) {
      console.error('Error playing VGM:', error);
      this.statusText.setText(`Error playing ${file.name}: ${error.message}`);
    }
  }

  private async playWithOldVGM(ay8910Chip: any) {
    // Create old VGM instance for AY8910 playback
    this.currentVgmOld = new Vgm(this.currentVgmData!);

    const frameCount = this.currentVgmOld.getSamplesCount();
    const myArrayBuffer = this.audioCtx.createBuffer(1, frameCount, this.currentVgmOld.sampleRate);
    const nowBuffering = myArrayBuffer.getChannelData(0);

    this.currentVgmOld.fillBuffer(nowBuffering, ay8910Chip.chip);

    this.currentSource = this.audioCtx.createBufferSource();
    this.currentSource.buffer = myArrayBuffer;
    this.currentSource.connect(this.audioCtx.destination);
    this.currentSource.loop = true;

    this.currentSource.onended = () => {
      this.stopPlayback();
    };

    this.currentSource.start();
    await this.audioCtx.resume();

    this.isPlaying = true;
    this.updateFileSelection();
    this.updateButtonStates();
  }

  private async playWithNewVGM() {
    // Use real-time VGM playback for YM2413 and other chips
    const sampleRate = 44100;
    const vgmInfo = this.getVGMInfo(this.currentVgmData!);

    // Calculate buffer size based on VGM data
    const totalSamples = vgmInfo.totalSamples;
    const loopSamples = vgmInfo.loopSamples;

    // If there's a loop, use intro + one loop iteration
    // Otherwise use the entire song
    let bufferSamples: number;
    if (loopSamples > 0) {
      bufferSamples = totalSamples; // This includes intro + loop
    } else {
      bufferSamples = totalSamples;
    }

    const channels = 1;
    this.currentSource = this.audioCtx.createBufferSource();
    const buffer = this.audioCtx.createBuffer(channels, bufferSamples, sampleRate);
    const bufferData = buffer.getChannelData(0);

    // Parse VGM data and generate audio
    this.generateVGMAudio(bufferData, sampleRate, vgmInfo);

    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.audioCtx.destination);

    // Enable looping only if the VGM has loop data
    this.currentSource.loop = (loopSamples > 0);

    // Set loop points if available
    if (loopSamples > 0 && totalSamples > loopSamples) {
      const introSamples = totalSamples - loopSamples;
      this.currentSource.loopStart = introSamples / sampleRate;
      this.currentSource.loopEnd = totalSamples / sampleRate;
    }

    this.currentSource.onended = () => {
      this.stopPlayback();
    };

    this.currentSource.start();
    await this.audioCtx.resume();

    this.isPlaying = true;
    this.updateFileSelection();
    this.updateButtonStates();
  }

  private getVGMInfo(vgmData: Uint8Array) {
    // Read VGM header information
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

    // Get active chips
    const chips = this.currentChips;

    while (dataIndex < vgmData.length && sampleIndex < buffer.length) {
      // Handle waiting
      if (waitSamples > 0) {
        const samplesToProcess = Math.min(waitSamples, buffer.length - sampleIndex);

        // Generate audio for current state - mix multiple chips together
        const ym2413 = chips.find(c => c.type === 'YM2413');
        const ym2612 = chips.find(c => c.type === 'YM2612');
        const sn76489 = chips.find(c => c.type === 'SN76489');

        // Generate samples from all active chips and mix them
        for (let i = 0; i < samplesToProcess; i++) {
          let mixedSample = 0;
          let activeChips = 0;

          // VGM standard volume ratios - based on real Genesis hardware
          const BASE_SCALE = 0.0002; // Base scaling factor

          // Add YM2413 if present (×1.0 ratio like YM2612)
          if (ym2413) {
            const chipOutput = ym2413.chip.update(1); // Generate 1 sample
            mixedSample += chipOutput[0][0] * BASE_SCALE * 1.0; // YM2413 ×1.0
            activeChips++;
          }

          // Add YM2612 if present (×1.0 reference ratio) - TEMPORARILY DISABLED FOR TESTING
          if (ym2612) {
            const chipOutput = ym2612.chip.update(1); // Generate 1 sample
            mixedSample += chipOutput[0][0] * BASE_SCALE * 0.25; // YM2612 ×1.0 (reference)
            activeChips++;
          }

          // Add SN76489 if present (BOOSTED FOR TESTING - normally ×0.25)
          if (sn76489) {
            const chipOutput = sn76489.chip.update(1); // Generate 1 sample
            mixedSample += chipOutput[0][0] * BASE_SCALE * 1.0; // BOOSTED: SN76489 ×2.0 for testing
            activeChips++;
          }

          // Light compression for multi-chip mixes to prevent peaks
          if (activeChips > 1) {
            mixedSample *= 0.9; // Gentle limiting
          }

          buffer[sampleIndex++] = Math.max(-1, Math.min(1, mixedSample)); // Clamp
        }

        waitSamples -= samplesToProcess;
        continue;
      }

      // Parse VGM command
      const command = vgmData[dataIndex];

      if (command === 0x66) {
        // End of data
        break;
      } else if (command === 0x4f) {
        // Game Gear PSG stereo write (0x4f dd)
        const data = vgmData[dataIndex + 1];

        const sn76489 = chips.find(c => c.type === 'SN76489');
        if (sn76489) {
          // Write stereo data to SN76489 - this is for Game Gear stereo control
          sn76489.chip.write(data);
        }

        dataIndex += 2;
      } else if (command === 0x50) {
        // SN76489 PSG write value
        const data = vgmData[dataIndex + 1];

        const sn76489 = chips.find(c => c.type === 'SN76489');
        if (sn76489) {
          sn76489.chip.write(data);
        }

        dataIndex += 2;
      } else if (command === 0x51) {
        // YM2413 register write
        const reg = vgmData[dataIndex + 1];
        const data = vgmData[dataIndex + 2];

        const ym2413 = chips.find(c => c.type === 'YM2413');
        if (ym2413) {
          ym2413.chip.write(reg, data);
        }

        dataIndex += 3;
      } else if (command === 0x52) {
        // YM2612 port 0 write
        const reg = vgmData[dataIndex + 1];
        const data = vgmData[dataIndex + 2];

        const ym2612 = chips.find(c => c.type === 'YM2612');
        if (ym2612) {
          // Port 0 uses register addresses as-is
          ym2612.chip.write(reg, data);
        }

        dataIndex += 3;
      } else if (command === 0x53) {
        // YM2612 port 1 write
        const reg = vgmData[dataIndex + 1];
        const data = vgmData[dataIndex + 2];

        const ym2612 = chips.find(c => c.type === 'YM2612');
        if (ym2612) {
          // Port 1 uses register addresses + 0x100
          ym2612.chip.write(reg + 0x100, data);
        }

        dataIndex += 3;
      } else if (command === 0x61) {
        // Wait n samples
        waitSamples = vgmData[dataIndex + 1] | (vgmData[dataIndex + 2] << 8);
        dataIndex += 3;
      } else if (command === 0x62) {
        // Wait 735 samples (60th of a second)
        waitSamples = 735;
        dataIndex += 1;
      } else if (command === 0x63) {
        // Wait 882 samples (50th of a second)
        waitSamples = 882;
        dataIndex += 1;
      } else if (command === 0x67) {
        // Data block command - need to properly parse and skip the entire block

        // Show next few bytes for debugging
        const nextBytes = Array.from(vgmData.slice(dataIndex, dataIndex + 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');

        if (dataIndex + 6 < vgmData.length && vgmData[dataIndex + 1] === 0x66) {
          // Format: 0x67 0x66 tt ss ss ss ss [data...]
          // Skip type (1 byte) and read size (4 bytes, little-endian)
          const dataSize = vgmData[dataIndex + 3] | (vgmData[dataIndex + 4] << 8) |
                          (vgmData[dataIndex + 5] << 16) | (vgmData[dataIndex + 6] << 24);


          if (dataSize < 1000000 && dataIndex + 7 + dataSize <= vgmData.length) {
            // Skip: command(1) + marker(1) + type(1) + size(4) + data(dataSize)
            dataIndex += 7 + dataSize;
          } else {
            console.warn(`Invalid data block size or extends beyond file, minimal skip`);
            dataIndex += 7;
          }
        } else {
          console.warn(`Invalid data block format, minimal skip`);
          dataIndex += 7;
        }
      } else if (command >= 0x70 && command <= 0x7F) {
        // Wait n+1 samples (n = command & 0x0F)
        waitSamples = (command & 0x0F) + 1;
        dataIndex += 1;
      } else if (command >= 0x80 && command <= 0x8F) {
        // YM2612 port 0 address 2A write from data bank, then wait n samples
        const waitCount = command & 0x0F;

        // Note: This should write to YM2612 register 0x2A from a data bank
        // For now, we'll just implement the wait part
        waitSamples = waitCount;
        dataIndex += 1;
      } else if (command >= 0x90 && command <= 0x95) {
        // DAC Stream Control Write - skip 5 bytes
        dataIndex += 5;
      } else if (command >= 0xA0 && command <= 0xBF) {
        // Various chip writes (AY8910, RF5C68, etc.) - 3 bytes each
        dataIndex += 3;
      } else if (command >= 0xC0 && command <= 0xDF) {
        // Various chip writes - 3 bytes each
        dataIndex += 3;
      } else if (command >= 0xE0 && command <= 0xFF) {
        // Data stream writes - 5 bytes each
        dataIndex += 5;
      } else {
        // Unknown command, skip
        const nextByte1 = dataIndex + 1 < vgmData.length ? vgmData[dataIndex + 1].toString(16) : 'EOF';
        const nextByte2 = dataIndex + 2 < vgmData.length ? vgmData[dataIndex + 2].toString(16) : 'EOF';
        console.warn(`Unknown VGM command: 0x${command.toString(16)} at offset 0x${dataIndex.toString(16)}, next bytes: 0x${nextByte1} 0x${nextByte2}`);
        dataIndex += 1;
      }
    }

    // Fill remainder with silence
    while (sampleIndex < buffer.length) {
      buffer[sampleIndex++] = 0;
    }
  }

  private getDataOffset(vgmData: Uint8Array): number {
    // VGM data offset is at 0x34 as a relative offset from 0x34
    const relativeOffset = vgmData[0x34] | (vgmData[0x35] << 8) | (vgmData[0x36] << 16) | (vgmData[0x37] << 24);

    // If offset is 0, data starts at 0x40 (default for older VGM versions)
    if (relativeOffset === 0) {
      return 0x40;
    }

    // Otherwise, data starts at 0x34 + relative offset
    return 0x34 + relativeOffset;
  }

  private stopPlayback() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }

    // Don't suspend the audio context - just stop the source
    this.isPlaying = false;

    this.updateFileSelection();
    this.updateButtonStates();

    const selectedFile = this.files[this.selectedFile];
    this.statusText.setText(`Selected: ${selectedFile.name} - ${selectedFile.description}`);
  }

  update() {
    this.inputManager.updateControls();

    // Handle navigation
    if (this.inputManager.justPressed('up')) {
      this.selectedFile = Math.max(0, this.selectedFile - 1);
      this.updateFileSelection();
      this.updateButtonStates();
    } else if (this.inputManager.justPressed('down')) {
      this.selectedFile = Math.min(this.files.length - 1, this.selectedFile + 1);
      this.updateFileSelection();
      this.updateButtonStates();
    }

    // Handle playback controls
    if (this.inputManager.justPressed('b1')) { // Space key
      this.playSelected();
    }

    // Handle stop (S key) - using justPressed for single key press
    if (this.input.keyboard && this.input.keyboard.checkDown(this.input.keyboard.addKey('S'), 1)) {
      this.stopPlayback();
    }

    // Back to menu
    if (this.inputManager.justPressed('b4')) { // ESC key
      this.stopPlayback();
      this.scene.start('MenuScene', { config: this.config });
    }
  }

  destroy() {
    this.stopPlayback();
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    super.destroy();
  }
}