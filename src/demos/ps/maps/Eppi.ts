/**
 * Eppi Village Script
 * TypeScript port of Eppi.java
 */

import { PSGame } from '../PSGame';
import { Flags, GameType } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Eppi {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Weapon_Iron_Axe),
      PSGame.getItem(OriginalItem.Weapon_Needle_Gun),
      PSGame.getItem(OriginalItem.Shield_Bronze_Shield)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Eppi_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Eppi_House_2"));
    await PSMenu.endScene();
  }

  public static async houseKey(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.HASHIM);
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key))) {
        await PSMenu.StextLast(PSGame.getString("Eppi_House_Key_Return"));
      } else {
        if (await PSMenu.Prompt(PSGame.getString("Eppi_House_Key"), PSGame.getYesNo()) === 1) {
          await PSMenu.StextLast(PSGame.getString("Eppi_House_KeyYes"));
          PSGame.setFlag(Flags.INFO_KEY);
        } else {
          await PSMenu.StextLast(PSGame.getString("Eppi_House_KeyNo"));
        }
      }
    } else {
      // ODIN QUEST
      if (PSGame.hasFlag(Flags.GOT_MYAU)) {
        await PSMenu.Stext(PSGame.getString("Eppi_House_Key_Return"));
      } else {
        await PSMenu.Stext(PSGame.getString("Eppi_House_Key_Myau"));
        PSGame.setFlag(Flags.GOT_MYAU);

        // TODO: Party member recruitment + cinematic system not implemented yet.
        // Java adds Myau (MUSK_CAT/NATURER), levels him twice, heals, then plays the
        // Myau/Odin intro cinematics and reallocates the party.
        console.log("Eppi: Myau recruitment (Odin quest) - party member and cinematic system not implemented yet");
      }
    }
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Eppi_House_3"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Eppi_House_3_Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Eppi_House_3_No"));
    }
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Eppi_House_4"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Eppi_People_Ent1"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.EPPI), CityHelper.getY(City.EPPI));
  }
}
