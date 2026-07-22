/**
 * Drasgow City Script
 * TypeScript port of Drasgow.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';

export class Drasgow {

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Drasgow_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Drasgow_House_2"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Drasgow_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Drasgow_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Drasgow_People_Ent3"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.DRASGOW), CityHelper.getY(City.DRASGOW));
  }

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DRASGOW_DUNGEON);
  }
}
