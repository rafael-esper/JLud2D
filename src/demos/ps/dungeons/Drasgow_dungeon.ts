/**
 * Drasgow_dungeon - Dungeon Script
 * TypeScript port of Drasgow_dungeon.java
 */

import { PSGame } from '../PSGame';
import { City } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, PSMenu, EntityType, EntityClothes } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';

export class Drasgow_dungeon {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Drasgow_dungeon);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.DRASGOW, 19, 17);
  }

  public static async false_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CORRIDOR, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_FalseShop"));
    await PSMenu.endScene();
  }

  public static async gas_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    if (await PSMenu.Prompt(PSGame.getString("Drasgow_People_Dungeon_Shop"), PSGame.getYesNo()) === 1) {
      const gasShield = PSGame.getItem(OriginalItem.Quest_GasClear);
      if (PSGame.getParty().mst >= gasShield.getCost()) {
        PSGame.getParty().mst -= gasShield.getCost();
        PSGame.getParty().addQuestItem(gasShield);
        await PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopYes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopNotEnough"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopNo"));
    }
    await PSMenu.endScene();
  }

  public static async man(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CORRIDOR, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
    await PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_Man"));
    await PSMenu.endScene();
  }
}
