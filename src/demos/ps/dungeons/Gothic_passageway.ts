/**
 * Gothic_passageway - Dungeon Script
 * TypeScript port of Gothic_passageway.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { City } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Gothic_passageway {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Gothic_passageway);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE]);
      dungeon.setFixedEnemies(0, [PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE]);
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.SPACEPORT1, 2, 18);
  }

  public static async gothic(): Promise<void> {
    await PSGame.mapswitchToCity(City.GOTHIC, 31, 8);
  }

  public static async assistant(): Promise<void> {
    if (PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
      await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
    } else {
      await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.CITY_MAN_BLOND, EntityClothes.WHITE);
      if (!PSGame.hasFlag(Flags.LUVENO_FREE)) {
        await PSMenu.StextLast(PSGame.getString("Spaceport_Passage_Assistant"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Spaceport_Passage_Assistant_pos_Luveno"));
        PSGame.setFlag(Flags.GOT_ASSISTANT);
      }
    }
    await PSMenu.endScene();
  }
}
