package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;
import core.Script;
import demos.ps.PSDungeon;
import demos.ps.oo.Enemy;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.Scene;

public class Guaron_morgue {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.REVENANT});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.REVENANT});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.REVENANT});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.ZOMBIE, PS1Enemy.REVENANT, PS1Enemy.BATALION});

		dungeon.startDungeon();
	}
	
	public static void chest1() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.gameData.chestFlags.contains(Chest.GUARON_MORGUE_CHEST1)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, new Enemy[]{PSGame.getEnemy(PS1Enemy.DEATH_KNIGHT)});
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.GUARON_MORGUE_CHEST1, 0, Trapped.NO_TRAP, getItem(OriginalItem.Armor_Laconian_Armor));
		}
		
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.GUARON_MORGUE_CHEST2, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Dimate));
	}

	public static void stairs1_up() {
		PSGame.warp(5, 7, false);
	}
	public static void stairs1_down() {
		PSGame.warp(21, 10, false);
	}
	public static void stairs2_up() {
		PSGame.warp(12, 12, false);
	}
	public static void stairs2_down() {
		PSGame.warp(25, 13, false);
	}
	public static void stairs3_up() {
		PSGame.warp(9, 3, false);
	}
	public static void stairs3_down() {
		PSGame.warp(25, 6, false);
	}
	public static void stairs4_up() {
		PSGame.warp(13, 7, false);
	}
	public static void stairs4_down() {
		PSGame.warp(27, 8, false);
	}

	public static void trap1() {
		PSGame.trapRoutine(Trap.GUARON_TRAP1, Trap.INFO_GUARON_TRAP1, 25, 8);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.GUARON_TRAP2, Trap.INFO_GUARON_TRAP2, 21, 12);
	}

	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,80,7);
	}
}
