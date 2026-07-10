/**
 * Blueberry - Dungeon Script (Tonoe mines)
 * TypeScript port of Blueberry.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Flags } from '../game/GameData';
import { City } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, NecroType, MotaCape } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Blueberry {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Blueberry);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.DRAINER_CRAB, PS1Enemy.WIGHT, PS1Enemy.SKULL_EN]);
      dungeon.setRandomEnemies(1, [PS1Enemy.WIZARD, PS1Enemy.SPHINX, PS1Enemy.NESSIE]);

      // Java sets area 0 twice - the second call overwrites the first
      dungeon.setFixedEnemies(0, [PS1Enemy.DRAINER_CRAB, PS1Enemy.WIZARD, PS1Enemy.DRAINER_CRAB]);
      dungeon.setFixedEnemies(0, [PS1Enemy.SKULL_EN, PS1Enemy.RD_DRAGN, PS1Enemy.SKULL_EN]);

      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.TONOE, 29, 23);
  }

  public static async stairup1(): Promise<void> {
    await PSGame.warp(20, 4, false);
  }

  public static async stairdown1(): Promise<void> {
    await PSGame.warp(4, 9, false);
  }

  public static async stairup2(): Promise<void> {
    await PSGame.warp(10, 1, false);
  }

  public static async stairdown2(): Promise<void> {
    await PSGame.warp(16, 11, false);
  }

  public static async stairup3(): Promise<void> {
    await PSGame.warp(6, 1, false);
  }

  public static async stairdown3(): Promise<void> {
    await PSGame.warp(12, 11, false);
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.TONOE_MINE_CHEST1, 0, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.TONOE_MINE_CHEST2, 1000, Trapped.EXPLOSION, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.TONOE_MINE_CHEST3, 1000, Trapped.ARROW, null);
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.TONOE_MINE_CHEST4, 0, Trapped.ARROW, null);
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.TONOE_MINE_CHEST5, 1000, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Trimate));
  }

  public static async man(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.NECRO, NecroType.ESPER as unknown as EntityClothes);
    await PSMenu.StextLast(PSGame.getString("Tonoe_Mines_Necro_Esper"));
    PSGame.setFlag(Flags.INFO_GOTHIC_NECRO);
    await PSMenu.endScene();
  }

  public static async mota(): Promise<void> {
    if (!PSGame.hasFlag(Flags.INFO_TONOE_DAUGHTER)) {
      await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.MOTA_CUSTOM, MotaCape.YELLOW as unknown as EntityClothes);
      await PSMenu.StextLast(PSGame.getString("Tonoe_People_Rescue"));
      PSGame.setFlag(Flags.INFO_TONOE_DAUGHTER);
    } else {
      await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
    }
    await PSMenu.endScene();
  }

  public static async nightmare(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_TONOE_SACCUBUS)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SACCUBUS)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_TONOE_SACCUBUS);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.TONOE_MINE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Armor_Laconian_Mail));
    }
  }
}
