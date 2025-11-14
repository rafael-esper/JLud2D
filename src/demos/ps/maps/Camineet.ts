/**
 * Camineet City Script
 * TypeScript port of Camineet.java
 */

import { PSGame } from '../PSGame';
import { GameType } from '../game/GameData';
import { Planet, City } from '../game/City';
import { PS1Sound } from '../game/PSLibSound';
import { PS1Image } from '../game/PSLibImage';
import { Item, OriginalItem } from '../game/Item';
import { PSScene_Type, PSSpecialEntity } from '../PSScene';
import { PSCancellable } from '../menu/MenuStack';

export class Camineet {

  public static alis(): void {
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      // PSMenu.startScene(Scene.YELLOW_HOUSE, SpecialEntity.NONE);
      // PSMenu.Stext(PSGame.getString("Camineet_House_Alis"));
      // PSMenu.endScene();
      console.log("Camineet: Alis house (PS_ORIGINAL)");
    } else {
      // PSMenu.startScene(Scene.YELLOW_HOUSE, LargeEntity.ALIS);
      // PSMenu.Stext(PSGame.getString("Camineet_House_Alis_Odin"));
      // PSMenu.endScene();
      console.log("Camineet: Alis house (other game type)");
    }
  }

  public static warehouse(): void {
    // PSGame.mapswitch(Dungeon.WAREHOUSE);
    console.log("Camineet: Entering warehouse");
  }

  public static church(): void {
    // PSMenu.startScene(Scene.CHURCH, SpecialEntity.PRIEST);
    // PSGame.Church(1);
    // PSMenu.endScene();
    console.log("Camineet: Church - healing services");
  }

  public static yellow(): void { // house
    // PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    // PSMenu.Stext(PSGame.getString("Camineet_House_Man"));
    // PSMenu.endScene();
    console.log("Camineet: Yellow house man");
  }

  public static oldman(): void { // house
    // PSMenu.startScene(Scene.BLUE_HOUSE, SpecialEntity.OLDMAN);
    // if (PSMenu.Prompt(PSGame.getString("Camineet_House_Oldman"), PSGame.getYesNo()) === 1) {
    //   PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_Yes"));
    // } else {
    //   PSMenu.StextNext(PSGame.getString("Camineet_House_Oldman_No"));
    //   PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_NoCrisis"));
    // }
    // PSMenu.endScene();
    console.log("Camineet: Old man house with dialogue choice");
  }

  public static nekise(): void {
    // PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      // if (!PSGame.hasFlag(Flags.VISIT_NEKISE)) {
      //   PSGame.setFlag(Flags.VISIT_NEKISE);
      //   PSMenu.StextFirst(PSGame.getString("Camineet_House_Nekise_intro"));
      //   PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot));
      //   PSMenu.StextLast(PSGame.getString("Camineet_House_Nekise_greet"));
      // } else {
      //   PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_greet"));
      // }
      console.log("Camineet: Nekise - first visit gives Laconian Pot");
    } else {
      // PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_Odin"));
      console.log("Camineet: Nekise - Odin version");
    }
    // PSMenu.endScene();
  }

  public static suelo(): void {
    // PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.RED);

    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      // if (!PSGame.hasFlag(Flags.VISIT_SUELO)) {
      //   PSGame.setFlag(Flags.VISIT_SUELO);
      //   PSMenu.StextFirst(PSGame.getString("Camineet_House_Suelo_intro1"));
      //   PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro2"));
      //   PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro3"));
      //   PSMenu.StextLast(PSGame.getString("Camineet_House_Suelo_greet"));
      // } else {
      //   PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_greet"));
      // }
      PSGame.playSound(PS1Sound.CURE);
      PSGame.getParty().healAll(false);
      console.log("Camineet: Suelo - healing house");
    } else {
      // PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_Odin"));
      console.log("Camineet: Suelo - Odin version");
    }
    // PSMenu.endScene();
  }

  public static weap_shop(): void {
    // PSMenu.startScene(Scene.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    // PSGame.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, [
    //   PSGame.getItem(OriginalItem.Shield_Leather_Shield),
    //   PSGame.getItem(OriginalItem.Shield_Iron_Shield),
    //   PSGame.getItem(OriginalItem.Shield_Ceramic_Shield)
    // ]);
    // PSMenu.endScene();
    console.log("Camineet: Weapon shop - shields for sale");
  }

  public static food_shop(): void {
    // PSMenu.startScene(Scene.SHOP_FOOD, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    // PSGame.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, [
    //   PSGame.getItem(OriginalItem.Inventory_Monomate),
    //   PSGame.getItem(OriginalItem.Inventory_Dimate)
    // ]);
    // PSMenu.endScene();
    console.log("Camineet: Food shop - healing items for sale");
  }

  public static hand_shop(): void {
    // PSMenu.startScene(Scene.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    // PSGame.Shop(PSGame.getString("Shop_Tool_Welcome"), true, [
    //   PSGame.getItem(OriginalItem.Inventory_Flash),
    //   PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
    //   PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    // ]);
    // PSMenu.endScene();
    console.log("Camineet: Hand shop - tools for sale");
  }

  public static ent1(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent1"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 1");
  }

  public static ent2(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent2"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 2");
  }

  public static ent3(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent3"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 3");
  }

  public static ent4(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent4"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 4");
  }

  public static exit1(): void {
    PSGame.mapswitch(Planet.PALMA, 84, 49);
  }

  public static exit2(): void {
    PSGame.mapswitch(Planet.PALMA, 82, 49);
  }

  public static spaceport(): void {
    // if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
    //   PSMenu.Stext(PSGame.getString("Camineet_People_Cop_No_Pass"));
    // } else {
    //   PSMenu.Stext(PSGame.getString("Camineet_People_Cop_Pass"));
    //   PSGame.mapswitch(Planet.PALMA, 81, 46);
    // }
    console.log("Camineet: Spaceport - need Road Pass");
  }

  public static robot1(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Cop1"));
    // PSGame.EntFinish();
    console.log("Camineet: Robot guard 1");
  }

  public static robot2(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Cop2"));
    // PSGame.EntFinish();
    console.log("Camineet: Robot guard 2");
  }
}