/**
 * Dungeon - Dungeon and Cave Management
 * Defines all dungeons, caves and underground areas in PS
 */

import { PS1Music } from './PSLibMusic';

const BASE_FOLDER = "src/demos/ps";

export enum DungeonType {
  FIRE,
  GREY,
  GREEN,
  YELLOW,
  BLUE,
  ILLUSION,
  COLOR,
  MOTA,
  ORANGE,
  EMERALD,
  COLD,
  RUBY
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

export enum Dark {
  TRUE,
  FALSE
}

export enum Dungeon {
  // Special/None
  NONE,

  // Palma dungeons
  WAREHOUSE,
  ODIN_CAVE,
  IALA,
  NAULA,
  GOTHIC_PASSAGEWAY_IN,
  GOTHIC_PASSAGEWAY_OUT,
  PRISON_IN,
  PRISON_OUT,
  TRIADA,
  BORTEVO_IN,
  BORTEVO_OUT,
  ABION_DUNGEON_IN,
  ABION_DUNGEON_OUT,
  DRASGOW_DUNGEON,
  CAVE_BAYA_IN,
  CAVE_BAYA_OUT,
  LOST_ISLAND,
  MEDUSA_TOWER,
  BAYA_MALAY,

  // Motavia dungeons
  GOVERNOR_IN,
  GOVERNOR_OUT,
  NAHARU,
  CASBA_CAVE_IN,
  CASBA_CAVE_OUT,
  TAJIMA_CAVE,
  BLUEBERRY_MINE,
  DARKFALZ_DUNGEON,

  // Dezoris dungeons
  SKURE_TUNNEL_IN,
  SKURE_TUNNEL_OUT,
  DEZO_CAVE1_IN,
  DEZO_CAVE1_OUT,
  DEZO_CAVE2_IN,
  DEZO_CAVE2_OUT,
  DEZO_CAVE3_IN,
  DEZO_CAVE3_OUT,
  DEZO_CAVE4_IN,
  DEZO_CAVE4_OUT,
  DEZO_CAVE_AUKBA_IN,
  DEZO_CAVE_AUKBA_OUT,
  AUKBA_TUNNEL_IN,
  AUKBA_TUNNEL_OUT,
  PRISM_CAVE,
  CORONA,
  GUARON_MORGUE,
  FROST_CAVE,

