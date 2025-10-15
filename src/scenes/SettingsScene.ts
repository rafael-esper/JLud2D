/**
 * Settings Scene
 * Settings menu with all GUI options from Java GUI.java
 * Replicates the JMenuBar functionality
 */

import { GameConfig } from '../config/GameConfig';
import { InputManager, ControlsConfig } from '../config/Controls';

export class SettingsScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private selectedOption: number = 0;
  private menuItems: Array<{
    label: string,
    type: 'toggle' | 'action' | 'range',
    key: keyof GameConfig,
    getValue?: () => string,
    action?: () => void,
    min?: number,
    max?: number,
    step?: number
  }> = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private frameDelayValue: number = 20; // Java default: 20ms = 50fps

  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data: { config: GameConfig }) {
    this.config = data.config;
    this.inputManager = new InputManager(this, new ControlsConfig());
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, 30, 'Settings', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    title.setOrigin(0.5);

    // Create menu items (matching Java GUI.java options)
    this.createMenuItems();
    this.createMenu();

    // Instructions - more compact
    const instructions = this.add.text(width / 2, height - 35, 'ARROWS: Navigate | SPACE: Toggle | ESC: Back', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#888888',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // Hotkeys info - more compact
    const hotkeys = this.add.text(width / 2, height - 20, 'F5=Sound | F6=Fullscreen | F7=Double | F8=FPS | F9/F10=FPS±', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#666666',
      align: 'center'
    });
    hotkeys.setOrigin(0.5);

    // Setup hotkeys
    this.setupHotkeys();

    console.log('SettingsScene: Created with Java GUI.java options');
  }

  update() {
    this.inputManager.updateControls();

    // Handle menu navigation
    if (this.inputManager.justPressed('up')) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      this.updateMenuSelection();
    } else if (this.inputManager.justPressed('down')) {
      this.selectedOption = Math.min(this.menuItems.length - 1, this.selectedOption + 1);
      this.updateMenuSelection();
    }

    // Handle left/right for range values
    if (this.inputManager.justPressed('left') || this.inputManager.justPressed('right')) {
      this.handleRangeAdjustment(this.inputManager.justPressed('right'));
    }

    // Handle selection
    if (this.inputManager.justPressed('b1')) {
      this.selectOption();
    }

    // Back to menu
    if (this.inputManager.justPressed('b4')) {
      this.saveAndExit();
    }
  }

  private createMenuItems() {
    this.menuItems = [
      {
        label: 'Enable Sound',
        type: 'toggle',
        key: 'noSound',
        getValue: () => this.config.noSound ? 'OFF' : 'ON'
      },
      {
        label: 'Full Screen Mode',
        type: 'toggle',
        key: 'windowMode',
        getValue: () => this.config.windowMode ? 'OFF' : 'ON',
        action: () => this.toggleFullscreen()
      },
      {
        label: 'Double Screen Mode',
        type: 'toggle',
        key: 'doubleWindowMode',
        getValue: () => this.config.doubleWindowMode ? 'ON' : 'OFF',
        action: () => this.toggleDoubleScreen()
      },
      {
        label: 'Show FPS',
        type: 'toggle',
        key: 'showFPS',
        getValue: () => this.config.showFPS ? 'ON' : 'OFF'
      },
      {
        label: 'Frame Delay',
        type: 'range',
        key: 'debug', // Using debug as placeholder
        getValue: () => `${this.frameDelayValue}ms (${Math.round(1000/this.frameDelayValue)}fps)`,
        min: 5,
        max: 100,
        step: 5
      },
      {
        label: 'Master Volume',
        type: 'range',
        key: 'masterVolume',
        getValue: () => `${Math.round(this.config.masterVolume * 100)}%`,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        label: 'Music Volume',
        type: 'range',
        key: 'musicVolume',
        getValue: () => `${Math.round(this.config.musicVolume * 100)}%`,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        label: 'SFX Volume',
        type: 'range',
        key: 'sfxVolume',
        getValue: () => `${Math.round(this.config.sfxVolume * 100)}%`,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        label: 'Pixel Art Mode',
        type: 'toggle',
        key: 'pixelArt',
        getValue: () => this.config.pixelArt ? 'ON' : 'OFF'
      },
      {
        label: 'Resolution',
        type: 'action',
        key: 'xRes',
        getValue: () => `${this.config.xRes}x${this.config.yRes}`,
        action: () => this.cycleResolution()
      },
      {
        label: 'Reset to Defaults',
        type: 'action',
        key: 'debug',
        getValue: () => '',
        action: () => this.resetToDefaults()
      }
    ];
  }

  private createMenu() {
    const width = this.cameras.main.width;
    const startY = 60;
    const spacing = 20;

    this.menuTexts = [];

    this.menuItems.forEach((item, index) => {
      const value = item.getValue ? item.getValue() : '';

      // Split label and value for better formatting
      const labelText = this.add.text(20, startY + (index * spacing), item.label, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff'
      });

      const valueText = this.add.text(200, startY + (index * spacing), value, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#cccccc'
      });

      // Store both texts for easy updating
      const menuText = this.add.container(0, 0, [labelText, valueText]);
      (menuText as any).labelText = labelText;
      (menuText as any).valueText = valueText;

      this.menuTexts.push(menuText as any);
    });

    this.updateMenuSelection();
  }

  private updateMenuSelection() {
    this.menuTexts.forEach((container, index) => {
      const item = this.menuItems[index];
      const value = item.getValue ? item.getValue() : '';

      const labelText = (container as any).labelText;
      const valueText = (container as any).valueText;

      // Update value text
      valueText.setText(value);

      if (index === this.selectedOption) {
        labelText.setStyle({ color: '#ffff00', stroke: '#000000', strokeThickness: 1 });
        valueText.setStyle({ color: '#ffff00', stroke: '#000000', strokeThickness: 1 });
        labelText.setScale(1.05);
        valueText.setScale(1.05);
      } else {
        labelText.setStyle({ color: '#ffffff', stroke: '', strokeThickness: 0 });
        valueText.setStyle({ color: '#cccccc', stroke: '', strokeThickness: 0 });
        labelText.setScale(1.0);
        valueText.setScale(1.0);
      }
    });
  }

  private selectOption() {
    const item = this.menuItems[this.selectedOption];

    switch (item.type) {
      case 'toggle':
        this.toggleOption(item);
        break;
      case 'action':
        if (item.action) {
          item.action();
        }
        break;
      case 'range':
        // Range values are adjusted with left/right, space just shows current value
        break;
    }

    this.updateMenuSelection();
  }

  private toggleOption(item: any) {
    const currentValue = this.config[item.key as keyof GameConfig];

    switch (item.key) {
      case 'noSound':
        this.config.noSound = !this.config.noSound;
        // Apply sound setting
        if (this.config.noSound) {
          this.sound.pauseAll();
        } else {
          this.sound.resumeAll();
        }
        break;
      case 'windowMode':
        this.toggleFullscreen();
        break;
      case 'doubleWindowMode':
        this.toggleDoubleScreen();
        break;
      case 'showFPS':
        this.config.showFPS = !this.config.showFPS;
        break;
      case 'pixelArt':
        this.config.pixelArt = !this.config.pixelArt;
        break;
    }
  }

  private handleRangeAdjustment(increase: boolean) {
    const item = this.menuItems[this.selectedOption];
    if (item.type !== 'range') return;

    const step = item.step || 1;
    const min = item.min || 0;
    const max = item.max || 1;

    switch (item.key) {
      case 'debug': // Frame delay
        if (increase) {
          this.frameDelayValue = Math.min(max, this.frameDelayValue + step);
        } else {
          this.frameDelayValue = Math.max(min, this.frameDelayValue - step);
        }
        break;
      case 'masterVolume':
        if (increase) {
          this.config.masterVolume = Math.min(max, this.config.masterVolume + step);
        } else {
          this.config.masterVolume = Math.max(min, this.config.masterVolume - step);
        }
        this.sound.setVolume(this.config.masterVolume);
        break;
      case 'musicVolume':
        if (increase) {
          this.config.musicVolume = Math.min(max, this.config.musicVolume + step);
        } else {
          this.config.musicVolume = Math.max(min, this.config.musicVolume - step);
        }
        break;
      case 'sfxVolume':
        if (increase) {
          this.config.sfxVolume = Math.min(max, this.config.sfxVolume + step);
        } else {
          this.config.sfxVolume = Math.max(min, this.config.sfxVolume - step);
        }
        break;
    }

    this.updateMenuSelection();
  }

  private toggleFullscreen() {
    this.config.windowMode = !this.config.windowMode;

    if (this.config.windowMode) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      }
    } else {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
      }
    }
  }

  private toggleDoubleScreen() {
    this.config.doubleWindowMode = !this.config.doubleWindowMode;

    // Force window mode when enabling double screen (like Java version)
    if (this.config.doubleWindowMode) {
      this.config.windowMode = true;
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      }
    }

    // Update responsive scaling immediately
    const game = (window as any).game;
    if (game && game.updateScaling) {
      game.updateScaling();
    }

    // Show update message
    this.showUpdateMessage('Double Screen Mode Updated');
  }

  private cycleResolution() {
    const resolutions = [
      { x: 320, y: 240 },   // Default
      { x: 640, y: 480 },   // 2x
      { x: 800, y: 600 },   // SVGA
      { x: 1024, y: 768 },  // XGA
      { x: 1280, y: 960 }   // SXGA
    ];

    const currentIndex = resolutions.findIndex(r => r.x === this.config.xRes && r.y === this.config.yRes);
    const nextIndex = (currentIndex + 1) % resolutions.length;

    this.config.xRes = resolutions[nextIndex].x;
    this.config.yRes = resolutions[nextIndex].y;

    this.showRestartMessage();
  }

  private resetToDefaults() {
    const defaultConfig = new GameConfig();
    Object.assign(this.config, defaultConfig);
    this.frameDelayValue = 20;

    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Settings Reset to Defaults!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      this.updateMenuSelection();
    });
  }

  private showRestartMessage() {
    const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Restart Required for Changes', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  private showUpdateMessage(text: string) {
    const message = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      message.destroy();
    });
  }

  private setupHotkeys() {
    // Prevent browser from handling F keys
    document.addEventListener('keydown', (event) => {
      if (event.key >= 'F5' && event.key <= 'F10') {
        event.preventDefault();
        event.stopPropagation();

        switch (event.key) {
          case 'F5': // Toggle Sound
            this.config.noSound = !this.config.noSound;
            if (this.config.noSound) {
              this.sound.pauseAll();
            } else {
              this.sound.resumeAll();
            }
            this.updateMenuSelection();
            break;
          case 'F6': // Toggle Fullscreen
            this.toggleFullscreen();
            this.updateMenuSelection();
            break;
          case 'F7': // Toggle Double Screen
            this.toggleDoubleScreen();
            this.updateMenuSelection();
            break;
          case 'F8': // Toggle FPS
            this.config.showFPS = !this.config.showFPS;
            this.updateMenuSelection();
            break;
          case 'F9': // Decrease FPS (increase delay)
            this.frameDelayValue = Math.min(100, this.frameDelayValue + 5);
            this.updateMenuSelection();
            break;
          case 'F10': // Increase FPS (decrease delay)
            this.frameDelayValue = Math.max(5, this.frameDelayValue - 5);
            this.updateMenuSelection();
            break;
        }
      }
    });
  }

  private saveAndExit() {
    // Save configuration
    this.config.saveConfig();

    // Go back to menu
    this.scene.start('MenuScene', { config: this.config });
  }
}