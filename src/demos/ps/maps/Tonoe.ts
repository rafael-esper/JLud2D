/**
 * Tonoe Village Script
 * TypeScript port of Tonoe.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Sound } from '../game/PSLibSound';
import { PSSceneType, EntityType, EntityClothes, MotaCape, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

// MotaCape values act as the "clothes" frame offset, same numeric slot as EntityClothes.
const cape = (c: MotaCape): EntityClothes => c as unknown as EntityClothes;

export class Tonoe {

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, EntityType.MOTA_CAP, cape(MotaCape.YELLOW));
    await PSGame.Church(1);
    await PSMenu.endScene();
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD_VILLAGE, EntityType.MOTA_CAP, cape(MotaCape.YELLOW));
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate),
      PSGame.getItem(OriginalItem.Inventory_Trimate)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.MOTA_NOCAP, cape(MotaCape.GREEN));
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Quest_Alsuline)
    ]);
    await PSMenu.endScene();
  }

  public static async chief_house(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_CUSTOM, cape(MotaCape.RED));
    await PSMenu.Stext(PSGame.getString("Tonoe_House_Chief"));
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_NOCAP, cape(MotaCape.YELLOW));
    if (await PSMenu.Prompt(PSGame.getString("Tonoe_House_1"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Tonoe_House_1Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Tonoe_House_1No"));
    }
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_CAP, cape(MotaCape.RED));
    await PSMenu.Stext(PSGame.getString("Tonoe_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_MASK, cape(MotaCape.GREEN));
    if (!PSGame.hasFlag(Flags.INFO_TONOE_DAUGHTER)) {
      await PSMenu.Stext(PSGame.getString("Tonoe_House_3"));
    } else {
      await PSMenu.Stext(PSGame.getString("Tonoe_House_3_Rescue"));
      PSGame.playSound(PS1Sound.CURE);
      PSGame.getParty().healAll(false);
    }
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_MASK, cape(MotaCape.BROWN));
    await PSMenu.Stext(PSGame.getString("Tonoe_House_4"));
    await PSMenu.endScene();
  }

  public static async house5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.MOTA_CUSTOM, cape(MotaCape.GREEN));
    await PSMenu.Stext(PSGame.getString("Tonoe_House_5"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Tonoe_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Tonoe_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Tonoe_People_Ent3"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, CityHelper.getX(City.TONOE), CityHelper.getY(City.TONOE));
  }

  public static async cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BLUEBERRY_MINE);
  }
}
