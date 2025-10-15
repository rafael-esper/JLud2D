package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.Scene;

public class Casba_cave {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.SKULL_EN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.G_SCORPI, PS1Enemy.SKULL_EN});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.SPHINX, PS1Enemy.ZOMBIE, PS1Enemy.MOTA_SHOOTER, PS1Enemy.TARANTUL});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.G_SCORPI});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.ZOMBIE, PS1Enemy.RD_SLIME});
		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.CASBA_CAVE_CHEST1, 100, Trapped.NO_TRAP, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.CASBA_CAVE_CHEST2, 0, Trapped.EXPLOSION, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.CASBA_CAVE_CHEST3, 100, Trapped.NO_TRAP, null);
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.CASBA_CAVE_CHEST4, 500, Trapped.NO_TRAP, null);
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.CASBA_CAVE_CHEST5, 5000, Trapped.NO_TRAP, null);
	}
	
	public static void red_dragon() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_CASBA_RD_DRAGON)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.RD_DRAGN), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_CASBA_RD_DRAGON);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.CASBA_CAVE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Light_Saber));
		}
	}

	public static void bl_dragon() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_CASBA_BL_DRAGON)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.BL_DRAGN), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_CASBA_BL_DRAGON);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.CASBA_CAVE_CHEST7, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye));
		}
	}
	
	public static void stairs1_up() {
		PSGame.warp(6, 8, false);
	}
	public static void stairs1_down() {
		PSGame.warp(20, 10, false);
	}
	public static void stairs2_up() {
		PSGame.warp(17, 11, false);
	}
	public static void stairs2_down() {
		PSGame.warp(7, 27, false);
	}
	public static void stairs3_up() {
		PSGame.warp(18, 1, false);
	}
	public static void stairs3_down() {
		PSGame.warp(8, 17, false);
	}
	public static void stairs4_up() {
		PSGame.warp(8, 6, false);
	}
	public static void stairs4_down() {
		PSGame.warp(26, 2, false);
	}
	public static void stairs5_up() {
		PSGame.warp(7, 14, false);
	}
	public static void stairs5_down() {
		PSGame.warp(21, 14, false);
	}
	public static void stairs6_up() {
		PSGame.warp(15, 13, false);
	}
	public static void stairs6_down() {
		PSGame.warp(9, 25, false);
	}
	public static void stairs7_up() {
		PSGame.warp(20, 3, false);
	}
	public static void stairs7_down() {
		PSGame.warp(10, 19, false);
	}
	public static void stairs8_up() {
		PSGame.warp(10, 4, false);
	}
	public static void stairs8_down() {
		PSGame.warp(24, 4, false);
	}

	public static void casba() {
		PSGame.mapswitch(City.CASBA,26,11);
	}

	public static void exit() {
		PSGame.mapswitch(Planet.MOTAVIA,71,94);
	}
}
