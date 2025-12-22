/**
 * GameData - Game State Management
 * Stores all game data including party, flags, and settings
 */

import { Planet } from './City';
import { Dungeon } from './Dungeon';
import { City } from './City';
import { Party } from './Party';
import { PS1Enemy } from './PSLibEnemy';

// Game configuration enums
export enum GameType {
  PS_ORIGINAL,
  PS_START_AS_ODIN,
  PS_START_AS_NOAH,
  PS_PARTY,
  PS_EXTENDED,
  PS_ARENA
}

export enum ScreenSize {
  SCREEN_320_240,
  SCREEN_640_480
}

// Game flags
export enum Flags {
  VISIT_SUELO,
  VISIT_NEKISE,
  SCION_INSIST_1,
  SCION_INSIST_2,
  GOT_MYAU,
  GOT_ODIN,
  INFO_KEY,
  GOVERNOR_CAKE,
  MET_GOVERNOR,
  GOT_NOAH
  // Note: This enum likely has more entries in the full Java file
}

// Chest flags
export enum Chest {
  WAREHOUSE_CHEST1,
  WAREHOUSE_CHESTKEY,
  ODIN_CHEST1,
  ODIN_CHEST2,
  ODIN_COMPASS,
  IALA_CAVE_CHEST1,
  IALA_CAVE_CHEST2,
  IALA_CAVE_CHEST3
  // Note: This enum likely has more entries in the full Java file
}

// Trap flags
export enum Trap {
  BAYA_MALAY_TRAP1,
  INFO_BAYA_MALAY_TRAP1,
  BAYA_MALAY_TRAP2,
  INFO_BAYA_MALAY_TRAP2,
  BAYA_MALAY_TRAP3,
  INFO_BAYA_MALAY_TRAP3,
  BAYA_MALAY_TRAP4,
  INFO_BAYA_MALAY_TRAP4,
  CORONA_TRAP1,
  INFO_CORONA_TRAP1,
  CORONA_TRAP2,
  INFO_CORONA_TRAP2,
  CORONA_TRAP3,
  INFO_CORONA_TRAP3,
  CORONA_TRAP4,
  INFO_CORONA_TRAP4,
  CORONA_TRAP5,
  INFO_CORONA_TRAP5
  // Note: This enum likely has more entries in the full Java file
}

// Trapped chest types
export enum Trapped {
  NO_TRAP,
  EXPLOSION,
  FLASH,
  ARROW
}

export class GameData {
  // Options
  public musicVolume: number = 30; // 0-100
  public soundVolume: number = 50; // 0-100
  public dungeonDelay: number = 4; // varies between 1-4
  public battleInformation: boolean = true;
  public locale: string = 'en'; // Simplified from Java Locale

  // Game state flags using Set instead of Java EnumSet
  public flags: Set<Flags> = new Set();
  public chestFlags: Set<Chest> = new Set();
  public trapFlags: Set<Trap> = new Set();
  public visitedCities: Set<City> = new Set();
  public visitedEnemies: Set<PS1Enemy> = new Set();

  // Game configuration
  private gameType: GameType | null = null;
  private screenSize: ScreenSize | null = null;

  // Current location
  public current_planet: Planet | null = null;
  public current_dungeon: Dungeon = Dungeon.NONE;
  public current_city: City | null = null;

  // Party data
  private party: Party | null = null;

  // Vehicle status
  public onWaterVehicle: boolean = false;
  public onGroundVehicle: boolean = false;

  // Position and dungeon state
  public gotox: number = 0;
  public gotoy: number = 0;
  public dungeonFace: number = 1;
  public dungeonFloor: number = 0;

  // Debug options
  public enableCheats: boolean = false;

  // Getters and setters - direct port from Java
  public getParty(): Party | null {
    return this.party;
  }

  public setParty(party: Party): void {
    this.party = party;
  }

  public getGameType(): GameType | null {
    return this.gameType;
  }

  public setGameType(gameType: GameType): void {
    this.gameType = gameType;
  }

  public getScreenSize(): ScreenSize | null {
    return this.screenSize;
  }

  public setScreenSize(screenSize: ScreenSize): void {
    this.screenSize = screenSize;
  }

  // Save and load methods (TypeScript/browser adaptation)
  // Note: Browser storage would use localStorage/sessionStorage instead of file I/O

  /**
   * Save game data to browser storage
   */
  public static save(gameData: GameData, key: string): void {
    try {
      const serialized = JSON.stringify({
        musicVolume: gameData.musicVolume,
        soundVolume: gameData.soundVolume,
        dungeonDelay: gameData.dungeonDelay,
        battleInformation: gameData.battleInformation,
        locale: gameData.locale,
        flags: Array.from(gameData.flags),
        chestFlags: Array.from(gameData.chestFlags),
        trapFlags: Array.from(gameData.trapFlags),
        visitedCities: Array.from(gameData.visitedCities),
        visitedEnemies: Array.from(gameData.visitedEnemies),
        gameType: gameData.gameType,
        screenSize: gameData.screenSize,
        current_planet: gameData.current_planet,
        current_dungeon: gameData.current_dungeon,
        current_city: gameData.current_city,
        party: gameData.party,
        onWaterVehicle: gameData.onWaterVehicle,
        onGroundVehicle: gameData.onGroundVehicle,
        gotox: gameData.gotox,
        gotoy: gameData.gotoy,
        dungeonFace: gameData.dungeonFace,
        dungeonFloor: gameData.dungeonFloor,
        enableCheats: gameData.enableCheats
      });
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  /**
   * Load game data from browser storage
   */
  public static load(key: string): GameData | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return null;
      }

      const data = JSON.parse(serialized);
      const gameData = new GameData();

      // Restore primitive values
      gameData.musicVolume = data.musicVolume || 30;
      gameData.soundVolume = data.soundVolume || 50;
      gameData.dungeonDelay = data.dungeonDelay || 4;
      gameData.battleInformation = data.battleInformation !== undefined ? data.battleInformation : true;
      gameData.locale = data.locale || 'en';
      gameData.gameType = data.gameType || null;
      gameData.screenSize = data.screenSize || null;
      gameData.current_planet = data.current_planet || null;
      gameData.current_dungeon = data.current_dungeon || null;
      gameData.current_city = data.current_city || null;
      gameData.party = data.party || null;
      gameData.onWaterVehicle = data.onWaterVehicle || false;
      gameData.onGroundVehicle = data.onGroundVehicle || false;
      gameData.gotox = data.gotox || 0;
      gameData.gotoy = data.gotoy || 0;
      gameData.dungeonFace = data.dungeonFace || 0;
      gameData.dungeonFloor = data.dungeonFloor || 0;
      gameData.enableCheats = data.enableCheats || false;

      // Restore sets
      gameData.flags = new Set(data.flags || []);
      gameData.chestFlags = new Set(data.chestFlags || []);
      gameData.trapFlags = new Set(data.trapFlags || []);
      gameData.visitedCities = new Set(data.visitedCities || []);
      gameData.visitedEnemies = new Set(data.visitedEnemies || []);

      return gameData;
    } catch (error) {
      console.error('Error loading game data:', error);
      return null;
    }
  }
}