/**
 * Prison - Dungeon Script (Baya Malay Gate prison)
 * TypeScript port of Prison.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, DezoType } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Prison {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Prison);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async room1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_1"));
    await PSMenu.endScene();
  }

  public static async room2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.DEZO, DezoType.REGULAR as unknown as EntityClothes);
    if (await PSMenu.Prompt(PSGame.getString("Gate_Baya_Malay_Dezorian"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_DezorianYes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_DezorianNo"));
    }
    await PSMenu.endScene();
  }

  public static async room3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_2"));
    await PSMenu.endScene();
  }

  public static async room4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_3"));
    await PSMenu.endScene();
  }

  public static async room5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.VILLA_WMN_BLOND, EntityClothes.BLUE);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Woman_1"));
    await PSMenu.endScene();
  }

  public static async room6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.BEGGAR);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_4"));
    await PSMenu.endScene();
  }

  public static async room7(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.CITY_MAN_BLUE, EntityClothes.BLUE);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_5"));
    await PSMenu.endScene();
  }

  public static async oldman(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Prisoner"));
    await PSMenu.endScene();
  }

  public static async stairs_down(): Promise<void> {
    await PSGame.warp(2, 19, false);
  }

  public static async stairs_up(): Promise<void> {
    await PSGame.warp(8, 19, false);
  }

  public static async robot(): Promise<void> {
    if (!PSGame.hasFlag(Flags.MONSTER_PRISON_ROBOTCOP)) {
      const currentScene = PSGame.getCurrentScene();
      if (!currentScene) return;

      let outcome = BattleOutcome.TALK;

      const robotcop = PSLibEnemy.getEnemyByEnum(PS1Enemy.ROBOTCOP)!;
      await robotcop.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, robotcop.getChr());

      if (await PSMenu.Prompt(PSGame.getString("Gate_Baya_Malay_Robot"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_RobotYes"));
        await PSGame.warp(11, 21, false);
      } else {
        await PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_RobotNo"));
        const battle = new PSBattle();
        outcome = await battle.battleScene(PSSceneType.CORRIDOR, robotcop, 3); // Java: changed to 3
      }

      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_PRISON_ROBOTCOP);
      }

      await PSMenu.endScene();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 105, 35);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 105, 32);
  }
}
