/**
 * Casba Village Script
 * TypeScript port of Casba.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Casba {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_MAN_BROWN, EntityClothes.WHITE);
    await PSGame.Hospital(2); // more expensive
    await PSMenu.endScene();
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, SpecialEntity.PRIEST);
    await PSGame.Church(2); // more expensive
    await PSMenu.endScene();
  }

  public static async hand_shop1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.VILLA_MAN_BROWN, EntityClothes.GREEN);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet),
      PSGame.getItem(OriginalItem.Inventory_Magic_Hat)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Vehicle_LandMaster)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
    if (await PSMenu.Prompt(PSGame.getString("Casba_House_1"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Casba_House_1Yes"));
      PSGame.setFlag(Flags.INFO_HOVER);
    } else {
      await PSMenu.StextLast(PSGame.getString("Casba_House_1No"));
    }
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Casba_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.BEGGAR);
    await PSMenu.Stext(PSGame.getString("Casba_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.OLDMAN);
    await PSMenu.Stext(PSGame.getString("Casba_House_4"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Casba_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Casba_People_Ent1"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, CityHelper.getX(City.CASBA), CityHelper.getY(City.CASBA));
  }

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.CASBA_CAVE_OUT);
  }
}
