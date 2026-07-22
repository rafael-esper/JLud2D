/**
 * Naula - Dungeon Script
 * TypeScript port of Naula.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Naula {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Naula);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
      dungeon.setRandomEnemies(-3, [PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);

      dungeon.setFixedEnemies(0, [PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WEREBAT]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.EVILDEAD, PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.GIANTFLY, PS1Enemy.EVILDEAD]);
      dungeon.setFixedEnemies(-3, [PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.NAULA_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Short_Sword));
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.NAULA_CHEST2, 10, Trapped.NO_TRAP, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.NAULA_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(11, 5, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(2, 5, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(24, 5, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(14, 3, false);
  }

  public static async stairs_3_4(): Promise<void> {
    await PSGame.warp(28, 2, false);
  }

  public static async stairs_4_3(): Promise<void> {
    await PSGame.warp(18, 4, false);
  }

  public static async cake_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.VILLA_MAN_BLUE, EntityClothes.BLUE);
    if (await PSMenu.Prompt(PSGame.getString("Naula_CakeShop"), PSGame.getYesNo()) === 1) {
      const cake = PSGame.getItem(OriginalItem.Quest_Shortcake);
      if (PSGame.getParty().mst >= cake.getCost()) {
        PSGame.getParty().mst -= cake.getCost();
        PSGame.getParty().addQuestItem(cake);
        await PSMenu.StextLast(PSGame.getString("Naula_CakeShopYes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Naula_CakeShopNo"));
    }
    await PSMenu.endScene();
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 99, 13);
  }
}
