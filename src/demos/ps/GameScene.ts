/**
 * GameScene - Phantasy Star Main Game Scene
 * Direct port of Phantasy.java - Main game world with map and party management
 */

import { PSGame } from './PSGame';
import { City, CityHelper } from './game/City';
import { ScreenSize } from './game/GameData';
import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { MenuStack } from './menu/MenuStack';
import { PSMenu } from './PSMenu';
import { PSMenuMain } from './PSMenuMain';

export class GameScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private menuStack: MenuStack;
  private tiledMap: any = null;
  private mapNameOverride: string | null = null;
  public mapBasePath: string = 'src/demos/ps/maps';

  constructor() {
    super({ key: 'PSGameScene' });
  }

  async init(data: { config: GameConfig; mapName?: string }) {
    this.config = data.config;
    this.mapNameOverride = data.mapName || null;
  }

  preload() {
    console.log('GameScene: Preloading game resources');

    const mapBasePath = 'src/demos/ps/maps';

    // Preload commonly used maps to allow transitions between them
    console.log('GameScene: Preloading Camineet map');
    this.load.tilemapTiledJSON('Camineet-map', `${mapBasePath}/Camineet.map.json`);

    console.log('GameScene: Preloading Palma map');
    this.load.tilemapTiledJSON('Palma-map', `${mapBasePath}/Palma.map.json`);

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

    // Initialize menu stack for PSMenu system
    this.menuStack = new MenuStack(this, this.inputManager);

    // Set PSMenu instance to our menuStack (critical for PSMenu.startScene to work)
    PSMenu.instance = this.menuStack;

    // Initialize PSMenu constants (STEXT_BOTTOM_X/Y/WX/WY etc.)
    PSMenu.initPSMenu(ScreenSize.SCREEN_320_240);

    // Initialize the game scene
    PSGame.setCurrentScene(this);
    MainEngine.setCurrentScene(this, this.config);

    // Load the map for the current location (use override if provided)
    const mapName = this.mapNameOverride || 'Camineet.map.json';
    const mapBasePath = this.mapBasePath;

    console.log(`GameScene: Loading map ${mapName} from ${mapBasePath}`);

    // Clear existing map layers before loading new map
    if (this.tiledMap) {
      this.tiledMap.destroy();
      this.tiledMap = null;
    }

    // Destroy all existing tilemaps in the scene to prevent contamination
    this.children.list.forEach((child: Phaser.GameObjects.GameObject) => {
      if (child.type === 'TilemapLayer') {
        child.destroy();
      }
    });

    // Ensure screen is black before map setup
    await ScriptEngine.fadeout(25, true);

    this.tiledMap = await MainEngine.loadAndInitMap(this, mapName, mapBasePath);

    console.log("GameScene: Map loaded, screen remains black for setup");

    // Play music based on current city
    const currentCity = PSGame.getCurrentCity();
    if (currentCity) {
      const cityMusic = CityHelper.getMusic(currentCity);
      console.log(`GameScene: Playing city music for ${currentCity}: ${cityMusic}`);
      await PSGame.playMusic(cityMusic);
    }

    // Start the map (equivalent to Phantasy.java startmap())
    await this.startmap();

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

    // Setup camera to center on player after spawning (before fade-in)
    MainEngine.setupCamera();

    // Fade in screen (equivalent to Java screen.fadeIn(30, true))
    await ScriptEngine.fadein(30, true);

    MainEngine.setScriptActive(false);

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

    // Check if PSMenu is active and should pause game
    const isMenuActive = this.menuStack && this.menuStack.hasMenu();

    if (!isMenuActive) {
      // Update engine only when menu is not active - this handles player movement, entity updates, camera tracking
      MainEngine.updateEngine(this.inputManager);

      // Render entities with Y-sorting for proper depth ordering
      MainEngine.RenderEntities();
    }

    // Update and render menu system if PSMenu is active
    if (isMenuActive) {
      this.menuStack.drawMenus();
    }

    // Open the main game menu (Java: hookbutton(4, "PSMenuMain.menu"))
    if (!isMenuActive && PSMenu.isMenuHooked() && !MainEngine.isScriptActive()) {
      if (this.inputManager.justPressed('b4')) {
        this.inputManager.unpress(8); // b4 (Java: unpress(4))
        PSMenuMain.menu().catch(error => console.error('GameScene: Main menu error:', error));
      } else if (PSGame.gameData.enableCheats && this.inputManager.justPressed('M')) {
        // Java: hookkey(SCAN_M, "PSMenuMain.cheatMenu")
        PSMenuMain.cheatMenu().catch(error => console.error('GameScene: Cheat menu error:', error));
      }
    }

    // Handle ESC/Menu - Back to main menu (only when no game menu is open;
    // ESC is also the cancel button inside menus)
    if (!isMenuActive && this.inputManager.justPressed('menu')) {
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