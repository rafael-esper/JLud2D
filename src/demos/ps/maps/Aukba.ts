/**
 * Aukba Village Script
 * TypeScript port of Aukba.java
 */

import { PSGame } from '../PSGame';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, DezoType, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

// DezoType values act as the "clothes" frame offset, same numeric slot as EntityClothes.
const dezo = (d: DezoType): EntityClothes => d as unknown as EntityClothes;

export class Aukba {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSGame.Hospital(3); // Pricey!
    await PSMenu.endScene();
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSGame.Church(3); // Pricey!
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    ]);
    await PSMenu.endScene();
  }

  public static async icedigger_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Vehicle_IceDecker)
    ]);
    await PSMenu.endScene();
  }

  public static async lefthouse1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Left_House_1"));
    await PSMenu.endScene();
  }

  public static async lefthouse2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Left_House_2"));
    await PSMenu.endScene();
  }

  public static async lefthouse3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Left_House_3"));
    await PSMenu.endScene();
  }

  public static async lefthouse4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Left_House_4"));
    await PSMenu.endScene();
  }

  public static async lefthouse5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    if (await PSMenu.Prompt(PSGame.getString("Aukba_Left_House_5"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Aukba_Left_House_5Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Aukba_Left_House_5No"));
    }
    await PSMenu.endScene();
  }

  public static async lefthouse6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Left_House_6"));
    await PSMenu.endScene();
  }

  public static async righthouse1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_1"));
    await PSMenu.endScene();
  }

  public static async righthouse2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_2"));
    await PSMenu.endScene();
  }

  public static async righthouse3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_3"));
    await PSMenu.endScene();
  }

  public static async righthouse4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_4"));
    await PSMenu.endScene();
  }

  public static async righthouse5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_5"));
    await PSMenu.endScene();
  }

  public static async righthouse6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.DEZO, dezo(DezoType.REGULAR));
    await PSMenu.Stext(PSGame.getString("Aukba_Right_House_6"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Aukba_Left_Ent"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Aukba_Right_Ent"));
    PSGame.EntFinish();
  }

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.AUKBA_TUNNEL_OUT);
  }
}
