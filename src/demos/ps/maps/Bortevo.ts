/**
 * Bortevo City Script
 * TypeScript port of Bortevo.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, SpecialEntity, LargeEntity, PSMenu } from '../PSMenu';

export class Bortevo {

  public static async house(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.BEGGAR);
    await PSMenu.Stext(PSGame.getString("Bortevo_People_Man_2"));
    await PSMenu.endScene();
  }

  public static async hapsby(): Promise<void> {
    if (!PSGame.hasFlag(Flags.GOT_HAPSBY)) {
      await PSMenu.startSceneWithLargeEntity(PSSceneType.RUINED_HOUSE, LargeEntity.JUNK);
    } else {
      await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.NONE);
    }

    await PSMenu.instance.waitB1();
    if (!PSGame.hasFlag(Flags.GOT_HAPSBY) && PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Polymeteral))) {
      await PSMenu.Stext(PSGame.getString("Bortevo_House_Hapsby"));
      await PSMenu.startSceneWithLargeEntity(PSSceneType.SCREEN_NOFADE, LargeEntity.HAPSBY);
      await PSMenu.instance.waitDelay(30);
      await PSMenu.Stext(PSGame.getString("Bortevo_Hapsby_Free"));
      await PSMenu.StextNext(PSGame.getString("Bortevo_Hapsby"));
      PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Polymeteral));
      PSGame.setFlag(Flags.GOT_HAPSBY);
    } else {
      await PSMenu.Stext(PSGame.getString("Chest_Search"));
    }
    await PSMenu.endScene();
  }

  public static async junk(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.RUINED_HOUSE, LargeEntity.JUNK);
    await PSMenu.instance.waitB1();
    await PSMenu.Stext(PSGame.getString("Chest_Search"));
    await PSMenu.endScene();
  }

  public static async hovercraft(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.RUINED_HOUSE, LargeEntity.JUNK);
    await PSMenu.instance.waitB1();
    if (PSGame.hasFlag(Flags.INFO_HOVER) && !PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_FlowMover))) {
      await PSMenu.Stext(PSGame.getString("Bortevo_House_Hovercraft"));
      PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Vehicle_FlowMover));
    } else {
      await PSMenu.Stext(PSGame.getString("Chest_Search"));
    }
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Bortevo_People_Man_1"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.BORTEVO), CityHelper.getY(City.BORTEVO));
  }
}
