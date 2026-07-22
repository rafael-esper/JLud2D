/**
 * Prism_cave - Dungeon Script
 * TypeScript port of Prism_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, PSMenu, EntityType, EntityClothes } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Prism_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Prism_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.TITAN, PS1Enemy.FROSTMAN, PS1Enemy.WT_DRAGN]);
      await dungeon.startDungeon();
    }
  }

  public static async chest(): Promise<void> {
    await PSGame.chestFlag(Chest.PRISM_CAVE_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Magic_Hat));
  }

  public static async woman(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.VILLA_WMN_BLUE, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Cave_Deep_Dezo_Woman"));
    await PSMenu.endScene();
  }

  public static async titan(): Promise<void> {
    if (!PSGame.gameData.chestFlags.has(Chest.PRISM_CAVE_CHEST2)) {
      const battle = new PSBattle();
      const outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.CYCLOP)!, 2);
      if (outcome === BattleOutcome.WIN) {
        await PSGame.chestFlag(Chest.PRISM_CAVE_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Aeroprism));
      }
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 71, 86);
  }
}
