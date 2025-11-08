package demos.ps.dungeons;

import static core.Script.current_map;
import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;

public class Drasgow_dungeon {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(City.DRASGOW,19,17);
	}	
	public static void false_shop() {
		PSMenu.startScene(Scene.CORRIDOR, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_FalseShop"));
		PSMenu.endScene();
	}
	public static void gas_shop() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		if(PSMenu.Prompt(PSGame.getString("Drasgow_People_Dungeon_Shop"), PSGame.getYesNo()) == 1) {
			Item gasShield = PSGame.getItem(OriginalItem.Quest_GasClear);
			if(PSGame.getParty().mst >= gasShield.getCost()) {
				PSGame.getParty().mst-=gasShield.getCost();
				PSGame.getParty().addQuestItem(gasShield);
				PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopYes"));
			}
			else {
				PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopNotEnough"));
			}
		} else {
			PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_ShopNo"));	
		}
		PSMenu.endScene();
	}
	public static void man() {
		PSMenu.startScene(Scene.CORRIDOR, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
		PSMenu.StextLast(PSGame.getString("Drasgow_People_Dungeon_Man"));
		PSMenu.endScene();
	}

	
}
