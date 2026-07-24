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
import { PSAssets } from './PSAssets';
import { ConfirmDialog } from '../../utils/ConfirmDialog';
import { PersistenceManager } from '../../utils/PersistenceManager';

export class GameScene extends Phaser.Scene {
  private config!: GameConfig;
  private inputManager!: InputManager;
  private menuStack!: MenuStack;
  private tiledMap: any = null;
  private mapNameOverride: string | null = null;
  private enterLoaded: boolean = false;
  private enterIntro: boolean = false;
  private confirmingExit: boolean = false;
  public mapBasePath: string = 'src/demos/ps/maps';

  // Stable reference so PersistenceManager register/unregister pair up. Flushes
  // the auto-resume snapshot when the tab is backgrounded (see main.ts).
  private readonly snapshotCallback = () => PSGame.captureAutoResume();

  constructor() {
    super({ key: 'PSGameScene' });
  }

  async init(data: { config: GameConfig; mapName?: string; enterLoaded?: boolean; enterIntro?: boolean }) {
    this.config = data.config;
    this.mapNameOverride = data.mapName || null;
    this.enterLoaded = data.enterLoaded || false;
    this.enterIntro = data.enterIntro || false;
  }

  preload() {
    console.log('GameScene: Preloading game resources');

    // Warm every Phaser-loadable PS asset (all sounds, city maps and tilesets)
    // with the exact keys the lazy loaders use, so remote-hosted sessions don't
    // stall on first use. Idempotent with TitleScene's call — already-cached
    // assets are skipped, so this is a no-op on the normal Title -> Game path
    // and a full warm-up if GameScene is ever entered directly.
    PSAssets.queuePhaserAssets(this);
  }

  async create() {
    console.log('GameScene: Starting Phantasy Star main game');

    // Background-warm the VGM music cache (no-op if TitleScene already did it),
    // so the first play of each track is instant even on a remote host.
    PSAssets.warmMusic();

    // Initialize input manager (like Demo1, but with the PS key layout)
    const controlsConfig = createPSControlsConfig();
    this.inputManager = new InputManager(this, controlsConfig);
    // Overworld needs b1 (board/leave transport), b2, and b3 (open main menu);
    // start/pause are always included by setMobileButtons.
    this.inputManager.setMobileButtons(['b1', 'b2', 'b3']);

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

    // Auto-resume wiring: flush a snapshot when the tab is backgrounded, and
    // keep a fresh field checkpoint via a periodic timer so a SILENT mobile kill
    // (no lifecycle event) still has recent state to restore. Both are no-ops
    // when isSafeToAutosave() is false (battle / transition / cinematic).
    PersistenceManager.register(this.snapshotCallback);
    this.time.addEvent({ delay: 5000, loop: true, callback: () => PSGame.captureAutoResume() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      PersistenceManager.unregister(this.snapshotCallback);
    });

    // Loading a save from the title screen: the save data is already adopted;
    // now that the engine/scene context exists, enter the saved location. This
    // skips the hardcoded Camineet load below — mapswitch loads the correct map,
    // starts its music and runs startmap (party allocation / dungeon entry).
    if (this.enterLoaded) {
      await ScriptEngine.fadeout(25, true);
      await PSGame.enterLoadedLocation();
      console.log("GameScene: Loaded-game entry complete");
      PSGame.captureAutoResume(); // refresh the checkpoint at the restored spot
      return;
    }

    // New game: run the opening cinematic on the Space map (Java: Title's
    // newGameMenu calls map("space/Space.map"); Space.startmap sees no
    // departure city and plays the intro, which itself switches to the real
    // starting map when it finishes). Coordinates are irrelevant here — the
    // intro never spawns the party on this map.
    if (this.enterIntro) {
      await ScriptEngine.fadeout(1, true);
      await PSGame.mapswitch('Space.map', 9, 93, false, 'src/demos/ps/space');
      console.log("GameScene: Intro entry complete");
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

    // Safe field checkpoint: a known-good snapshot the moment a new map is
    // walkable, so a silent kill before the next timer tick still resumes here.
    PSGame.captureAutoResume();

    console.log("GameScene: Map started successfully");
  }

  /**
   * Main game loop - handles input, entity updates, and map animations
   */
  update(_time: number, delta: number): void {
    // Check if PSMenu is active and should pause game (also pause while the
    // generic exit-confirmation dialog is up)
    const isMenuActive = (this.menuStack && this.menuStack.hasMenu()) || this.confirmingExit;

    // Update input controls FIRST (like Demo1) — but only when no menu/dialog
    // owns its own polling loop. MenuStack and ConfirmDialog both run their
    // own scene.time.delayedCall loop that calls updateControls() every
    // frame; calling it again here too would advance prevStart/prevMenu a
    // step ahead of theirs, clobbering the justPressed edge (e.g. Start/Enter
    // silently stops registering inside the exit-confirm dialog). Mirrors the
    // same gate PSScene.update() already uses.
    if (!isMenuActive) {
      this.inputManager.updateControls();
    }

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

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
      // Intentional exit: a reload should show the demo menu, not resume.
      PSGame.clearAutoResume();
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