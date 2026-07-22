/**
 * Sky_castle (Air Castle) Script
 * TypeScript port of Sky_castle.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Dungeon } from '../game/Dungeon';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';

export class Sky_castle {

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Air_Castle_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, SpecialEntity.OLDMAN);
    await PSMenu.Stext(PSGame.getString("Air_Castle_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Air_Castle_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Air_Castle_House_4"));
    await PSMenu.endScene();
  }

  public static async house5(): Promise<void> {
    if (!PSGame.hasFlag(Flags.MONSTER_SKY_SERPENT)) {
      const battle = new PSBattle();
      const outcome = await battle.battleScene(PSSceneType.BLUE_HOUSE, PSLibEnemy.getEnemyByEnum(PS1Enemy.SERPENT)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_SKY_SERPENT);
      }
    } else {
      await PSMenu.startScene(PSSceneType.BLUE_HOUSE, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
      await PSMenu.endScene();
    }
  }

  public static async castle(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.LASSIC_CASTLE);
  }
}
