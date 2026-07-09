/**
 * Aukba_entrance Script
 * TypeScript port of Aukba_entrance.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';

export class Aukba_entrance {

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.AUKBA_TUNNEL_IN);
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.DEZORIS, CityHelper.getX(City.AUKBA_ENTRANCE), CityHelper.getY(City.AUKBA_ENTRANCE));
  }
}
