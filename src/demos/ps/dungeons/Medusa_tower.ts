/**
 * Medusa_tower - Dungeon Script
 * TypeScript port of Medusa_tower.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap, Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Medusa_tower {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Medusa_tower);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.MANTICORE, PS1Enemy.SKELETON, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.SORCERER, PS1Enemy.CENTAUR, PS1Enemy.GIANT]);
      dungeon.setRandomEnemies(1, [PS1Enemy.OWL_BEAR, PS1Enemy.WEREBAT, PS1Enemy.MARAUDER]);
      dungeon.setRandomEnemies(2, [PS1Enemy.STALKER, PS1Enemy.HORSEMAN]);
      dungeon.setRandomEnemies(3, [PS1Enemy.REAPER, PS1Enemy.GR_SLIME]);
      dungeon.setRandomEnemies(4, [PS1Enemy.GIANTFLY, PS1Enemy.STALKER, PS1Enemy.WYVERN, PS1Enemy.ANDROCOP]);
      dungeon.setRandomEnemies(5, [PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN, PS1Enemy.WYVERN, PS1Enemy.ANDROCOP]);
      dungeon.setRandomEnemies(6, [PS1Enemy.MANTICORE, PS1Enemy.STALKER, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN]);

      dungeon.setFixedEnemies(0, [PS1Enemy.SKELETON, PS1Enemy.SKELETON, PS1Enemy.MARAUDER, PS1Enemy.SKELETON]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.SORCERER, PS1Enemy.CENTAUR]);
      dungeon.setFixedEnemies(1, [PS1Enemy.CENTAUR, PS1Enemy.MARAUDER]);
      dungeon.setFixedEnemies(2, [PS1Enemy.STALKER, PS1Enemy.SKELETON]);
      dungeon.setFixedEnemies(3, [PS1Enemy.REAPER, PS1Enemy.STALKER]);
      dungeon.setFixedEnemies(4, [PS1Enemy.GIANTFLY, PS1Enemy.WYVERN, PS1Enemy.GIANTFLY]);
      dungeon.setFixedEnemies(5, [PS1Enemy.MAGICIAN, PS1Enemy.WYVERN]);
      dungeon.setFixedEnemies(6, [PS1Enemy.STALKER, PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
  }

  // The map's first chest zone is named 'chest' (not 'chest1') - alias so it fires
  public static async chest(): Promise<void> {
    await Medusa_tower.chest1();
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST3, 0, Trapped.EXPLOSION, null);
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST6, 10, Trapped.NO_TRAP, null);
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST7, 20, Trapped.NO_TRAP, null);
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST8, 0, Trapped.ARROW, null);
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST9, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest10(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST10, 10, Trapped.NO_TRAP, null);
  }

  public static async chest11(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST11, 5, Trapped.NO_TRAP, null);
  }

  public static async chest12(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST12, 0, Trapped.NO_TRAP, null);
  }

  public static async chest13(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST13, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest14(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST14, 10, Trapped.NO_TRAP, null);
  }

  public static async chest15(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST15, 35, Trapped.NO_TRAP, null);
  }

  public static async chest16(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST16, 0, Trapped.EXPLOSION, null);
  }

  public static async chest17(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest18(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST18, 0, Trapped.ARROW, null);
  }

  public static async chest19(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST19, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest20(): Promise<void> {
    await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST20, 0, Trapped.ARROW, null);
  }

  public static async stairs1_up(): Promise<void> {
    await PSGame.warp(30, 11, false);
  }

  public static async stairs1_down(): Promise<void> {
    await PSGame.warp(13, 13, false);
  }

  public static async stairs2_up(): Promise<void> {
    await PSGame.warp(5, 19, false);
  }

  public static async stairs2_down(): Promise<void> {
    await PSGame.warp(22, 4, false);
  }

  public static async stairs3_up(): Promise<void> {
    await PSGame.warp(13, 24, false);
  }

  public static async stairs3_down(): Promise<void> {
    await PSGame.warp(30, 5, false);
  }

  public static async stairs4_up(): Promise<void> {
    await PSGame.warp(18, 20, false);
  }

  public static async stairs4_down(): Promise<void> {
    await PSGame.warp(1, 22, false);
  }

  public static async stairs5_up(): Promise<void> {
    await PSGame.warp(19, 30, false);
  }

  public static async stairs5_down(): Promise<void> {
    await PSGame.warp(4, 30, false);
  }

  public static async stairs6_up(): Promise<void> {
    await PSGame.warp(12, 41, false);
  }

  public static async stairs6_down(): Promise<void> {
    await PSGame.warp(26, 24, false);
  }

  public static async stairs7_up(): Promise<void> {
    await PSGame.warp(24, 43, false);
  }

  public static async stairs7_down(): Promise<void> {
    await PSGame.warp(6, 41, false);
  }

  public static async stairs8_up(): Promise<void> {
    await PSGame.warp(5, 61, false);
  }

  public static async stairs8_down(): Promise<void> {
    await PSGame.warp(22, 40, false);
  }

  public static async stairs9_up(): Promise<void> {
    await PSGame.warp(24, 57, false);
  }

  public static async stairs9_down(): Promise<void> {
    await PSGame.warp(9, 57, false);
  }

  public static async stairs10_up(): Promise<void> {
    await PSGame.warp(25, 60, false);
  }

  public static async stairs10_down(): Promise<void> {
    await PSGame.warp(10, 60, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.MEDUSA_TRAP1, Trap.INFO_MEDUSA_TRAP1, 7, 4);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.MEDUSA_TRAP2, Trap.INFO_MEDUSA_TRAP2, 27, 5);
  }

  public static async oldman1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    await PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_1"));
    await PSMenu.endScene();
  }

  public static async oldman2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    await PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_2"));
    await PSMenu.endScene();
  }

  public static async oldman3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    await PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_3"));
    await PSMenu.endScene();
  }

  public static async monster(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 4) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.GIANTFLY)!, quantity);
  }

  public static async medusa(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_MEDUSA)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.MEDUSA)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_MEDUSA);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST21, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Laconian_Axe));
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 33, 79);
  }
}
