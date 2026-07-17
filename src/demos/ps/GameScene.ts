/**
 * GameScene - Phantasy Star Main Game Scene
 * Direct port of Phantasy.java - Main game world with map and party management
 */

import { PSGame } from './PSGame';
import { City, CityHelper } from './game/City';
import { Dungeon } from './game/Dungeon';
import { ScreenSize } from './game/GameData';
import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { GameConfig } from '../../config/GameConfig';
import { InputManager } from '../../config/Controls';
import { createPSControlsConfig } from './PSControls';
import { MenuStack } from './menu/MenuStack';
import { PSMenu } from './PSMenu';
import { PSMenuMain } from './PSMenuMain';
import { ConfirmDialog } from '../../utils/ConfirmDialog';

export class GameScene extends Phaser.Scene {
  private config!: GameConfig;
  private inputManager!: InputManager;
  private menuStack!: MenuStack;
  private tiledMap: any = null;
  private mapNameOverride: string | null = null;
  private enterLoaded: boolean = false;
  private confirmingExit: boolean = false;
  public mapBasePath: string = 'src/demos/ps/maps';

  constructor() {
    super({ key: 'PSGameScene' });
  }

  async init(data: { config: GameConfig; mapName?: string; enterLoaded?: boolean }) {
    this.config = data.config;
    this.mapNameOverride = data.mapName || null;
    this.enterLoaded = data.enterLoaded || false;
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

    // Initialize input manager (like Demo1, but with the PS key layout)
    const controlsConfig = createPSControlsConfig();
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

    // Expose the live instances for console debugging and automated tests
    // (page-side ES imports can get separate module copies under Vite HMR)
    (window as any).PSGame = PSGame;
    (window as any).MainEngine = MainEngine;

    // Loading a save from the title screen: the save data is already adopted;
    // now that the engine/scene context exists, enter the saved location. This
    // skips the hardcoded Camineet load below — mapswitch loads the correct map,
    // starts its music and runs startmap (party allocation / dungeon entry).
    if (this.enterLoaded) {
      await ScriptEngine.fadeout(25, true);
      await PSGame.enterLoadedLocation();
      console.log("GameScene: Loaded-game entry complete");
      return;
    }

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

    // Play music based on current city (CAMINEET is 0 — check against null)
    const currentCity = PSGame.getCurrentCity();
    if (currentCity !== null) {
      const cityMusic = CityHelper.getMusic(currentCity);
      console.log(`GameScene: Playing city music for ${City[currentCity]}: ${cityMusic}`);
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

    // Dungeon maps are driven by PSDungeon.startDungeon() (black cover, loading
    // box, first-person renderer). The generic city startmap below would fade
    // the raw dungeon tilemap in - this is the fallback path for dungeon maps
    // whose script hasn't been ported yet.
    const { PSDungeon } = await import('./PSDungeon');
    if (PSDungeon.getIsInsideDungeon()) {
      console.log("GameScene.startmap: Inside dungeon - skipping generic city startmap");
      return;
    }

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
  update(_time: number, delta: number): void {
    // Update input controls FIRST (like Demo1)
    this.inputManager.updateControls();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Check if PSMenu is active and should pause game (also pause while the
    // generic exit-confirmation dialog is up)
    const isMenuActive = (this.menuStack && this.menuStack.hasMenu()) || this.confirmingExit;

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

    // Board/leave vehicles (Java: hookbutton(1, "PSGame.verifyTransport"))
    // (isScriptActive blips off mid-mapswitch, hence the extra transition gate)
    if (!isMenuActive && PSGame.canTransport && !MainEngine.isScriptActive() && !MainEngine.isMapTransitionActive()) {
      if (this.inputManager.justPressed('b1')) {
        this.inputManager.unpress(5); // b1 (Java: unpress(1); TS numbering differs)
        PSGame.verifyTransport().catch(error => console.error('GameScene: verifyTransport error:', error));
      }
    }

    // Open the main game menu (Java: hookbutton(4, "PSMenuMain.menu"); remapped to b3 = "call menu")
    if (!isMenuActive && PSMenu.isMenuHooked() && !MainEngine.isScriptActive() && !MainEngine.isMapTransitionActive()) {
      if (this.inputManager.justPressed('b3')) {
        this.inputManager.unpress(7); // b3
        PSMenuMain.menu().catch(error => console.error('GameScene: Main menu error:', error));
      } else if (PSGame.gameData.enableCheats && this.inputManager.justPressed('M')) {
        // Java: hookkey(SCAN_M, "PSMenuMain.cheatMenu")
        PSMenuMain.cheatMenu().catch(error => console.error('GameScene: Cheat menu error:', error));
      }
    }

    // Handle ESC - back to main menu, gated behind a Yes/No confirmation
    // (only when no game menu is open; the dialog itself pauses the game).
    // Inside a first-person dungeon the dungeon loop handles ESC itself —
    // both loops call updateControls() every frame, so this justPressed edge
    // is unreliable there (same reason the loop's b3 hook is a level check).
    if (!isMenuActive && PSGame.getCurrentDungeon() === Dungeon.NONE &&
        this.inputManager.justPressed('menu')) {
      this.confirmExitToTitle().catch(error => console.error('GameScene: Exit confirm error:', error));
    }
  }

  /**
   * Show the generic "Exit to main menu?" confirmation before leaving.
   * Public so the dungeon main loop can await it on ESC.
   */
  public async confirmExitToTitle(): Promise<void> {
    this.confirmingExit = true;
    const confirmed = await ConfirmDialog.confirm(this, this.inputManager, 'Exit to main menu?');
    this.confirmingExit = false;
    if (confirmed) {
      console.log('GameScene: Exit confirmed, returning to main menu');
      PSGame.stopMusic(); // Stop the city music
      // End the dungeon main loop before tearing the engine down
      const { PSDungeon } = await import('./PSDungeon');
      PSDungeon.setIsInsideDungeon(false);
      MainEngine.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }



  /**
   * Handle scene shutdown
   */
  destroy(): void {
    console.log("GameScene: Shutting down");
  }
}