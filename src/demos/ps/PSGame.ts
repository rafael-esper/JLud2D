/**
 * PSGame - Phantasy Star Game Management
 * Port of PSGame.java - Core game state and resource management
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { PS1Music } from './game/PSLibMusic';
import { PS1Image } from './game/PSLibImage';
import { PS1Sound } from './game/PSLibSound';
import { Party } from './game/Party';
import { Planet, City, CityHelper } from './game/City';
import { ScreenSize, GameType, Flags, GameData } from './game/GameData';
import { Dungeon } from './game/Dungeon';
import { CHR } from '../../domain/CHR';
import { PS1CHR, PS1CHRHelper } from './game/PSLibCHR';
import { Item } from './game/Item';
import { OriginalItem, PSLibItem } from './game/PSLibItem';


export class PSGame {
  public static gameData: GameData = new GameData();
  private static currentScene: Phaser.Scene | null = null;
  private static party: Party | null = null;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static currentCity: any = null; // Current city for music and location
  private static currentMusic: PS1Music | null = null; // Track currently playing music

  // Sound library cache (equivalent to Java soundLIB HashMap)
  private static soundLIB: Map<PS1Sound, string> = new Map();

  // CHR library cache (equivalent to Java chrLIB HashMap)
  private static chrLIB: Map<PS1CHR, CHR> = new Map();

  // Localization strings (simplified for demo - in original this loads from resource bundles)
  private static strings: { [key: string]: string } = {
    "Title_Newgame": "New Game",
    "Title_Loadgame": "Load Game",
    "Title_Credits": "Credits",
    "Title_Options_Language": "Language",
    "Title_Newgame_Alis": "Start as Alis",
    "Title_Newgame_Odin": "Start as Odin",
    "Title_Newgame_Noah": "Start as Noah",
    "Title_Newgame_Party": "Start as Party",
    "Title_Newgame_Extended": "Extended Game",
    "Title_Newgame_PSArena": "PS Arena",
    "Title_Credits_About": "About",
    "Title_Credits_Game": "Game Credits",
    "Title_Credits_Contact": "Contact",
    // Camineet house strings
    "Camineet_House_Alis": "Welcome to Alis's house! This is where your adventure began.",
    "Camineet_House_Alis_Odin": "This house holds memories of Alis...",
    "Camineet_House_Man": "Hello there! Welcome to our town.",
    "Camineet_House_Oldman": "Would you like to hear about the crisis?",
    "Camineet_House_Oldman_Yes": "Yes, dark times have fallen upon our land...",
    "Camineet_House_Oldman_No": "Very well.",
    "Camineet_House_Oldman_NoCrisis": "Perhaps you will change your mind later.",
    "Camineet_House_Nekise_intro": "Welcome, young traveler! I have something for you.",
    "Camineet_House_Nekise_greet": "Hello again! How goes your quest?",
    "Camineet_House_Nekise_Odin": "Greetings, Odin. The road is dangerous.",
    "Camineet_House_Suelo_intro1": "Welcome to my humble dwelling.",
    "Camineet_House_Suelo_intro2": "I can help heal your wounds.",
    "Camineet_House_Suelo_intro3": "Please rest here whenever you need.",
    "Camineet_House_Suelo_greet": "Welcome back! Let me heal you.",
    "Camineet_House_Suelo_Odin": "Odin, you look weary. Rest here.",
    // Shop strings
    "Shop_Weapon_Welcome": "Welcome to our weapon shop!",
    "Shop_Pharmacy_Welcome": "Welcome to our pharmacy!",
    "Shop_Tool_Welcome": "Welcome to our tool shop!",
    // Citizen strings
    "Camineet_People_Ent1": "The town has been peaceful lately.",
    "Camineet_People_Ent2": "Have you heard the latest news?",
    "Camineet_People_Ent3": "Be careful out there, traveler.",
    "Camineet_People_Ent4": "The shops have good wares today.",
    "Camineet_People_Cop_No_Pass": "You need a Road Pass to enter the spaceport.",
    "Camineet_People_Cop_Pass": "Your Road Pass is in order. You may proceed.",
    "Camineet_People_Cop1": "I am programmed to protect this city.",
    "Camineet_People_Cop2": "Security protocols are active."
  };

  /**
   * Initialize game screen with specified size
   */
  public static initGameScreen(screenSize: ScreenSize): void {
    this.gameData.setScreenSize(screenSize);
    console.log(`PSGame: Initialized with screen size ${screenSize === ScreenSize.SCREEN_320_240 ? '320x240' : '640x480'}`);
  }

  /**
   * Play VGM music
   */
  public static async playMusic(music: PS1Music): Promise<void> {
    // Don't change music if the same music is already playing
    if (this.currentMusic === music) {
      console.log(`PSGame: Music ${music} is already playing, skipping`);
      return;
    }

    const musicPath = music as string;
    console.log(`PSGame: Playing music ${musicPath}`);
    await ScriptEngine.loadVGM('ps_current', musicPath);
    ScriptEngine.playmusic('ps_current');
    this.currentMusic = music;
  }

  /**
   * Stop currently playing music
   */
  public static stopMusic(): void {
    ScriptEngine.stopmusic();
    this.currentMusic = null;
  }

  /**
   * Get localized string
   */
  public static getString(key: string): string {
    return this.strings[key] || key;
  }

  /**
   * Get Yes/No choice array for prompts
   */
  public static getYesNo(): string[] {
    return ["Yes", "No"];
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
   * Regroup party members
   */
  public static regroup(x: number, y: number): void {
    console.log(`PSGame: Regrouping party at (${x}, ${y})`);
    // TODO: Implement party regrouping logic
    // This would position party members around the specified coordinates
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
  public static initPSGame(gameType: GameType): void {
    console.log(`PSGame: Initializing game type ${GameType[gameType]}`);

    // Initialize party with specified game type
    this.party = new Party(gameType);

    console.log(`PSGame: Party initialized with ${this.party.partySize()} members`);
  }

  /**
   * Load game (placeholder)
   */
  public static loadGame(): boolean {
    console.log("PSGame: Load game not implemented in demo");
    return false;
  }

  /**
   * Language menu (placeholder)
   */
  public static languageMenu(x: number, y: number): void {
    console.log(`PSGame: Language menu at (${x}, ${y}) not implemented in demo`);
  }

  /**
   * Get current party - direct port from Java
   */
  public static getParty(): Party {
    if (!this.party) {
      throw new Error("Party not initialized - call initPSGame() first");
    }
    return this.party;
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
   * Map switch with string path - base implementation
   */
  public static async mapswitch(mapname: string, x: number, y: number, fade: boolean = true): Promise<void> {
    console.log(`PSGame.mapswitch: Loading map ${mapname} at (${x}, ${y})`);

    MainEngine.setEntitiesPaused(true);
    this.setgotoxy(x, y);
    this.transportOff();

    if (fade) {
      await ScriptEngine.fadeout(30, true);
    }

    MainEngine.setEntitiesPaused(false);
    await ScriptEngine.map(mapname);
  }

  /**
   * Map switch to Planet - explicit method for Planet enum
   */
  public static async mapswitchToPlanet(planet: Planet, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToPlanet: ${Planet[planet]} at (${x}, ${y})`);

    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_planet = planet;
    this.gameData.current_city = null;

    // Import Planet helpers
    const { PlanetHelper } = await import('./game/City');

    // Get planet map path and call base mapswitch
    const mapPath = PlanetHelper.getMapPath(planet);
    await this.mapswitch(mapPath, x, y, true);
    await this.playMusic(PlanetHelper.getMusic(planet));
  }

  /**
   * Map switch to City - explicit method for City enum
   */
  public static async mapswitchToCity(city: City, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToCity: ${City[city]} at (${x}, ${y})`);

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
    await this.mapswitch(CityHelper.getPath(city), x, y, true);
    this.playMusic(CityHelper.getMusic(city));
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
  public static getCurrentCity(): any {
    return this.currentCity;
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
    console.log("PSGame: Menu system activated");
    // In full implementation, this would enable the in-game menu system
    // This would integrate with our ported menu system
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
          // Play sound once loaded
          this.currentScene!.sound.play(audioKey, { volume: 0.7 });
        });
        this.currentScene.load.start();
      } else {
        // Sound already loaded in Phaser, play it directly
        this.currentScene.sound.play(audioKey, { volume: 0.7 });
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
}