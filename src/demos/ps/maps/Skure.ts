/**
 * Skure City Script
 * TypeScript port of Skure.java
 */

import { PSGame } from '../PSGame';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Skure {

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH, SpecialEntity.PRIEST);
    await PSGame.Church(2);
    await PSMenu.endScene();
  }

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL, EntityType.CITY_WMN_BLUE, EntityClothes.WHITE);
    await PSGame.Hospital(2);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BLUE, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Weapon_Psycho_Wand),
      PSGame.getItem(OriginalItem.Shield_Animal_Glove),
      PSGame.getItem(OriginalItem.Weapon_Laser_Gun)
    ]);
    await PSMenu.endScene();
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_MAN_BLUE, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate),
      PSGame.getItem(OriginalItem.Inventory_Trimate)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BLUE, EntityClothes.GREEN);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BLUE, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Skure_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLUE, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Skure_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_WMN_BLUE, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Skure_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLUE, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Skure_House_4"));
    await PSMenu.endScene();
  }

  public static async house5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, SpecialEntity.OLDMAN);
    await PSMenu.Stext(PSGame.getString("Skure_House_5"));
    await PSMenu.endScene();
  }

  public static async house6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLUE, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Skure_House_6"));
    await PSMenu.endScene();
  }

  public static async house7(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_WMN_BLUE, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Skure_House_7"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Skure_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Skure_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Skure_People_Ent3"));
    PSGame.EntFinish();
  }

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.SKURE_TUNNEL_OUT);
  }
}
