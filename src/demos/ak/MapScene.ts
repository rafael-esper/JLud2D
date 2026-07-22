/**
 * MapScene - Alex Kidd Map Screen and Level Management
 * Shows the world map with animated location marker before each level
 * Includes all level switching and progression logic
 * Port of Java showMapScreen() and level management methods
 */

import { GameConfig } from '../../config/GameConfig';
import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { Sound } from '../../domain/Sound';
import { Condition } from './AkMovement';
import { AkCore } from './AkCore';
import { AkBaseScene } from './AkBaseScene';

export class MapScene extends AkBaseScene {
  private mapImage!: Phaser.GameObjects.Image;
  private redCircle!: Phaser.GameObjects.Graphics;

  // Animation state
  private bullet: number = 0;

  // Level switching state
  private static LevelId: number = 1;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static mapx: number = 0;
  private static mapy: number = 0;
  private static currentMusic: string = '';
  private static currentLevel: string = '';
  private static changemap: boolean = false;

  // Current display values
  private displayMapx: number = 277;
  private displayMapy: number = 190;
  private displayLevel: string = "Mount Nibana";

  // Complete level configuration data (initialized lazily to avoid circular dependencies)
  private static levelData: any[] | null = null;

  constructor() {
    super('MapScene');
  }

  async init(data: { config: GameConfig }) {
    this.config = data.config;

    // Get current level info for display
    const currentLevelInfo = MapScene.getCurrentLevelInfo();
    this.displayMapx = currentLevelInfo.mapX;
    this.displayMapy = currentLevelInfo.mapY;
    this.displayLevel = currentLevelInfo.name;
  }

  preload() {
    // Load the world map image
    this.load.image('worldmap', 'src/demos/ak/res/image/world.png');

    // Load map music (same as loaded in AkScene)
    this.load.audio('snd_mapa', 'src/demos/ak/res/sound/Mapa.mp3');
  }

