/**
 * Iala - Dungeon Script
 * TypeScript port of Iala.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap, Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Iala {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Iala);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.SKELETON, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-3, [PS1Enemy.EVILDEAD, PS1Enemy.SKELETON]);

      dungeon.setFixedEnemies(0, [PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WING_EYE]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.WEREBAT]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.SKELETON, PS1Enemy.EVILDEAD, PS1Enemy.SKELETON]);
      dungeon.setFixedEnemies(-3, [PS1Enemy.EVILDEAD, PS1Enemy.SKELETON]);

      await dungeon.startDungeon();
    }
  }

  public static async beggar(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Iala_Man"));
    await PSMenu.endScene();
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST2, 20, Trapped.NO_TRAP, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST3, 0, Trapped.NO_TRAP, null); // empty
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST4, 0, Trapped.NO_TRAP, null); // empty
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST5, 0, Trapped.EXPLOSION, null);
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST7, 20, Trapped.NO_TRAP, null);
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST8, 0, Trapped.NO_TRAP, null);
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST9, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest10(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST10, 0, Trapped.ARROW, null);
  }

  public static async chest11(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST11, 20, Trapped.NO_TRAP, null);
  }

  public static async chest12(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST12, 20, Trapped.NO_TRAP, null);
  }

  public static async chest13(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST13, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest14(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST14, 0, Trapped.EXPLOSION, null);
  }

  public static async chest15(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST15, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest16(): Promise<void> {
    await PSGame.chestFlag(Chest.IALA_CAVE_CHEST16, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  // Java comment: changed to Skeleton_Guard
  public static async skeleton(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_IALA_SKELETON)) {
      outcome = await PSGame.fixedBattle(PSSceneType.CORRIDOR, [PS1Enemy.SKELETON, PS1Enemy.SKELETON_GUARD, PS1Enemy.SKELETON]);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_IALA_SKELETON);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.IALA_CAVE_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Saber_Claw));
    }
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(19, 12, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(3, 10, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(14, 28, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(30, 10, false);
  }

  public static async stairs_3_4(): Promise<void> {
    await PSGame.warp(20, 30, false);
  }

  public static async stairs_4_3(): Promise<void> {
    await PSGame.warp(2, 30, false);
  }

  public static async stairs_dead_up(): Promise<void> {
    await PSGame.warp(27, 9, false);
  }

  public static async stairs_dead_down(): Promise<void> {
    await PSGame.warp(11, 27, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.IALA_TRAP1, Trap.INFO_IALA_TRAP1, 25, 3);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.IALA_TRAP2, Trap.INFO_IALA_TRAP2, 9, 18);
  }

  public static async trap3(): Promise<void> {
    await PSGame.trapRoutine(Trap.IALA_TRAP3, Trap.INFO_IALA_TRAP3, 27, 18);
  }

  public static async trap4(): Promise<void> {
    await PSGame.trapRoutine(Trap.IALA_TRAP4, Trap.INFO_IALA_TRAP4, 29, 19);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 119, 58);
  }
}
