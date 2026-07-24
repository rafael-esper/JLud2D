/**
 * Boot Scene
 * Initial scene that loads assets and initializes the game
 */

import { GameConfig } from '../config/GameConfig';
import { SaveManager } from '../demos/ps/game/SaveManager';

export class BootScene extends Phaser.Scene {
  private config!: GameConfig;

  constructor() {
    super({ key: 'BootScene' });
  }

  init(data: { config: GameConfig }) {
    this.config = data.config;
  }

  preload() {
    // Create a simple loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '14px monospace',
        color: '#ffffff'
      }
    });
    assetText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('fileprogress', (file: any) => {
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    // Load basic assets
    this.loadBasicAssets();
  }

  create() {
    // A Restart from the emulator UI reloads the page for a clean slate and
    // records which demo to relaunch — honor that instead of showing the menu
    const restart = sessionStorage.getItem('jlud2d-restart');
    if (restart) {
      sessionStorage.removeItem('jlud2d-restart');
      try {
        const target = JSON.parse(restart);
        if (target && target.scene) {
          console.log(`BootScene: Restarting demo at ${target.scene}`);
          this.scene.start(target.scene, { demoPath: target.demoPath, config: this.config });
          return;
        }
      } catch (error) {
        console.warn('BootScene: invalid restart target, opening menu', error);
      }
    }

    // Auto-resume: if a Phantasy Star session was snapshotted before a mobile
    // process kill / reload, skip the demo menu and drop straight back into it.
    // (Generic-friendly: future demos add their own check alongside this one.)
    if (SaveManager.hasAutoResume()) {
      console.log('BootScene: auto-resume snapshot found, entering PS');
      this.scene.start('PSTitleScene', { config: this.config, autoResume: true });
      return;
    }

    console.log('BootScene: Assets loaded, starting MenuScene');

    // Transition to menu scene
    this.scene.start('MenuScene', { config: this.config });
  }

  private loadBasicAssets() {
    // Create simple colored rectangles as placeholder graphics
    this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

  }
}