  create() {
    // Setup common AK controls
    this.setupAkControls();

    // Set black background
    this.cameras.main.setBackgroundColor('#000000');

    // Display the world map (scaled to fit screen if needed)
    this.mapImage = this.add.image(160, 120, 'worldmap');

    if (!this.mapImage) {
      console.error('MapScene: Failed to create worldmap image');
      return;
    }

    this.mapImage.setOrigin(0.5, 0.5);

    // Scale map to fit screen if it's too large
    if (this.mapImage.width && this.mapImage.height) {
      const scaleX = 320 / this.mapImage.width;
      const scaleY = 240 / this.mapImage.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      this.mapImage.setScale(scale);
    } else {
      console.error('MapScene: worldmap image has invalid dimensions');
    }

    // Create level text at bottom
    this.add.text(10, 225, `Level ${MapScene.LevelId}: ${this.displayLevel}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff'
    });

    // Create graphics object for the red circle
    this.redCircle = this.add.graphics();
    this.redCircle.setDepth(10); // Make sure it renders on top

    // Stop current VGM music and play map music
    ScriptEngine.stopmusic();
    Sound.stopMusic();
    Sound.playSound('snd_mapa');

    // Wait a bit before allowing input (matching original wait(20))
    this.time.delayedCall(333, () => {
      // Start the animation loop
      this.startAnimation();
    });

    console.log(`MapScene: Showing map for Level ${MapScene.LevelId}: ${this.displayLevel} at (${this.displayMapx}, ${this.displayMapy})`);
    console.log(`MapScene Debug - Current level info:`, MapScene.getCurrentLevelInfo());
  }

  private startAnimation(): void {
    // Create a timer that updates the bullet animation
    this.time.addEvent({
      delay: 50, // Update every 50ms for smooth animation
      callback: this.updateAnimation,
      callbackScope: this,
      loop: true
    });
  }

  private updateAnimation(): void {
    // Update bullet counter (0-12 cycle)
    this.bullet++;
    if (this.bullet > 12) {
      this.bullet = 0;
    }

    // Clear previous circle
    this.redCircle.clear();

    // Draw pulsing red circle at map location
    this.redCircle.fillStyle(0xff0000, 1); // Red color

    let radius: number;
    if (this.bullet < 6) {
      radius = this.bullet;
    } else {
      radius = 12 - this.bullet;
    }

    // Adjust position based on map scale and offset
    if (!this.mapImage || !this.mapImage.width || !this.mapImage.height) {
      console.error('MapScene: Cannot update animation - mapImage not properly initialized');
      return;
    }

    const mapScale = this.mapImage.scaleX;
    const adjustedX = (this.mapImage.x - (this.mapImage.width * mapScale) / 2) + (this.displayMapx * mapScale);
    const adjustedY = (this.mapImage.y - (this.mapImage.height * mapScale) / 2) + (this.displayMapy * mapScale);

    if (radius > 0) {
      this.redCircle.fillCircle(adjustedX, adjustedY, radius);
    }
  }

  update(): void {
    // Handle common input (includes menu/ESC handling)
    this.handleCommonInput();

    if (this.confirmingExit) return;

    // Check for button press to continue (b1 = punch button, start = enter)
    if (this.inputManager.justPressed('b1') || this.inputManager.justPressed('start')) {
      this.proceedToLevel();
    }
  }

  private proceedToLevel(): void {
    // Clean up and proceed to the actual level
    Sound.stopMusic();

    // Get current level info and apply it
    const levelInfo = MapScene.getCurrentLevelInfo();
    MapScene.Mapswitch(
      levelInfo.mapFile,
      levelInfo.playerX,
      levelInfo.playerY,
      levelInfo.mapX,
      levelInfo.mapY,
      levelInfo.music,
      levelInfo.condition,
      levelInfo.name
    );

    // Transition to AkScene with config, demoPath, and level info
    this.scene.start('AkScene', {
      config: this.config,
      demoPath: MainEngine.getSystemPath ? MainEngine.getSystemPath() : 'src/demos/ak',
      levelInfo: levelInfo
    });
  }

  // ========== LEVEL MANAGEMENT METHODS (from original Java) ==========

  /**
   * Switch to a new map with specified parameters (Java Mapswitch method)
   */
  public static Mapswitch(
    mapname: string,
    x: number,
    y: number,
    ix: number,
    iy: number,
    music: string,
    initialCondition: Condition,
    levelName: string
  ): void {
    this.gotox = x;
    this.gotoy = y; // player coordinates
    this.mapx = ix;
    this.mapy = iy; // map coordinates
    this.currentMusic = music;
    this.currentLevel = levelName;
    AkCore.setCondition(initialCondition);
    AkCore.setInvincible(0);

    if (this.LevelId > 0) {
      this.changemap = true;
    }

    console.log(`MapScene: Switching to ${levelName} (${mapname}) at (${x}, ${y})`);
  }

  /**
   * Handle level progression (Java DoLevel method)
   */
  public static DoLevel(): void {
    // Increment level ID for progression
    this.LevelId++;

    console.log(`MapScene: Advancing to level ${this.LevelId}`);

    // Check if we've exceeded available levels
    this.initializeLevelData();
    if (this.LevelId > this.levelData!.length) {
      console.log(`MapScene: Reached end of levels (${this.LevelId}), cycling back to level 1`);
      this.LevelId = 1;
    }

    // Show map screen for the new level
    this.showMapScreen();
  }

  public static showMapScreen(): void {
    // Clear entities from previous level but preserve game state (gold, energy, etc.)
    MainEngine.clearEntities();

    const currentScene = MainEngine.getCurrentScene();
    if (currentScene) {
      currentScene.scene.start('MapScene', {
        config: (currentScene as any).config
      });
    }
  }

  private static initializeLevelData(): void {
    if (this.levelData === null) {
      this.levelData = [
        {
          id: 1,
          mapFile: "level01.map.json",
          playerX: 2,
          playerY: 4,
          mapX: 277,
          mapY: 190,
          music: 'snd_mapa',
          condition: Condition.WALK,
          name: "Mount Nibana"
        },
        {
          id: 2,
          mapFile: "level02.map.json",
          playerX: 2,
          playerY: 5,
          mapX: 290,
          mapY: 182,
          music: 'snd_mapa',
          condition: Condition.WALK,
          name: "Tatadero's Pond"
        },
        {
          id: 3,
          mapFile: "level03.map.json",
          playerX: 2,
          playerY: 10,
          mapX: 279,
          mapY: 177,
          music: 'snd_mapa',
          condition: Condition.WALK,
          name: "Plains of Tatadero"
        },
        {
          id: 4,
          mapFile: "level04.map.json",
          playerX: 8,
          playerY: 15,
          mapX: 282,
          mapY: 160,
          music: 'snd_mapa',
          condition: Condition.WALK,
          name: "Cave of Moonnight"
        },
        {
          id: 5,
          mapFile: "level05.map.json",
          playerX: 8,
          playerY: 2,
          mapX: 290,
          mapY: 152,
          music: 'snd_water',
          condition: Condition.SWIM,
          name: "Lake Bimurai"
        }
      ];
    }
  }

  /**
   * Get current level information
   */
  public static getCurrentLevelInfo() {
    this.initializeLevelData();

    const levelInfo = this.levelData!.find(level => level.id === this.LevelId);
    if (!levelInfo) {
      console.error(`MapScene: Could not find level data for LevelId ${this.LevelId}, using level 1`);
      // Return level 1 data but don't modify LevelId here
      return this.levelData![0];
    }
    return levelInfo;
  }

  public static getLevelId(): number {
    return this.LevelId;
  }

  public static setLevelId(id: number): void {
    this.LevelId = Math.max(1, id);
  }

  public static getTargetPosition(): { x: number, y: number } {
    return { x: this.gotox, y: this.gotoy };
  }

  public static getTargetMapPosition(): { x: number, y: number } {
    return { x: this.mapx, y: this.mapy };
  }

  public static isMapChangePending(): boolean {
    return this.changemap;
  }

  public static clearMapChangeFlag(): void {
    this.changemap = false;
  }

  public static getCurrentMusic(): string {
    return this.currentMusic;
  }

  public static getCurrentLevelName(): string {
    return this.currentLevel;
  }

  public static reset(): void {
    this.LevelId = 1;
    this.gotox = 0;
    this.gotoy = 0;
    this.mapx = 0;
    this.mapy = 0;
    this.currentMusic = '';
    this.currentLevel = '';
    this.changemap = false;
  }

  public static getAllLevels() {
    this.initializeLevelData();
    return [...this.levelData!];
  }

  destroy() {
    // Stop music when scene is destroyed
    ScriptEngine.stopmusic();
    super.destroy();
  }
}