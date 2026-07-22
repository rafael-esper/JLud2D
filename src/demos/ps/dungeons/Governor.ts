/**
 * Governor - Dungeon Script (Paseo Governor's passageway)
 * TypeScript port of Governor.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { City } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, PSMenu } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Governor {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Governor);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async robot(): Promise<void> {
    if (!PSGame.hasFlag(Flags.GOVERNOR_CAKE)) {
      const currentScene = PSGame.getCurrentScene();
      if (!currentScene) return;

      const robotcop = PSLibEnemy.getEnemyByEnum(PS1Enemy.ROBOTCOP)!;
      await robotcop.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, robotcop.getChr());

      if (await PSMenu.Prompt(PSGame.getString("Paseo_Passageway_Cop"), PSGame.getYesNo()) === 1) {
        if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Shortcake))) {
          PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Shortcake));
          await PSMenu.StextLast(PSGame.getString("Paseo_Passageway_Cop_Gift"));
          PSGame.setFlag(Flags.GOVERNOR_CAKE);
        } else {
          await PSMenu.StextLast(PSGame.getString("Paseo_Passageway_Cop_NoGiftYes"));
        }
      } else {
        await PSMenu.StextLast(PSGame.getString("Paseo_Passageway_Cop_NoGiftNo"));
      }

      await PSMenu.endScene();
      // Unless the party gives the cake, they get backed off
      if (!PSGame.hasFlag(Flags.GOVERNOR_CAKE)) {
        PSGame.currentDungeon?.turnBack();
      }
    }
  }

  public static async governor(): Promise<void> {
    await PSGame.mapswitchToCity(City.PASEO, 19, 11);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.PASEO, 22, 18);
  }
}
