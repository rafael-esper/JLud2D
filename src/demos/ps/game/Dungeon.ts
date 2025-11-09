/**
 * Dungeon - Dungeon and Cave Management
 * Direct port of Dungeon.java - Defines all dungeons, caves and underground areas in PS
 */

import { PS1Music } from './PSLibMusic';

const BASE_FOLDER = "src/demos/ps";

export enum DungeonType {
  FIRE = 'FIRE',
  GREY = 'GREY',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  ILLUSION = 'ILLUSION',
  COLOR = 'COLOR',
  MOTA = 'MOTA',
  ORANGE = 'ORANGE',
  EMERALD = 'EMERALD',
  COLD = 'COLD',
  RUBY = 'RUBY'
}

export class DungeonTypeHelper {
  private static readonly typeConfigs = new Map<DungeonType, string>([
    [DungeonType.FIRE, `${BASE_FOLDER}/images/original/dungeon/Fire/`],
    [DungeonType.GREY, `${BASE_FOLDER}/images/original/dungeon/Grey/`],
    [DungeonType.GREEN, `${BASE_FOLDER}/images/original/dungeon/Green/`],
    [DungeonType.YELLOW, `${BASE_FOLDER}/images/original/dungeon/Yellow/`],
    [DungeonType.BLUE, `${BASE_FOLDER}/images/original/dungeon/Blue/`],
    [DungeonType.ILLUSION, `${BASE_FOLDER}/images/original/dungeon/Illusion/`],
    [DungeonType.COLOR, `${BASE_FOLDER}/images/original/dungeon/Color/`],
    [DungeonType.MOTA, `${BASE_FOLDER}/images/original/dungeon/Mota/`],
    [DungeonType.ORANGE, `${BASE_FOLDER}/images/original/dungeon/Orange/`],
    [DungeonType.EMERALD, `${BASE_FOLDER}/images/original/dungeon/Emerald/`],
    [DungeonType.COLD, `${BASE_FOLDER}/images/original/dungeon/Cold/`],
    [DungeonType.RUBY, `${BASE_FOLDER}/images/original/dungeon/Ruby/`]
  ]);

  public static getImagePath(type: DungeonType): string {
    return this.typeConfigs.get(type) || "";
  }
}

// Entity directions (from domain/Entity.ts)
export enum EntityDirection {
  NORTH = 1,
  SOUTH = 2,
  WEST = 3,
  EAST = 4
}

enum Dark {
  TRUE = 'TRUE',
  FALSE = 'FALSE'
}

export enum Dungeon {
  // Special/None
  NONE = 'NONE',

  // Palma dungeons
  WAREHOUSE = 'WAREHOUSE',
  ODIN_CAVE = 'ODIN_CAVE',
  IALA = 'IALA',
  NAULA = 'NAULA',
  GOTHIC_PASSAGEWAY_IN = 'GOTHIC_PASSAGEWAY_IN',
  GOTHIC_PASSAGEWAY_OUT = 'GOTHIC_PASSAGEWAY_OUT',
  PRISON_IN = 'PRISON_IN',
  PRISON_OUT = 'PRISON_OUT',
  TRIADA = 'TRIADA',
  BORTEVO_IN = 'BORTEVO_IN',
  BORTEVO_OUT = 'BORTEVO_OUT',
  ABION_DUNGEON_IN = 'ABION_DUNGEON_IN',
  ABION_DUNGEON_OUT = 'ABION_DUNGEON_OUT',
  DRASGOW_DUNGEON = 'DRASGOW_DUNGEON',
  CAVE_BAYA_IN = 'CAVE_BAYA_IN',
  CAVE_BAYA_OUT = 'CAVE_BAYA_OUT',
  LOST_ISLAND = 'LOST_ISLAND',
  MEDUSA_TOWER = 'MEDUSA_TOWER',
  BAYA_MALAY = 'BAYA_MALAY',

  // Motavia dungeons
  GOVERNOR_IN = 'GOVERNOR_IN',
  GOVERNOR_OUT = 'GOVERNOR_OUT',
  NAHARU = 'NAHARU',
  CASBA_CAVE_IN = 'CASBA_CAVE_IN',
  CASBA_CAVE_OUT = 'CASBA_CAVE_OUT',
  TAJIMA_CAVE = 'TAJIMA_CAVE',
  BLUEBERRY_MINE = 'BLUEBERRY_MINE',
  DARKFALZ_DUNGEON = 'DARKFALZ_DUNGEON',

