/**
 * Parolit City Script
 * TypeScript port of Parolit.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { Item } from '../game/Item';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Parolit {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL, EntityType.CITY_WMN_BROWN, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Weapon_Iron_Sword),
      PSGame.getItem(OriginalItem.Weapon_Titanium_Sword),
      PSGame.getItem(OriginalItem.Weapon_Ceramic_Sword)
    ]);
    await PSMenu.endScene();
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Parolit_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Parolit_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Parolit_House_3"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Ent3"));
    PSGame.EntFinish();
  }

  public static async spaceport(): Promise<void> {
    if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
      await PSMenu.Stext(PSGame.getString("Parolit_People_Cop_No_Pass"));
    } else {
      await PSMenu.Stext(PSGame.getString("Parolit_People_Cop_Pass"));
      PSGame.mapswitchToPlanet(Planet.PALMA, 70, 57);
    }
  }

  public static async robot1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Cop1"));
    PSGame.EntFinish();
  }

  public static async robot2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Cop2"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.PAROLIT), CityHelper.getY(City.PAROLIT));
  }
}