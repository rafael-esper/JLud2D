/**
 * Demo 3 Scene - VGM Player Demo (Refactored)
 * Simple VGM file player using the VGM core module
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { ScriptEngine } from '../../core/ScriptEngine';
import { ConfirmDialog } from '../../utils/ConfirmDialog';

interface VGMFile {
  name: string;
  key: string;
  supported: boolean;
  chip: string;
  description?: string;
}

export class Demo3Scene extends Phaser.Scene {
  private config!: GameConfig;
  private inputManager!: InputManager;

  // State
  private selectedFile: number = 0;
  private isPlaying: boolean = false;
  private confirmingExit: boolean = false;

  // VGM files configuration
  private files: VGMFile[] = [
    { name: 'bonus.vgz', key: 'bonus', supported: false, chip: '', description: '' },
    { name: 'title.vgz', key: 'title', supported: false, chip: '', description: '' },
    { name: 'tune.vgm', key: 'tune', supported: false, chip: '', description: '' },
    { name: 'battle.vgm', key: 'battle', supported: false, chip: '', description: '' },
    { name: 'mota.vgz', key: 'mota', supported: false, chip: '', description: '' },
    { name: 'emerald.vgm', key: 'emerald', supported: false, chip: '', description: '' },
    { name: 'swim.vgm', key: 'swim1', supported: false, chip: '', description: '' },
    { name: 'swim.vgz', key: 'swim2', supported: false, chip: '', description: '' },
    { name: 'palma.vgz', key: 'palma', supported: false, chip: '', description: '' },
    { name: 'town.vgz', key: 'town', supported: false, chip: '', description: '' }
  ];

  // UI elements
  private statusText!: Phaser.GameObjects.Text;
  private fileListTexts: Phaser.GameObjects.Text[] = [];
  private fileStatusTexts: Phaser.GameObjects.Text[] = [];
  private playButton!: Phaser.GameObjects.Text;
  private stopButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Demo3Scene' });
  }

  init(data: { demoPath: string; config?: GameConfig }) {
    this.config = data.config || new GameConfig();
  }

  async create() {
    try {
      // Initialize controls
      const controlsConfig = new ControlsConfig();
      this.inputManager = new InputManager(this, controlsConfig);

      // Demo3 uses b1 for play, b2 for stop
      this.inputManager.setMobileButtons(['b1', 'b2']);

      // Create UI
      this.createUI();

      // Load VGM file information
      await this.loadVGMFileList();

      // Set up controls
      this.setupControls();

      // Set up audio context resume on user interaction
      this.input.on('pointerdown', () => ScriptEngine.resumeVGMAudio());
      this.input.keyboard?.on('keydown', () => ScriptEngine.resumeVGMAudio());

      console.log('Demo 3 Scene - VGM Player initialized');
    } finally {
      (window as any).hideLoading?.();
    }
  }


  private async loadVGMFileList() {
    this.statusText.setText('Loading VGM files...');

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      const y = 50 + (i * 20);  // Moved up from 95 to 50 to use freed space

      try {
        // Try to load VGM file using MainEngine
        const info = await ScriptEngine.loadVGM(file.key, `src/demos/demo3/${file.name}`);

        if (info) {
          file.supported = true;
          file.chip = info.chips.join(', ');
          file.description = `${info.duration} - ${info.chips.length} chip(s)`;
        } else {
          file.supported = false;
          file.chip = 'Not found';
        }
      } catch (error) {
        file.supported = false;
        file.chip = 'Error loading';
        console.warn(`Failed to load ${file.name}:`, error);
      }

      // Create file list text
      const color = file.supported ? '#00ff00' : '#ff0000';
      const prefix = i === this.selectedFile ? '► ' : '  ';
      const text = this.add.text(50, y, `${prefix}${file.name}`, {
        fontSize: '12px',
        color: color,
        fontFamily: 'monospace'
      });

      this.fileListTexts.push(text);

      // Create chip status text on the right
      const statusText = this.add.text(this.cameras.main.width - 50, y, file.supported ? file.chip : 'Not supported', {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: file.supported ? '#00ff00' : '#ff6666'
      });
      statusText.setOrigin(1, 0);

      this.fileStatusTexts.push(statusText);
    }

    this.updateFileList();
    this.updateButtonStates();
    this.statusText.setText('Ready - Select a file and press SPACE to play');
  }

  private createUI() {
    const centerX = this.cameras.main.width / 2;

    // Status (moved up to where title was)
    this.statusText = this.add.text(centerX, 20, 'Initializing...', {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Control buttons
    const buttonY = this.cameras.main.height - 80;
    this.playButton = this.add.text(centerX - 40, buttonY, 'PLAY', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#006600',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    this.stopButton = this.add.text(centerX + 40, buttonY, 'STOP', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#660000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    // Button click handlers
    this.playButton.on('pointerdown', () => this.playMusic());
    this.stopButton.on('pointerdown', () => this.stopMusic());

    // Controls info
    const controlsY = this.cameras.main.height - 40;
    this.add.text(centerX, controlsY, 'UP/DOWN: Select File | J/Z/ENTER: Play | K/X: Stop | ESC: Back to Menu', {
      fontSize: '10px',
      color: '#888888',
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5);
  }

  private updateFileList() {
    this.fileListTexts.forEach((text, index) => {
      const file = this.files[index];
      const color = file.supported ? '#00ff00' : '#ff0000';
      const selectedColor = file.supported ? '#ffff00' : '#ff8800';
      const prefix = index === this.selectedFile ? '► ' : '  ';

      text.setText(`${prefix}${file.name}`);
      text.setColor(index === this.selectedFile ? selectedColor : color);
    });

    // Update button states when selection changes
    this.updateButtonStates();
  }

  private updateButtonStates() {
    if (!this.playButton || !this.stopButton) return;

    const selectedFile = this.files[this.selectedFile];

    // Play button: enabled if file is supported and not playing
    if (selectedFile.supported && !this.isPlaying) {
      this.playButton.setStyle({ backgroundColor: '#006600' });
      this.playButton.setAlpha(1);
      this.playButton.setInteractive();
    } else {
      this.playButton.setStyle({ backgroundColor: '#333333' });
      this.playButton.setAlpha(0.5);
      if (this.isPlaying) {
        this.playButton.disableInteractive();
      }
    }

    // Stop button: enabled only when playing
    if (this.isPlaying) {
      this.stopButton.setStyle({ backgroundColor: '#660000' });
      this.stopButton.setAlpha(1);
      this.stopButton.setInteractive();
    } else {
      this.stopButton.setStyle({ backgroundColor: '#333333' });
      this.stopButton.setAlpha(0.5);
      this.stopButton.disableInteractive();
    }
  }

  private setupControls() {
    // Controls will be handled in update() method using inputManager.justPressed()
  }

  /**
   * Public API: Play music
   */
  async playMusic(): Promise<void> {
    const file = this.files[this.selectedFile];

    if (!file.supported) {
      this.statusText.setText('Cannot play this file');
      return;
    }

    try {
      this.statusText.setText(`Loading ${file.name}...`);

      const success = await ScriptEngine.playmusic(file.key);

      if (success) {
        this.isPlaying = true;
        this.statusText.setText(`Playing: ${file.name}`);
      } else {
        this.statusText.setText('Playback failed');
        this.isPlaying = false;
      }
      this.updateButtonStates();

    } catch (error) {
      console.error('Playback failed:', error);
      this.statusText.setText('Playback failed');
      this.isPlaying = false;
      this.updateButtonStates();
    }
  }

  /**
   * Public API: Stop music
   */
  stopMusic(): void {
    ScriptEngine.stopmusic();

    this.isPlaying = false;
    this.statusText.setText('Stopped');
    this.updateButtonStates();
  }

  private confirmExit(): void {
    this.confirmingExit = true;
    ConfirmDialog.confirm(this, this.inputManager, 'Exit to main menu?').then(confirmed => {
      this.confirmingExit = false;
      if (confirmed) {
        this.stopMusic();
        this.scene.start('MenuScene', { config: this.config });
      }
    });
  }

  update() {
    // Don't update until scene is fully initialized
    if (!this.inputManager || this.confirmingExit) {
      return;
    }

    // Update input manager
    this.inputManager.updateControls();

    // Handle input
    if (this.inputManager.justPressed('up')) {
      if (this.selectedFile > 0) {
        this.selectedFile--;
        this.updateFileList();
      }
    }

    if (this.inputManager.justPressed('down')) {
      if (this.selectedFile < this.files.length - 1) {
        this.selectedFile++;
        this.updateFileList();
      }
    }

    // Play music - J/Z (b1) or Enter (start)
    if (this.inputManager.justPressed('b1') || this.inputManager.justPressed('start')) {
      this.playMusic();
    }

    // Stop music - K/X (b2)
    if (this.inputManager.justPressed('b2')) {
      this.stopMusic();
    }

    // ESC - Back to main menu, gated behind a Yes/No confirmation
    if (this.inputManager.justPressed('menu')) {
      this.confirmExit();
    }

    // Update playing status
    if (this.isPlaying && !ScriptEngine.isVGMPlaying()) {
      // Music finished naturally
      this.isPlaying = false;
      this.statusText.setText('Finished');
      this.updateButtonStates();
    }
  }

  destroy() {
    this.stopMusic();
  }
}

