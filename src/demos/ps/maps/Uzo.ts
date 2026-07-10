/**
 * Uzo Village Script
 * TypeScript port of Uzo.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, LargeEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { PSOutcome } from '../menu/MenuStack';

export class Uzo {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BROWN, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, SpecialEntity.PRIEST);
    await PSGame.Church(1);
    await PSMenu.endScene();
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD_VILLAGE, EntityType.VILLA_WMN_BROWN, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate)
    ]);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Weapon_Silver_Tusk),
      PSGame.getItem(OriginalItem.Weapon_Light_Saber),
      PSGame.getItem(OriginalItem.Armor_Saber_Fur)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.BLUE);
    if (await PSMenu.Prompt(PSGame.getString("Uzo_House_1"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Uzo_House_1Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Uzo_House_1No"));
      PSGame.setFlag(Flags.INFO_FLUTE);
    }
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Uzo_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BROWN, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Uzo_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Uzo_House_4"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Uzo_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Uzo_People_Ent1"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, CityHelper.getX(City.UZO), CityHelper.getY(City.UZO));
  }

  public static async spaceship(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.DESERT, LargeEntity.HAPSBY);
    await PSGame.hapsbyRoutine(City.UZO);
    await PSMenu.endSceneWithOutcome(PSOutcome.FADE_HOUSE);
  }
}
