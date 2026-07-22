/**
 * Loar Village Script
 * TypeScript port of Loar.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Loar {

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, SpecialEntity.PRIEST);
    await PSGame.Church(2);
    await PSMenu.endScene();
  }

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.BLUE);
    await PSGame.Hospital(2);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Armor_White_Cloak),
      PSGame.getItem(OriginalItem.Weapon_Heat_Gun),
      PSGame.getItem(OriginalItem.Weapon_Silver_Tusk)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Loar_House_1"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Loar_House_1Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Loar_House_1No"));
    }
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Loar_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Loar_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Loar_House_4"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Loar_People_Man"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.LOAR), CityHelper.getY(City.LOAR));
  }
}
