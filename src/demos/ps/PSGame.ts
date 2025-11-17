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
import { ScreenSize, GameType } from './game/GameData';

export class PSGameData {
  public enableCheats: boolean = false;
  private screenSize: ScreenSize = ScreenSize.SCREEN_320_240;
  public current_planet: any = null; // Planet enum reference
  public current_dungeon: any = 'NONE'; // Dungeon enum reference
  public current_city: any = null; // City enum reference
  public onGroundVehicle: boolean = false;
  public visitedCities: any[] = [];

  public getScreenSize(): ScreenSize {
    return this.screenSize;
  }

  public setScreenSize(size: ScreenSize): void {
    this.screenSize = size;
  }
}

export class PSGame {
  public static gameData: PSGameData = new PSGameData();
  private static currentScene: Phaser.Scene | null = null;
  private static party: Party | null = null;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static currentCity: any = null; // Current city for music and location
  private static currentMusic: PS1Music | null = null; // Track currently playing music

  // Sound library cache (equivalent to Java soundLIB HashMap)
  private static soundLIB: Map<PS1Sound, string> = new Map();

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
    "Title_Credits_Contact": "Contact"
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
   * Get image resource path
   */
  public static getImage(imageKey: PS1Image | string): string {
    if (typeof imageKey === 'string') {
      return imageKey;
    }
    return imageKey as string;
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
   * Map switch with fade - direct port from Java mapswitch(String, int, int, boolean)
   */
  public static async mapswitch(mapname: string, x: number, y: number, fade: boolean): Promise<void>;

  /**
   * Map switch to City - direct port from Java mapswitch(City, int, int)
   */
  public static async mapswitch(city: any, x: number, y: number): Promise<void>;

  public static async mapswitch(mapnameOrCity: string | any, x: number, y: number, fade?: boolean): Promise<void> {
    // Import Planet and City enums to check for mapswitch type
    const { Planet, PlanetHelper, City, CityHelper } = await import('./game/City');

    console.log(`PSGame.mapswitch: ${mapnameOrCity} (${typeof mapnameOrCity}), Planet values: [${Object.values(Planet)}], City values: [${Object.values(City)}]`);

    if (typeof mapnameOrCity === 'string') {
      // Base mapswitch(mapname, x, y, fade)
      const mapname = mapnameOrCity;
      const shouldFade = fade !== undefined ? fade : true;

      MainEngine.setEntitiesPaused(true);
      this.setgotoxy(x, y);
      this.transportOff();

      if (shouldFade) {
        await ScriptEngine.fadeout(30, true);
      }

      MainEngine.setEntitiesPaused(false);
      await ScriptEngine.map(mapname);

    } else if (typeof mapnameOrCity === 'number' && Object.values(Planet).includes(mapnameOrCity)) {
      // Planet mapswitch(planet, x, y) - check against actual Planet enum values
      console.log(`Taking Planet branch for: ${mapnameOrCity}`);
      const planet = mapnameOrCity as Planet;

      this.gameData.onGroundVehicle = false;
      this.gameData.current_dungeon = 'NONE';
      this.gameData.current_planet = planet;
      this.gameData.current_city = null;

      // Get planet map path and call base mapswitch
      const mapPath = PlanetHelper.getMapPath(planet);
      await this.mapswitch(mapPath, x, y, true);
      await this.playMusic(PlanetHelper.getMusic(planet));

    } else {
      // City mapswitch(city, x, y) - this should catch City.CAMINEET
      console.log(`Taking City branch for: ${mapnameOrCity}`);
      const city = mapnameOrCity;

      if (this.gameData.current_dungeon && this.gameData.current_dungeon !== 'NONE') {
        // PSMenu.setMapOff(); // TODO: Implement when PSMenu is ready
      }

      this.gameData.onGroundVehicle = false;
      this.gameData.current_dungeon = 'NONE';
      this.gameData.current_city = city;
      this.gameData.current_planet = city.planet;

      // Add to visited cities
      if (!this.gameData.visitedCities.includes(city)) {
        this.gameData.visitedCities.push(city);
      }

      // Call base mapswitch with city path
      await this.mapswitch(CityHelper.getPath(city), x, y, true);
      this.playMusic(CityHelper.getMusic(city));
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

      // Cache check - if not cached, load and cache it
      if (!this.soundLIB.has(sound)) {
        this.soundLIB.set(sound, soundPath);

        // Load the sound if not already loaded
        if (!this.currentScene.cache.audio.exists(audioKey)) {
          this.currentScene.load.audio(audioKey, soundPath);
          this.currentScene.load.once('complete', () => {
            // Play sound once loaded
            this.currentScene!.sound.play(audioKey, { volume: 0.7 });
          });
          this.currentScene.load.start();
        } else {
          // Sound already loaded, play it
          this.currentScene.sound.play(audioKey, { volume: 0.7 });
        }
      } else {
        // Sound is cached, play it directly
        this.currentScene.sound.play(audioKey, { volume: 0.7 });
      }
    } catch (error) {
      console.error(`PSGame: Error playing sound ${sound}:`, error);
    }
  }
}