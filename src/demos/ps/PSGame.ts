/**
 * PSGame - Phantasy Star Game Management
 * Port of PSGame.java - Core game state and resource management
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { GameSpeed } from '../../config/GameSpeed';
import { Entity, EntityDirection, Direction } from '../../domain/Entity';
import { PS1Music } from './game/PSLibMusic';
import { PS1Image } from './game/PSLibImage';
import { PS1Sound } from './game/PSLibSound';
import { PSMenu, SpecialEntity } from './PSMenu';
import { Party } from './game/Party';
import { Planet, City, CityHelper, PlanetHelper } from './game/City';
import { ScreenSize, GameType, Flags, GameData } from './game/GameData';
import { Dungeon, DungeonHelper } from './game/Dungeon';
import { CHR } from '../../domain/CHR';
import { PS1CHR, PS1CHRHelper } from './game/PSLibCHR';
import { Item, ItemType } from './game/Item';
import { OriginalItem, PSLibItem } from './game/PSLibItem';
import { PS1Spell, SpellFactory, PSLibSpell } from './game/PSLibSpell';
import { Effect } from './game/PSEffect';
import { PSLibEnemy, GenericEnemy } from './game/PSLibEnemy';
import { VImage } from './menu/MenuImageBox';
import { I18nManager } from './game/I18nManager';
import { SaveManager, SaveSlotMeta } from './game/SaveManager';

// Battle system imports
import { Enemy } from './battle/Enemy';
import { BattleOutcome } from './battle/PSBattle';
import { PSSceneType } from './PSMenu';
import { Trapped, Trap } from './game/GameData';
import { JobHelper } from './game/Job';
import { MenuCHR } from './menu/MenuCHR';
import { MenuState } from './menu/MenuType';


export class PSGame {
  public static gameData: GameData = new GameData();
  private static currentScene: Phaser.Scene | null = null;
  private static party: Party | null = null;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static canTransportFlag: boolean = false;
  private static fromCity: City | null = null;
  private static toCity: City | null = null;

  // Debug cheat (Talk menu): skip all zone-triggered encounters. Not
  // persisted in saves; boss/story fights (startBattle) are unaffected.
  public static battlesOff: boolean = false;

  // Weak-ice tiles on Dezoris (Java PSGame constants)
  public static readonly ICE_FLOCK = 165;
  public static readonly WEAK_ICE_ZONE = 1;
  private static currentMusic: PS1Music | null = null; // Track currently playing music
  private static pausedMusic: PS1Music | null = null; // Track shelved by pauseMusic()
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

    ScriptEngine.setMusicVolume(this.gameData.musicVolume);

    // If this is the track shelved by pauseMusic() (interrupted by a battle),
    // continue it from where it stopped instead of restarting it
    if (this.pausedMusic === music && ScriptEngine.resumemusic(music as string)) {
      this.pausedMusic = null;
    } else {
      ScriptEngine.playmusic(music as string);
    }
    this.currentMusic = music;
  }

  /**
   * Shelve the current track (exact position) so the next playMusic() of the
   * same track resumes where it was interrupted. Used at battle start so the
   * overworld/dungeon music picks up mid-song after the fight.
   */
  public static pauseMusic(): void {
    if (this.currentMusic === null) {
      return;
    }
    ScriptEngine.pausemusic();
    this.pausedMusic = this.currentMusic;
    this.currentMusic = null;
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
    return this.gameData.onGroundVehicle || this.gameData.onWaterVehicle;
  }

  /**
   * Regroup party members after a scene (house/shop/encounter) ends.
   *
   * Standard: always anchor to the *event tile* — the whole tile that triggered
   * the scene, captured at trigger time (event_tx, event_ty) — then place the
   * player at that tile plus the requested adjustment. For a house exit this is
   * regroup(0, 1): the door tile plus one south, so the player always lands
   * directly in front of the house facing south.
   *
   * Basing this on the event tile (rather than the player's live pixel position
   * and facing) fixes a bug where diagonal/sideways entry left the player to the
   * left or right of the door, re-triggering the house event a second time.
   */
  public static regroup(xAdjust: number, yAdjust: number): void {
    console.log(`PSGame: Regrouping party with adjustment (${xAdjust}, ${yAdjust})`);

    // Early exit if no player
    const player = MainEngine.getPlayer();
    if (!player) {
      console.log('PSGame.regroup: No player entity found');
      return;
    }

    // Anchor to the event tile that triggered the scene, then apply the offset.
    const tileX = MainEngine.getEventTx() + xAdjust;
    const tileY = MainEngine.getEventTy() + yAdjust;

    // Set player to exact tile position
    player.setxy(tileX * 16, tileY * 16);

    // Always face south after regrouping (matching Java behavior)
    player.setFace(EntityDirection.SOUTH);

    console.log(`PSGame.regroup: Player placed at event tile (${MainEngine.getEventTx()}, ${MainEngine.getEventTy()}) + (${xAdjust}, ${yAdjust}) = tile (${tileX}, ${tileY}) = (${tileX * 16}, ${tileY * 16}) pixels, now facing south`);
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

    // Handle PSSceneType — Java: getImage(PS1Image.valueOf(scene.name())),
    // i.e. every image-backed scene has a PS1Image entry with the same name
    if (typeof imageKeyOrScene === 'number') {
      const sceneName = PSSceneType[imageKeyOrScene];
      const image = (PS1Image as Record<string, string>)[sceneName];
      if (image) {
        return image;
      }
      console.warn(`PSGame.getImage: no PS1Image entry for scene ${sceneName}`);
      return PS1Image.BLUE_HOUSE; // Fallback
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

    // Java: gameData.setGameType(gameType) — findAndPlayMusic() and others
    // key off it (null game type means "still on the title screen")
    this.gameData.setGameType(gameType);

    // Initialize party with specified game type
    this.party = new Party(gameType);

    console.log(`PSGame: Party initialized with ${this.party.partySize()} members`);
  }

  /**
   * Human-readable name of the party's current location, for save-slot labels.
   * Dungeon > city > planet, matching how a save's position is restored.
   */
  private static currentPlaceName(): string {
    if (this.getCurrentDungeon() !== Dungeon.NONE) {
      // NAULA -> "Naula", GOTHIC_PASSAGEWAY_IN -> "Gothic Passageway In"
      return Dungeon[this.getCurrentDungeon()]
        .split('_')
        .map(w => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
    }
    if (this.gameData.current_city !== null) {
      return CityHelper.toString(this.gameData.current_city);
    }
    if (this.gameData.current_planet !== null) {
      const name = Planet[this.gameData.current_planet];
      return this.getString(`Planet_${name.charAt(0)}${name.slice(1).toLowerCase()}`);
    }
    return '???';
  }

  /** Map a game locale ('en', 'se') to a BCP-47 tag for date formatting. */
  private static localeToTag(locale: string): string {
    switch (locale) {
      case 'en': return 'en-US';
      case 'se': return 'sv-SE';
      default: return locale;
    }
  }

  /** Build the metadata header shown for a freshly written save slot. */
  public static buildSaveMeta(): SaveSlotMeta {
    const place = this.currentPlaceName();
    const maxLevel = this.getParty().getMaxLevel();
    const date = SaveManager.formatDate(new Date(), this.localeToTag(this.gameData.locale));
    return {
      place,
      maxLevel,
      date,
      timestamp: Date.now(),
      label: SaveManager.composeLabel(place, maxLevel, date)
    };
  }

  /**
   * Load game - browser adaptation of Java loadGame(). Shows the used save
   * slots, restores the chosen state, and re-enters its map.
   * @returns true if a game was loaded (the main menu should then close)
   */
  public static async loadGame(enterMap: boolean = true): Promise<boolean> {
    const { PSCancellable } = await import('./menu/MenuStack');

    const metas = SaveManager.listMetas();
    const used: { slot: number; label: string }[] = [];
    metas.forEach((m, slot) => {
      if (m) {
        used.push({ slot, label: m.label });
      }
    });

    if (used.length === 0) {
      await PSMenu.Stext(this.getString("Menu_No_Saves"));
      return false;
    }

    PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 2, used.map(u => u.label), true));
    const sel = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    PSMenu.instance.pop();

    if (sel < 0) {
      return false; // cancelled
    }

    const loaded = SaveManager.loadFromSlot(used[sel].slot);
    if (!loaded) {
      await PSMenu.Stext(this.getString("Menu_Load_Failed"));
      return false;
    }

    // Adopt the loaded state. PSGame.party is the live reference the engine
    // uses, so point it at the restored party (they are otherwise unsynced).
    this.gameData = loaded;
    this.party = loaded.getParty();

    // Restore the language the save was made in (Java: reload ResourceBundle).
    if (loaded.locale) {
      await this.setLocale(loaded.locale);
    }

    // Clear the open main-menu boxes before rebuilding the map so nothing
    // lingers over the new scene (the caller must not pop again after a load).
    while (PSMenu.instance.hasMenu()) {
      PSMenu.instance.pop();
    }

    // Re-enter the saved location. In-game loads (pause menu) do this now — the
    // GameScene is already running. Title-screen loads pass enterMap=false and
    // start the GameScene first (which has no map/party yet); GameScene.create
    // then calls enterLoadedLocation() once the engine/scene context exists.
    if (enterMap) {
      await this.enterLoadedLocation();
    }

    return true;
  }

  /**
   * Enter the map for the currently-adopted save state (city, planet or
   * dungeon). Requires a running GameScene — mapswitch loads the map, starts its
   * music and runs startmap (which allocates the party / enters the dungeon).
   */
  public static async enterLoadedLocation(): Promise<void> {
    const x = this.gameData.gotox;
    const y = this.gameData.gotoy;
    if (this.getCurrentDungeon() !== Dungeon.NONE) {
      // Re-enter at the exact saved tile (x, y), not the dungeon entrance. Pass
      // alreadyInside=true so startDungeon() re-enters illuminated and restores the
      // saved facing (getDungeonFace) instead of printing the "Pitch black" intro.
      await this.mapswitchToDungeon(this.gameData.current_dungeon, true, x, y);
    } else if (this.gameData.current_city !== null) {
      await this.mapswitchToCity(this.gameData.current_city, x, y);
    } else if (this.gameData.current_planet !== null) {
      await this.mapswitchToPlanet(this.gameData.current_planet, x, y);
    }
  }

  /**
   * Save game - browser adaptation of Java saveGame(). Writes to one of up to
   * SaveManager.MAX_SLOTS localStorage slots, each labelled with place, party
   * level and date. Overwriting an occupied slot asks for confirmation.
   */
  public static async saveGame(): Promise<void> {
    const player = MainEngine.getPlayer();
    if (player) {
      this.gameData.gotox = Math.floor(player.getx() / 16);
      this.gameData.gotoy = Math.floor(player.gety() / 16);

      if (this.getCurrentDungeon() !== Dungeon.NONE) {
        const dungeon = this.getCurrentDungeonInstance();
        if (dungeon && !dungeon.getAlreadyInside()) {
          // Java: don't save on the entry tile before the floor is revealed.
          return;
        }
        this.gameData.dungeonFace = player.getFace();
      }
    }

    // Keep gameData's party reference in sync with the live party before saving.
    this.gameData.setParty(this.getParty());

    const { PSCancellable } = await import('./menu/MenuStack');

    const metas = SaveManager.listMetas();
    const options = metas.map(m => (m ? m.label : this.getString('Menu_Empty_Slot')));

    PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 2, options, true));
    const slot = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    PSMenu.instance.pop();

    if (slot < 0) {
      return; // cancelled
    }

    if (metas[slot]) {
      const confirm = await PSMenu.Prompt(this.getString('Menu_Overwrite_Prompt'), this.getYesNo());
      PSMenu.instance.pop(); // text box left by Prompt
      if (confirm !== 1) {
        return; // declined overwrite
      }
    }

    const meta = this.buildSaveMeta();
    if (SaveManager.saveToSlot(slot, this.gameData, meta)) {
      await PSMenu.Stext(this.getString("Menu_Save_Success"));
    } else {
      await PSMenu.Stext(this.getString("Menu_Save_Failed"));
    }
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
    return this.gameData?.getGameType() ?? GameType.PS_ORIGINAL;
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
  /**
   * Dungeon floor trap - direct port of Java PSGame.trapRoutine().
   * First contact: fall through to (warpx, warpy) one floor down. Once the
   * info flag is set, the party is warned and pushed back instead. A trap
   * spell/effect (setTrapEffect) disarms it permanently.
   */
  public static async trapRoutine(trap: Trap, infoTrap: Trap, warpx: number, warpy: number): Promise<void> {
    // If cast spell
    if (this.currentDungeon?.getTrapEffect()) {
      // Disarm trap
      if (!this.gameData.trapFlags.has(trap)) {
        await PSMenu.Stext(this.getString("Dungeon_Trap"));
        this.gameData.trapFlags.add(trap);
        this.currentDungeon.setTrapEffect(false);
      }
      return;
    }

    // If didn't cast spell
    if (this.gameData.trapFlags.has(trap)) {
      return;
    } else if (this.gameData.trapFlags.has(infoTrap)) {
      await PSMenu.Stext(this.getString("Dungeon_Trap_Info"));
      this.currentDungeon?.turnBack();
    } else {
      this.gameData.trapFlags.add(infoTrap);
      this.playSound(PS1Sound.TRAP_FALL);
      this.gameData.dungeonFloor--;
      await this.warp(warpx, warpy, false);
      this.currentDungeon?.setZoneCheck();
    }
  }

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

    // Hard-gate zone triggers and player controls until the new map is fully
    // started (cleared by startEngine). scriptActive alone is not enough — the
    // fadeout below re-enables it on completion, and a zone firing in that blip
    // starts a second mapswitch whose gotoxy overwrites ours.
    MainEngine.setMapTransitionActive(true);

    try {
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
    } finally {
      // Normally startEngine already released the gate; this covers exceptions
      // before/inside it so a failed switch can't leave controls dead.
      MainEngine.setMapTransitionActive(false);
    }
  }

  /**
   * Map switch to Planet - explicit method for Planet enum
   */
  public static async mapswitchToPlanet(planet: Planet, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToPlanet: ${Planet[planet]} at (${x}, ${y})`);

    // Gate before the first await: the dynamic imports below can take real
    // frames (cold module in dev), and callers like Camineet.spaceport() run
    // EntFinish() right after invoking us, which re-enables controls.
    MainEngine.setMapTransitionActive(true);

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

    // Gate before the first await (see mapswitchToPlanet)
    MainEngine.setMapTransitionActive(true);

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
  public static async mapswitchToDungeon(
    dungeon: Dungeon,
    alreadyInside: boolean = false,
    spawnX?: number,
    spawnY?: number
  ): Promise<void> {
    console.log(`PSGame.mapswitchToDungeon: ${Dungeon[dungeon]}`);

    // Gate before the first await (see mapswitchToPlanet)
    MainEngine.setMapTransitionActive(true);

    // Import Dungeon helpers
    const { DungeonHelper } = await import('./game/Dungeon');

    // Set dungeon as current location
    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = dungeon;
    this.gameData.current_city = null;
    // Java mapswitch(Dungeon) resets the floor on fresh entry; a load
    // (alreadyInside) keeps the floor restored from the save, matching the
    // Java mapswitch(Dungeon, x, y) overload used there
    if (!alreadyInside) {
      this.gameData.dungeonFloor = 0;
    }

    // Spawn coordinates: fresh entries use the dungeon's entrance tile; a load
    // (alreadyInside) restores the exact saved tile so the party re-appears where
    // it was, not back at the entrance. Facing is likewise restored in
    // startDungeon() via getDungeonFace().
    const dungeonX = spawnX ?? DungeonHelper.getX(dungeon);
    const dungeonY = spawnY ?? DungeonHelper.getY(dungeon);

    // Set goto coordinates for dungeon spawn
    this.setgotoxy(dungeonX, dungeonY);

    // Get dungeon map path
    const mapPath = DungeonHelper.getPath(dungeon);
    if (!mapPath) {
      console.error(`PSGame.mapswitchToDungeon: No map path for dungeon ${Dungeon[dungeon]}`);
      MainEngine.setMapTransitionActive(false); // aborted — startEngine won't run to clear it
      return;
    }

    // Set player as entering a dungeon
    const { PSDungeon } = await import('./PSDungeon');
    PSDungeon.setIsInsideDungeon(true);

    // Initialize the dungeon instance BEFORE the map loads (Java: PSGame.currentDungeon
    // already exists when the dungeon map's startmap script configures enemies
    // and calls startDungeon() on it)
    this.currentDungeon = new PSDungeon();
    // alreadyInside must be set BEFORE the map's startmap script runs startDungeon()
    // (below, inside mapswitch): startDungeon() reads getAlreadyInside() to decide
    // isDark. Loading a save mid-dungeon passes true so the dungeon re-enters
    // illuminated (Java loadGame sets this before startDungeon's next-tick run);
    // setting it after mapswitch returns is too late — the loop has already printed
    // "Pitch black". Fresh entries pass false (the default).
    this.currentDungeon.setAlreadyInside(alreadyInside);

    // Call base mapswitch with dungeon path - basePath should point to the dungeons directory
    const dungeonMusic = DungeonHelper.getMusic(dungeon);
    await this.mapswitch(mapPath, dungeonX, dungeonY, true, `${this.PS_DEMO_BASE_PATH}/dungeons`, dungeonMusic ?? undefined);

    // Dungeons without a ported startmap script never call startDungeon() - do it here
    if (!this.currentDungeon.hasStarted()) {
      await this.currentDungeon.startDungeon();
    }
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
  public static getDungeonFace(): Direction {
    return (this.gameData.dungeonFace as Direction) || EntityDirection.NORTH;
  }

  /**
   * Set dungeon face direction
   */
  public static setDungeonFace(direction: Direction): void {
    this.gameData.dungeonFace = direction;
  }

  /**
   * Transport off - direct port from Java transportOff().
   * Java hooked/unhooked button 1 to verifyTransport; in the Phaser port
   * GameScene.update checks canTransport and calls verifyTransport().
   */
  public static transportOff(): void {
    this.canTransportFlag = false;
  }

  /**
   * Board/leave vehicles on button 1 - direct port of Java verifyTransport()
   */
  public static async verifyTransport(): Promise<void> {
    if (this.getCurrentDungeon() !== Dungeon.NONE || this.gameData.current_city !== null || PSMenu.instance.hasMenu()) {
      return;
    }

    if (this.gameData.current_planet === Planet.DEZORIS) {
      if (!this.gameData.onGroundVehicle) {
        if (!await this.icedigger()) {
          await this.landrover();
        }
      } else {
        await this.disembarkTransport();
        MainEngine.getCurrentMap()?.setMethodZone(this.WEAK_ICE_ZONE, true);
      }
      return;
    }

    if (this.gameData.onWaterVehicle) {
      await this.hovercraft(false); // try to disembark
    } else if (!await this.hovercraft(true)) {
      if (!this.gameData.onGroundVehicle) {
        await this.landrover();
      } else {
        await this.disembarkTransport();
      }
    }
  }

  private static async disembarkTransport(): Promise<void> {
    const player = MainEngine.getPlayer();
    if (!player) return;
    await this.getParty().disembark(Math.floor(player.getx() / 16), Math.floor(player.gety() / 16));
    this.gameData.onGroundVehicle = false;
    this.findAndPlayMusic();
  }

  /**
   * Board the Landrover - direct port of Java landrover()
   */
  public static async landrover(): Promise<boolean> {
    if (!this.getParty().hasQuestItem(this.getItem(OriginalItem.Vehicle_LandMaster))) {
      return false;
    }

    const player = MainEngine.getPlayer();
    let x = 0, y = 0;
    if (player) {
      x = Math.floor(player.getx() / 16);
      y = Math.floor(player.gety() / 16);
    } else {
      // Just loaded the game
      x = this.gameData.gotox;
      y = this.gameData.gotoy;
    }

    if (this.isWater(x, y) || this.isWater(x + 1, y) || this.isWater(x - 1, y) || this.isWater(x, y - 1) || this.isWater(x, y + 1)) {
      return false;
    }

    await this.getParty().embark(x, y, 'Landrover.anim.json');
    this.gameData.onGroundVehicle = true;
    await this.playMusic(PS1Music.VEHICLE);
    return true;
  }

  /**
   * Board/leave the Hovercraft - direct port of Java hovercraft()
   */
  public static async hovercraft(enter: boolean): Promise<boolean> {
    if (!this.getParty().hasQuestItem(this.getItem(OriginalItem.Vehicle_FlowMover))) {
      return false;
    }

    const player = MainEngine.getPlayer();
    let x = 0, y = 0;
    if (player) {
      switch (player.getFace()) {
        case EntityDirection.NORTH: x = Math.floor(player.getx() / 16); y = Math.floor((player.gety() - 17) / 16); break;
        case EntityDirection.WEST: x = Math.floor((player.getx() - 17) / 16); y = Math.floor(player.gety() / 16); break;
        case EntityDirection.SOUTH: x = Math.floor(player.getx() / 16); y = Math.floor((player.gety() + 40) / 16); break;
        case EntityDirection.EAST: x = Math.floor((player.getx() + 33) / 16); y = Math.floor(player.gety() / 16); break;
      }
    } else {
      // Just loaded the game
      x = this.gameData.gotox;
      y = this.gameData.gotoy;
    }

    if (enter && this.isWater(x, y)) {
      await this.getParty().embark(x, y, 'Hover.anim.json');
      this.gameData.onWaterVehicle = true;
      this.gameData.onGroundVehicle = false;
      await this.playMusic(PS1Music.VEHICLE);
      return true;
    }

    if (!enter && !this.isWater(x, y) && !MainEngine.getCurrentMap()?.getobs(x, y)) {
      await this.getParty().disembark(x, y);
      this.gameData.onWaterVehicle = false;
      this.findAndPlayMusic();
      return true;
    }

    return false;
  }

  /**
   * Board the Ice Digger - direct port of Java icedigger()
   */
  public static async icedigger(): Promise<boolean> {
    if (!this.getParty().hasQuestItem(this.getItem(OriginalItem.Vehicle_IceDecker))) {
      return false;
    }

    const player = MainEngine.getPlayer();
    let x = 0, y = 0;
    if (player) {
      x = Math.floor(player.getx() / 16);
      y = Math.floor(player.gety() / 16);
    } else {
      // Just loaded the game
      x = this.gameData.gotox;
      y = this.gameData.gotoy;
    }

    await this.getParty().embark(x, y, 'IceDigger.anim.json');
    MainEngine.getCurrentMap()?.setMethodZone(this.WEAK_ICE_ZONE, false);
    this.gameData.onGroundVehicle = true;
    await this.playMusic(PS1Music.VEHICLE);
    return true;
  }

  /**
   * Water tile check - direct port of Java isWater()
   */
  public static isWater(x: number, y: number): boolean {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return false;
    const tile = currentMap.gettile(x, y, 0) - 1;
    return tile === 7 || tile === 230 || tile === 231 || tile === 250 || tile === 251 ||
      (tile >= 180 && tile <= 189) ||
      (tile >= 200 && tile <= 209) ||
      (tile >= 260 && tile <= 269) ||
      (tile >= 280 && tile <= 289) ||
      (tile >= 554 && tile <= 557) ||
      (tile >= 574 && tile <= 577);
  }

  /**
   * Break weak ice ahead of the Ice Digger - direct port of Java breakIce()
   */
  public static breakIce(): void {
    if (!this.gameData.onGroundVehicle || !this.getParty().hasQuestItem(this.getItem(OriginalItem.Vehicle_IceDecker))) {
      return;
    }

    const e = MainEngine.getPlayer();
    const currentMap = MainEngine.getCurrentMap();
    if (!e || !currentMap) return;

    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    switch (e.getFace()) {
      case EntityDirection.NORTH:
        x1 = Math.floor(e.getx() / 16); y1 = Math.floor(e.gety() / 16) - 1;
        x2 = Math.floor(e.getx() / 16) + 1; y2 = Math.floor(e.gety() / 16) - 1;
        break;
      case EntityDirection.WEST:
        x1 = Math.floor(e.getx() / 16) - 1; y1 = Math.floor(e.gety() / 16);
        x2 = Math.floor(e.getx() / 16) - 1; y2 = Math.floor(e.gety() / 16) + 1;
        break;
      case EntityDirection.SOUTH:
        x1 = Math.floor(e.getx() / 16); y1 = Math.floor(e.gety() / 16) + 2;
        x2 = Math.floor(e.getx() / 16) + 1; y2 = Math.floor(e.gety() / 16) + 2;
        break;
      case EntityDirection.EAST:
        x1 = Math.floor(e.getx() / 16) + 2; y1 = Math.floor(e.gety() / 16);
        x2 = Math.floor(e.getx() / 16) + 2; y2 = Math.floor(e.gety() / 16) + 1;
        break;
    }

    let sound = false;
    if (currentMap.getzone(x1, y1) === this.WEAK_ICE_ZONE) {
      currentMap.settile(x1, y1, 0, this.ICE_FLOCK);
      sound = true;
    }
    if (currentMap.getzone(x2, y2) === this.WEAK_ICE_ZONE) {
      currentMap.settile(x2, y2, 0, this.ICE_FLOCK);
      sound = true;
    }
    if (sound) {
      this.playSound(PS1Sound.TCHAC);
    }
  }

  /**
   * Allocate on transport or normal party (called by Palma, Motavia and
   * Dezoris startmaps) - direct port of Java planetAllocate()
   */
  public static async planetAllocate(): Promise<void> {
    if (this.gameData.onGroundVehicle) {
      this.gameData.onGroundVehicle = false;
      await this.verifyTransport();
    } else if (this.gameData.onWaterVehicle) {
      this.gameData.onWaterVehicle = false;
      await this.verifyTransport();
    } else {
      await this.getParty().allocate(this.getgotox(), this.getgotoy());
    }
  }

  /**
   * Step out of the current event zone. The Java original snapped to whichever
   * neighboring tile had a different zone id, which assumes the zone is a thin
   * border. Eppi Forest is a wide zone that also wraps around the village
   * entrance's own (different) zone, so that neighbor scan can find the
   * entrance itself as the "different" tile and walk the player straight into
   * it. Snapping back to the tile the player stepped from instead works for
   * any zone shape and matches the actual intent - undo the step that
   * triggered the event.
   */
  public static getOutOfCurrentZone(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    const curx = MainEngine.getPrevPx();
    const cury = MainEngine.getPrevPy();
    player.setxy(curx * 16, cury * 16);

    // regroup() (called from PSMenu.endScene()) re-anchors the player to the
    // stored event tile - the tile that triggered this script. Without this,
    // it would snap the player right back onto the tile we just left,
    // silently undoing the walk-back the instant the scene finishes fading.
    MainEngine.setEventTile(curx, cury);
  }

  /**
   * Environmental damage for lava and gas - direct port of Java damageParty()
   */
  public static async damageParty(damage: number, scene: PSSceneType): Promise<void> {
    // Java flashed the screen white for one frame
    this.currentScene?.cameras.main.flash(100, 255, 255, 255);

    let sceneStarted = false;
    for (const p of this.getParty().getMembers()) {
      if (p.getHp() > 0) {
        if (p.getHp() <= damage) {
          p.setHp(0);
          if (!sceneStarted) {
            await PSMenu.startScene(scene, SpecialEntity.NONE);
            sceneStarted = true;
          }
          await PSMenu.StextLast(this.getString("Battle_Player_Died", "<player>", p.getName()));
        } else {
          p.setHp(p.getHp() - damage);
        }
      }
    }

    if (sceneStarted) {
      await PSMenu.endScene();

      if (!this.checkAlive()) {
        await this.gameOverRoutine();
      } else if (!this.gameData.onGroundVehicle) {
        await this.getParty().reallocate();
      }
    }
  }

  // ------------------------------------------------------------------
  // Spaceship travel (Hapsby) - direct port of the Java routines
  // ------------------------------------------------------------------

  public static getFromCity(): City | null { return this.fromCity; }
  public static setFromCity(city: City | null): void { this.fromCity = city; }
  public static getToCity(): City | null { return this.toCity; }
  public static setToCity(city: City | null): void { this.toCity = city; }

  /** Wait a number of engine frames (~16ms each) outside the menu system */
  public static waitFrames(frames: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const scene = this.currentScene;
      if (!scene) { resolve(); return; }
      let count = 0;
      const step = () => {
        if (++count >= frames) { resolve(); return; }
        scene.time.delayedCall(16, step);
      };
      scene.time.delayedCall(16, step);
    });
  }

  /**
   * Hapsby travel menu - direct port of Java hapsbyRoutine()
   */
  public static async hapsbyRoutine(city: City): Promise<void> {
    let numCity = 0;
    switch (city) {
      case City.GOTHIC: numCity = 1; break;
      case City.UZO: numCity = 2; break;
      case City.SKURE: numCity = 3; break;
    }

    const options = [
      this.getString("City_Gothic"),
      this.getString("City_Uzo"),
      this.getString("City_Skure")
    ];

    let opt = 0;
    while (true) {
      opt = await PSMenu.PromptNext(this.getString("Hapsby_Travel"), options);
      if (opt === 0) {
        break;
      }
      if (opt === numCity) {
        switch (city) {
          case City.GOTHIC: await PSMenu.StextNext(this.getString("Hapsby_Already_Gothic")); break;
          case City.UZO: await PSMenu.StextNext(this.getString("Hapsby_Already_Uzo")); break;
          case City.SKURE: await PSMenu.StextNext(this.getString("Hapsby_Already_Skure")); break;
        }
      } else if (opt === 1) {
        if (await PSMenu.PromptNext(this.getString("Hapsby_Choice_Gothic"), this.getYesNo()) === 1) {
          break;
        }
      } else if (opt === 2) {
        if (await PSMenu.PromptNext(this.getString("Hapsby_Choice_Uzo"), this.getYesNo()) === 1) {
          break;
        }
      } else if (opt === 3) {
        if (await PSMenu.PromptNext(this.getString("Hapsby_Choice_Skure"), this.getYesNo()) === 1) {
          break;
        }
      }
    }

    if (opt !== 0) {
      switch (opt) {
        case 1: await this.spaceshipRoutineStart(city, City.GOTHIC); break;
        case 2: await this.spaceshipRoutineStart(city, City.UZO); break;
        case 3: await this.spaceshipRoutineStart(city, City.SKURE); break;
      }
    }
  }

  /**
   * Leave the current city for the launch pad on the planet map -
   * direct port of Java spaceshipRoutineStart()
   */
  public static async spaceshipRoutineStart(from: City, to: City): Promise<void> {
    this.setFromCity(from);
    this.setToCity(to);

    switch (from) {
      case City.CAMINEET:
        await this.mapswitchShip(Planet.PALMA, 70, 46);
        break;
      case City.PASEO:
        await this.mapswitchShip(Planet.MOTAVIA, 79, 43);
        break;
      case City.GOTHIC:
        await this.mapswitchShip(Planet.PALMA, 52, 56);
        break;
      case City.UZO:
        await this.mapswitchShip(Planet.MOTAVIA, 92, 64);
        break;
      case City.SKURE:
        await this.mapswitchShip(Planet.DEZORIS, 171, 72);
        break;
    }
  }

  /**
   * Switch to a planet map for the spaceship launch - direct port of
   * Java mapswitchShip() (no fade, no music; the launch animation follows)
   */
  public static async mapswitchShip(planet: Planet, x: number, y: number): Promise<void> {
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_city = null;
    this.gameData.current_planet = planet;

    PSMenu.setMapOff();
    if (!ScriptEngine.screenFadedOut) {
      await ScriptEngine.fadeout(1, true); // Java: screen.paintBlack()
    }

    await this.mapswitch(PlanetHelper.getMapPath(planet), x, y, false);
    this.stopMusic(); // don't play music - the launch animation starts it
  }

  /**
   * Spaceship launch animation - direct port of Java spaceshipRoutineAnimation().
   * The ship rises from the launch pad, the screen fades, and the Space map loads.
   */
  public static async spaceshipRoutineAnimation(chrSpaceship: string): Promise<void> {
    // Java chr paths: "space/spaceship1.chr" / "space/spaceship2.chr"
    const chrName = chrSpaceship.includes('2') ? 'Spaceship2.anim.json' : 'Spaceship1.anim.json';
    await this.getParty().embark(this.getgotox(), this.getgotoy(), chrName, 'src/demos/ps/space');
    this.playSound(PS1Sound.SPACESHIP);
    MainEngine.setEntitiesPaused(true);
    PSMenu.menuOff();
    this.transportOff();
    await ScriptEngine.fadein(1, true);

    const e = MainEngine.getPlayer();
    const inputManager = (this.currentScene as any)?.inputManager;

    let velocity = 0;
    while (velocity++ < 320) {
      if (velocity > 150 && inputManager?.b1) {
        inputManager.unpress(1);
        break;
      }

      e?.incy(-Math.floor(velocity / 25));
      if (velocity % 5 === 0 || velocity % 16 === 0) {
        velocity++;
      }

      await this.waitFrames(1);
    }

    await ScriptEngine.fadeout(20, true);
    this.setgotoxy(9, 93);
    await this.playMusic(PS1Music.VEHICLE);
    await this.mapswitch('Space.map', 9, 93, false, 'src/demos/ps/space');
  }

  /**
   * Spaceship arrival - direct port of Java spaceshipRoutineEnd().
   * Called by the Space map script; the ship flies up to the destination
   * planet, then the destination city map loads.
   */
  public static async spaceshipRoutineEnd(): Promise<void> {
    const chrName = (this.getFromCity() === City.CAMINEET || this.getFromCity() === City.PASEO)
      ? 'Spaceship1.anim.json' : 'Spaceship2.anim.json';
    await this.getParty().embark(this.getgotox(), this.getgotoy(), chrName, 'src/demos/ps/space');

    await ScriptEngine.fadein(30, true);
    const e = MainEngine.getPlayer();
    const inputManager = (this.currentScene as any)?.inputManager;

    let count = 0;
    while (count++ < 300) {
      if (inputManager?.b1) {
        inputManager.unpress(1);
        break;
      }
      if (count > 15) {
        e?.incy(-5);
      }
      await this.waitFrames(1);
    }

    switch (this.getToCity()) {
      case City.CAMINEET:
        await this.mapswitchToCity(City.SPACEPORT1, 7, 6);
        break;
      case City.PASEO:
        this.gameData.visitedCities.add(City.PASEO);
        await this.mapswitchToCity(City.SPACEPORT2, 17, 18);
        break;
      case City.GOTHIC:
        await this.mapswitchToCity(City.GOTHIC, 4, 21);
        break;
      case City.UZO:
        await this.mapswitchToCity(City.UZO, 30, 19);
        break;
      case City.SKURE:
        this.gameData.visitedCities.add(City.SKURE);
        await this.mapswitchToCity(City.SKURE_ENTRANCE, 20, 14);
        break;
    }
  }

  /**
   * Ending sequence - direct port of Java endGameRoutine()
   */
  public static async endGameRoutine(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BAYA, SpecialEntity.NONE);
    await this.playMusic(PS1Music.ENDING);

    // Java: palette-swap of the sky from dark to bright blue - approximated
    // with background tints since the Phaser port has no per-pixel recolor
    for (let i = 0; i < 24; i++) {
      PSMenu.instance.back?.setTint((0 << 16) | (Math.min(255, (i + 1) * 10) << 8) | 255);
      await PSMenu.instance.waitDelay(3);
    }
    PSMenu.instance.back?.clearTint();

    await PSMenu.Stext(this.getString("Cinematic_Ending_1"));

    await PSMenu.startScene(PSSceneType.CORRIDOR, SpecialEntity.NONE);
    await PSMenu.cinematicText(await this.getVImage(PS1Image.CINE_ALIS), [this.getString("Cinematic_Ending_2")]);
    await PSMenu.cinematicText(await this.getVImage(PS1Image.CINE_ODIN), [this.getString("Cinematic_Ending_3")]);
    await PSMenu.cinematicText(await this.getVImage(PS1Image.CINE_NOAH), [this.getString("Cinematic_Ending_4")]);
    await PSMenu.cinematicText(await this.getVImage(PS1Image.CINE_MYAU), [this.getString("Cinematic_Ending_5")]);
    await PSMenu.cinematicText(await this.getVImage(PS1Image.CINE_ALIS), [this.getString("Cinematic_Ending_6")]);
    await PSMenu.endScene();

    await PSMenu.startScene(PSSceneType.ENDING, SpecialEntity.NONE);
    await PSMenu.instance.waitAnyButton();
    await PSMenu.endScene();

    PSMenu.setMapOff();
    await this.exitToTitle();
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
   * Returns a promise that resolves once playback has actually started
   * (first use of a sound loads the file asynchronously). Callers that
   * need the sound to begin before continuing can await it.
   */
  public static playSound(sound: PS1Sound): Promise<void> {
    if (!sound) {
      console.error("PSGame: Sound is null");
      return Promise.resolve();
    }

    if (!this.currentScene) {
      console.error("PSGame: No current scene to play sound");
      return Promise.resolve();
    }

    // Sound effect assets are recorded much quieter than the VGM music, so
    // boost the configured volume 4x (soundVolume 50 → 2.0 WebAudio gain).
    // Phaser's WebAudio path supports gain > 1.0.
    const sfxVolume = this.gameData.soundVolume * 4 / 100;

    return new Promise((resolve) => {
      try {
        // Get sound path
        const soundPath = sound as string;

        // Create audio key from filename
        const audioKey = soundPath.split('/').pop()?.replace('.wav', '') || 'unknown';

        // Check if sound needs to be loaded in Phaser's cache
        if (!this.currentScene!.cache.audio.exists(audioKey)) {
          // Load the sound first
          this.currentScene!.load.audio(audioKey, soundPath);
          this.currentScene!.load.once('complete', () => {
            // Play sound once loaded (the master volume from the emulator UI is
            // applied on top by Phaser's sound manager)
            this.currentScene!.sound.play(audioKey, { volume: sfxVolume });
            resolve();
          });
          this.currentScene!.load.start();
        } else {
          // Sound already loaded in Phaser, play it directly
          this.currentScene!.sound.play(audioKey, { volume: sfxVolume });
          resolve();
        }

        // Cache the sound path for reference
        if (!this.soundLIB.has(sound)) {
          this.soundLIB.set(sound, soundPath);
        }
      } catch (error) {
        console.error(`PSGame: Error playing sound ${sound}:`, error);
        resolve();
      }
    });
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
    await this.playMusic(PS1Music.CHURCH);

    const mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + this.getParty().mst, true);
    PSMenu.instance.push(mstBox);

    let resurrected = false;
    const option = await PSMenu.Prompt(this.getString("Church_Welcome"), this.getYesNo());
    if (option === 1) { // Yes

      if (this.getParty().partySize() === 1) {
        await PSMenu.StextNext(this.getString("Church_Alive", "<player>", this.getParty().getMember(0)!.getName()));
      } else {

        let reviveWho = await PSMenu.PromptNext(this.getString("Church_Who"), this.getParty().listMembers());
        while (reviveWho > 0) {
          const p = this.getParty().getMember(reviveWho - 1);
          if (p) {
            if (p.getHp() > 0) {
              await PSMenu.StextNext(this.getString("Church_Alive", "<player>", p.getName()));
            } else {
              const cost = p.getLevel() * 20 * costMultiplier;
              const optRevive = await PSMenu.PromptNext(this.getString("Church_Pay", "<number>", cost.toString()), this.getYesNo());
              if (optRevive === 1) { // Yes
                if (this.getParty().mst >= cost) {
                  await PSMenu.StextNext(this.getString("Church_Choose"));
                  // Sound must be audible before the incantation text starts writing
                  await this.playSound(PS1Sound.REVIVE);
                  await PSMenu.StextNext(this.getString("Church_Incantation"));
                  this.getParty().mst -= cost;
                  mstBox.updateText(0, "MST " + this.getParty().mst);
                  p.heal();
                  resurrected = true;
                } else {
                  await PSMenu.StextNext(this.getString("Church_Choose"));
                  await PSMenu.StextNext(this.getString("Church_Fail"));
                  await PSMenu.StextNext(this.getString("Church_Apologies"));
                }
              }
            }
          }

          reviveWho = await PSMenu.PromptNext(this.getString("Church_Other"), this.getParty().listMembers());
        }
      }
    }

    await PSMenu.StextNext(this.getString("Church_End"));
    await PSMenu.StextNext(this.getString("Church_LevelBegin"));
    for (let i = 0; i < this.getParty().partySize(); i++) {
      const p = this.getParty().getMember(i);
      if (p && p.getHp() > 0) {
        const remainingXp = JobHelper.getXp(p.getJob(), p.getLevel() + 1) - p.getXp();
        if (i + 1 < this.getParty().partySize()) {
          await PSMenu.StextNext(this.getString("Church_LevelUp", "<player>", p.getName(), "<number>", remainingXp.toString()));
        } else {
          await PSMenu.StextLast(this.getString("Church_LevelUp", "<player>", p.getName(), "<number>", remainingXp.toString()));
        }
      }
    }

    PSMenu.instance.pop(); // mstBox

    if (resurrected) {
      await this.getParty().reallocate();
    }

    this.findAndPlayMusic();
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
      await new Promise(resolve => setTimeout(resolve, GameSpeed.scaleDelay(8)));
    }

    // Do NOT unpause/unlock here: the walk ends exactly on Palma's camineet or
    // parolit entrance zone tile, and one free engine tick fires that zone,
    // starting a second mapswitch that clobbers this one's gotoxy. The
    // destination city's startmap unlocks and calls menuOn() after fade-in.
    await this.mapswitchToCity(destiny, gotox, gotoy);
  }

  /**
   * Fixed battle - battle with predetermined enemies
   */
  public static async fixedBattle(scene: PSSceneType, enemies: any[]): Promise<BattleOutcome> {
    console.log(`PSGame.fixedBattle: Starting fixed battle in ${scene} with ${enemies.length} enemies`);

    // Debug cheat: encounters disabled via the Talk menu
    if (this.battlesOff) {
      return BattleOutcome.WIN;
    }

    // Diminish battle frequency when on transport (Java parity)
    if (this.isOnTransport() && ScriptEngine.random(1, 2) === 1) {
      return BattleOutcome.WIN;
    }

    // Convert enemy enums to Enemy instances
    const { PSLibEnemy } = await import('./game/PSLibEnemy');
    const enemyInstances: any[] = [];

    for (const enemyEnum of enemies) {
      const enemyInstance = PSLibEnemy.getEnemyByEnum(enemyEnum);
      if (enemyInstance) {
        enemyInstances.push(enemyInstance);
        this.gameData.visitedEnemies.add(enemyEnum);
      } else {
        console.error(`PSGame.fixedBattle: Could not find enemy for enum ${enemyEnum}`);
      }
    }

    const { PSBattle } = await import('./battle/PSBattle');

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

    // Debug cheat: encounters disabled via the Talk menu
    if (this.battlesOff) {
      return BattleOutcome.WIN;
    }

    // Diminish battle frequency when on transport (Java parity)
    if (this.isOnTransport() && ScriptEngine.random(1, 2) === 1) {
      return BattleOutcome.WIN;
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
    this.gameData.visitedEnemies.add(selectedEnemyEnum);

    // Remove easy fights when on transport (Java parity)
    if (this.isOnTransport() && selectedEnemy.hp < 40) {
      return BattleOutcome.WIN;
    }

    // Determine random quantity based on party size (original PS1 rule: party.size * 2)
    const partySize = PSGame.getParty().getMembers().length;
    const maxByParty = partySize * 2;
    const maxByEnemy = selectedEnemy.getMaxNum() || 8; // fallback to 8
    const absoluteMax = PSGame.getCurrentDungeon() ? 4 : 8; // dungeon limit of 4
    const effectiveMax = Math.min(maxByParty, maxByEnemy, absoluteMax);
    const quantity = Math.floor(Math.random() * effectiveMax) + 1;

    const { PSBattle } = await import('./battle/PSBattle');

    const battle = new PSBattle();
    return await battle.battleScene(scene, selectedEnemy, quantity);
  }

  /**
   * Start battle with specific enemy and quantity
   */
  public static async startBattle(scene: PSSceneType, enemy: Enemy, quantity: number = 1): Promise<BattleOutcome> {
    console.log(`PSGame.startBattle: Starting battle with ${quantity} ${enemy.getName()}(s)`);

    const { PSBattle } = await import('./battle/PSBattle');

    const battle = new PSBattle();
    return await battle.battleScene(scene, enemy, quantity);
  }

  /**
   * Game over routine - direct port of Java gameOverRoutine().
   * Plays the game-over music, shows the defeat texts over whatever is on
   * screen (battle scene or map), then returns to the title screen
   * (Java: setMapOff + mapswitch("Title.map", 0, 0, false)).
   */
  public static async gameOverRoutine(): Promise<void> {
    console.log("PSGame: Game Over routine started");

    this.stopMusic();
    await this.playMusic(PS1Music.GAMEOVER);

    if (this.getParty().getMembers().length > 1) {
      await PSMenu.StextNext(this.getString("Battle_Lost"));
    }
    await PSMenu.StextLast(this.getString("Battle_End_Game", "<player>", this.getParty().getMember(0)!.getName()));

    PSMenu.setMapOff();
    await this.exitToTitle();
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
    // A game over (or quit) can arrive mid-battle or inside a first-person
    // dungeon; drop the gates those set so the next run starts clean
    ScriptEngine.setEntitiesPaused(false);
    MainEngine.setScriptActive(false);
    MainEngine.setPlayerControlsSuspended(false);
    MainEngine.setMapTransitionActive(false);
    const { PSDungeon } = await import('./PSDungeon');
    PSDungeon.setIsInsideDungeon(false);
    if (scene) {
      scene.scene.start('PSTitleScene', { config: (scene as any).config });
    }
  }

  /**
   * Check if party can transport (for battle system)
   */
  public static get canTransport(): boolean {
    return this.canTransportFlag;
  }

  /**
   * Transport on - direct port from Java transportOn()
   */
  public static transportOn(): void {
    this.canTransportFlag = true;
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

    // 4. Members who know the Trap (Untrap) spell get a third prompt option
    const membersWhoKnowTrap = this.getParty().getMembers()
      .filter(pm => pm.spells.some(s => s.getEffect() === Effect.TRAP));

    // 5. Ask "Open chest?" — Yes / [Untrap] / No
    let openChest = 0;
    let trapSpell = false;
    if (membersWhoKnowTrap.length > 0) {
      openChest = await PSMenu.PromptNext(this.getString("Chest_Open"),
        [this.getString("Menu_Choice_Yes"), this.getString("Spell_Untrap"), this.getString("Menu_Choice_No")]);
      if (openChest === 2) {
        // Cast Untrap with the first member who can pay the MP cost
        let chosenMember = membersWhoKnowTrap[0];
        let counter = 0;
        while (chosenMember.getMp() < SpellFactory.createSpell(PS1Spell.TRAP).getMpCost()
               && counter < membersWhoKnowTrap.length - 1) {
          chosenMember = membersWhoKnowTrap[++counter];
        }

        const trapSpellObj = SpellFactory.createSpell(PS1Spell.TRAP);
        const effect = await PSLibSpell.prepareSpell(trapSpellObj, chosenMember);
        if (effect) {
          // TRAP_CHEST is a no-op effect: the spell just spends MP and always
          // "removes" the trap — the chest opens safely below
          effect.setEffect(Effect.TRAP_CHEST);
          await PSLibSpell.castSpell(trapSpellObj, effect);
          trapSpell = true;
        } else {
          openChest = 3; // no MP: falls through to "not opened"
        }
      }
    } else {
      openChest = await PSMenu.PromptNext(this.getString("Chest_Open"), this.getYesNo());
    }

    let chestOpened = false;

    if (openChest === 1 || (openChest === 2 && membersWhoKnowTrap.length > 0)) {
      this.playSound(PS1Sound.CHEST);

      // 6. Opening animation + trap resolution (Java: traps have no text of
      //    their own — the animation, sound and damage tell the story)
      if (trapSpell) {
        if (trapped === Trapped.NO_TRAP) {
          await PSMenu.StextLast(this.getString("Dungeon_No_Trap"));
        } else {
          await PSMenu.StextLast(this.getString("Dungeon_Trap"));
        }
        chestSprite.animate(MenuState.ANIM1);
      } else if (trapped === Trapped.NO_TRAP) {
        chestSprite.animate(MenuState.ANIM1);
      } else if (trapped === Trapped.EXPLOSION) {
        chestSprite.animate(MenuState.ANIM1);
        await PSMenu.instance.waitAnimationEnd(chestSprite);

        chestSprite.animate(MenuState.ANIM2);
        this.playSound(PS1Sound.TRAP_EXPLOSION);
        // Damage all alive members
        for (const member of this.getParty().getMembers()) {
          if (member.getHp() > 0) {
            member.setHp(Math.max(1, member.getHp() - ScriptEngine.random(10, 25)
              - Math.floor((member.getMaxHp() * ScriptEngine.random(20, 30)) / 100)));
          }
        }
      } else if (trapped === Trapped.ARROW) {
        chestSprite.animate(MenuState.ANIM1);
        await PSMenu.instance.waitAnimationEnd(chestSprite);

        chestSprite.animate(MenuState.ANIM3);
        this.playSound(PS1Sound.TRAP_ARROW);
        // Damage one random alive member
        const members = this.getParty().getMembers();
        let randomMember = members[ScriptEngine.random(0, members.length - 1)];
        while (randomMember.getHp() <= 0) {
          randomMember = members[ScriptEngine.random(0, members.length - 1)];
        }
        randomMember.setHp(Math.max(1, randomMember.getHp() - ScriptEngine.random(5, 15)
          - Math.floor((randomMember.getMaxHp() * ScriptEngine.random(10, 15)) / 100)));
      }

      await PSMenu.instance.waitAnimationEnd(chestSprite);

      // 7. Rewards
      chestOpened = true;
      if (mesetas > 0) {
        if (!item) {
          await PSMenu.StextLast(this.getString("Chest_Mesetas", "<number>", mesetas.toString()));
        } else {
          await PSMenu.StextNext(this.getString("Chest_Mesetas", "<number>", mesetas.toString()));
        }
        this.getParty().addMesetas(mesetas);
      }
      if (item) {
        await PSMenu.StextLast(this.getString("Chest_Item", "<item>", item.getName()));
        if (item.type === ItemType.QUEST) {
          this.getParty().addQuestItem(item);
        } else {
          // A full inventory refuses the item — the chest stays closed so the
          // player can come back for it
          chestOpened = this.getParty().checkForFullAndAddItem(item);
        }
      }
      if (mesetas === 0 && !item) {
        await PSMenu.StextLast(this.getString("Chest_Empty"));
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
