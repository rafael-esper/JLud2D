package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.Enemy;
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

public class Iala {

	private static final Logger log = LogManager.getLogger(Iala.class);
	

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		dungeon.setRandomEnemies(-3, new PS1Enemy[]{PS1Enemy.EVILDEAD, PS1Enemy.SKELETON});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WING_EYE});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.WEREBAT, PS1Enemy.EVILDEAD, PS1Enemy.WEREBAT});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.EVILDEAD, PS1Enemy.SKELETON});
		dungeon.setFixedEnemies(-3, new PS1Enemy[]{PS1Enemy.EVILDEAD, PS1Enemy.SKELETON});
		
		dungeon.startDungeon();
	}

	public static void beggar() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Iala_Man"));
		PSMenu.endScene();
	}

	
	public static void chest1() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST1, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST2, 20, Trapped.NO_TRAP, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST3, 0, Trapped.NO_TRAP, null); // empty
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST4, 0, Trapped.NO_TRAP, null); // empty
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST5, 0, Trapped.EXPLOSION, null);
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST6, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST7, 20, Trapped.NO_TRAP, null);
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST8, 0, Trapped.NO_TRAP, null);
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST9, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest10() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST10, 0, Trapped.ARROW, null);
	}
	public static void chest11() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST11, 20, Trapped.NO_TRAP, null);
	}
	public static void chest12() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST12, 20, Trapped.NO_TRAP, null);
	}
	public static void chest13() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST13, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest14() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST14, 0, Trapped.EXPLOSION, null);
	}
	public static void chest15() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST15, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest16() {
		PSGame.chestFlag(Chest.IALA_CAVE_CHEST16, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Dimate));
	}

	// Rafael: changed to Skeleton_Guard
	public static void skeleton() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_IALA_SKELETON)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, 
					new Enemy[]{PSGame.getEnemy(PS1Enemy.SKELETON),PSGame.getEnemy(PS1Enemy.SKELETON_GUARD),PSGame.getEnemy(PS1Enemy.SKELETON)});
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_IALA_SKELETON);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.IALA_CAVE_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Saber_Claw));
		}
	}

	public static void stairs_1_2() {
		PSGame.warp(19, 12, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(3, 10, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(14, 28, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(30, 10, false);
	}
	public static void stairs_3_4() {
		PSGame.warp(20, 30, false);
	}
	public static void stairs_4_3() {
		PSGame.warp(2, 30, false);
	}
	public static void stairs_dead_up() {
		PSGame.warp(27, 9, false);
	}
	public static void stairs_dead_down() {
		PSGame.warp(11, 27, false);
	}	

	public static void trap1() {
		PSGame.trapRoutine(Trap.IALA_TRAP1, Trap.INFO_IALA_TRAP1, 25, 3);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.IALA_TRAP2, Trap.INFO_IALA_TRAP2, 9, 18);
	}
	public static void trap3() {
		PSGame.trapRoutine(Trap.IALA_TRAP3, Trap.INFO_IALA_TRAP3, 27, 18);
	}
	public static void trap4() {
		PSGame.trapRoutine(Trap.IALA_TRAP4, Trap.INFO_IALA_TRAP4, 29, 19);
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,119,58);
	}
}
