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
  GOT_NOAH,
  LUVENO_INSIST_1,
  LUVENO_INSIST_2,
  LUVENO_FREE,
  GOT_ASSISTANT,
  LUVENO_FEE,
  LUVENO_WAIT1,
  LUVENO_WAIT2,
  LUVENO_WAIT3,
  LUVENO_READY,
  DEFEAT_DRMAD,
  GOT_HAPSBY,
  LUVENO_BOARD,
  SPACESHIP_AREA,
  INFO_FLUTE,
  GOT_FLUTE,
  INFO_HOVER,
  INFO_PERSEUS,
  GOT_TORCH,
  DEFEAT_TAJIMA,
  DEFEAT_GOLD_DRAKE,
  DEFEAT_SHADOW,
  DEFEAT_LASSIC,
  DEFEAT_DARKFALZ,

  MONSTER_IALA_SKELETON,
  MONSTER_MEDUSA,
  MONSTER_NAHARU_DRAGON,
  MONSTER_CASBA_RD_DRAGON,
  MONSTER_CASBA_BL_DRAGON,
  MONSTER_TRIADA_SKELETON,
  MONSTER_TRIADA_ROBOTCOP,
  MONSTER_LOST_ISLAND_DRAGON,
  MONSTER_PRISON_ROBOTCOP,
  MONSTER_SKY_SERPENT,

  // New
  MONSTER_TONOE_SACCUBUS,
  INFO_TONOE_DAUGHTER,
  INFO_GOTHIC_NECRO,

  // Odin Quest
  ODIN_MEDUSA_HISS,
  ODIN_MEDUSA_COMPASS
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
  IALA_CAVE_CHEST3,
  IALA_CAVE_CHEST4,
  IALA_CAVE_CHEST5,
  IALA_CAVE_CHEST6,
  IALA_CAVE_CHEST7,
  IALA_CAVE_CHEST8,
  IALA_CAVE_CHEST9,
  IALA_CAVE_CHEST10,
  IALA_CAVE_CHEST11,
  IALA_CAVE_CHEST12,
  IALA_CAVE_CHEST13,
  IALA_CAVE_CHEST14,
  IALA_CAVE_CHEST15,
  IALA_CAVE_CHEST16,
  IALA_CAVE_CHEST17, // skeleton

  NAULA_CHEST1,
  NAULA_CHEST2,
  NAULA_CHEST3,

  DR_MAD_CHEST,

  MIRROR_SHIELD,

  MEDUSA_TOWER_CHEST1,
  MEDUSA_TOWER_CHEST2,
  MEDUSA_TOWER_CHEST3,
  MEDUSA_TOWER_CHEST4,
  MEDUSA_TOWER_CHEST5,
  MEDUSA_TOWER_CHEST6,
  MEDUSA_TOWER_CHEST7,
  MEDUSA_TOWER_CHEST8,
  MEDUSA_TOWER_CHEST9,
  MEDUSA_TOWER_CHEST10,
  MEDUSA_TOWER_CHEST11,
  MEDUSA_TOWER_CHEST12,
  MEDUSA_TOWER_CHEST13,
  MEDUSA_TOWER_CHEST14,
  MEDUSA_TOWER_CHEST15,
  MEDUSA_TOWER_CHEST16,
  MEDUSA_TOWER_CHEST17,
  MEDUSA_TOWER_CHEST18,
  MEDUSA_TOWER_CHEST19,
  MEDUSA_TOWER_CHEST20,
  MEDUSA_TOWER_CHEST21, // medusa

  LOST_ISLAND_CHEST1,
  LOST_ISLAND_CHEST2,
  LOST_ISLAND_CHEST3,
  LOST_ISLAND_CHEST4,
  LOST_ISLAND_CHEST5,
  LOST_ISLAND_CHEST6,
  LOST_ISLAND_CHEST7,
  LOST_ISLAND_CHEST8,
  LOST_ISLAND_CHEST9,
  LOST_ISLAND_CHEST10,
  LOST_ISLAND_CHEST11,
  LOST_ISLAND_CHEST12,
  LOST_ISLAND_CHEST13,
  LOST_ISLAND_CHEST14,
  LOST_ISLAND_CHEST15, // red dragon

  NAHARU_CHEST1,
  NAHARU_CHEST2,
  NAHARU_CHEST3,
  NAHARU_CHEST4,
  NAHARU_CHEST5,
  NAHARU_CHEST6,
  NAHARU_CHEST7,
  NAHARU_CHEST8,
  NAHARU_CHEST9, // red dragon

  CASBA_CAVE_CHEST1,
  CASBA_CAVE_CHEST2,
  CASBA_CAVE_CHEST3,
  CASBA_CAVE_CHEST4,
  CASBA_CAVE_CHEST5,
  CASBA_CAVE_CHEST6, // bl dragon
  CASBA_CAVE_CHEST7, // red dragon

  TAJIMA_CAVE_CHEST1,
  TAJIMA_CAVE_CHEST2,
  TAJIMA_CAVE_CHEST3,
  TAJIMA_CAVE_CHEST4,
  TAJIMA_CAVE_CHEST5,
  TAJIMA_CAVE_CHEST6,
  TAJIMA_CAVE_CHEST7,
  TAJIMA_CAVE_CHEST8,
  TAJIMA_CAVE_CHEST9,
  TAJIMA_CAVE_CHEST10,
  TAJIMA_CAVE_CHEST11,
  TAJIMA_CAVE_CHEST12,
  TAJIMA_CAVE_CHEST13,

  BORTEVO_CHEST1,
  BORTEVO_CHEST2,
  BORTEVO_CHEST3,
  BORTEVO_CHEST4,

  ABION_CHEST1,
  ABION_CHEST2,

  SKURE_CHEST,

  DEZO_CAVE1_CHEST1,
  DEZO_CAVE1_CHEST2,

  DEZO_CAVE3_CHEST,

  CORONA_CAVE_CHEST1,
  CORONA_CAVE_CHEST2,
  CORONA_CAVE_CHEST3,
  CORONA_CAVE_CHEST4,
  CORONA_CAVE_CHEST5,
  CORONA_CAVE_CHEST6,
  CORONA_CAVE_CHEST7,
  CORONA_CAVE_CHEST8,
  CORONA_CAVE_CHEST9,

  PRISM_CAVE_CHEST1,
  PRISM_CAVE_CHEST2, // titan

  GUARON_MORGUE_CHEST1,
  GUARON_MORGUE_CHEST2,

  FROST_DUNGEON_CHEST1,
  FROST_DUNGEON_CHEST2,
  FROST_DUNGEON_CHEST3,
  FROST_DUNGEON_CHEST4,
  FROST_DUNGEON_CHEST5,
  FROST_DUNGEON_CHEST6,

  BAYA_MALAY_CHEST1,
  BAYA_MALAY_CHEST2,
  BAYA_MALAY_CHEST3,
  BAYA_MALAY_CHEST4,
  BAYA_MALAY_CHEST5,
  BAYA_MALAY_CHEST6,
  BAYA_MALAY_CHEST7,
  BAYA_MALAY_CHEST8,
  BAYA_MALAY_CHEST9,
  BAYA_MALAY_CHEST10,
  BAYA_MALAY_CHEST11,
  BAYA_MALAY_CHEST12,
  BAYA_MALAY_CHEST13,
  BAYA_MALAY_CHEST14,
  BAYA_MALAY_CHEST15,
  BAYA_MALAY_CHEST16,
  BAYA_MALAY_CHEST17,
  BAYA_MALAY_CHEST18,
  BAYA_MALAY_CHEST19,
  BAYA_MALAY_CHEST20,
  BAYA_MALAY_CHEST21,
  BAYA_MALAY_CHEST22,
  BAYA_MALAY_CHEST23,
  BAYA_MALAY_CHEST24,
  BAYA_MALAY_CHEST25,
  BAYA_MALAY_CHEST26,

  TONOE_MINE_CHEST1,
  TONOE_MINE_CHEST2,
  TONOE_MINE_CHEST3,
  TONOE_MINE_CHEST4,
  TONOE_MINE_CHEST5,
  TONOE_MINE_CHEST6
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
  INFO_CORONA_TRAP5,
  CORONA_TRAP6,
  INFO_CORONA_TRAP6,
  DARKFALZ_TRAP1,
  INFO_DARKFALZ_TRAP1,
  DARKFALZ_TRAP2,
  INFO_DARKFALZ_TRAP2,
  FROST_CAVE_TRAP1,
  INFO_FROST_CAVE_TRAP1,
  FROST_CAVE_TRAP2,
  INFO_FROST_CAVE_TRAP2,
  FROST_CAVE_TRAP3,
  INFO_FROST_CAVE_TRAP3,
  FROST_CAVE_TRAP4,
  INFO_FROST_CAVE_TRAP4,
  FROST_CAVE_TRAP5,
  INFO_FROST_CAVE_TRAP5,
  FROST_CAVE_TRAP6,
  INFO_FROST_CAVE_TRAP6,
  GUARON_TRAP1,
  INFO_GUARON_TRAP1,
  GUARON_TRAP2,
  INFO_GUARON_TRAP2,
  IALA_TRAP1,
  INFO_IALA_TRAP1,
  IALA_TRAP2,
  INFO_IALA_TRAP2,
  IALA_TRAP3,
  INFO_IALA_TRAP3,
  IALA_TRAP4,
  INFO_IALA_TRAP4,
  LOST_ISLAND_TRAP1,
  INFO_LOST_ISLAND_TRAP1,
  LOST_ISLAND_TRAP2,
  INFO_LOST_ISLAND_TRAP2,
  LOST_ISLAND_TRAP3,
  INFO_LOST_ISLAND_TRAP3,
  LOST_ISLAND_TRAP4,
  INFO_LOST_ISLAND_TRAP4,
  MEDUSA_TRAP1,
  INFO_MEDUSA_TRAP1,
  MEDUSA_TRAP2,
  INFO_MEDUSA_TRAP2,
  NAHARU_TRAP,
  INFO_NAHARU_TRAP
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
  // Note: Browser storage uses localStorage instead of Java's .SAV file I/O.

  /** Bump when the serialized shape changes in a backward-incompatible way. */
  public static readonly SAVE_VERSION = 1;

  /**
   * Produce a plain, JSON-safe snapshot of this game state. The party is
   * serialized through its own graph (members/items resolved to identity
   * strings) rather than dumping live class instances.
   */
  public serialize(): any {
    return {
      version: GameData.SAVE_VERSION,
      musicVolume: this.musicVolume,
      soundVolume: this.soundVolume,
      dungeonDelay: this.dungeonDelay,
      battleInformation: this.battleInformation,
      locale: this.locale,
      flags: Array.from(this.flags),
      chestFlags: Array.from(this.chestFlags),
      trapFlags: Array.from(this.trapFlags),
      visitedCities: Array.from(this.visitedCities),
      visitedEnemies: Array.from(this.visitedEnemies),
      gameType: this.gameType,
      screenSize: this.screenSize,
      current_planet: this.current_planet,
      current_dungeon: this.current_dungeon,
      current_city: this.current_city,
      party: this.party ? this.party.serialize() : null,
      onWaterVehicle: this.onWaterVehicle,
      onGroundVehicle: this.onGroundVehicle,
      gotox: this.gotox,
      gotoy: this.gotoy,
      dungeonFace: this.dungeonFace,
      dungeonFloor: this.dungeonFloor,
      enableCheats: this.enableCheats
    };
  }

  /**
   * Rebuild a GameData from a snapshot produced by serialize().
   */
  public static fromSerialized(data: any): GameData {
    const gameData = new GameData();

    gameData.musicVolume = data.musicVolume ?? 30;
    gameData.soundVolume = data.soundVolume ?? 50;
    gameData.dungeonDelay = data.dungeonDelay ?? 4;
    gameData.battleInformation = data.battleInformation !== undefined ? data.battleInformation : true;
    gameData.locale = data.locale ?? 'en';
    gameData.gameType = data.gameType ?? null;
    gameData.screenSize = data.screenSize ?? null;
    gameData.current_planet = data.current_planet ?? null;
    // Dungeon.NONE is 0, so use ?? (not ||) to preserve "not in a dungeon".
    gameData.current_dungeon = data.current_dungeon ?? Dungeon.NONE;
    gameData.current_city = data.current_city ?? null;
    gameData.party = data.party ? Party.deserialize(data.party) : null;
    gameData.onWaterVehicle = data.onWaterVehicle ?? false;
    gameData.onGroundVehicle = data.onGroundVehicle ?? false;
    gameData.gotox = data.gotox ?? 0;
    gameData.gotoy = data.gotoy ?? 0;
    gameData.dungeonFace = data.dungeonFace ?? 1;
    gameData.dungeonFloor = data.dungeonFloor ?? 0;
    gameData.enableCheats = data.enableCheats ?? false;

    gameData.flags = new Set(data.flags ?? []);
    gameData.chestFlags = new Set(data.chestFlags ?? []);
    gameData.trapFlags = new Set(data.trapFlags ?? []);
    gameData.visitedCities = new Set(data.visitedCities ?? []);
    gameData.visitedEnemies = new Set(data.visitedEnemies ?? []);

    return gameData;
  }

  /**
   * Save game data to browser storage under a single key.
   */
  public static save(gameData: GameData, key: string): void {
    try {
      localStorage.setItem(key, JSON.stringify(gameData.serialize()));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  /**
   * Load game data from browser storage.
   */
  public static load(key: string): GameData | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return null;
      }
      return GameData.fromSerialized(JSON.parse(serialized));
    } catch (error) {
      console.error('Error loading game data:', error);
      return null;
    }
  }
}