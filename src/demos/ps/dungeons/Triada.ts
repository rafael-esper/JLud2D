/**
 * Triada - Dungeon Script (Triada Prison)
 * TypeScript port of Triada.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { PSOutcome } from '../menu/MenuStack';
import { MainEngine } from '../../../core/MainEngine';

export class Triada {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Triada);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async luveno(): Promise<void> {
    if (!PSGame.hasFlag(Flags.LUVENO_FREE)) {
      await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.LUVENO);
    } else {
      await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.NONE);
    }

    if (!PSGame.hasFlag(Flags.LUVENO_INSIST_1)) {
      await PSMenu.StextLast(PSGame.getString("Triada_Luveno_1"));
      PSGame.setFlag(Flags.LUVENO_INSIST_1);
    } else if (!PSGame.hasFlag(Flags.LUVENO_INSIST_2)) {
      await PSMenu.StextLast(PSGame.getString("Triada_Luveno_2"));
      PSGame.setFlag(Flags.LUVENO_INSIST_2);
    } else if (!PSGame.hasFlag(Flags.LUVENO_FREE)) {
      if (await PSMenu.Prompt(PSGame.getString("Triada_Luveno_3"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextLast(PSGame.getString("Triada_Luveno_3Yes"));
        PSGame.setFlag(Flags.LUVENO_FREE);
      } else {
        await PSMenu.StextLast(PSGame.getString("Triada_Luveno_3No"));
      }
    } else {
      await PSMenu.instance.waitAnyButton();
    }

    await PSMenu.endScene();
  }

  public static async man1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Triada_Man_1"), PSGame.getYesNo()) === 1) {
      const foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
      if (foundCola) {
        await PSMenu.StextLast(PSGame.getString("Triada_Man_1Yes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Gothic_People_EntNotEnoughCola"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Triada_Man_1No"));
    }

    await PSMenu.endScene();
  }

  public static async man2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Triada_Man_2"));
    await PSMenu.endScene();
  }

  public static async man3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Triada_Man_3"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Triada_Man_3Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Triada_Man_3No"));
    }
    await PSMenu.endScene();
  }

  public static async man4(): Promise<void> {
    // Java calls startScene twice here (copy-paste slip) - once is enough
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Triada_Man_4"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Triada_Man_4Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Triada_Man_4No"));
    }
    await PSMenu.endScene();
  }

  public static async man5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Triada_Man_5"));
    await PSMenu.endScene();
  }

  public static async tarantul(): Promise<void> {
    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    const tarantul = PSLibEnemy.getEnemyByEnum(PS1Enemy.TARANTUL)!;
    await tarantul.loadCHR(currentScene);
    await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, tarantul.getChr());
    await PSMenu.StextLast(PSGame.getString("Triada_Spider"));
    await PSMenu.endSceneWithOutcome(PSOutcome.FADE_DUNGEON);
  }

  public static async robot(): Promise<void> {
    if (!PSGame.hasFlag(Flags.MONSTER_TRIADA_ROBOTCOP)) {
      const currentScene = PSGame.getCurrentScene();
      if (!currentScene) return;

      let outcome = BattleOutcome.TALK;
      const battle = new PSBattle();

      const robotcop = PSLibEnemy.getEnemyByEnum(PS1Enemy.ROBOTCOP)!;
      await robotcop.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, robotcop.getChr());
      if (await PSMenu.Prompt(PSGame.getString("Triada_Robot"), PSGame.getYesNo()) === 1) {
        if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
          await PSMenu.StextLast(PSGame.getString("Triada_RobotYes"));
        } else {
          await PSMenu.StextLast(PSGame.getString("Spaceport_People_Cop_YesLie"));
          // Wipe the Prompt's lingering text box so it doesn't show over the battle scene.
          PSMenu.instance.clearMenus();
          outcome = await battle.battleScene(PSSceneType.CORRIDOR, robotcop, 1);
        }
      } else {
        await PSMenu.StextLast(PSGame.getString("Triada_RobotNo"));
        PSMenu.instance.clearMenus();
        outcome = await battle.battleScene(PSSceneType.CORRIDOR, robotcop, 1);
      }

      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_TRIADA_ROBOTCOP);
      }

      await PSMenu.endScene();
    }
  }

  public static async skeleton(): Promise<void> {
    if (!PSGame.hasFlag(Flags.MONSTER_TRIADA_SKELETON)) {
      const battle = new PSBattle();
      const outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SKELETON)!, 3);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_TRIADA_SKELETON);
      }
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 51, 83);
  }
}
