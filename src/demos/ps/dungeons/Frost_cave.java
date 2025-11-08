package demos.ps.dungeons;

import core.Script;
import demos.ps.PSDungeon;
import demos.ps.oo.PSBattle;
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

public class Frost_cave {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.FROSTMAN, PS1Enemy.WT_DRAGN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.SCORPIUS, PS1Enemy.WT_DRAGN});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.WT_DRAGN, PS1Enemy.TITAN});
		dungeon.setRandomEnemies(-3, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION});
		dungeon.setRandomEnemies(-4, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.TITAN});
		dungeon.setRandomEnemies(-5, new PS1Enemy[]{PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.BATALION});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.STORM_FLY, PS1Enemy.ZOMBIE, PS1Enemy.STORM_FLY});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.FROSTMAN, PS1Enemy.STORM_FLY});
		dungeon.setFixedEnemies(-3, new PS1Enemy[]{PS1Enemy.TITAN, PS1Enemy.FROSTMAN});
		dungeon.setFixedEnemies(-4, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.LICH, PS1Enemy.ZOMBIE});
		dungeon.setFixedEnemies(-5, new PS1Enemy[]{PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.SCORPIUS});
		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST1, 50, Trapped.ARROW, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Magic_Hat));
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Ceramic_Shield));
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST4, 0, Trapped.ARROW, null); 
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Laconian_Shield)); 
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.FROST_DUNGEON_CHEST6, 0, Trapped.EXPLOSION, null);
	}

	public static void stairs_1_up() {
		PSGame.warp(3, 7, false);
	}
	public static void stairs_1_down() {
		PSGame.warp(20, 9, false);
	}
	public static void stairs_2_up() {
		PSGame.warp(5, 7, false);
	}
	public static void stairs_2_down() {
		PSGame.warp(22, 5, false);
	}
	public static void stairs_3_up() {
		PSGame.warp(14, 4, false);
	}
	public static void stairs_3_down() {
		PSGame.warp(30, 2, false);
	}
	public static void stairs_4_up() {
		PSGame.warp(19, 7, false);
	}
	public static void stairs_4_down() {
		PSGame.warp(5, 21, false);
	}
	public static void stairs_5_up() {
		PSGame.warp(22, 4, false);
	}
	public static void stairs_5_down() {
		PSGame.warp(7, 18, false);
	}
	public static void stairs_6_up() {
		PSGame.warp(30, 6, false);
	}
	public static void stairs_6_down() {
		PSGame.warp(15, 20, false);
	}
	public static void stairs_7_up() {
		PSGame.warp(6, 17, false);
	}
	public static void stairs_7_down() {
		PSGame.warp(20, 17, false);
	}
	public static void stairs_8_up() {
		PSGame.warp(10, 17, false);
	}
	public static void stairs_8_down() {
		PSGame.warp(25, 17, false);
	}
	public static void stairs_9_up() {
		PSGame.warp(5, 23, false);
	}
	public static void stairs_9_down() {
		PSGame.warp(20, 23, false);
	}	
	public static void stairs_10_up() {
		PSGame.warp(20, 19, false);
	}
	public static void stairs_10_down() {
		PSGame.warp(4, 26, false);
	}	
	public static void stairs_11_up() {
		PSGame.warp(25, 19, false);
	}
	public static void stairs_11_down() {
		PSGame.warp(9, 27, false);
	}	
	public static void stairs_12_up() {
		PSGame.warp(20, 25, false);
	}
	public static void stairs_12_down() {
		PSGame.warp(6, 32, false);
	}	
	public static void stairs_13_up() {
		PSGame.warp(8, 25, false);
	}
	public static void stairs_13_down() {
		PSGame.warp(21, 28, false);
	}	
	public static void stairs_14_up() {
		PSGame.warp(5, 27, false);
	}
	public static void stairs_14_down() {
		PSGame.warp(21, 31, false);
	}	
	public static void stairs_15_up() {
		PSGame.warp(7, 30, false);
	}
	public static void stairs_15_down() {
		PSGame.warp(21, 32, false);
	}	
	
	public static void trap1() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP1, Trap.INFO_FROST_CAVE_TRAP1, 18, 5);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP2, Trap.INFO_FROST_CAVE_TRAP2, 2, 19);
	}
	public static void trap3() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP3, Trap.INFO_FROST_CAVE_TRAP3, 19, 21);
	}
	public static void trap4() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP4, Trap.INFO_FROST_CAVE_TRAP4, 1, 28);
	}
	public static void trap5() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP5, Trap.INFO_FROST_CAVE_TRAP5, 16, 31);
	}
	public static void trap6() {
		PSGame.trapRoutine(Trap.FROST_CAVE_TRAP6, Trap.INFO_FROST_CAVE_TRAP6, 10, 36);
	}
	
	public static void dezo() {
		PSMenu.startScene(Scene.CORRIDOR, EntityType.DEZO, DezoType.REGULAR);
		PSMenu.StextLast(PSGame.getString("Cave_Dezo_Dezorian"));
		PSMenu.endScene();
	}

	public static void blscorpion() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SCORPIUS), Script.random(2, 4));
	}


	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,11,36);
	}
}
