/**
 * Corona - Dungeon Script (Corona Tower)
 * TypeScript port of Corona.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, PSMenu, EntityType, EntityClothes, DezoType } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Corona {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Corona);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.VAMPIRE_LORD, PS1Enemy.FROSTMAN, PS1Enemy.BATALION, PS1Enemy.LICH]);
      dungeon.setRandomEnemies(1, [PS1Enemy.LICH, PS1Enemy.SNOW_LION, PS1Enemy.WYVERN, PS1Enemy.FROSTMAN]);
      dungeon.setRandomEnemies(2, [PS1Enemy.LICH, PS1Enemy.SNOW_LION, PS1Enemy.WYVERN, PS1Enemy.BATALION]);
      dungeon.setRandomEnemies(3, [PS1Enemy.SORCERER, PS1Enemy.TITAN, PS1Enemy.MARAUDER]);

      dungeon.setFixedEnemies(0, [PS1Enemy.VAMPIRE_LORD, PS1Enemy.LICH]);
      dungeon.setFixedEnemies(1, [PS1Enemy.LICH, PS1Enemy.BATALION]);
      dungeon.setFixedEnemies(2, [PS1Enemy.LICH, PS1Enemy.BATALION, PS1Enemy.BATALION]);
      dungeon.setFixedEnemies(3, [PS1Enemy.SORCERER, PS1Enemy.MARAUDER]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST2, 0, Trapped.EXPLOSION, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST3, 500, Trapped.NO_TRAP, null);
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST5, 20, Trapped.NO_TRAP, null);
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST7, 0, Trapped.ARROW, null);
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST8, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.CORONA_CAVE_CHEST9, 20, Trapped.NO_TRAP, null);
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(23, 7, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(8, 5, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(8, 23, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(23, 4, false);
  }

  public static async stairs_3_4(): Promise<void> {
    await PSGame.warp(19, 32, false);
  }

  public static async stairs_4_3(): Promise<void> {
    await PSGame.warp(6, 32, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP1, Trap.INFO_CORONA_TRAP1, 3, 2);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP2, Trap.INFO_CORONA_TRAP2, 5, 7);
  }

  public static async trap3(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP3, Trap.INFO_CORONA_TRAP3, 11, 7);
  }

  public static async trap4(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP4, Trap.INFO_CORONA_TRAP4, 3, 12);
  }

  public static async trap5(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP5, Trap.INFO_CORONA_TRAP5, 8, 10);
  }

  public static async trap6(): Promise<void> {
    await PSGame.trapRoutine(Trap.CORONA_TRAP6, Trap.INFO_CORONA_TRAP6, 13, 11);
  }

  public static async dezorian1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.DEZO, DezoType.REGULAR as unknown as EntityClothes);
    await PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian1"));
    await PSMenu.endScene();
  }

  public static async dezorian2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.DEZO, DezoType.REGULAR as unknown as EntityClothes);
    await PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian2"));
    await PSMenu.endScene();
  }

  public static async torch(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.DEZO, DezoType.TORCH as unknown as EntityClothes);
    if (await PSMenu.Prompt(PSGame.getString("Corona_Tower_Dezorian_Priest"), PSGame.getYesNo()) === 1) {
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye))) {
        PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye));
        PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch));
        await PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian_PriestYes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian_PriestNoGem"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian_PriestNo"));
    }

    await PSMenu.endScene();
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 52, 14);
  }
}
