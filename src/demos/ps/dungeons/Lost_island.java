package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import core.Script;

public class Lost_island {
	

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.STALKER, PS1Enemy.VAMPIRE, PS1Enemy.GHOUL});
		dungeon.setRandomEnemies(1, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.MANTICORE, PS1Enemy.SERPENT, PS1Enemy.ANDROCOP});
		dungeon.setRandomEnemies(2, new PS1Enemy[]{PS1Enemy.MANTICORE, PS1Enemy.SERPENT, PS1Enemy.ANDROCOP});
		dungeon.setRandomEnemies(3, new PS1Enemy[]{PS1Enemy.OWL_BEAR, PS1Enemy.WEREBAT, PS1Enemy.MARAUDER});
		dungeon.setRandomEnemies(4, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.MANTICORE, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.STALKER, PS1Enemy.GHOUL});
		dungeon.setFixedEnemies(1, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.SERPENT});
		dungeon.setFixedEnemies(2, new PS1Enemy[]{PS1Enemy.OWL_BEAR, PS1Enemy.SERPENT, PS1Enemy.OWL_BEAR});
		dungeon.setFixedEnemies(3, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.MARAUDER});
		dungeon.setFixedEnemies(4, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.MARAUDER});

		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST1, 20, Trapped.NO_TRAP, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST2, 0, Trapped.ARROW, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest4() { // NEW
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate)); 
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST5, 100, Trapped.NO_TRAP, null); 
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST7, 0, Trapped.EXPLOSION, null);
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST8, 0, Trapped.ARROW, null);
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST9, 1, Trapped.NO_TRAP, null);
	}
	public static void chest10() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST10, 0, Trapped.EXPLOSION, null);
	}
	public static void chest11() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST11, 20, Trapped.NO_TRAP, null);
	}
	public static void chest12() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST12, 20, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest13() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST13, 0, Trapped.ARROW, null);
	}
	public static void chest14() {
		PSGame.chestFlag(Chest.LOST_ISLAND_CHEST14, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}

	public static void stairs_1_up() {
		PSGame.warp(19, 3, false);
	}
	public static void stairs_1_down() {
		PSGame.warp(3, 5, false);
	}
	public static void stairs_2_up() {
		PSGame.warp(29, 6, false);
	}
	public static void stairs_2_down() {
		PSGame.warp(10, 6, false);
	}
	public static void stairs_3_up() {
		PSGame.warp(19, 10, false);
	}
	public static void stairs_3_down() {
		PSGame.warp(5, 10, false);
	}
	public static void stairs_4_up() {
		PSGame.warp(1, 22, false);
	}
	public static void stairs_4_down() {
		PSGame.warp(17, 4, false);
	}
	public static void stairs_5_up() {
		PSGame.warp(8, 23, false);
	}
	public static void stairs_5_down() {
		PSGame.warp(24, 5, false);
	}
	public static void stairs_6_up() {
		PSGame.warp(23, 20, false);
	}
	public static void stairs_6_down() {
		PSGame.warp(7, 18, false);
	}
	public static void stairs_7_up() {
		PSGame.warp(28, 18, false);
	}
	public static void stairs_7_down() {
		PSGame.warp(12, 20, false);
	}
	public static void stairs_8_up() {
		PSGame.warp(11, 43, false);
	}
	public static void stairs_8_down() {
		PSGame.warp(21, 27, false);
	}

	public static void trap1() {
		PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 12, 9);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 26, 8);
	}
	public static void trap3() {
		PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 20, 12);
	}
	public static void trap4() {
		PSGame.trapRoutine(Trap.LOST_ISLAND_TRAP1, Trap.INFO_LOST_ISLAND_TRAP1, 1, 22);
	}
	
	public static void oldman() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		PSMenu.StextLast(PSGame.getString("Island_Tower_Man"));
		PSMenu.endScene();
	}
	public static void reddragon() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_LOST_ISLAND_DRAGON)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.RD_DRAGN), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_LOST_ISLAND_DRAGON);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.LOST_ISLAND_CHEST15, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Laconian_Sword));
		}
	}
	
	public static void redslime() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.RD_SLIME), Script.random(2, 4));
	}

	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,5,45);
	}
}
