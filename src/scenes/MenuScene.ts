/**
 * Menu Scene
 * Main menu with demo selection
 */

import { GameConfig } from '../config/GameConfig';
import { InputManager, ControlsConfig } from '../config/Controls';

export class MenuScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private selectedDemo: number = 0;
  private menuItems: string[] = ['Demo 1 - Island World', 'Demo 2 - Golden Axe Warrior', 'Settings', 'Exit'];
  private menuTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data: { config: GameConfig }) {
    this.config = data.config;
    this.inputManager = new InputManager(this, new ControlsConfig());
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(width / 2, 60, 'JLud2D - Phaser 4 Port', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 90, 'Select a demo to run:', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#cccccc'
    });
    subtitle.setOrigin(0.5);

    // Menu items
    this.createMenu();

    // Instructions
    const instructions = this.add.text(width / 2, height - 60, 'Use ARROW KEYS or WASD to navigate\nPRESS SPACE or ENTER to select\nESC for fullscreen toggle', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888888',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // Configuration info
    const configInfo = this.add.text(10, height - 40, `Resolution: ${this.config.xRes}x${this.config.yRes} | Window Mode: ${this.config.windowMode ? 'ON' : 'OFF'} | Sound: ${this.config.noSound ? 'OFF' : 'ON'}`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#666666'
    });

    console.log('MenuScene: Created with config:', this.config);
  }

  update() {
    this.inputManager.updateControls();

    // Handle menu navigation
    if (this.inputManager.justPressed('up')) {
      this.selectedDemo = Math.max(0, this.selectedDemo - 1);
      this.updateMenuSelection();
    } else if (this.inputManager.justPressed('down')) {
      this.selectedDemo = Math.min(this.menuItems.length - 1, this.selectedDemo + 1);
      this.updateMenuSelection();
    }

    // Handle selection
    if (this.inputManager.justPressed('b1')) {
      this.selectDemo();
    }

    // Handle fullscreen toggle
    if (this.inputManager.justPressed('b4')) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }
  }

  private createMenu() {
    const width = this.cameras.main.width;
    const startY = 140;
    const spacing = 30;

    this.menuTexts = [];

    this.menuItems.forEach((item, index) => {
      const menuText = this.add.text(width / 2, startY + (index * spacing), item, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff'
      });
      menuText.setOrigin(0.5);
      this.menuTexts.push(menuText);
    });

    this.updateMenuSelection();
  }

  private updateMenuSelection() {
    this.menuTexts.forEach((text, index) => {
      if (index === this.selectedDemo) {
        text.setStyle({ color: '#ffff00', stroke: '#000000', strokeThickness: 1 });
        text.setScale(1.1);
      } else {
        text.setStyle({ color: '#ffffff', stroke: '', strokeThickness: 0 });
        text.setScale(1.0);
      }
    });
  }

  private selectDemo() {
    switch (this.selectedDemo) {
      case 0: // Demo 1
        console.log('Starting Demo1Scene');
        this.scene.start('Demo1Scene', { demoPath: 'src/demos/demo1' });
        break;
      case 1: // Demo 2
        console.log('Starting Demo2Scene');
        this.scene.start('Demo2Scene', { demoPath: 'src/demos/demo2' });
        break;
      case 2: // Settings
        console.log('Starting SettingsScene');
        this.scene.start('SettingsScene', { config: this.config });
        break;
      case 3: // Exit
        console.log('Exiting game');
        if (confirm('Exit game?')) {
          window.close();
        }
        break;
    }
  }
}