/**
 * Bortevo_cave - Dungeon Script
 * TypeScript port of Bortevo_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Bortevo_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Bortevo_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.GHOUL, PS1Enemy.EVILDEAD, PS1Enemy.SKELETON, PS1Enemy.VAMPIRE]);
      dungeon.setFixedEnemies(0, [PS1Enemy.SKELETON, PS1Enemy.GHOUL]);
      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.BORTEVO_CHEST1, 100, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.BORTEVO_CHEST2, 0, Trapped.ARROW, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.BORTEVO_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.BORTEVO_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async man(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Bortevo_People_Cave"));
    await PSMenu.endScene();
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 26, 48);
  }

  public static async abion_island(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 23, 38);
  }
}
