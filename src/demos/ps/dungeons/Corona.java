package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.DezoType;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Corona {

	private static final Logger log = LogManager.getLogger(Corona.class);
	

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.VAMPIRE_LORD, PS1Enemy.FROSTMAN, PS1Enemy.BATALION, PS1Enemy.LICH});
		dungeon.setRandomEnemies(1, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.SNOW_LION, PS1Enemy.WYVERN, PS1Enemy.FROSTMAN});
		dungeon.setRandomEnemies(2, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.SNOW_LION, PS1Enemy.WYVERN, PS1Enemy.BATALION});
		dungeon.setRandomEnemies(3, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.TITAN, PS1Enemy.MARAUDER});		

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.VAMPIRE_LORD, PS1Enemy.LICH});
		dungeon.setFixedEnemies(1, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.BATALION});
		dungeon.setFixedEnemies(2, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.BATALION, PS1Enemy.BATALION});
		dungeon.setFixedEnemies(3, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.MARAUDER});		
		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST1, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Escape_Cloth));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST2, 0, Trapped.EXPLOSION, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST3, 500, Trapped.NO_TRAP, null);
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST4, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Dimate)); 
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST5, 20, Trapped.NO_TRAP, null);
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST6, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST7, 0, Trapped.ARROW, null);
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST8, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.CORONA_CAVE_CHEST9, 20, Trapped.NO_TRAP, null);
	}

	public static void stairs_1_2() {
		PSGame.warp(23, 7, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(8, 5, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(8, 23, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(23, 4, false);
	}
	public static void stairs_3_4() {
		PSGame.warp(19, 32, false);
	}
	public static void stairs_4_3() {
		PSGame.warp(6, 32, false);
	}

	public static void trap1() {
		PSGame.trapRoutine(Trap.CORONA_TRAP1, Trap.INFO_CORONA_TRAP1, 3, 2);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.CORONA_TRAP2, Trap.INFO_CORONA_TRAP2, 5, 7);
	}
	public static void trap3() {
		PSGame.trapRoutine(Trap.CORONA_TRAP3, Trap.INFO_CORONA_TRAP3, 11, 7);
	}
	public static void trap4() {
		PSGame.trapRoutine(Trap.CORONA_TRAP4, Trap.INFO_CORONA_TRAP4, 3, 12);
	}
	public static void trap5() {
		PSGame.trapRoutine(Trap.CORONA_TRAP5, Trap.INFO_CORONA_TRAP5, 8, 10);
	}
	public static void trap6() {
		PSGame.trapRoutine(Trap.CORONA_TRAP6, Trap.INFO_CORONA_TRAP6, 13, 11);
	}
	
	public static void dezorian1() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.DEZO, DezoType.REGULAR);
		PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian1"));
		PSMenu.endScene();
	}
	public static void dezorian2() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.DEZO, DezoType.REGULAR);
		PSMenu.StextLast(PSGame.getString("Corona_Tower_Dezorian2"));
		PSMenu.endScene();
	}

	public static void torch() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.DEZO, DezoType.TORCH);
		if(PSMenu.Prompt(getString("Corona_Tower_Dezorian_Priest"), getYesNo()) == 1) {
			
			if(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye))) {
				PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye));
				PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch));
				PSMenu.StextLast(getString("Corona_Tower_Dezorian_PriestYes"));				
			} else {
				PSMenu.StextLast(getString("Corona_Tower_Dezorian_PriestNoGem"));
			}
		} else {
			PSMenu.StextLast(getString("Corona_Tower_Dezorian_PriestNo"));	
		}

		PSMenu.endScene();
	}


	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,52,14);
	}
}
