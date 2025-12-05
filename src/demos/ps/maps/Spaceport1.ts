/**
 * Spaceport1 City Script
 * TypeScript port of Spaceport1.java
 */

import { PSGame } from '../PSGame';
import { Planet, City } from '../game/City';
import { Flags } from '../game/GameData';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { Dungeon } from '../game/Dungeon';

export class Spaceport1 {

  /**
   * Quick transport to Camineet city
   */
  public static async camineet(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Cop_Pass"));
    PSGame.EntFinish();
    PSGame.mapswitchToPlanet(Planet.PALMA, 72, 46);
  }

  /**
   * Quick transport to Parolit city
   */
  public static async parolit(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Cop_Pass"));
    PSGame.EntFinish();
    PSGame.mapswitchToPlanet(Planet.PALMA, 70, 48);
  }

  /**
   * Interactive spaceship service between Camineet and Paseo
   */
  public static async spaceship(): Promise<void> {
    // TODO: Implement spaceship scene when available
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);

    const choice = await PSMenu.Prompt(PSGame.getString("Spaceport_Spaceship_Destination"), [
      PSGame.getString("Spaceport_Spaceship_Camineet"),
      PSGame.getString("Spaceport_Spaceship_Paseo")
    ]);

    if (choice === 0) { // Camineet
      await PSMenu.StextLast(PSGame.getString("Spaceport_Spaceship_ToCamineet"));
      // TODO: Implement spaceship routine to Camineet
      console.log("Spaceport1: Spaceship service to Camineet");
    } else if (choice === 1) { // Paseo
      await PSMenu.StextLast(PSGame.getString("Spaceport_Spaceship_ToPaseo"));
      // TODO: Implement spaceship routine to Paseo
      console.log("Spaceport1: Spaceship service to Paseo");
    }

    await PSMenu.endScene();
  }

  /**
   * Food shop selling basic healing items
   */
  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_WMN_BLOND, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate)
    ]);
    await PSMenu.endScene();
    console.log("Spaceport1: Food shop - healing items for sale");
  }

  /**
   * Passport office with complex dialogue tree and 100 meseta cost
   */
  public static async passport(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.GREEN);

    // Stage 1: Want a passport?
    const wantPassport = await PSMenu.Prompt(
      PSGame.getString("Spaceport_Passport_Question1"),
      PSGame.getYesNo()
    );

    if (wantPassport !== 1) { // Not "Yes"
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_Goodbye"));
      await PSMenu.endScene();
      return;
    }

    // Stage 2: Illegal activities?
    const illegalActivities = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_Question2"),
      PSGame.getYesNo()
    );

    if (illegalActivities === 1) { // "Yes" to illegal activities
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_Illegal"));
      await PSMenu.endScene();
      return;
    }

    // Stage 3: Any illness?
    const illness = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_Question3"),
      PSGame.getYesNo()
    );

    if (illness === 1) { // "Yes" to illness
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_Illness"));
      await PSMenu.endScene();
      return;
    }

    // Stage 4: Payment (100 mesetas)
    const payment = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_Question4"),
      PSGame.getYesNo()
    );

    if (payment !== 1) { // Not "Yes" to payment
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_NoPayment"));
      await PSMenu.endScene();
      return;
    }

    // Check if player has enough money
    const party = PSGame.getParty();
    if (party.getMesetas() < 100) {
      await PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
      await PSMenu.endScene();
      return;
    }

    // All conditions met - issue passport
    party.removeMesetas(100);
    party.addQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));
    await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_Success"));

    await PSMenu.endScene();
    console.log("Spaceport1: Passport issued for 100 mesetas");
  }

  /**
   * Security checkpoint to enter restricted area
   */
  public static async robot_in(): Promise<void> {
    PSGame.EntStart();

    const party = PSGame.getParty();
    const hasPassport = party.hasQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));

    if (!hasPassport) {
      await PSMenu.Stext(PSGame.getString("Spaceport_Robot_NoPassport"));
    } else {
      await PSMenu.Stext(PSGame.getString("Spaceport_Robot_PassportOK"));

      // Check for GOT_HAPSBY flag - confiscate passport if set
      if (PSGame.hasFlag(Flags.GOT_HAPSBY)) {
        party.removeItem(PSGame.getItem(OriginalItem.Quest_Passport));
        await PSMenu.StextNext(PSGame.getString("Spaceport_Robot_Confiscate"));
        console.log("Spaceport1: Passport confiscated due to GOT_HAPSBY flag");
      }

      // TODO: Implement warp functionality for area transition
      // Original: PSGame.warp(17, 6, true);
      console.log("Spaceport1: Entering restricted area (warp functionality needed)");
    }

    PSGame.EntFinish();
  }

  /**
   * Exit from restricted area back to main spaceport
   */
  public static async robot_out(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_Robot_Exit"));

    // TODO: Implement warp functionality for area transition
    // Original: PSGame.warp(28, 12, true);
    console.log("Spaceport1: Exiting restricted area (warp functionality needed)");

    PSGame.EntFinish();
  }

  /**
   * Secret entrance to Gothic Passageway (requires GOT_NOAH flag)
   */
  public static async manhole(): Promise<void> {
    PSGame.EntStart();

    if (PSGame.hasFlag(Flags.GOT_NOAH)) {
      await PSMenu.Stext(PSGame.getString("Spaceport_Manhole_Open"));
      await PSGame.mapswitch(Dungeon.GOTHIC_PASSAGEWAY_IN);
      console.log("Spaceport1: Secret access to Gothic Passageway granted");
    } else {
      await PSMenu.Stext(PSGame.getString("Spaceport_Manhole_Closed"));
      console.log("Spaceport1: Manhole access denied - GOT_NOAH flag not set");
    }

    PSGame.EntFinish();
  }

  /**
   * Generic NPC 1
   */
  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent1"));
    PSGame.EntFinish();
    console.log("Spaceport1: Random citizen 1");
  }

  /**
   * Generic NPC 2
   */
  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent2"));
    PSGame.EntFinish();
    console.log("Spaceport1: Random citizen 2");
  }

  /**
   * Generic NPC 3
   */
  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent3"));
    PSGame.EntFinish();
    console.log("Spaceport1: Random citizen 3");
  }
}