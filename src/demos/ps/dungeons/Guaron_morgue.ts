/**
 * Guaron_morgue - Dungeon Script
 * TypeScript port of Guaron_morgue.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Guaron_morgue {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Guaron_morgue);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.REVENANT]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.REVENANT]);

      dungeon.setFixedEnemies(0, [PS1Enemy.BATALION, PS1Enemy.REVENANT]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.ZOMBIE, PS1Enemy.REVENANT, PS1Enemy.BATALION]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.gameData.chestFlags.has(Chest.GUARON_MORGUE_CHEST1)) {
      const battle = new PSBattle();
      outcome = await battle.battleSceneWithEnemies(PSSceneType.CORRIDOR, [PSLibEnemy.getEnemyByEnum(PS1Enemy.DEATH_KNIGHT)!]);
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.GUARON_MORGUE_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Armor_Laconian_Armor));
    }
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.GUARON_MORGUE_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async stairs1_up(): Promise<void> {
    await PSGame.warp(5, 7, false);
  }

  public static async stairs1_down(): Promise<void> {
    await PSGame.warp(21, 10, false);
  }

  public static async stairs2_up(): Promise<void> {
    await PSGame.warp(12, 12, false);
  }

  public static async stairs2_down(): Promise<void> {
    await PSGame.warp(25, 13, false);
  }

  public static async stairs3_up(): Promise<void> {
    await PSGame.warp(9, 3, false);
  }

  public static async stairs3_down(): Promise<void> {
    await PSGame.warp(25, 6, false);
  }

  public static async stairs4_up(): Promise<void> {
    await PSGame.warp(13, 7, false);
  }

  public static async stairs4_down(): Promise<void> {
    await PSGame.warp(27, 8, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.GUARON_TRAP1, Trap.INFO_GUARON_TRAP1, 25, 8);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.GUARON_TRAP2, Trap.INFO_GUARON_TRAP2, 21, 12);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 80, 7);
  }
}
