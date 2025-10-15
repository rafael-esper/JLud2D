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

public class Medusa_tower {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.MANTICORE, PS1Enemy.SKELETON, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.CENTAUR, PS1Enemy.GIANT});
		dungeon.setRandomEnemies(1, new PS1Enemy[]{PS1Enemy.OWL_BEAR, PS1Enemy.WEREBAT, PS1Enemy.MARAUDER});
		dungeon.setRandomEnemies(2, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.HORSEMAN});
		dungeon.setRandomEnemies(3, new PS1Enemy[]{PS1Enemy.REAPER, PS1Enemy.GR_SLIME});
		dungeon.setRandomEnemies(4, new PS1Enemy[]{PS1Enemy.GIANTFLY, PS1Enemy.STALKER, PS1Enemy.WYVERN, PS1Enemy.ANDROCOP});
		dungeon.setRandomEnemies(5, new PS1Enemy[]{PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN, PS1Enemy.WYVERN, PS1Enemy.ANDROCOP});
		dungeon.setRandomEnemies(6, new PS1Enemy[]{PS1Enemy.MANTICORE, PS1Enemy.STALKER, PS1Enemy.MARAUDER, PS1Enemy.GR_DRAGN});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.SKELETON, PS1Enemy.MARAUDER, PS1Enemy.SKELETON});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.CENTAUR});
		dungeon.setFixedEnemies(1, new PS1Enemy[]{PS1Enemy.CENTAUR, PS1Enemy.MARAUDER});
		dungeon.setFixedEnemies(2, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.SKELETON});
		dungeon.setFixedEnemies(3, new PS1Enemy[]{PS1Enemy.REAPER, PS1Enemy.STALKER});
		dungeon.setFixedEnemies(4, new PS1Enemy[]{PS1Enemy.GIANTFLY, PS1Enemy.WYVERN, PS1Enemy.GIANTFLY});
		dungeon.setFixedEnemies(5, new PS1Enemy[]{PS1Enemy.MAGICIAN, PS1Enemy.WYVERN});
		dungeon.setFixedEnemies(6, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER});

		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST3, 0, Trapped.EXPLOSION, null);
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate)); 
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST6, 10, Trapped.NO_TRAP, null);
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST7, 20, Trapped.NO_TRAP, null);
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST8, 0, Trapped.ARROW, null);
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST9, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest10() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST10, 10, Trapped.NO_TRAP, null);
	}
	public static void chest11() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST11, 5, Trapped.NO_TRAP, null);
	}
	public static void chest12() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST12, 0, Trapped.NO_TRAP, null);
	}
	public static void chest13() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST13, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest14() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST14, 10, Trapped.NO_TRAP, null);
	}
	public static void chest15() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST15, 35, Trapped.NO_TRAP, null);
	}
	public static void chest16() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST16, 0, Trapped.EXPLOSION, null);
	}
	public static void chest17() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest18() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST18, 0, Trapped.ARROW, null);
	}
	public static void chest19() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST19, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest20() {
		PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST20, 0, Trapped.ARROW, null);
	}

	public static void stairs1_up() {
		PSGame.warp(30, 11, false);
	}
	public static void stairs1_down() {
		PSGame.warp(13, 13, false);
	}
	public static void stairs2_up() {
		PSGame.warp(5, 19, false);
	}
	public static void stairs2_down() {
		PSGame.warp(22, 4, false);
	}
	public static void stairs3_up() {
		PSGame.warp(13, 24, false);
	}
	public static void stairs3_down() {
		PSGame.warp(30, 5, false);
	}
	public static void stairs4_up() {
		PSGame.warp(18, 20, false);
	}
	public static void stairs4_down() {
		PSGame.warp(1, 22, false);
	}
	public static void stairs5_up() {
		PSGame.warp(19, 30, false);
	}
	public static void stairs5_down() {
		PSGame.warp(4, 30, false);
	}
	public static void stairs6_up() {
		PSGame.warp(12, 41, false);
	}
	public static void stairs6_down() {
		PSGame.warp(26, 24, false);
	}
	public static void stairs7_up() {
		PSGame.warp(24, 43, false);
	}
	public static void stairs7_down() {
		PSGame.warp(6, 41, false);
	}
	public static void stairs8_up() {
		PSGame.warp(5, 61, false);
	}
	public static void stairs8_down() {
		PSGame.warp(22, 40, false);
	}
	public static void stairs9_up() {
		PSGame.warp(24, 57, false);
	}
	public static void stairs9_down() {
		PSGame.warp(9, 57, false);
	}
	public static void stairs10_up() {
		PSGame.warp(25, 60, false);
	}
	public static void stairs10_down() {
		PSGame.warp(10, 60, false);
	}
	
	public static void trap1() {
		PSGame.trapRoutine(Trap.MEDUSA_TRAP1, Trap.INFO_MEDUSA_TRAP1, 7, 4);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.MEDUSA_TRAP2, Trap.INFO_MEDUSA_TRAP2, 27, 5);
	}
	
	public static void oldman1() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_1"));
		PSMenu.endScene();
	}
	public static void oldman2() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_2"));
		PSMenu.endScene();
	}
	public static void oldman3() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		PSMenu.StextLast(PSGame.getString("Medusa_Tower_Man_3"));
		PSMenu.endScene();
	}
	public static void monster() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.GIANTFLY), Script.random(2, 4));
	}
	public static void medusa() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_MEDUSA)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.MEDUSA), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_MEDUSA);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.MEDUSA_TOWER_CHEST21, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Laconian_Axe));
		}
	}

	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,33,79);
	}
}
