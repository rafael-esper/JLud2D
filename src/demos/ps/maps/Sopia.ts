/**
 * Sopia Village Script
 * TypeScript port of Sopia.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';

export class Sopia {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BROWN, EntityClothes.WHITE);
    await PSGame.Hospital(2); // More expensive
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BROWN, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Sopia_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLUE, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Sopia_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Sopia_House_3"), PSGame.getYesNo()) === 1) {
      if (PSGame.getParty().mst < 400) {
        await PSMenu.StextLast(PSGame.getString("Sopia_House_3NotEnough"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Sopia_House_3Yes"));
        PSGame.getParty().mst -= 400;
        PSGame.setFlag(Flags.INFO_PERSEUS);
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_3No"));
    }
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, EntityType.VILLA_WMN_BROWN, EntityClothes.GREEN);
    if (await PSMenu.Prompt(PSGame.getString("Sopia_House_4"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_4Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_4No"));
    }
    await PSMenu.endScene();
  }

  public static async house5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Sopia_House_5"), PSGame.getYesNo()) === 1) {
      const foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
      if (foundCola) {
        await PSMenu.StextLast(PSGame.getString("Sopia_House_5Yes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Sopia_House_5NotEnough"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_5No"));
    }
    await PSMenu.endScene();
  }

  public static async house6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Sopia_House_6"));
    await PSMenu.endScene();
  }

  public static async house7(): Promise<void> {
    await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.BEGGAR);
    if (await PSMenu.Prompt(PSGame.getString("Sopia_House_7"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_7Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Sopia_House_7No"));
    }
    await PSMenu.endScene();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, CityHelper.getX(City.SOPIA), CityHelper.getY(City.SOPIA));
  }
}