  // Final dungeon
  LASSIC_CASTLE
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
    [Dungeon.WAREHOUSE, { x: 11, y: 6, dir: EntityDirection.NORTH, mapPath: "Warehouse.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.TOWN }],
    [Dungeon.ODIN_CAVE, { x: 12, y: 11, dir: EntityDirection.NORTH, mapPath: "Odin_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.IALA, { x: 14, y: 13, dir: EntityDirection.NORTH, mapPath: "Iala.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.NAULA, { x: 3, y: 1, dir: EntityDirection.WEST, mapPath: "Naula.map", isDark: true, type: DungeonType.COLOR, music: PS1Music.CAVE }],
    [Dungeon.GOTHIC_PASSAGEWAY_IN, { x: 4, y: 13, dir: EntityDirection.NORTH, mapPath: "Gothic_passageway.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.GOTHIC_PASSAGEWAY_OUT, { x: 4, y: 2, dir: EntityDirection.SOUTH, mapPath: "Gothic_passageway.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.PRISON_IN, { x: 14, y: 12, dir: EntityDirection.NORTH, mapPath: "Prison.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.PRISON_OUT, { x: 4, y: 2, dir: EntityDirection.SOUTH, mapPath: "Prison.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.TRIADA, { x: 2, y: 12, dir: EntityDirection.NORTH, mapPath: "Triada.map", isDark: false, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.BORTEVO_IN, { x: 15, y: 13, dir: EntityDirection.NORTH, mapPath: "Bortevo_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.BORTEVO_OUT, { x: 2, y: 2, dir: EntityDirection.SOUTH, mapPath: "Bortevo_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.ABION_DUNGEON_IN, { x: 2, y: 12, dir: EntityDirection.NORTH, mapPath: "Abion_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.CAVE }],
    [Dungeon.ABION_DUNGEON_OUT, { x: 14, y: 0, dir: EntityDirection.WEST, mapPath: "Abion_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.CAVE }],
    [Dungeon.DRASGOW_DUNGEON, { x: 1, y: 14, dir: EntityDirection.NORTH, mapPath: "Drasgow_dungeon.map", isDark: false, type: DungeonType.GREEN, music: PS1Music.TOWN }],
    [Dungeon.CAVE_BAYA_IN, { x: 8, y: 6, dir: EntityDirection.NORTH, mapPath: "Baya_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.CAVE_BAYA_OUT, { x: 3, y: 2, dir: EntityDirection.EAST, mapPath: "Baya_cave.map", isDark: true, type: DungeonType.BLUE, music: PS1Music.CAVE }],
    [Dungeon.LOST_ISLAND, { x: 7, y: 13, dir: EntityDirection.NORTH, mapPath: "Lost_island.map", isDark: true, type: DungeonType.GREEN, music: PS1Music.TOWER }],
    [Dungeon.MEDUSA_TOWER, { x: 25, y: 13, dir: EntityDirection.NORTH, mapPath: "Medusa_tower.map", isDark: true, type: DungeonType.FIRE, music: PS1Music.TOWER }],
    [Dungeon.BAYA_MALAY, { x: 25, y: 27, dir: EntityDirection.NORTH, mapPath: "Baya_malay.map", isDark: true, type: DungeonType.ORANGE, music: PS1Music.TOWER }],

    // Motavia dungeons
    [Dungeon.GOVERNOR_IN, { x: 4, y: 12, dir: EntityDirection.NORTH, mapPath: "Governor.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],
    [Dungeon.GOVERNOR_OUT, { x: 1, y: 5, dir: EntityDirection.SOUTH, mapPath: "Governor.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],
    [Dungeon.NAHARU, { x: 9, y: 6, dir: EntityDirection.EAST, mapPath: "Naharu.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.CASBA_CAVE_IN, { x: 3, y: 13, dir: EntityDirection.NORTH, mapPath: "Casba_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.CASBA_CAVE_OUT, { x: 10, y: 13, dir: EntityDirection.NORTH, mapPath: "Casba_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.TAJIMA_CAVE, { x: 9, y: 13, dir: EntityDirection.NORTH, mapPath: "Tajima_cave.map", isDark: true, type: DungeonType.MOTA, music: PS1Music.CAVE }],
    [Dungeon.BLUEBERRY_MINE, { x: 9, y: 11, dir: EntityDirection.NORTH, mapPath: "Blueberry.map", isDark: true, type: DungeonType.COLOR, music: PS1Music.CAVE }],
    [Dungeon.DARKFALZ_DUNGEON, { x: 6, y: 14, dir: EntityDirection.NORTH, mapPath: "Darkfalz.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }],

    // Dezoris dungeons
    [Dungeon.SKURE_TUNNEL_IN, { x: 9, y: 12, dir: EntityDirection.NORTH, mapPath: "Skure_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.SKURE_TUNNEL_OUT, { x: 1, y: 8, dir: EntityDirection.NORTH, mapPath: "Skure_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE1_IN, { x: 1, y: 12, dir: EntityDirection.NORTH, mapPath: "Dezo_cave1.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE1_OUT, { x: 1, y: 1, dir: EntityDirection.SOUTH, mapPath: "Dezo_cave1.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE2_IN, { x: 12, y: 11, dir: EntityDirection.WEST, mapPath: "Dezo_cave2.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE2_OUT, { x: 7, y: 5, dir: EntityDirection.SOUTH, mapPath: "Dezo_cave2.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE3_IN, { x: 4, y: 11, dir: EntityDirection.NORTH, mapPath: "Dezo_cave3.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE3_OUT, { x: 2, y: 3, dir: EntityDirection.SOUTH, mapPath: "Dezo_cave3.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE4_IN, { x: 1, y: 10, dir: EntityDirection.NORTH, mapPath: "Dezo_cave4.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE4_OUT, { x: 8, y: 3, dir: EntityDirection.SOUTH, mapPath: "Dezo_cave4.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE_AUKBA_IN, { x: 2, y: 18, dir: EntityDirection.EAST, mapPath: "Dezo_cave_aukba.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.DEZO_CAVE_AUKBA_OUT, { x: 12, y: 5, dir: EntityDirection.WEST, mapPath: "Dezo_cave_aukba.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.AUKBA_TUNNEL_IN, { x: 14, y: 12, dir: EntityDirection.NORTH, mapPath: "Aukba_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.AUKBA_TUNNEL_OUT, { x: 8, y: 7, dir: EntityDirection.NORTH, mapPath: "Aukba_tunnel.map", isDark: false, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.PRISM_CAVE, { x: 12, y: 13, dir: EntityDirection.NORTH, mapPath: "Prism_cave.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],
    [Dungeon.CORONA, { x: 1, y: 13, dir: EntityDirection.NORTH, mapPath: "Corona.map", isDark: false, type: DungeonType.RUBY, music: PS1Music.TOWER }],
    [Dungeon.GUARON_MORGUE, { x: 14, y: 14, dir: EntityDirection.WEST, mapPath: "Guaron_morgue.map", isDark: true, type: DungeonType.GREY, music: PS1Music.CAVE }],
    [Dungeon.FROST_CAVE, { x: 3, y: 13, dir: EntityDirection.NORTH, mapPath: "Frost_cave.map", isDark: true, type: DungeonType.COLD, music: PS1Music.CAVE }],

    // Final dungeon
    [Dungeon.LASSIC_CASTLE, { x: 6, y: 13, dir: EntityDirection.NORTH, mapPath: "Lassic_castle.map", isDark: false, type: DungeonType.YELLOW, music: PS1Music.PALACE }]
  ]);

  /**
   * Get all dungeons
   */
  public static getAllDungeons(): Dungeon[] {
    return Array.from(this.dungeonConfigs.keys());
  }

  /**
   * Get dungeon X coordinate
   */
  public static getX(dungeon: Dungeon): number {
    return this.dungeonConfigs.get(dungeon)?.x ?? 0;
  }

  /**
   * Get dungeon Y coordinate
   */
  public static getY(dungeon: Dungeon): number {
    return this.dungeonConfigs.get(dungeon)?.y ?? 0;
  }

  /**
   * Get dungeon direction
   */
  public static getDir(dungeon: Dungeon): EntityDirection {
    return this.dungeonConfigs.get(dungeon)?.dir ?? EntityDirection.NORTH;
  }

  /**
   * Get dungeon type
   */
  public static getType(dungeon: Dungeon): DungeonType | null {
    return this.dungeonConfigs.get(dungeon)?.type ?? null;
  }

  /**
   * Get dungeon map path
   */
  public static getPath(dungeon: Dungeon): string | null {
    return this.dungeonConfigs.get(dungeon)?.mapPath ?? null;
  }

  /**
   * Check if dungeon is dark
   */
  public static isDark(dungeon: Dungeon): boolean {
    return this.dungeonConfigs.get(dungeon)?.isDark ?? false;
  }

  /**
   * Get dungeon music
   */
  public static getMusic(dungeon: Dungeon): PS1Music | null {
    return this.dungeonConfigs.get(dungeon)?.music ?? null;
  }
}