  // Dezoris dungeons
  SKURE_TUNNEL_IN = 'SKURE_TUNNEL_IN',
  SKURE_TUNNEL_OUT = 'SKURE_TUNNEL_OUT',
  DEZO_CAVE1_IN = 'DEZO_CAVE1_IN',
  DEZO_CAVE1_OUT = 'DEZO_CAVE1_OUT',
  DEZO_CAVE2_IN = 'DEZO_CAVE2_IN',
  DEZO_CAVE2_OUT = 'DEZO_CAVE2_OUT',
  DEZO_CAVE3_IN = 'DEZO_CAVE3_IN',
  DEZO_CAVE3_OUT = 'DEZO_CAVE3_OUT',
  DEZO_CAVE4_IN = 'DEZO_CAVE4_IN',
  DEZO_CAVE4_OUT = 'DEZO_CAVE4_OUT',
  DEZO_CAVE_AUKBA_IN = 'DEZO_CAVE_AUKBA_IN',
  DEZO_CAVE_AUKBA_OUT = 'DEZO_CAVE_AUKBA_OUT',
  AUKBA_TUNNEL_IN = 'AUKBA_TUNNEL_IN',
  AUKBA_TUNNEL_OUT = 'AUKBA_TUNNEL_OUT',
  PRISM_CAVE = 'PRISM_CAVE',
  CORONA = 'CORONA',
  GUARON_MORGUE = 'GUARON_MORGUE',
  FROST_CAVE = 'FROST_CAVE',

  // Final dungeon
  LASSIC_CASTLE = 'LASSIC_CASTLE'
}

