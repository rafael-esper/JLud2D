package demos.ps.dungeons;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;

public class Naula {

	private static final Logger log = LogManager.getLogger(Naula.class);
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-3, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WEREBAT});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.EVILDEAD, PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.GIANTFLY, PS1Enemy.EVILDEAD});
		dungeon.setFixedEnemies(-3, new PS1Enemy[]{PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.NAULA_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Short_Sword));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.NAULA_CHEST2, 10, Trapped.NO_TRAP, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.NAULA_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
	}

	public static void stairs_1_2() {
		PSGame.warp(11, 5, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(2, 5, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(24, 5, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(14, 3, false);
	}
	public static void stairs_3_4() {
		PSGame.warp(28, 2, false);
	}	
	public static void stairs_4_3() {
		PSGame.warp(18, 4, false);
	}	
	
	
	public static void cake_shop() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.VILLA_MAN_BLUE, EntityClothes.BLUE);
		if(PSMenu.Prompt(PSGame.getString("Naula_CakeShop"), PSGame.getYesNo()) == 1) {
			Item cake = PSGame.getItem(OriginalItem.Quest_Shortcake);
			if(PSGame.getParty().mst >= cake.getCost()) {
				PSGame.getParty().mst-=cake.getCost();
				PSGame.getParty().addQuestItem(cake);
				PSMenu.StextLast(PSGame.getString("Naula_CakeShopYes"));
			}
			else {
				PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
			}
		} else {
			PSMenu.StextLast(PSGame.getString("Naula_CakeShopNo"));	
		}
		PSMenu.endScene();
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,99,13);
	}
}
