/**
 * PSLibCHR - Phantasy Star CHR Animation Library
 * Direct port of PSLibCHR.java - Defines CHR animation files and their paths
 */

// Base folder constant for public assets (Vite serves from public/ as root)
const BASE_FOLDER = "ps";

export enum PS1CHR {
  // Misc
  CHEST,
  SKY_CASTLE,
  ODIN_STATUE,
  MYAU_FLAPPING,

  // Battle Animations
  ENEMY_FIRE,
  ENEMY_THUNDER,
  PLAYER_FIRE,
  PLAYER_WIND,
  PLAYER_THUNDER,
  PLAYER_GIFIRE,

  // Scenes
  ANIM_BEACH,
  ANIM_SEA,
  ANIM_LAVA,
  ANIM_GAS,

  // Entities
  IMG_ENTITIES,
  IMG_ENTITIES_LARGE
}

export class PS1CHRHelper {
  private static readonly chrConfigs = new Map<PS1CHR, { url: string }>([
    // Misc
    [PS1CHR.CHEST, { url: `${BASE_FOLDER}/images/original/chest.anim.json` }],
    [PS1CHR.SKY_CASTLE, { url: `${BASE_FOLDER}/images/original/sky_castle.anim.json` }],
    [PS1CHR.ODIN_STATUE, { url: `${BASE_FOLDER}/images/original/odin_stone.anim.json` }],
    [PS1CHR.MYAU_FLAPPING, { url: `${BASE_FOLDER}/images/original/myau_flapping.anim.json` }],

    // Battle Animations
    [PS1CHR.ENEMY_FIRE, { url: `${BASE_FOLDER}/battle/enemy_fire.anim.json` }],
    [PS1CHR.ENEMY_THUNDER, { url: `${BASE_FOLDER}/battle/enemy_thunder.anim.json` }],
    [PS1CHR.PLAYER_FIRE, { url: `${BASE_FOLDER}/battle/pl_fire.anim.json` }],
    [PS1CHR.PLAYER_WIND, { url: `${BASE_FOLDER}/battle/pl_wind.anim.json` }],
    [PS1CHR.PLAYER_THUNDER, { url: `${BASE_FOLDER}/battle/pl_thunder.anim.json` }],
    [PS1CHR.PLAYER_GIFIRE, { url: `${BASE_FOLDER}/battle/pl_gifire.anim.json` }],

    // Scenes
    [PS1CHR.ANIM_BEACH, { url: `${BASE_FOLDER}/images/original/scene/Beach.anim.json` }],
    [PS1CHR.ANIM_SEA, { url: `${BASE_FOLDER}/images/original/scene/Sea.anim.json` }],
    [PS1CHR.ANIM_LAVA, { url: `${BASE_FOLDER}/images/original/scene/Lava.anim.json` }],
    [PS1CHR.ANIM_GAS, { url: `${BASE_FOLDER}/images/original/scene/Gas.anim.json` }],

    // Entities
    [PS1CHR.IMG_ENTITIES, { url: `${BASE_FOLDER}/images/original/entities.anim.json` }],
    [PS1CHR.IMG_ENTITIES_LARGE, { url: `${BASE_FOLDER}/images/original/lentities.anim.json` }]
  ]);

  public static getUrl(chr: PS1CHR): string {
    return this.chrConfigs.get(chr)?.url || '';
  }
}

export class PSLibCHR {
  // Static factory method for getting CHR URL - matches Java interface
  public static getUrl(chr: PS1CHR): string {
    return PS1CHRHelper.getUrl(chr);
  }
}