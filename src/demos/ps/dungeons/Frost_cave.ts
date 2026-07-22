/**
 * Frost_cave - Dungeon Script
 * TypeScript port of Frost_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, PSMenu, EntityType, EntityClothes, DezoType } from '../PSMenu';
import { PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Frost_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Frost_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.STALKER, PS1Enemy.FROSTMAN, PS1Enemy.WT_DRAGN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.STALKER, PS1Enemy.SCORPIUS, PS1Enemy.WT_DRAGN]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.WT_DRAGN, PS1Enemy.TITAN]);
      dungeon.setRandomEnemies(-3, [PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION]);
      dungeon.setRandomEnemies(-4, [PS1Enemy.BATALION, PS1Enemy.TITAN]);
      dungeon.setRandomEnemies(-5, [PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.BATALION]);

      dungeon.setFixedEnemies(0, [PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.STORM_FLY, PS1Enemy.ZOMBIE, PS1Enemy.STORM_FLY]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.FROSTMAN, PS1Enemy.STORM_FLY]);
      dungeon.setFixedEnemies(-3, [PS1Enemy.TITAN, PS1Enemy.FROSTMAN]);
      dungeon.setFixedEnemies(-4, [PS1Enemy.BATALION, PS1Enemy.LICH, PS1Enemy.ZOMBIE]);
      dungeon.setFixedEnemies(-5, [PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.SCORPIUS]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST1, 50, Trapped.ARROW, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Magic_Hat));
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Ceramic_Shield));
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST4, 0, Trapped.ARROW, null);
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Laconian_Shield));
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST6, 0, Trapped.EXPLOSION, null);
  }

  public static async stairs_1_up(): Promise<void> {
    await PSGame.warp(3, 7, false);
  }

  public static async stairs_1_down(): Promise<void> {
    await PSGame.warp(20, 9, false);
  }

  public static async stairs_2_up(): Promise<void> {
    await PSGame.warp(5, 7, false);
  }

  public static async stairs_2_down(): Promise<void> {
    await PSGame.warp(22, 5, false);
  }

  public static async stairs_3_up(): Promise<void> {
    await PSGame.warp(14, 4, false);
  }

  public static async stairs_3_down(): Promise<void> {
    await PSGame.warp(30, 2, false);
  }

  public static async stairs_4_up(): Promise<void> {
    await PSGame.warp(19, 7, false);
  }

  public static async stairs_4_down(): Promise<void> {
    await PSGame.warp(5, 21, false);
  }

  public static async stairs_5_up(): Promise<void> {
    await PSGame.warp(22, 4, false);
  }

  public static async stairs_5_down(): Promise<void> {
    await PSGame.warp(7, 18, false);
  }

  public static async stairs_6_up(): Promise<void> {
    await PSGame.warp(30, 6, false);
  }

  public static async stairs_6_down(): Promise<void> {
    await PSGame.warp(15, 20, false);
  }

  public static async stairs_7_up(): Promise<void> {
    await PSGame.warp(6, 17, false);
  }

  public static async stairs_7_down(): Promise<void> {
    await PSGame.warp(20, 17, false);
  }

  public static async stairs_8_up(): Promise<void> {
    await PSGame.warp(10, 17, false);
  }

  public static async stairs_8_down(): Promise<void> {
    await PSGame.warp(25, 17, false);
  }

  public static async stairs_9_up(): Promise<void> {
    await PSGame.warp(5, 23, false);
  }

  public static async stairs_9_down(): Promise<void> {
    await PSGame.warp(20, 23, false);
  }

  public static async stairs_10_up(): Promise<void> {
    await PSGame.warp(20, 19, false);
  }

  public static async stairs_10_down(): Promise<void> {
    await PSGame.warp(4, 26, false);
  }

  public static async stairs_11_up(): Promise<void> {
    await PSGame.warp(25, 19, false);
  }

  public static async stairs_11_down(): Promise<void> {
    await PSGame.warp(9, 27, false);
  }

  public static async stairs_12_up(): Promise<void> {
    await PSGame.warp(20, 25, false);
  }

  public static async stairs_12_down(): Promise<void> {
    await PSGame.warp(6, 32, false);
  }

  public static async stairs_13_up(): Promise<void> {
    await PSGame.warp(8, 25, false);
  }

  public static async stairs_13_down(): Promise<void> {
    await PSGame.warp(21, 28, false);
  }

  public static async stairs_14_up(): Promise<void> {
    await PSGame.warp(5, 27, false);
  }

  public static async stairs_14_down(): Promise<void> {
    await PSGame.warp(21, 31, false);
  }

  public static async stairs_15_up(): Promise<void> {
    await PSGame.warp(7, 30, false);
  }

  public static async stairs_15_down(): Promise<void> {
    await PSGame.warp(21, 32, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP1, Trap.INFO_FROST_CAVE_TRAP1, 18, 5);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP2, Trap.INFO_FROST_CAVE_TRAP2, 2, 19);
  }

  public static async trap3(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP3, Trap.INFO_FROST_CAVE_TRAP3, 19, 21);
  }

  public static async trap4(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP4, Trap.INFO_FROST_CAVE_TRAP4, 1, 28);
  }

  public static async trap5(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP5, Trap.INFO_FROST_CAVE_TRAP5, 16, 31);
  }

  public static async trap6(): Promise<void> {
    await PSGame.trapRoutine(Trap.FROST_CAVE_TRAP6, Trap.INFO_FROST_CAVE_TRAP6, 10, 36);
  }

  public static async dezo(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CORRIDOR, EntityType.DEZO, DezoType.REGULAR as unknown as EntityClothes);
    await PSMenu.StextLast(PSGame.getString("Cave_Dezo_Dezorian"));
    await PSMenu.endScene();
  }

  public static async blscorpion(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 4) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SCORPIUS)!, quantity);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 11, 36);
  }
}
