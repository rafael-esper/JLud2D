/**
 * Lost_island - Dungeon Script (Lost Island tower)
 * TypeScript port of Lost_island.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap, Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Lost_island {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Lost_island);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.WIGHT, PS1Enemy.STALKER, PS1Enemy.VAMPIRE, PS1Enemy.GHOUL]);
      dungeon.setRandomEnemies(1, [PS1Enemy.GR_SLIME, PS1Enemy.MANTICORE, PS1Enemy.SERPENT, PS1Enemy.ANDROCOP]);
      dungeon.setRandomEnemies(2, [PS1Enemy.MANTICORE, PS1Enemy.SERPENT, PS1Enemy.ANDROCOP]);
      dungeon.setRandomEnemies(3, [PS1Enemy.OWL_BEAR, PS1Enemy.WEREBAT, PS1Enemy.MARAUDER]);
      dungeon.setRandomEnemies(4, [PS1Enemy.SKELETON, PS1Enemy.MANTICORE, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN]);

      dungeon.setFixedEnemies(0, [PS1Enemy.WIGHT, PS1Enemy.STALKER, PS1Enemy.GHOUL]);
      dungeon.setFixedEnemies(1, [PS1Enemy.GR_SLIME, PS1Enemy.SERPENT]);
      dungeon.setFixedEnemies(2, [PS1Enemy.OWL_BEAR, PS1Enemy.SERPENT, PS1Enemy.OWL_BEAR]);
      dungeon.setFixedEnemies(3, [PS1Enemy.WEREBAT, PS1Enemy.MARAUDER]);
      dungeon.setFixedEnemies(4, [PS1Enemy.SKELETON, PS1Enemy.MARAUDER]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST1, 20, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST2, 0, Trapped.ARROW, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST5, 100, Trapped.NO_TRAP, null);
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST7, 0, Trapped.EXPLOSION, null);
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST8, 0, Trapped.ARROW, null);
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST9, 1, Trapped.NO_TRAP, null);
  }

  public static async chest10(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST10, 0, Trapped.EXPLOSION, null);
  }

  public static async chest11(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST11, 20, Trapped.NO_TRAP, null);
  }

  public static async chest12(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST12, 20, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest13(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST13, 0, Trapped.ARROW, null);
  }

  public static async chest14(): Promise<void> {
    await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST14, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async stairs_1_up(): Promise<void> {
    await PSGame.warp(19, 3, false);
  }

  public static async stairs_1_down(): Promise<void> {
    await PSGame.warp(3, 5, false);
  }

  public static async stairs_2_up(): Promise<void> {
    await PSGame.warp(29, 6, false);
  }

  public static async stairs_2_down(): Promise<void> {
    await PSGame.warp(10, 6, false);
  }

  public static async stairs_3_up(): Promise<void> {
    await PSGame.warp(19, 10, false);
  }

  public static async stairs_3_down(): Promise<void> {
    await PSGame.warp(5, 10, false);
  }

  public static async stairs_4_up(): Promise<void> {
    await PSGame.warp(1, 22, false);
  }

  public static async stairs_4_down(): Promise<void> {
    await PSGame.warp(17, 4, false);
  }

  public static async stairs_5_up(): Promise<void> {
    await PSGame.warp(8, 23, false);
  }

  public static async stairs_5_down(): Promise<void> {
    await PSGame.warp(24, 5, false);
  }

  public static async stairs_6_up(): Promise<void> {
    await PSGame.warp(23, 20, false);
  }

  public static async stairs_6_down(): Promise<void> {
    await PSGame.warp(7, 18, false);
  }

  public static async stairs_7_up(): Promise<void> {
    await PSGame.warp(28, 18, false);
  }

  public static async stairs_7_down(): Promise<void> {
    await PSGame.warp(12, 20, false);
  }

  public static async stairs_8_up(): Promise<void> {
    await PSGame.warp(11, 43, false);
  }

  public static async stairs_8_down(): Promise<void> {
    await PSGame.warp(21, 27, false);
  }

  // Java uses LOST_ISLAND_TRAP1/INFO_LOST_ISLAND_TRAP1 for all four traps
  // (TRAP2-4 exist in the enum but are never referenced) - kept as-is
  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 12, 9);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 26, 8);
  }

  public static async trap3(): Promise<void> {
    await PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 20, 12);
  }

  public static async trap4(): Promise<void> {
    await PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 1, 22);
  }

  public static async oldman(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    await PSMenu.StextLast(PSGame.getString("Island_Tower_Man"));
    await PSMenu.endScene();
  }

  public static async reddragon(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_LOST_ISLAND_DRAGON)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_DRAGN)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_LOST_ISLAND_DRAGON);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.LOST_ISLAND_CHEST15, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Laconian_Sword));
    }
  }

  public static async redslime(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 4) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_SLIME)!, quantity);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 5, 45);
  }
}