export class DungeonHelper {
  private static readonly dungeonConfigs = new Map<Dungeon, {
    x: number,
    y: number,
    dir: EntityDirection,
    mapPath: string | null,
    isDark: boolean,
    type: DungeonType | null,
    music: PS1Music | null
  }>([
    // Special
    [Dungeon.NONE, { x: 0, y: 0, dir: EntityDirection.NORTH, mapPath: null, isDark: false, type: null, music: null }],

    // Palma dungeons
    [Dungeon.WAREHOUSE, { x: 11, y: 6, dir: EntityDirection.NORTH, mapPath: "dungeons/Warehouse.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.TOWN }],
    [Dungeon.ODIN_CAVE, { x: 12, y: 11, dir: EntityDirection.NORTH, mapPath: "dungeons/Odin_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.IALA, { x: 14, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Iala.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.NAULA, { x: 3, y: 1, dir: EntityDirection.WEST, mapPath: "dungeons/Naula.map", isDark: true, type: DungeonType.COLOR, music: PS1Music.CAVE }],
    [Dungeon.GOTHIC_PASSAGEWAY_IN, { x: 4, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Gothic_passageway.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.GOTHIC_PASSAGEWAY_OUT, { x: 4, y: 2, dir: EntityDirection.SOUTH, mapPath: "dungeons/Gothic_passageway.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.PRISON_IN, { x: 14, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Prison.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.PRISON_OUT, { x: 4, y: 2, dir: EntityDirection.SOUTH, mapPath: "dungeons/Prison.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.TRIADA, { x: 2, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Triada.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.BORTEVO_IN, { x: 15, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Bortevo_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.BORTEVO_OUT, { x: 2, y: 2, dir: EntityDirection.SOUTH, mapPath: "dungeons/Bortevo_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.ABION_DUNGEON_IN, { x: 2, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Abion_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.CAVE }],
    [Dungeon.ABION_DUNGEON_OUT, { x: 14, y: 0, dir: EntityDirection.WEST, mapPath: "dungeons/Abion_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.CAVE }],
    [Dungeon.DRASGOW_DUNGEON, { x: 1, y: 14, dir: EntityDirection.NORTH, mapPath: "dungeons/Drasgow_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.TOWN }],
    [Dungeon.CAVE_BAYA_IN, { x: 8, y: 6, dir: EntityDirection.NORTH, mapPath: "dungeons/Baya_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.CAVE_BAYA_OUT, { x: 3, y: 2, dir: EntityDirection.EAST, mapPath: "dungeons/Baya_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.LOST_ISLAND, { x: 7, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Lost_island.map", isDark: true, type: DungeonType.GREEN, music: PS1Music.TOWER }],
    [Dungeon.MEDUSA_TOWER, { x: 25, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Medusa_tower.map", isDark: true, type: DungeonType.FIRE, music: PS1Music.TOWER }],
    [Dungeon.BAYA_MALAY, { x: 25, y: 27, dir: EntityDirection.NORTH, mapPath: "dungeons/Baya_malay.map", isDark: true, type: DungeonType.ORANGE, music: PS1Music.TOWER }],

    // Motavia dungeons
    [Dungeon.GOVERNOR_IN, { x: 4, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Governor.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],
    [Dungeon.GOVERNOR_OUT, { x: 1, y: 5, dir: EntityDirection.SOUTH, mapPath: "dungeons/Governor.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],
    [Dungeon.NAHARU, { x: 9, y: 6, dir: EntityDirection.EAST, mapPath: "dungeons/Naharu.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.CASBA_CAVE_IN, { x: 3, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Casba_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.CASBA_CAVE_OUT, { x: 10, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Casba_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.TAJIMA_CAVE, { x: 9, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Tajima_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.BLUEBERRY_MINE, { x: 9, y: 11, dir: EntityDirection.NORTH, mapPath: "dungeons/Blueberry.map", isDark: true, type: DungeonType.COLOR, music: PS1Music.CAVE }],
    [Dungeon.DARKFALZ_DUNGEON, { x: 6, y: 14, dir: EntityDirection.NORTH, mapPath: "dungeons/Darkfalz.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],

    // Dezoris dungeons
    [Dungeon.SKURE_TUNNEL_IN, { x: 9, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Skure_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.SKURE_TUNNEL_OUT, { x: 1, y: 8, dir: EntityDirection.NORTH, mapPath: "dungeons/Skure_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE1_IN, { x: 1, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Dezo_cave1.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE1_OUT, { x: 1, y: 1, dir: EntityDirection.SOUTH, mapPath: "dungeons/Dezo_cave1.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE2_IN, { x: 12, y: 11, dir: EntityDirection.WEST, mapPath: "dungeons/Dezo_cave2.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE2_OUT, { x: 7, y: 5, dir: EntityDirection.SOUTH, mapPath: "dungeons/Dezo_cave2.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE3_IN, { x: 4, y: 11, dir: EntityDirection.NORTH, mapPath: "dungeons/Dezo_cave3.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE3_OUT, { x: 2, y: 3, dir: EntityDirection.SOUTH, mapPath: "dungeons/Dezo_cave3.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE4_IN, { x: 1, y: 10, dir: EntityDirection.NORTH, mapPath: "dungeons/Dezo_cave4.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE4_OUT, { x: 8, y: 3, dir: EntityDirection.SOUTH, mapPath: "dungeons/Dezo_cave4.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE_AUKBA_IN, { x: 2, y: 18, dir: EntityDirection.EAST, mapPath: "dungeons/Dezo_cave_aukba.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE_AUKBA_OUT, { x: 12, y: 5, dir: EntityDirection.WEST, mapPath: "dungeons/Dezo_cave_aukba.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.AUKBA_TUNNEL_IN, { x: 14, y: 12, dir: EntityDirection.NORTH, mapPath: "dungeons/Aukba_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.AUKBA_TUNNEL_OUT, { x: 8, y: 7, dir: EntityDirection.NORTH, mapPath: "dungeons/Aukba_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.PRISM_CAVE, { x: 12, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Prism_cave.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.CORONA, { x: 1, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Corona.map", isDark: false, type: DungeonType.RUBY, music: PS1Music.TOWER }],
    [Dungeon.GUARON_MORGUE, { x: 14, y: 14, dir: EntityDirection.WEST, mapPath: "dungeons/Guaron_morgue.map", isDark: true, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.FROST_CAVE, { x: 3, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Frost_cave.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],

    // Final dungeon
    [Dungeon.LASSIC_CASTLE, { x: 6, y: 13, dir: EntityDirection.NORTH, mapPath: "dungeons/Lassic_castle.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }]
  ]);

  /**
   * Get all dungeons
   */
  public static getAllDungeons(): Dungeon[] {
    return Array.from(this.dungeonConfigs.keys());
  }

  /**
   * Get dungeon X coordinate - direct port of Java getX()
   */
  public static getX(dungeon: Dungeon): number {
    return this.dungeonConfigs.get(dungeon)?.x || 0;
  }

  /**
   * Get dungeon Y coordinate - direct port of Java getY()
   */
  public static getY(dungeon: Dungeon): number {
    return this.dungeonConfigs.get(dungeon)?.y || 0;
  }

  /**
   * Get dungeon direction - direct port of Java getDir()
   */
  public static getDir(dungeon: Dungeon): EntityDirection {
    return this.dungeonConfigs.get(dungeon)?.dir || EntityDirection.NORTH;
  }

  /**
   * Get dungeon type - direct port of Java getType()
   */
  public static getType(dungeon: Dungeon): DungeonType | null {
    return this.dungeonConfigs.get(dungeon)?.type || null;
  }

  /**
   * Get dungeon map path - direct port of Java getPath()
   */
  public static getPath(dungeon: Dungeon): string | null {
    return this.dungeonConfigs.get(dungeon)?.mapPath || null;
  }

  /**
   * Check if dungeon is dark - direct port of Java isDark()
   */
  public static isDark(dungeon: Dungeon): boolean {
    return this.dungeonConfigs.get(dungeon)?.isDark || false;
  }

  /**
   * Get dungeon music - direct port of Java getMusic()
   */
  public static getMusic(dungeon: Dungeon): PS1Music | null {
    return this.dungeonConfigs.get(dungeon)?.music || null;
  }
}