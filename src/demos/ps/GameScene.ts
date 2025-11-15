/**
 * GameScene - Phantasy Star Main Game Scene
 * Direct port of Phantasy.java - Main game world with map and party management
 */

import { PSGame } from './PSGame';
import { PS1Music } from './game/PSLibMusic';
import { City, CityHelper } from './game/City';
import { MainEngine } from '../../core/MainEngine';
import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { Camineet } from './maps/Camineet';

export class GameScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private tiledMap: any = null;
  private mapNameOverride: string | null = null;

  constructor() {
    super({ key: 'PSGameScene' });
  }

  async init(data: { config: GameConfig; mapName?: string }) {
    this.config = data.config;
    this.mapNameOverride = data.mapName || null;
  }

  preload() {
    console.log('GameScene: Preloading game resources');

    // Preload the Camineet map
    // TODO: This should be dynamic based on PSGame.gameData.current_planet and goto coordinates
    const mapName = 'Camineet.map.json';
    const mapBasePath = 'src/demos/ps/maps';

    console.log(`GameScene: Preloading map ${mapName}`);
    this.load.tilemapTiledJSON('Camineet-map', `${mapBasePath}/${mapName}`);

    // Load map tileset images (these will be referenced in the map JSON)
    this.load.image('PS1', `${mapBasePath}/PS1.png`);
    this.load.image('default.meta', `${mapBasePath}/default.meta.png`);
  }

  async create() {
    console.log('GameScene: Starting Phantasy Star main game');

    // Initialize input manager (like Demo1)
    const controlsConfig = new ControlsConfig();
    this.inputManager = new InputManager(this, controlsConfig);
    this.inputManager.setMobileButtons([]);

    // Initialize the game scene
    PSGame.setCurrentScene(this);
    MainEngine.setCurrentScene(this, this.config);

    // Load the map for the current location (use override if provided)
    const mapName = this.mapNameOverride || 'Camineet.map.json';
    const mapBasePath = 'src/demos/ps/maps';

    console.log(`GameScene: Loading map ${mapName} from ${mapBasePath}`);
    this.tiledMap = await MainEngine.loadAndInitMap(this, mapName, mapBasePath);

    // Set Camineet script context manually
    MainEngine.setScriptContext(Camineet);
    console.log('GameScene: Camineet script context set');

    // Set screen to black IMMEDIATELY after map loads to prevent flash
    this.cameras.main.setAlpha(0);
    console.log("GameScene: Screen set to black, ready for fade-in");

    // Play music based on current city
    const currentCity = PSGame.getCurrentCity();
    if (currentCity) {
      const cityMusic = CityHelper.getMusic(currentCity);
      console.log(`GameScene: Playing city music for ${currentCity}: ${cityMusic}`);
      await PSGame.playMusic(cityMusic);
    }

    // Start the map (equivalent to Phantasy.java startmap())
    await this.startmap();

    // Setup camera and ensure it tracks the player
    MainEngine.setupCamera();

    console.log("GameScene: Initialization complete");
  }

  /**
   * Generic startmap function - direct port of Phantasy.java startmap()
   */
  private async startmap(): Promise<void> {
    console.log("PS::startmap");

    // Enable camera tracking (equivalent to Java cameratracking=1)
    MainEngine.setCameraTracking(1);

    // Allocate party at goto position
    await PSGame.getParty().allocate(PSGame.getgotox(), PSGame.getgotoy());

    // Fade in screen (equivalent to Java screen.fadeIn(30, true))
    await PSGame.fadeIn(30, true);

    // Turn menu on (equivalent to Java PSMenu.menuOn())
    PSGame.menuOn();

    // Turn transport off (equivalent to Java PSGame.transportOff())
    PSGame.transportOff();

    // Optional: Enable horizontal and vertical wrapping
    // current_map.horizontalWrapable = current_map.verticalWrapable = true;

    console.log("GameScene: Map started successfully");
  }

  /**
   * Main game loop - handles input, entity updates, and map animations
   */
  update(time: number, delta: number): void {
    // Update input controls FIRST (like Demo1)
    this.inputManager.updateControls();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Update engine - this handles player movement, entity updates, camera tracking
    MainEngine.updateEngine(this.inputManager);

    // Handle ESC/Menu - Back to main menu
    if (this.inputManager.justPressed('menu')) {
      console.log('GameScene: Menu key pressed, returning to main menu');
      PSGame.stopMusic(); // Stop the city music
      MainEngine.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }


  /**
   * Handle scene shutdown
   */
  destroy(): void {
    console.log("GameScene: Shutting down");
    super.destroy();
  }
}