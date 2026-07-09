/**
 * PSGame - Phantasy Star Game Management
 * Port of PSGame.java - Core game state and resource management
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { Entity, EntityDirection } from '../../domain/Entity';
import { PS1Music } from './game/PSLibMusic';
import { PS1Image } from './game/PSLibImage';
import { PS1Sound } from './game/PSLibSound';
import { PSMenu } from './PSMenu';
import { Party } from './game/Party';
import { Planet, City, CityHelper, PlanetHelper } from './game/City';
import { ScreenSize, GameType, Flags, GameData } from './game/GameData';
import { Dungeon, DungeonHelper } from './game/Dungeon';
import { CHR } from '../../domain/CHR';
import { PS1CHR, PS1CHRHelper } from './game/PSLibCHR';
import { Item } from './game/Item';
import { OriginalItem, PSLibItem } from './game/PSLibItem';
import { PSLibEnemy, GenericEnemy } from './game/PSLibEnemy';
import { VImage } from './menu/MenuImageBox';
import { I18nManager } from './game/I18nManager';
import { PS_MUSIC_MANIFEST } from './music-manifest';

// Battle system imports
import { Enemy } from './battle/Enemy';
import { BattleOutcome } from './battle/PSBattle';
import { PSSceneType } from './PSMenu';
import { Trapped } from './game/GameData';
import { MenuCHR } from './menu/MenuCHR';
import { MenuState } from './menu/MenuType';


export class PSGame {
  public static gameData: GameData = new GameData();
  private static currentScene: Phaser.Scene | null = null;
  private static party: Party | null = null;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static currentMusic: PS1Music | null = null; // Track currently playing music
  private static i18nManager: I18nManager = I18nManager.getInstance();
  public static currentDungeon: any = null; // Current dungeon instance
  private static readonly PS_DEMO_BASE_PATH = 'src/demos/ps'; // Base path for PS demo

  // Sound library cache (equivalent to Java soundLIB HashMap)
  private static soundLIB: Map<PS1Sound, string> = new Map();

  // CHR library cache (equivalent to Java chrLIB HashMap)
  private static chrLIB: Map<PS1CHR, CHR> = new Map();


  /**
   * Initialize game screen with specified size
   */
  public static initGameScreen(screenSize: ScreenSize): void {
    this.gameData.setScreenSize(screenSize);
    console.log(`PSGame: Initialized with screen size ${screenSize === ScreenSize.SCREEN_320_240 ? '320x240' : '640x480'}`);
  }


  /**
   * Initialize internationalization system
   */
  public static async initializeI18n(locale?: string): Promise<void> {
    try {
      const targetLocale = locale || this.gameData.locale;
      await this.i18nManager.initialize(targetLocale);
      console.log(`PSGame: I18n initialized for locale: ${targetLocale}`);
    } catch (error) {
      console.error('PSGame: Failed to initialize I18n:', error);
      throw error;
    }
  }

  public static async playMusic(music: PS1Music): Promise<void> {
    if (this.currentMusic === music) {
      return;
    }

    const musicKey = this.getMusicKeyFromPath(music as string);

    ScriptEngine.setMusicVolume(this.gameData.musicVolume);
    ScriptEngine.playmusic(musicKey);
    this.currentMusic = music;
  }

  /**
   * Get music key from music path for cached playback
   */
  private static getMusicKeyFromPath(musicPath: string): string {
    // Find the matching asset key in the manifest based on the path
    for (const asset of PS_MUSIC_MANIFEST.assets) {
      if (asset.path === musicPath) {
        return asset.key;
      }
    }

    // Fallback: extract filename without extension as key
    const filename = musicPath.split('/').pop() || '';
    return filename.replace(/\.(vgz|vgm)$/, '').toLowerCase();
  }

  /**
   * Stop currently playing music
   */
  public static stopMusic(): void {
    ScriptEngine.stopmusic();
    this.currentMusic = null;
  }

  /**
   * Get localized string - direct port from Java getString() method
   */
  public static getString(key: string): string;
  public static getString(key: string, ...params: string[]): string;
  public static getString(key: string, ...params: string[]): string {
    try {
      let result = this.i18nManager.getString(key);

      // Handle parameter substitution (Java style with placeholder/value pairs)
      if (params.length > 0) {
        for (let i = 0; i < params.length; i += 2) {
          if (i + 1 < params.length) {
            const placeholder = params[i];
            const value = params[i + 1];
            result = result.replace(new RegExp(placeholder.replace(/[<>]/g, '\\$&'), 'g'), value);
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`String ${key} not found.`);
      return key;
    }
  }

  /**
   * Pad a value to a fixed width - direct port of Java PSGame.format()
   */
  public static format(value: number | string, len: number, alignLeft: boolean = false): string {
    let str = value.toString();
    while (str.length < len) {
      str = alignLeft ? str + ' ' : ' ' + str;
    }
    return str;
  }

  /**
   * Get Yes/No choice array for prompts (localized)
   */
  public static getYesNo(): string[] {
    return [this.getString("Menu_Choice_Yes"), this.getString("Menu_Choice_No")];
  }

  /**
   * Set current locale and reload language files
   */
  public static async setLocale(locale: string): Promise<void> {
    try {
      await this.i18nManager.setLocale(locale);
      this.gameData.locale = locale;
      console.log(`PSGame: Locale changed to ${locale}`);
    } catch (error) {
      console.error(`PSGame: Failed to set locale to ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Get current locale
   */
  public static getCurrentLocale(): string {
    return this.i18nManager.getCurrentLocale();
  }

  /**
   * Get available languages with their display names
   */
  public static async getAvailableLanguages(): Promise<{code: string, name: string}[]> {
    // Define supported languages with native display names
    return [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'pt', name: 'Português' },
      { code: 'se', name: 'Svenska' },
      { code: 'tt', name: 'Português (TT)' }
    ];
  }

  /**
   * Check if player is on transport
   */
  public static isOnTransport(): boolean {
    // For now, assume player is not on transport
    // TODO: Implement proper transport detection
    return false;
  }

  /**
   * Regroup party members - enhanced version that positions player based on facing direction
   * Instead of always going south, positions player in opposite direction of where they're facing
   */
  public static regroup(xAdjust: number, yAdjust: number): void {
    console.log(`PSGame: Regrouping party with adjustment (${xAdjust}, ${yAdjust})`);

    // Early exit if no player
    const player = MainEngine.getPlayer();
    if (!player) {
      console.log('PSGame.regroup: No player entity found');
      return;
    }

    const currentX = player.getx();
    const currentY = player.gety();
    const playerFace = player.getFace();

    // Calculate adjustment based on opposite direction of player facing
    let finalXAdjust = xAdjust;
    let finalYAdjust = yAdjust;

    // If this is the default scene exit call regroup(0, 1), adjust based on player direction
    if (xAdjust === 0 && yAdjust === 1) {
      switch (playerFace) {
        case EntityDirection.NORTH:
          finalXAdjust = 0;
          finalYAdjust = 1; // Exit to the south (opposite of north)
          break;
        case EntityDirection.SOUTH:
          finalXAdjust = 0;
          finalYAdjust = -1; // Exit to the north (opposite of south)
          break;
        case EntityDirection.WEST:
          finalXAdjust = 1; // Exit to the east (opposite of west)
          finalYAdjust = 0;
          break;
        case EntityDirection.EAST:
          finalXAdjust = -1; // Exit to the west (opposite of east)
          finalYAdjust = 0;
          break;
        default:
          // Keep original values for any other case
          break;
      }
    }

    // Apply the calculated adjustments
    const tileX = Math.floor((currentX + 16 * finalXAdjust) / 16);
    const tileY = Math.floor((currentY + 16 * finalYAdjust) / 16);

    // Set player to exact tile position
    player.setxy(tileX * 16, tileY * 16);

    // Always face south after regrouping (matching Java behavior)
    player.setFace(EntityDirection.SOUTH);

    console.log(`PSGame.regroup: Player moved from (${currentX}, ${currentY}) to tile (${tileX}, ${tileY}) = (${tileX * 16}, ${tileY * 16}) pixels, now facing south, adjustments: (${finalXAdjust}, ${finalYAdjust})`);
  }

  /**
   * Get image resource path
   */
  public static getImage(imageKey: PS1Image | string): string;
  public static getImage(sceneType: any): string; // PSSceneType overload
  public static getImage(imageKeyOrScene: PS1Image | string | any): string {
    if (typeof imageKeyOrScene === 'string') {
      return imageKeyOrScene;
    }

    // Handle PSSceneType - import here to avoid circular dependency
    if (typeof imageKeyOrScene === 'number') {
      // Map PSSceneType enum values to background images
      switch (imageKeyOrScene) {
        case 1: // PSSceneType.BLUE_HOUSE
          return PS1Image.BLUE_HOUSE;
        case 2: // PSSceneType.YELLOW_HOUSE
          return PS1Image.YELLOW_HOUSE;
        case 3: // PSSceneType.HOSPITAL
          return PS1Image.HOSPITAL;
        case 4: // PSSceneType.CHURCH
          return PS1Image.CHURCH;
        case 5: // PSSceneType.SHOP_CENTRAL
          return PS1Image.SHOP_WEAPON; // Generic shop
        case 6: // PSSceneType.SHOP_FOOD
          return PS1Image.SHOP_FOOD;
        case 7: // PSSceneType.SHOP_HAND
          return PS1Image.SHOP_HAND;
        case 8: // PSSceneType.SHOP_WEAPON
          return PS1Image.SHOP_WEAPON;
        case 16: // PSSceneType.SPACESHIP
          return PS1Image.SPACESHIP;
        case 29: // PSSceneType.FIELDS
          return PS1Image.FIELDS;
        default:
          return PS1Image.BLUE_HOUSE; // Default fallback
      }
    }

    return imageKeyOrScene as string;
  }

  /**
   * Set current scene reference
   */
  public static setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }

  /**
   * Get current scene reference
   */
  public static getCurrentScene(): Phaser.Scene | null {
    return this.currentScene;
  }

  /**
   * Initialize PS game with specified type - direct port from Java
   */
  public static async initPSGame(gameType: GameType): Promise<void> {
    console.log(`PSGame: Initializing game type ${GameType[gameType]}`);

    // Reset all game state for a fresh start
    this.gameData = new GameData();

    // Initialize party with specified game type
    this.party = new Party(gameType);

    console.log(`PSGame: Party initialized with ${this.party.partySize()} members`);
  }

  /** localStorage key used for browser saves (replaces Java's .SAV file chooser) */
  private static readonly SAVE_KEY: string = 'PS_SAVE';

  /**
   * Load game - browser adaptation of Java loadGame()
   * Full restore (party/map) is not implemented yet.
   */
  public static async loadGame(): Promise<boolean> {
    console.log("PSGame: Load game not implemented in demo");
    await PSMenu.Stext(this.getString("Menu_Load_Failed"));
    return false;
  }

  /**
   * Save game - browser adaptation of Java saveGame() (localStorage instead of a .SAV file)
   */
  public static async saveGame(): Promise<void> {
    const player = MainEngine.getPlayer();
    if (player) {
      this.gameData.gotox = Math.floor(player.getx() / 16);
      this.gameData.gotoy = Math.floor(player.gety() / 16);

      if (this.getCurrentDungeon() !== Dungeon.NONE) {
        this.gameData.dungeonFace = player.getFace();
      }
    }

    GameData.save(this.gameData, PSGame.SAVE_KEY);
    await PSMenu.Stext(this.getString("Menu_Save_Success"));
  }

  /**
   * Change sound volume - direct port from Java changeSoundVolume()
   */
  public static changeSoundVolume(volume: number): void {
    this.gameData.soundVolume = volume;
  }

  /**
   * Change music volume - direct port from Java changeMusicVolume()
   */
  public static changeMusicVolume(volume: number): void {
    this.gameData.musicVolume = volume;
    ScriptEngine.setMusicVolume(volume);
  }

  /**
   * Check if any party member is alive - direct port from Java checkAlive()
   */
  public static checkAlive(): boolean {
    return this.getParty().getMembers().some(member => member.getHp() > 0);
  }

  private static enemyLib: Map<GenericEnemy, Enemy> | null = null;

  /**
   * Get the enemy library - direct port from Java getEnemyLib()
   */
  public static getEnemyLib(): Map<GenericEnemy, Enemy> {
    if (!this.enemyLib) {
      this.enemyLib = PSLibEnemy.initializeOriginalEnemies();
    }
    return this.enemyLib;
  }

  /**
   * Load an image into a Phaser texture and return it as a VImage
   * (equivalent of Java's PSGame.getImage returning a VImage)
   */
  public static async getVImage(imageKey: PS1Image | string): Promise<VImage> {
    const path = this.getImage(imageKey);
    const scene = this.currentScene;
    const key = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || path;

    if (!scene) {
      return { width: 0, height: 0, key };
    }

    if (!scene.textures.exists(key)) {
      await new Promise<void>((resolve) => {
        scene.load.image(key, path);
        scene.load.once('complete', () => resolve());
        scene.load.start();
      });
    }

    const source = scene.textures.get(key).getSourceImage();
    return { width: source.width, height: source.height, key };
  }

  /**
   * Language menu - direct port from Java with I18n integration
   */
  public static async languageMenu(menuStack: any): Promise<boolean> {
    console.log("PSGame: Opening language selection menu");

    // Define supported languages with display names
    const languages = await this.getAvailableLanguages();

    // Get current locale to mark it
    const currentLocale = this.getCurrentLocale();

    // Create language options with current language marked
    const languageOptions = languages.map(lang => {
      const prefix = lang.code === currentLocale ? '* ' : '  ';
      return prefix + lang.name;
    });

    // Create language selection menu
    const languageMenu = menuStack.createPromptBox(90, 140, languageOptions, true);
    menuStack.push(languageMenu);

    // Import PSCancellable for proper typing
    const { PSCancellable } = await import('./menu/MenuStack');

    const selectedIndex = await menuStack.waitOpt(PSCancellable.TRUE);
    menuStack.pop();

    // Handle cancellation (waitOpt returns -1 when cancelled)
    if (selectedIndex === -1) {
      console.log("PSGame: Language selection cancelled");
      return false;
    }

    const selectedLanguage = languages[selectedIndex];
    console.log(`PSGame: Selected language: ${selectedLanguage.name} (${selectedLanguage.code})`);

    // Only change language if it's different from current
    if (selectedLanguage.code !== currentLocale) {
      try {
        await this.setLocale(selectedLanguage.code);
        console.log(`PSGame: Language changed to ${selectedLanguage.name}`);
        return true; // Indicate that language was changed
      } catch (error) {
        console.error(`PSGame: Failed to change language to ${selectedLanguage.code}:`, error);
        return false;
      }
    } else {
      console.log("PSGame: Language unchanged (same as current)");
      return false; // No change needed
    }
  }

  /**
   * Get current party - direct port from Java
   */
  public static getParty(): Party {
    if (!this.party) {
      // Auto-initialize with default game type for development/testing
      console.warn("PSGame: Party not initialized, auto-initializing with PS_ORIGINAL");
      this.initPSGameSync(GameType.PS_ORIGINAL);
    }
    return this.party!;
  }

  /**
   * Synchronous version of initPSGame for auto-initialization
   */
  private static initPSGameSync(gameType: GameType): void {
    this.gameData.setGameType(gameType);
    this.party = new Party(gameType);
    console.log(`PSGame: Auto-initialized party with ${GameType[gameType]}`);
  }

  /**
   * Get current game type
   */
  public static getGameType(): GameType {
    // For now return PS_ORIGINAL, could be stored in gameData
    return GameType.PS_ORIGINAL;
  }

  /**
   * Get goto X coordinate - direct port from Java
   */
  public static getgotox(): number {
    return this.gotox;
  }

  /**
   * Get goto Y coordinate - direct port from Java
   */
  public static getgotoy(): number {
    return this.gotoy;
  }

  /**
   * Warp the player to a tile position within the current dungeon - direct port of
   * Java PSGame.warp(). Delegates to the active dungeon instance's renderer.
   */
  public static async warp(i: number, j: number, rendermap: boolean): Promise<void> {
    const dungeon = this.getCurrentDungeonInstance();
    if (dungeon && typeof dungeon.warpTo === 'function') {
      await dungeon.warpTo(i, j, rendermap);
    } else {
      console.warn('PSGame.warp: no active dungeon instance to warp within');
    }
  }

  /**
   * Find an inventory item across all party members - direct port of Java findItemWithParty().
   * Optionally removes the first matching item found.
   */
  public static findItemWithParty(inventoryItem: OriginalItem, remove: boolean): boolean {
    const item = this.getItem(inventoryItem);
    for (const pm of this.getParty().getMembers()) {
      const items = pm.getItems();
      const idx = items.indexOf(item);
      if (idx !== -1) {
        if (remove) {
          items.splice(idx, 1);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Map switch with string path - base implementation
   */
  public static async mapswitch(mapname: string, x: number, y: number, fade: boolean = true, basePath?: string, music?: PS1Music): Promise<void> {
    console.log(`PSGame.mapswitch: Loading map ${mapname} at (${x}, ${y})`);

    // Block all input during map transition
    MainEngine.setScriptActive(true);
    MainEngine.setEntitiesPaused(true);
    this.setgotoxy(x, y);
    this.transportOff();

    if (fade && !ScriptEngine.screenFadedOut) {
      await ScriptEngine.fadeout(30, true);
    }

    // Screen is now black — hide the dungeon RT before fadein so it never overlays the new map
    if (this.currentDungeon) {
      this.currentDungeon.hideRenderTexture();
    }

    // Start the new map's music BEFORE the map script runs. In Java, map()
    // only flags the switch and playMusic() runs right after, so the music is
    // already playing when the new map's startmap script (which may animate
    // and even switch maps again, e.g. the spaceport walk) executes.
    if (music !== undefined) {
      await this.playMusic(music);
    }

    await MainEngine.startEngine(mapname, basePath);
  }

  /**
   * Map switch to Planet - explicit method for Planet enum
   */
  public static async mapswitchToPlanet(planet: Planet, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToPlanet: ${Planet[planet]} at (${x}, ${y})`);

    // Set player as leaving dungeon (entering planet)
    const { PSDungeon } = await import('./PSDungeon');
    PSDungeon.setIsInsideDungeon(false);

    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_planet = planet;
    this.gameData.current_city = null;

    // Import Planet helpers
    const { PlanetHelper } = await import('./game/City');

    // Get planet map path and call base mapswitch (music starts before the
    // map script runs, so the spaceport walk animation plays over it)
    const mapPath = PlanetHelper.getMapPath(planet);
    await this.mapswitch(mapPath, x, y, true, undefined, PlanetHelper.getMusic(planet));
  }

  /**
   * Map switch to City - explicit method for City enum
   */
  public static async mapswitchToCity(city: City, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToCity: ${City[city]} at (${x}, ${y})`);

    // Set player as leaving dungeon (entering city)
    const { PSDungeon } = await import('./PSDungeon');
    PSDungeon.setIsInsideDungeon(false);

    // Import City helpers
    const { CityHelper } = await import('./game/City');

    if (this.gameData.current_dungeon !== null && this.gameData.current_dungeon !== Dungeon.NONE) {
      // PSMenu.setMapOff(); // TODO: Implement when PSMenu is ready
    }

    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_city = city;
    this.gameData.current_planet = CityHelper.getPlanet(city);

    // Add to visited cities
    this.gameData.visitedCities.add(city);

    // Call base mapswitch with city path
    await this.mapswitch(CityHelper.getPath(city), x, y, true, undefined, CityHelper.getMusic(city));
  }

  /**
   * Switch to dungeon map - handles dungeon entrance/exit with proper coordinates
   */
  public static async mapswitchToDungeon(dungeon: Dungeon): Promise<void> {
    console.log(`PSGame.mapswitchToDungeon: ${Dungeon[dungeon]}`);

    // Import Dungeon helpers
    const { DungeonHelper } = await import('./game/Dungeon');

    // Set dungeon as current location
    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = dungeon;
    this.gameData.current_city = null;

    // Get dungeon coordinates and direction
    const dungeonX = DungeonHelper.getX(dungeon);
    const dungeonY = DungeonHelper.getY(dungeon);
    const dungeonDir = DungeonHelper.getDir(dungeon);

    // Set goto coordinates for dungeon spawn
    this.setgotoxy(dungeonX, dungeonY);

    // Get dungeon map path
    const mapPath = DungeonHelper.getPath(dungeon);
    if (!mapPath) {
      console.error(`PSGame.mapswitchToDungeon: No map path for dungeon ${Dungeon[dungeon]}`);
      return;
    }

    // Set player as entering a dungeon
    const { PSDungeon } = await import('./PSDungeon');
    PSDungeon.setIsInsideDungeon(true);

    // Call base mapswitch with dungeon path - basePath should point to the dungeons directory
    const dungeonMusic = DungeonHelper.getMusic(dungeon);
    await this.mapswitch(mapPath, dungeonX, dungeonY, true, `${this.PS_DEMO_BASE_PATH}/dungeons`, dungeonMusic ?? undefined);

    // Initialize dungeon system
    this.currentDungeon = new PSDungeon();
    this.currentDungeon.setAlreadyInside(false);
    await this.currentDungeon.startDungeon();
  }

  /**
   * Set goto coordinates
   */
  public static setgotoxy(x: number, y: number): void {
    this.gotox = x;
    this.gotoy = y;
  }

  /**
   * Get current city
   */
  public static getCurrentCity(): City | null {
    return this.gameData.current_city;
  }

  /**
   * Get current dungeon
   */
  public static getCurrentDungeon(): Dungeon {
    return this.gameData.current_dungeon;
  }

  /**
   * Get dungeon face direction (for dungeon re-entry)
   */
  public static getDungeonFace(): EntityDirection {
    return this.gameData.dungeonFace || EntityDirection.NORTH;
  }

  /**
   * Set dungeon face direction
   */
  public static setDungeonFace(direction: EntityDirection): void {
    this.gameData.dungeonFace = direction;
  }

  /**
   * Transport off - direct port from Java transportOff()
   */
  public static transportOff(): void {
    console.log("PSGame: Transport off");
    // In full implementation, this would disable transport mode
  }


  /**
   * Turn menu on - direct port from Java PSMenu.menuOn()
   */
  public static menuOn(): void {
    PSMenu.menuOn();
  }

  /**
   * Turn menu off - direct port from Java PSMenu.menuOff()
   */
  public static menuOff(): void {
    PSMenu.menuOff();
  }

  /**
   * Play sound - direct port of Java PSGame.playSound()
   */
  public static playSound(sound: PS1Sound): void {
    if (!sound) {
      console.error("PSGame: Sound is null");
      return;
    }

    if (!this.currentScene) {
      console.error("PSGame: No current scene to play sound");
      return;
    }

    // Sound effect assets are recorded much quieter than the VGM music, so
    // boost the configured volume 4x (soundVolume 50 → 2.0 WebAudio gain).
    // Phaser's WebAudio path supports gain > 1.0.
    const sfxVolume = this.gameData.soundVolume * 4 / 100;

    try {
      // Get sound path
      const soundPath = sound as string;

      // Create audio key from filename
      const audioKey = soundPath.split('/').pop()?.replace('.wav', '') || 'unknown';

      // Check if sound needs to be loaded in Phaser's cache
      if (!this.currentScene.cache.audio.exists(audioKey)) {
        // Load the sound first
        this.currentScene.load.audio(audioKey, soundPath);
        this.currentScene.load.once('complete', () => {
          // Play sound once loaded (the master volume from the emulator UI is
          // applied on top by Phaser's sound manager)
          this.currentScene!.sound.play(audioKey, { volume: sfxVolume });
        });
        this.currentScene.load.start();
      } else {
        // Sound already loaded in Phaser, play it directly
        this.currentScene.sound.play(audioKey, { volume: sfxVolume });
      }

      // Cache the sound path for reference
      if (!this.soundLIB.has(sound)) {
        this.soundLIB.set(sound, soundPath);
      }
    } catch (error) {
      console.error(`PSGame: Error playing sound ${sound}:`, error);
    }
  }

  /**
   * Get CHR data for given PS1CHR type - direct port from Java getCHR()
   */
  public static async getCHR(chrType: PS1CHR): Promise<CHR> {
    if (this.chrLIB.has(chrType)) {
      return this.chrLIB.get(chrType)!;
    }

    if (!this.currentScene) {
      throw new Error("PSGame: No current scene to load CHR data");
    }

    // Load CHR from file
    const chrUrl = PS1CHRHelper.getUrl(chrType);
    console.log(`PSGame: Loading CHR ${PS1CHR[chrType]} from ${chrUrl}`);

    // Parse the URL to get base path and filename
    const urlParts = chrUrl.split('/');
    const filename = urlParts.pop() || '';
    const basePath = urlParts.join('/');

    // Keep the full filename since CHR.loadChr expects .anim.json files
    const chrName = filename;

    console.log(`PSGame: Parsed URL - basePath: "${basePath}", filename: "${filename}", chrName: "${chrName}"`);

    const chr = await CHR.loadChr(this.currentScene, chrName, basePath);
    this.chrLIB.set(chrType, chr);

    return chr;
  }

  /**
   * Check if a flag is set - direct port from Java hasFlag()
   */
  public static hasFlag(flag: Flags): boolean {
    return this.gameData.flags.has(flag);
  }

  /**
   * Set a flag - direct port from Java setFlag()
   */
  public static setFlag(flag: Flags): void {
    this.gameData.flags.add(flag);
    console.log(`PSGame: Set flag ${Flags[flag]}`);
  }

  /**
   * Clear a flag - direct port from Java clearFlag()
   */
  public static clearFlag(flag: Flags): void {
    this.gameData.flags.delete(flag);
    console.log(`PSGame: Cleared flag ${Flags[flag]}`);
  }

  /**
   * Get item by OriginalItem enum - direct port from Java getItem()
   */
  public static getItem(originalItem: OriginalItem): Item {
    const item = PSLibItem.getItemByEnum(originalItem);
    if (!item) {
      throw new Error(`Item not found for OriginalItem: ${OriginalItem[originalItem]}`);
    }
    return item;
  }

  /**
   * Start entity interaction - direct port from Java EntStart()
   * Sets up the interaction context for talking to NPCs/entities
   */
  public static EntStart(): void {
    console.log("PSGame: Starting entity interaction");
    // FIXME: Implement proper entity interaction start behavior
    // In the original Java, this would:
    // 1. Stop entity movement
    // 2. Face entity towards player
    // 3. Set interaction state
    // 4. Potentially show entity sprite/portrait

    // For now, we'll implement basic functionality
    // The actual sprite/portrait display would be handled by PSMenu if needed
  }

  /**
   * Finish entity interaction - direct port from Java EntFinish()
   * Cleans up after entity interaction
   */
  public static EntFinish(): void {
    console.log("PSGame: Finishing entity interaction");

    // Simple fix: pop the text box from the menu stack and clear graphics
    PSMenu.instance.pop();
    PSMenu.instance.clearGraphics();

    MainEngine.setScriptActive(false);
    MainEngine.setEntitiesPaused(false);

    // TODO: In the original Java, this would also:
    // 1. Resume entity movement patterns
    // 2. Clear interaction state
    // 3. Hide entity portraits/sprites if shown
    // 4. Return entities to normal behavior
  }

  /**
   * Church routine - direct port from Java PSGame.Church(int costMultiplier)
   * Provides resurrection services for dead party members
   */
  public static async Church(costMultiplier: number): Promise<void> {
    console.log(`PSGame: Church routine started with cost multiplier ${costMultiplier}`);

    // Store current music to restore later
    const previousMusic = this.currentMusic;

    // Play church music
    await this.playMusic(PS1Music.CHURCH);

    // Show MST display
    await PSMenu.showMST();

    // Get dead party members
    const party = this.getParty();
    const deadMembers = party.getDeadMembers();

    if (deadMembers.length === 0) {
      // No one needs resurrection
      await PSMenu.Stext(this.getString("Church_NoResurrectionNeeded"));
    } else {
      // Create resurrection menu with dead members (similar to shop menu)
      const resurrectionOptions: string[] = [];
      const costs: number[] = [];

      for (const member of deadMembers) {
        const cost = member.getLevel() * 20 * costMultiplier;
        costs.push(cost);
        resurrectionOptions.push(`${member.getName()} - ${cost} MST`);
      }

      // Add "None" option
      resurrectionOptions.push(this.getString("Church_None"));

      // Single menu interaction (like shop)
      const resurrectionMenu = PSMenu.instance.createPromptBox(
        50, 80, resurrectionOptions, true
      );

      PSMenu.instance.push(resurrectionMenu);

      // Import PSCancellable for proper typing
      const { PSCancellable } = await import('./menu/MenuStack');

      const choice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
      PSMenu.instance.pop();

      if (choice !== -1 && choice !== resurrectionOptions.length - 1) {
        // Valid selection - handle resurrection
        const selectedMember = deadMembers[choice];
        const cost = costs[choice];

        // Check if party has enough money
        if (party.getMesetas() < cost) {
          await PSMenu.Stext(this.getString("Church_NotEnoughMoney"));
        } else {
          // Confirm resurrection
          const confirmText = this.getString("Church_ConfirmResurrection")
            .replace("{name}", selectedMember.getName())
            .replace("{cost}", cost.toString());

          const confirmChoice = await PSMenu.Prompt(confirmText, this.getYesNo());

          if (confirmChoice === 0) { // Yes
            // Deduct money and resurrect
            party.removeMesetas(cost);
            selectedMember.resurrect();

            this.playSound(PS1Sound.CURE);

            await PSMenu.Stext(
              this.getString("Church_ResurrectionSuccess")
                .replace("{name}", selectedMember.getName())
            );

            // Check for level up (if character gained experience while dead)
            if (selectedMember.checkLevelUp()) {
              await this.showLevelUp(selectedMember);
            }
          } else {
            // Player chose "No" for confirmation
            await PSMenu.Stext(this.getString("Church_Goodbye"));
          }
        }
      } else {
        // Cancelled or chose "None"
        await PSMenu.Stext(this.getString("Church_Goodbye"));
      }
    }

    // Remove MST display
    PSMenu.instance.pop();

    // Restore previous music
    if (previousMusic) {
      await this.playMusic(previousMusic);
      console.log(`PSGame: Restored previous music: ${previousMusic}`);
    }

    console.log("PSGame: Church routine completed");
  }

  /**
   * Hospital routine - direct port of Java Hospital() method
   * Heals party members for a fee based on cost multiplier
   */
  public static async Hospital(costMultiplier: number): Promise<void> {
    // Create MST display box
    const mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + this.getParty().mst, true);
    PSMenu.instance.push(mstBox);

    const option = await PSMenu.Prompt(this.getString("Hospital_Welcome"), this.getYesNo());
    if (option === 1) { // Yes

      if (this.getParty().partySize() === 1) {
        const member = this.getParty().getMember(0);
        if (member) {
          const hpMpDiff = (member.getMaxHp() - member.getHp()) + (member.getMaxMp() - member.mp);
          if (hpMpDiff <= 0) {
            await PSMenu.StextNext(this.getString("Hospital_Healthy"));
          } else {
            const cost = hpMpDiff * costMultiplier;
            const optCure = await PSMenu.PromptNext(this.getString("Hospital_Cost", "<number>", cost.toString()), this.getYesNo());
            if (optCure === 1) { // Yes
              if (this.getParty().mst >= cost) {
                this.getParty().mst -= cost;
                mstBox.updateText(0, "MST " + this.getParty().mst);
                member.heal();
                this.playSound(PS1Sound.CURE);
                await PSMenu.StextLast(this.getString("Hospital_Cure"));
                PSMenu.instance.pop(); // mstBox
                return;
              } else {
                await PSMenu.StextLast(this.getString("Shop_Not_Enough_Money"));
                PSMenu.instance.pop(); // mstBox
                return;
              }
            }
          }
        }
      } else { // Party size > 1
        let cureWho = await PSMenu.PromptNext(this.getString("Hospital_Who"), this.getParty().listMembers());
        while (cureWho > 0) {
          const member = this.getParty().getMember(cureWho - 1);
          if (member) {
            if (member.getHp() <= 0) {
              await PSMenu.StextNext(this.getString("Hospital_Dead", "<player>", member.getName()));
            } else {
              const hpMpDiff = (member.getMaxHp() - member.getHp()) + (member.getMaxMp() - member.mp);
              if (hpMpDiff <= 0) {
                await PSMenu.StextNext(this.getString("Hospital_Player_Healthy", "<player>", member.getName()));
              } else {
                const cost = hpMpDiff * costMultiplier;
                const optCure = await PSMenu.PromptNext(this.getString("Hospital_Cost", "<number>", cost.toString()), this.getYesNo());
                if (optCure === 1) { // Yes
                  if (this.getParty().mst >= cost) {
                    this.getParty().mst -= cost;
                    mstBox.updateText(0, "MST " + this.getParty().mst);
                    member.heal();
                    this.playSound(PS1Sound.CURE);
                    await PSMenu.StextNext(this.getString("Hospital_Cure"));
                  } else {
                    await PSMenu.StextLast(this.getString("Shop_Not_Enough_Money"));
                    PSMenu.instance.pop(); // mstBox
                    return;
                  }
                }
              }
            }
          }

          cureWho = await PSMenu.PromptNext(this.getString("Hospital_Other"), this.getParty().listMembers());
        }
      }
    }

    await PSMenu.StextLast(this.getString("Hospital_End"));
    PSMenu.instance.pop(); // mstBox
  }

  /**
   * Show level up information - helper for Church and other level-up scenarios
   */
  private static async showLevelUp(member: any): Promise<void> {
    const levelUpText = this.getString("LevelUp_Message")
      .replace("{name}", member.getName())
      .replace("{level}", member.getLevel().toString());

    await PSMenu.Stext(levelUpText);

    // Show stat increases if available
    const statIncrease = member.getLastLevelUpStats();
    if (statIncrease) {
      const statsText = this.getString("LevelUp_Stats")
        .replace("{hp}", statIncrease.hp.toString())
        .replace("{mp}", statIncrease.mp.toString())
        .replace("{attack}", statIncrease.attack.toString())
        .replace("{defense}", statIncrease.defense.toString());

      await PSMenu.Stext(statsText);
    }
  }

  /**
   * Spaceport transition with animation - direct port of Java spaceportTransition() method
   * Animates party movement in specified direction until reaching stop point, then switches to destination
   */
  public static async spaceportTransition(direction: number, whenStop: number, destiny: City, gotox: number, gotoy: number): Promise<void> {

    this.menuOff();
    this.transportOff();

    // Allocate party at correct position like normal mapswitch
    await this.getParty().allocate(this.getgotox(), this.getgotoy());

    // Set camera tracking and position once
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();

    // Fade in to show the animation
    await ScriptEngine.fadein(30, true);

    // Ensure entities remain paused and controls disabled for the animation
    MainEngine.setEntitiesPaused(true);
    MainEngine.setScriptActive(true);

    let count = 0;
    const party = this.getParty();

    while (true) {
      const player = MainEngine.getPlayer();
      if (!player) break;

      // Check stop conditions based on direction
      const playerTileX = Math.floor(player.getx() / 16);
      const playerTileY = Math.floor(player.gety() / 16);

      if (direction === 3 && playerTileX <= whenStop) break; // WEST
      if (direction === 4 && playerTileX >= whenStop) break; // EAST
      if (direction === 1 && playerTileY <= whenStop) break; // NORTH
      if (direction === 2 && playerTileY >= whenStop) break; // SOUTH

      // Move all party members
      let currentEntity: Entity | null = player;
      for (let j = 0; j < party.partySize(); j++) {
        if (j === 0) {
          currentEntity = player;
        } else if (currentEntity) {
          currentEntity = currentEntity.getFollower();
        }

        if (currentEntity && count === 0) {
          currentEntity.setFace(direction);
          const chr = currentEntity.getChr();
          if (chr) {
            const idleFrames = chr.getIdle();
            currentEntity.setSpecframe(idleFrames[direction] || 0);
          }
          if (direction === 2 || direction === 1) {
            currentEntity.incx(4);
          }
        }

        if (currentEntity && count > j * 16) {
          switch (direction) {
            case 3: // WEST
              currentEntity.incx(-1);
              break;
            case 4: // EAST
              currentEntity.incx(1);
              break;
            case 1: // NORTH
              currentEntity.incy(-1);
              break;
            case 2: // SOUTH
              currentEntity.incy(1);
              break;
          }
        }
      }

      count++;

      // Force sprite visual update for all entities
      currentEntity = player;
      for (let j = 0; j < party.partySize(); j++) {
        if (j === 0) {
          currentEntity = player;
        } else if (currentEntity) {
          currentEntity = currentEntity.getFollower();
        }

        if (currentEntity) {
          currentEntity.draw();
        }
      }

      // Add delay to slow down animation (one pixel at a time)
      await new Promise(resolve => setTimeout(resolve, 8));
    }

    MainEngine.setEntitiesPaused(false);
    MainEngine.setScriptActive(false);
    this.menuOn();
    await this.mapswitchToCity(destiny, gotox, gotoy);
  }

  /**
   * Fixed battle - battle with predetermined enemies
   */
  public static async fixedBattle(scene: PSSceneType, enemies: any[]): Promise<BattleOutcome> {
    console.log(`PSGame.fixedBattle: Starting fixed battle in ${scene} with ${enemies.length} enemies`);

    // Convert enemy enums to Enemy instances
    const { PSLibEnemy } = await import('./game/PSLibEnemy');
    const enemyInstances: any[] = [];

    for (const enemyEnum of enemies) {
      const enemyInstance = PSLibEnemy.getEnemyByEnum(enemyEnum);
      if (enemyInstance) {
        enemyInstances.push(enemyInstance);
      } else {
        console.error(`PSGame.fixedBattle: Could not find enemy for enum ${enemyEnum}`);
      }
    }

    const { PSBattle } = await import('./battle/PSBattle');
    const { BattleOutcome } = await import('./battle/PSBattle');

    const battle = new PSBattle();
    return await battle.battleSceneWithEnemies(scene, enemyInstances);
  }

  /**
   * Random battle - battle with random selection from enemy array
   */
  public static async randomBattle(scene: PSSceneType, enemyPool: any[]): Promise<BattleOutcome> {
    console.log(`PSGame.randomBattle: Starting random battle in ${scene} with enemy pool of ${enemyPool.length}`);

    if (enemyPool.length === 0) {
      throw new Error("Enemy pool cannot be empty for random battle");
    }

    // Select random enemy from pool
    const randomIndex = Math.floor(Math.random() * enemyPool.length);
    const selectedEnemyEnum = enemyPool[randomIndex];

    // Convert enemy enum to Enemy instance
    const { PSLibEnemy } = await import('./game/PSLibEnemy');
    const selectedEnemy = PSLibEnemy.getEnemyByEnum(selectedEnemyEnum);

    if (!selectedEnemy) {
      throw new Error(`Could not find enemy for enum ${selectedEnemyEnum}`);
    }

    // Determine random quantity based on party size (original PS1 rule: party.size * 2)
    const partySize = PSGame.getParty().getMembers().length;
    const maxByParty = partySize * 2;
    const maxByEnemy = selectedEnemy.getMaxNum() || 8; // fallback to 8
    const absoluteMax = PSGame.getCurrentDungeon() ? 4 : 8; // dungeon limit of 4
    const effectiveMax = Math.min(maxByParty, maxByEnemy, absoluteMax);
    const quantity = Math.floor(Math.random() * effectiveMax) + 1;

    const { PSBattle } = await import('./battle/PSBattle');
    const { BattleOutcome } = await import('./battle/PSBattle');

    const battle = new PSBattle();
    return await battle.battleScene(scene, selectedEnemy, quantity);
  }

  /**
   * Start battle with specific enemy and quantity
   */
  public static async startBattle(scene: PSSceneType, enemy: Enemy, quantity: number = 1): Promise<BattleOutcome> {
    console.log(`PSGame.startBattle: Starting battle with ${quantity} ${enemy.getName()}(s)`);

    const { PSBattle } = await import('./battle/PSBattle');
    const { BattleOutcome } = await import('./battle/PSBattle');

    const battle = new PSBattle();
    return await battle.battleScene(scene, enemy, quantity);
  }

  /**
   * Game over routine - called when party is defeated
   */
  public static async gameOverRoutine(): Promise<void> {
    console.log("PSGame: Game Over routine started");

    this.stopMusic();

    // Show game over message
    await PSMenu.Stext(this.getString("Battle_Lost"));

    // TODO: Implement proper game over handling
    // This could include:
    // - Save game state
    // - Return to title screen
    // - Resurrection options
    // - Party member revival mechanics

    console.log("PSGame: Game Over routine completed");
  }

  /**
   * Return to the title screen (Java: setMapOff + mapswitch("Title.map"))
   * In the Phaser port the title is its own scene, so switch scenes.
   */
  public static async exitToTitle(): Promise<void> {
    this.stopMusic();
    const scene = this.currentScene;
    await ScriptEngine.fadeout(25, true);
    MainEngine.cleanup();
    if (scene) {
      scene.scene.start('PSTitleScene', { config: (scene as any).config });
    }
  }

  /**
   * Check if party can transport (for battle system)
   */
  public static get canTransport(): boolean {
    // TODO: Implement transport availability check
    return false;
  }

  /**
   * Transport on - enable transport mode
   */
  public static transportOn(): void {
    console.log("PSGame: Transport activated");
    // TODO: Implement transport mode activation
  }

  /**
   * Find and play appropriate music for current context
   */
  public static findAndPlayMusic(): void {
    console.log("PSGame: Finding appropriate music for current context");

    // Determine appropriate music based on current location (Java order:
    // dungeon, then city, then planet/vehicle, then title/story fallback)
    if (this.gameData.current_dungeon !== Dungeon.NONE) {
      const dungeonMusic = DungeonHelper.getMusic(this.gameData.current_dungeon);
      if (dungeonMusic) {
        this.playMusic(dungeonMusic);
      }
    } else if (this.gameData.current_city !== null) {
      this.playMusic(CityHelper.getMusic(this.gameData.current_city));
    } else if (this.gameData.current_planet !== null) {
      if (this.gameData.onGroundVehicle || this.gameData.onWaterVehicle) {
        this.playMusic(PS1Music.VEHICLE);
      } else {
        this.playMusic(PlanetHelper.getMusic(this.gameData.current_planet));
      }
    } else if (this.gameData.getGameType() === null) {
      this.playMusic(PS1Music.TITLE);
    } else {
      this.playMusic(PS1Music.STORY);
    }
  }

  /**
   * Get display messages setting for battle system
   */
  public static getDisplayMessages(): boolean {
    // TODO: Implement setting for battle message display
    return true;
  }

  /**
   * Open chest with trap and item handling
   */
  public static async chest(mesetas: number, trapped: Trapped, item?: Item): Promise<boolean> {
    console.log(`PSGame.chest: Opening chest with ${mesetas} mesetas, trap: ${trapped}`);

    // 1. Disable menu controls during chest interaction
    PSMenu.menuOff();

    // 2. Create and display chest sprite at position (128, 112)
    const chestCHR = await this.getCHR(PS1CHR.CHEST);
    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      console.error("PSGame.chest: No current scene available");
      PSMenu.menuOn();
      return false;
    }

    const chestSprite = new MenuCHR(currentScene, 128, 112, chestCHR);
    chestSprite.setDepth(1995); // above dungeon texture (1990), below menu text boxes (2000+)
    PSMenu.instance.push(chestSprite);

    // 3. Show initial "Chest Found!" text
    await PSMenu.StextFirst(this.getString("Chest_Found"));

    // 4. Trap detection (if Myau is in party)
    if (trapped !== Trapped.NO_TRAP && this.getParty().hasMember("Myau")) {
      await PSMenu.PromptNext(this.getString("Chest_Myau_Sniff"), this.getYesNo());
      await PSMenu.PromptNext(this.getString("Chest_Trap"), this.getYesNo());
    }

    // 5. Ask "Open chest?" with YES/NO menu
    const openChestChoice = await PSMenu.PromptNext(
      this.getString("Chest_Open"),
      this.getYesNo()
    );

    let chestOpened = false;

    if (openChestChoice === 1) {  // YES is first option; PromptNext returns 1-indexed
      chestOpened = true;

      // 6. Play opening animation — run drawMenus() each frame until animation finishes
      chestSprite.animate(MenuState.ANIM1);
      await PSMenu.instance.waitAnimationEnd(chestSprite);

      // 7. Handle traps
      if (trapped === Trapped.EXPLOSION) {
        chestSprite.animate(MenuState.ANIM2);
        await PSMenu.instance.waitAnimationEnd(chestSprite);
        await PSMenu.StextNext(this.getString("Chest_Explosion"));
        // TODO: Damage all party members
      } else if (trapped === Trapped.ARROW) {
        chestSprite.animate(MenuState.ANIM3);
        await PSMenu.instance.waitAnimationEnd(chestSprite);
        await PSMenu.StextNext(this.getString("Chest_Arrow"));
        // TODO: Damage random party member
      }

      // 8. Show rewards
      if (mesetas > 0) {
        this.getParty().addMesetas(mesetas);
        await PSMenu.StextNext(this.getString("Chest_Mesetas", "<number>", mesetas.toString()));
      }

      if (item) {
        this.getParty().addItem(item);
        await PSMenu.StextNext(this.getString("Chest_Item", "<item>", item.getName()));
      }
    }

    // 9. Cleanup — pop the textBox left by PromptNext, then the chestSprite,
    //    then flush the Graphics object (it only clears itself inside waitXxx loops)
    PSMenu.instance.pop(); // textBox ("Open chest?")
    PSMenu.instance.pop(); // chestSprite
    PSMenu.instance.clearGraphics();
    PSMenu.menuOn();

    return chestOpened;
  }

  /**
   * Get dungeon delay for movement animations
   */
  public static getDungeonDelay(): number {
    return 3; // Frame delay for dungeon movement animations
  }

  /**
   * Get current dungeon instance
   */
  public static getCurrentDungeonInstance(): any {
    return this.currentDungeon;
  }

  /**
   * Chest flag management - direct port from PSGame.java
   */
  public static async chestFlag(flag: any, mesetas: number, trapped: any, item: any): Promise<void> {
    if (this.gameData.chestFlags.has(flag)) {
      console.log(`PSGame.chestFlag: Chest ${flag} already opened`);
      return;
    }

    console.log(`PSGame.chestFlag: Opening chest ${flag}`);

    // Call the chest() method to show visual display and get user choice
    const opened = await this.chest(mesetas, trapped, item);

    // Only set flag if user actually opened the chest
    if (opened) {
      this.gameData.chestFlags.add(flag);
    }
  }

}